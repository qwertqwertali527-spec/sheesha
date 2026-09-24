import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { isPublicApproved } from '@/lib/config';

export default function PrivacyPage() {
  if (isPublicApproved()) redirect(process.env.PRIVACY_POLICY_URL!);
  return <main className="privacyPage">
    <div className="privacyCard">
      <Link href="/" className="backLink"><ArrowLeft size={16} /> Back to LAYALI</Link>
      <div className="privacyIcon"><ShieldCheck size={26} /></div>
      <p className="eyebrow darkEyebrow">CONCEPT PREVIEW · PRIVACY NOTE</p>
      <h1>Respect for your details starts here.</h1>
      <p>This is a development preview, not a live booking service or a final legal privacy policy. Please use fictional information to test it.</p>
      <div className="privacyDetail">
        <h2>What the demo stores</h2>
        <p>If you submit an inquiry, the demo stores the messages and details you provide in a local development database. They appear in the password-protected staff inbox. No booking or payment is created.</p>
        <h2>AI and third parties</h2>
        <p>By default the guided demo uses local rules. If the owner later connects an OpenAI API key, submitted text may be processed by OpenAI for structured information extraction after you opt in. This page must be replaced by the owner’s lawyer-approved notice before any public launch.</p>
        <h2>Your choices</h2>
        <p>Do not enter real personal details into the demo. The website owner must define retention, deletion requests, data location and a contact address before using it with real customers. WhatsApp messaging is disabled unless a separately approved non-regulated use case is configured.</p>
      </div>
      <Link href="/" className="button buttonDark">Return to the site <ArrowLeft size={16} className="flipIcon" /></Link>
    </div>
  </main>;
}
