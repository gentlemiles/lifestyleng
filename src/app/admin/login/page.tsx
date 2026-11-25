import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ShieldCheck } from 'lucide-react';
import { getAdminSession } from '@/server/auth/guards';
import { isUsingLocalDevFallbackCredentials } from '@/server/auth/password';
import { AdminLoginForm } from '@/components/admin/admin-login-form';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Admin Sign In — Lifestyle Corporate Networks Ltd.',
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const existingSession = await getAdminSession();
  if (existingSession) {
    redirect('/admin');
  }

  const params = await searchParams;
  const nextPath = typeof params.next === 'string' ? params.next : undefined;
  const isLocalDevFallback = isUsingLocalDevFallbackCredentials();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F5F7] px-4 py-12">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-black/[0.08] bg-white p-8 shadow-sm">
        <div className="space-y-3 text-center">
          <div className="flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/lcn-logo-full.png"
              alt="Lifestyle Corporate Networks Ltd."
              width={946}
              height={225}
              className="h-11 w-auto max-w-[220px] object-contain"
            />
          </div>
          <div className="space-y-1">
            <h1 className="font-display text-xl font-bold text-[#1B1B1D]">
              Restricted Admin CMS
            </h1>
            <p className="text-xs text-[#6E6E73]">
              Authorized Lifestyle Corporate Networks Ltd. personnel only.
            </p>
          </div>
        </div>

        <AdminLoginForm
          nextPath={nextPath}
          isLocalDevFallback={isLocalDevFallback}
        />

        <div className="flex items-center justify-between border-t border-black/[0.06] pt-4 text-xs text-[#6E6E73]">
          <span className="inline-flex items-center gap-1.5">
            <ShieldCheck className="h-3.5 w-3.5 text-[#006A6A]" />
            Signed HttpOnly Session
          </span>
          <Link href="/" className="font-medium text-[#1B1B1D] hover:underline">
            ← Return to Storefront
          </Link>
        </div>
      </div>
    </div>
  );
}
