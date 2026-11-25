import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { env } from '@/env';
import { processIdempotentPaymentWebhook } from '@/server/services/payment-reconciler';

export const dynamic = 'force-dynamic';

interface FlutterwaveWebhookPayload {
  event: string;
  data: {
    id: string | number;
    tx_ref: string;
    amount: number;
    currency: string;
    status: string;
  };
}

export async function POST(req: Request): Promise<NextResponse> {
  const rawBody = await req.text();
  const verifHash = req.headers.get('verif-hash');

  if (!verifHash) {
    return NextResponse.json(
      { error: 'Missing verif-hash header' },
      { status: 401 }
    );
  }

  const expectedSecret = env.FLUTTERWAVE_WEBHOOK_SECRET_HASH;
  if (
    expectedSecret.length !== verifHash.length ||
    !crypto.timingSafeEqual(
      Buffer.from(expectedSecret),
      Buffer.from(verifHash)
    )
  ) {
    return NextResponse.json(
      { error: 'Invalid Flutterwave webhook secret hash' },
      { status: 401 }
    );
  }

  const event = JSON.parse(rawBody) as FlutterwaveWebhookPayload;

  if (
    event.event === 'charge.completed' &&
    event.data.status === 'successful' &&
    event.data.currency === 'NGN'
  ) {
    const amountPaidKobo = Math.round(Number(event.data.amount) * 100);
    await processIdempotentPaymentWebhook({
      provider: 'FLUTTERWAVE',
      providerEventId: String(event.data.id),
      eventType: event.event,
      reference: String(event.data.tx_ref),
      amountPaidKobo,
      rawPayload: event,
    });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
