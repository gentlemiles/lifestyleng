# Identity, Sessions, Role-Based Access Control (RBAC) & Audit Logging
**Project:** LifestyleNG.com  
**Parent Organization:** Lifestyle Corporate Networks Ltd.  
**Priority Level:** CRITICAL (Secures Server Actions & Administrative CMS)

## 1. Defense-in-Depth Authorization Architecture
Next.js route middleware (`src/middleware.ts`) is strictly a **first-pass UX redirect filter**. Because Server Actions compile to public HTTP `POST` endpoints, **every mutating Server Action** must invoke an explicit session guard on line 1 before executing any logic.

```typescript
// src/server/auth/guards.ts
import { cookies } from 'next/headers';
import { verifySessionToken } from './session';
import { db } from '@/lib/db';
import { adminAuditLogs } from '@/lib/db/schema';

export async function requireAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('lifestyleng_session')?.value;
  const session = token ? await verifySessionToken(token) : null;

  if (!session) {
    throw new Error('ERR_UNAUTHORIZED');
  }
  return session;
}

export async function requireAdmin() {
  const session = await requireAuth();
  if (session.role !== 'ADMIN' && session.role !== 'SUPER_ADMIN') {
    throw new Error('ERR_FORBIDDEN');
  }
  return session;
}
```

---

## 2. RBAC Permission Matrix Across All 4 Divisions

| Capability / Operation | `GUEST` | `CUSTOMER` | `ADMIN` | `SUPER_ADMIN` |
| :--- | :---: | :---: | :---: | :---: |
| Browse Fashion, MTN, Stays & Car Hire | Yes | Yes | Yes | Yes |
| Guest Checkout & Pre-filled WhatsApp Enquiries | Yes | Yes | Yes | Yes |
| View Past Orders & Bookings Dashboard | No | Own Only | All | All |
| Initiate 24-Hour Return Request (`<= 24h` of receipt) | Via Order Lookup + OTP | Own Orders | Yes | Yes |
| Manage Fashion & MTN Products / Prices / Photos | No | No | Yes | Yes |
| Log Physical Wuye Boutique Walk-In POS Sales | No | No | Yes | Yes |
| Update Kaura Shortlet / Furnished Rates & Calendar | No | No | Yes | Yes |
| Manage Property Management Onboarding Proposals | Submit Only | Submit Only | Yes | Yes |
| Dispatch Car Hire, Airport Transfers & Cargo Logistics | Submit Only | Submit Only | Yes | Yes |
| Process FibreX Coverage & MTN B2B Distribution Leads | Submit Only | Submit Only | Yes | Yes |
| Approve / Reject 24-Hour Returns & Issue Refunds | No | No | Yes | Yes |
| Manage Admin Accounts & View Immutable Audit Logs | No | No | No | Yes |

---

## 3. Guest Checkout & Retroactive Account Linking
Customers can complete Fashion/MTN hardware purchases, Shortlet reservations, Car Hire bookings, or FibreX requests as a `GUEST` using their email and Nigerian phone number.

When a `GUEST` later creates an account and verifies ownership of their email address via OTP/Magic Link, a post-verification hook executes:

```sql
UPDATE orders SET user_id = $newUserId WHERE customer_email = $verifiedEmail AND user_id IS NULL;
```

This automatically populates their historical Wuye Boutique orders, Kaura Shortlet stays, and Car Hire records in `/account`.

---

## 4. Mandatory Admin Audit Logging (`admin_audit_logs`)
Every administrative mutation in `src/server/actions/admin/*` must write an audit record inside the same database transaction as the mutation:
- Product price changes (`base_price_kobo` / `price_kobo`).
- Wuye physical boutique inventory adjustments (`available_stock`).
- Shortlet nightly/weekly/monthly rate updates and manual calendar blocks.
- 24-hour return request approvals, rejections, and refund disbursements.
