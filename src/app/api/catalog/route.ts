import { NextResponse } from 'next/server';
import { readCmsStore } from '@/server/services/cms-store';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const store = readCmsStore();
  return NextResponse.json(store, { status: 200 });
}
