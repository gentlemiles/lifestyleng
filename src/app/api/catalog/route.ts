import { NextResponse } from 'next/server';
import { readCmsStoreAsync } from '@/server/services/cms-store';

export const dynamic = 'force-dynamic';

export async function GET(): Promise<NextResponse> {
  const store = await readCmsStoreAsync();
  return NextResponse.json(store, { status: 200 });
}
