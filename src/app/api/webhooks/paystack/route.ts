import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { env } from '@/env';
import { processIdempotentPaymentWebhook } from '@/server/services/payment-reconciler';

export const dynamic = 'force-dynamic';

interface PaystackWebhookPayload {
  event: string;
  data: {
    id: string | number;
    reference: string;
    amount: number;
  };
}

export async function POST(req: Request): Promise<NextResponse> {
  const rawBody = await req.text();
  const signature = req.headers.get('x-paystack-signature');

  if (!signature) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 401 });
  }

  const expectedHash = crypto
    .createHmac('sha512', env.PAYSTACK_SECRET_KEY)
    .update(rawBody)
    .digest('hex');

  if (
    expectedHash.length !== signature.length ||
    !crypto.timingSafeEqual(Buffer.from(expectedHash), Buffer.from(signature))
  ) {
    return NextResponse.json(
      { error: 'Invalid cryptographic signature' },
      { status: 401 }
    );
  }

  const event = JSON.parse(rawBody) as PaystackWebhookPayload;

  if (event.event === 'charge.success') {
    await processIdempotentPaymentWebhook({
      provider: 'PAYSTACK',
      providerEventId: String(event.data.id),
      eventType: event.event,
      reference: String(event.data.reference),
      amountPaidKobo: Number(event.data.amount),
      rawPayload: event,
    });
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
