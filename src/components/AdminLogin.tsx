'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, LockKeyhole } from 'lucide-react';

export function AdminLogin() {
  const [username, setUsername] = useState('owner');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError('');
    try {
      const response = await fetch('/api/admin/login', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || 'Could not sign in.');
      window.location.reload();
    } catch (error) { setError(error instanceof Error ? error.message : 'Could not sign in.'); setLoading(false); }
  }

  return <main className="adminLoginPage"><div className="loginDecoration" aria-hidden="true" /><div className="loginCard"><Link href="/" className="backLink"><ArrowLeft size={16} /> Back to the website</Link><div className="loginBrand"><span>✳</span> LAYALI.</div><div className="loginIcon"><LockKeyhole size={22} /></div><p className="eyebrow darkEyebrow">STAFF PORTAL</p><h1>A quieter way<br />to stay in touch.</h1><p className="loginIntro">Sign in to review inquiries, take over conversations and update your content.</p><form onSubmit={submit} className="loginForm"><label>Username<input autoComplete="username" value={username} onChange={(event) => setUsername(event.target.value)} required /></label><label>Password<input type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} required /></label>{error && <p className="formError" role="alert">{error}</p>}<button className="button buttonDark" disabled={loading}>{loading ? 'Signing in…' : 'Sign in'} <ArrowRight size={18} /></button></form><p className="loginNote">Access is restricted to authorised staff. No real-customer data should be entered into this concept preview.</p></div></main>;
}
