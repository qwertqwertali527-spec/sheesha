/** Fail closed: a preview is not a public business launch. */
export const isPublicApproved = () => (
  process.env.SITE_PUBLIC_APPROVED === 'true' &&
  process.env.LEGAL_REVIEW_COMPLETED === 'true' &&
  Boolean(process.env.PRIVACY_POLICY_URL?.startsWith('https://')) &&
  Boolean(process.env.SITE_URL?.startsWith('https://'))
);

/**
 * Meta does not list a tobacco exemption. This switch is ONLY for a separately
 * cleared, genuinely non-regulated use case, never for shisha tobacco sales.
 */
export function isWhatsAppEnabled(): boolean {
  return (
    isPublicApproved() &&
    process.env.SERVICE_CLASSIFICATION === 'non_regulated' &&
    process.env.WHATSAPP_USE_CASE_APPROVED === 'true' &&
    Boolean(
      process.env.WHATSAPP_PHONE_NUMBER &&
      process.env.WHATSAPP_PHONE_NUMBER_ID &&
      process.env.WHATSAPP_ACCESS_TOKEN &&
      process.env.WHATSAPP_VERIFY_TOKEN &&
      process.env.WHATSAPP_APP_SECRET,
    )
  );
}

export const assistantMode = () => (process.env.OPENAI_API_KEY ? 'ai-assisted' : 'guided-demo');
