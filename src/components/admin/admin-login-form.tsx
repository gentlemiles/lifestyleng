'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight } from 'lucide-react';
import { loginAdminAction } from '@/server/actions/auth';

interface AdminLoginFormProps {
  nextPath?: string;
  isLocalDevFallback: boolean;
}

export function AdminLoginForm({
  nextPath,
  isLocalDevFallback,
}: AdminLoginFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState('admin@lifestyleng.com');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    try {
      const response = await loginAdminAction({
        email,
        password,
        nextPath,
      });

      if (response.error) {
        setErrorMsg(response.error.message);
        return;
      }

      router.replace(response.data.redirectTo);
      router.refresh();
    } catch {
      setErrorMsg('Sign-in failed unexpectedly. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isLocalDevFallback && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-2.5 text-xs text-amber-900">
          <strong>Local Development Mode:</strong> Set <code>ADMIN_EMAIL</code>{' '}
          and <code>ADMIN_PASSWORD_HASH</code> in <code>.env.local</code> or
          Hostinger Environment Variables. Local dev fallback:{' '}
          <code>admin@lifestyleng.com</code> / <code>LifestyleAdmin2026!</code>
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-800"
        >
          {errorMsg}
        </div>
      )}

      <div>
        <label
          htmlFor="admin-email"
          className="block text-xs font-semibold text-neutral-700"
        >
          Admin Email
        </label>
        <input
          id="admin-email"
          type="email"
          autoComplete="username"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="admin@lifestyleng.com"
          className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 focus:border-[#001026] focus:outline-none"
        />
      </div>

      <div>
        <label
          htmlFor="admin-password"
          className="block text-xs font-semibold text-neutral-700"
        >
          Password
        </label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          className="mt-1.5 w-full rounded-lg border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-950 focus:border-[#001026] focus:outline-none"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#001026] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0B2545] disabled:opacity-50"
      >
        <Lock className="h-4 w-4" />
        <span>{isSubmitting ? 'Signing In...' : 'Sign In to Admin CMS'}</span>
        {!isSubmitting && <ArrowRight className="h-4 w-4" />}
      </button>
    </form>
  );
}
