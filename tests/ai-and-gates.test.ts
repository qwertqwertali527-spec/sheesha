import assert from 'node:assert/strict';
import test from 'node:test';
import { isPublicApproved, isWhatsAppEnabled } from '../src/lib/config';
import { defaultSettings } from '../src/lib/defaults';
import { extractMessage } from '../src/lib/extractor';

test('live WhatsApp fails closed for tobacco even if credentials are present', () => {
  const keys = [
    'SITE_PUBLIC_APPROVED', 'LEGAL_REVIEW_COMPLETED', 'PRIVACY_POLICY_URL', 'SITE_URL',
    'SERVICE_CLASSIFICATION', 'WHATSAPP_USE_CASE_APPROVED', 'WHATSAPP_PHONE_NUMBER',
    'WHATSAPP_PHONE_NUMBER_ID', 'WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_VERIFY_TOKEN', 'WHATSAPP_APP_SECRET',
  ];
  const before = Object.fromEntries(keys.map((key) => [key, process.env[key]]));
  try {
    Object.assign(process.env, {
      SITE_PUBLIC_APPROVED: 'true', LEGAL_REVIEW_COMPLETED: 'true',
      PRIVACY_POLICY_URL: 'https://example.test/privacy', SITE_URL: 'https://example.test',
      SERVICE_CLASSIFICATION: 'tobacco', WHATSAPP_USE_CASE_APPROVED: 'true',
      WHATSAPP_PHONE_NUMBER: '971501234567', WHATSAPP_PHONE_NUMBER_ID: '123',
      WHATSAPP_ACCESS_TOKEN: 'fake', WHATSAPP_VERIFY_TOKEN: 'fake', WHATSAPP_APP_SECRET: 'fake',
    });
    assert.equal(isPublicApproved(), true);
    assert.equal(isWhatsAppEnabled(), false);
    process.env.SERVICE_CLASSIFICATION = 'non_regulated';
    assert.equal(isWhatsAppEnabled(), true); // Only after external clearance; these flags are not evidence.
  } finally {
    for (const key of keys) {
      if (before[key] === undefined) delete process.env[key];
      else process.env[key] = before[key];
    }
  }
});

test('AI integration accepts structured extraction but cannot generate business claims', async () => {
  const originalFetch = globalThis.fetch;
  const originalKey = process.env.OPENAI_API_KEY;
  process.env.OPENAI_API_KEY = 'fake-test-key';
  let requestBody: Record<string, unknown> | undefined;
  globalThis.fetch = async (_input, init) => {
    requestBody = JSON.parse(init?.body as string) as Record<string, unknown>;
    return new Response(JSON.stringify({ output: [{ content: [{ type: 'output_text', text: JSON.stringify({
      intent: 'inquiry', name: 'Ali', contact: null, date: null, time: null, area: 'Dubai Marina',
      address: null, quantity: 2, service: null, options: null, specialRequirements: null,
    }) }] }] }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  try {
    const result = await extractMessage('My name is Ali and I need two units in Dubai Marina.', '', defaultSettings);
    assert.equal(result.fields.name, 'Ali');
    assert.equal(result.fields.quantity, 2);
    assert.equal(result.fields.address, undefined);
    assert.equal(requestBody?.store, false);
    assert.equal((requestBody?.text as { format: { type: string } })?.format.type, 'json_schema');
  } finally {
    globalThis.fetch = originalFetch;
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
  }
});
