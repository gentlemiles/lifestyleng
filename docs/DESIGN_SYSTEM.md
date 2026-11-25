# UI Tokens, Apple HIG Design System & Component Hierarchy
**Project:** LifestyleNG.com  
**Priority Level:** CRITICAL (Prevents Visual Fragmentation & Eliminates AI Design Slop)

## 1. Apple HIG Aesthetic Principles & Anti-Slop Mandate
LifestyleNG.com must communicate a modern, elegant, premium, and trustworthy multi-service lifestyle brand.
- **Clarity:** Generous whitespace, unmistakable hierarchy, tabular numeric alignment (`tabular-nums`) for Naira (`₦`) prices, and crisp `1px` translucent borders (`rgba(0, 0, 0, 0.06)`).
- **Deference:** Product photography (Wuye fashion pieces, Prince & Princess Estate duplex interiors, executive vehicles, and MTN FibreX hardware) takes center stage. UI chrome stays whisper-quiet.
- **Depth:** Frosted glass sticky navigation (`backdrop-filter: saturate(180%) blur(20px)`), continuous squircle corner radii (`20px` to `28px`), and soft ambient elevation.
- **Strictly Banned AI Slop:** Zero neon cyberpunk gradients, zero brutalist `0px` sharp boxes (`rounded-none`), zero monospace decorative system labels (`SYS // 01`), and zero fake urgency timers or fake stock-depletion bars.

---

## 2. Semantic Color & Typography Tokens (`src/app/globals.css`)
Define these canonical CSS custom properties and Tailwind v4 theme tokens so every generated page shares an identical palette:

```css
@import "tailwindcss";

:root {
  /* Apple HIG Surface Hierarchy */
  --bg-canvas: #F5F5F7;              /* Signature Apple Alabaster page backdrop */
  --bg-surface: #FFFFFF;             /* Pure white elevated Bento & product cards */
  --bg-surface-subtle: #FAFAFC;      /* Secondary input & filter well background */
  --bg-glass: rgba(255, 255, 255, 0.78); /* Sticky header & slide-over drawer */
  --bg-obsidian: #1D1D1F;            /* High-contrast hero monolith & primary pill CTA */

  /* Typography Ink Hierarchy */
  --text-primary: #1D1D1F;           /* Deep Apple Charcoal for headlines & body */
  --text-secondary: #6E6E73;         /* Supporting descriptions & metadata */
  --text-muted: #86868B;             /* Captions, SKUs, and legal disclaimers */
  --text-on-dark: #F5F5F7;           /* Text on #1D1D1F obsidian surfaces */

  /* Corporate & Division Semantic Accents (Surgical Use < 10% of Viewport) */
  --brand-navy: #0B2545;             /* Lifestyle Corporate Networks Ltd. authority */
  --brand-teal: #008080;             /* LCN connectivity & interactive link accent */
  --mtn-gold: #FFCC00;               /* Official MTN FibreX & Telecom accent */
  --mtn-gold-hover: #E6B800;
  --whatsapp-emerald: #10B981;       /* WhatsApp concierge & verified stock badge */
  --whatsapp-surface: #ECFDF5;
  --whatsapp-ink: #047857;

  /* Status & Feedback Tokens */
  --status-warning-bg: #FFFBEB;
  --status-warning-ink: #B45309;     /* 2-Hour Car Hire & 24-Hour Return notices */
  --status-danger: #DC2626;          /* Destructive actions & validation errors */
  --border-hairline: rgba(29, 29, 31, 0.08);
  --border-focus: #0B2545;

  /* Apple Continuous Squircle Radii */
  --radius-sm: 10px;                 /* Inputs, size chips, inner thumbnails */
  --radius-md: 16px;                 /* Standard cards & calendar cells */
  --radius-lg: 22px;                 /* Product cards & booking panels */
  --radius-xl: 28px;                 /* Hero monolith & 4-Division Bento tiles */
  --radius-pill: 980px;              /* Primary & secondary action buttons */

  /* Ambient Diffusion Shadows */
  --shadow-rest: 0 2px 12px -2px rgba(29, 29, 31, 0.04), 0 1px 3px 0 rgba(29, 29, 31, 0.02);
  --shadow-hover: 0 16px 32px -8px rgba(29, 29, 31, 0.08), 0 4px 12px -2px rgba(29, 29, 31, 0.04);
  --shadow-modal: 0 24px 48px -12px rgba(29, 29, 31, 0.18);
}
```

### Typography Scale (`Plus Jakarta Sans` + `Inter`)
- **Hero Display (`display-hero`):** `clamp(2.25rem, 4vw, 3.5rem)` (56px desktop / 36px mobile), `font-weight: 700`, `line-height: 1.08`, `letter-spacing: -0.025em`.
- **Section Headline (`headline-xl`):** `clamp(1.625rem, 2.8vw, 2.25rem)` (36px desktop / 26px mobile), `font-weight: 700`, `line-height: 1.15`, `letter-spacing: -0.02em`.
- **Bento / Division Title (`headline-md`):** `22px`, `font-weight: 600`, `line-height: 1.25`, `letter-spacing: -0.01em`.
- **Body Copy (`body-lg` / `body-md`):** `16px` / `14px` Inter, `font-weight: 400`, `line-height: 1.6`, color `var(--text-secondary)`.
- **Numeric Price Ledger (`price-hero` / `price-card`):** Plus Jakarta Sans, `font-variant-numeric: tabular-nums`, `font-weight: 700`, always prefixed with `₦`.

---

## 3. Reusable E-Commerce & Multi-Service Component Specifications

### 3.1 `PriceDisplay` (`src/components/commerce/price-display.tsx`)
Formats integer kobo into Nigerian Naira (`₦`) with zero floating-point drift and optional sale strikethrough.

```typescript
interface PriceDisplayProps {
  amountKobo: number;
  compareAtKobo?: number | null;
  periodSuffix?: '/ night' | '/ week' | '/ month' | '/ day' | '/ hr';
  size?: 'sm' | 'md' | 'lg' | 'hero';
}

export function formatKoboToNaira(kobo: number): string {
  const naira = Math.round(kobo / 100);
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(naira);
}
```

- **Visual Rules:** Primary price renders in `var(--text-primary)` with `tabular-nums`. If `compareAtKobo > amountKobo`, render the original price beside it in `text-xs line-through text-[#86868B]`. Never render red `-40%` brutalist tags; if a discount badge is needed, use a subtle pill (`bg-[#F5F5F7] text-[#1D1D1F]`).

### 3.2 `ProductCard` (`src/components/commerce/product-card.tsx`)
Used across **Lifestyle Boutique (Fashion)** (`/shop/clothes` — Clothing, Shoes, Bags, Accessories) and **Lifestyle MTN Services** (`/mtn-services/fibrex` — 5G/4G Routers, MiFis, Outdoor CPEs).
- **Container:** `bg-white rounded-[22px] p-4 border border-black/[0.06] shadow-[var(--shadow-rest)] hover:shadow-[var(--shadow-hover)] transition-all duration-300 flex flex-col justify-between`.
- **Media Slot:** Aspect ratio `4:5` for Fashion (Clothing, Shoes, Bags) and `1:1` for MTN Telecom Hardware on a soft `#F5F5F7` inner squircle (`rounded-[16px] overflow-hidden`).
- **Omnichannel & Trust Eyebrow:** Top-left subtle pill indicating either `Wuye Boutique • Pickup Available` (for Fashion) or `Official MTN Hardware` (for Telecom).
- **Data Density Cap:** Strictly limited to Category/Sub-pillar label, Product Title (max 2-line clamp), Color Swatch dots (up to 4), `PriceDisplay`, and dual action row (`Add to Bag` pill + subtle WhatsApp icon button).

### 3.3 `VariantSelector` (`src/components/commerce/variant-selector.tsx`)
Handles multi-dimensional SKU selection across Fashion and Telecom:
- **Clothing Sizes:** Pill buttons (`XS`, `S`, `M`, `L`, `XL`, `XXL`).
- **Shoe Sizes:** Tabular EU/UK size grid (`EU 37` through `EU 46`).
- **Bags & Accessories:** Material / hardware finish pills (`Full-Grain Leather`, `Suede`, `Gold Hardware`, `One Size`).
- **Active State:** Selected pill uses `bg-[#1D1D1F] text-white font-semibold`; out-of-stock variants render at `opacity-35 line-through cursor-not-allowed` with a one-tap `"Request Restock on WhatsApp"` link.

### 3.4 `SlideOverCart` (`src/components/commerce/slide-over-cart.tsx`)
- **Surface:** Right-anchored sheet (`max-w-[440px] w-full bg-white/85 backdrop-blur-2xl border-l border-black/[0.08] shadow-[var(--shadow-modal)]`).
- **Omnichannel Fulfillment Switcher (Top of Drawer):** Apple-style segmented control allowing the customer to switch between:
  - `Doorstep Delivery (Abuja & Inter-State)`
  - `In-Store Pickup — Suite 83 / Block B70, H&A Plaza, Wuye (₦0 Free Pickup)`
- **Mandatory Policy Callout (Footer of Drawer):** Subtle rounded banner (`bg-[#F5F5F7] p-3 rounded-[12px] text-xs text-[#6E6E73]`):
  > "Returns are accepted within 24 hours of receipt in original unworn/unopened condition."
- **Primary Actions:** Full-width pill button `Proceed to Secure Checkout` (`bg-[#1D1D1F] text-white rounded-full py-3.5`) + Secondary pill `Checkout via WhatsApp Concierge` (`bg-[#ECFDF5] text-[#047857]`).

### 3.5 Division-Specific Apple HIG Primitives
- **`SegmentedPillarControl` (`src/components/ui/segmented-pillar-control.tsx`):**
  - Translucent Apple iOS/macOS segmented tab bar (`bg-[#E8E8ED] p-1 rounded-full`) with an animated white active thumb (`bg-white shadow-sm rounded-full`).
  - Powers the 3 sub-pillar switches on `/stays` (*Short-Let Apartments | Furnished Accommodation | Property Management*), `/car-hire` (*Car Hire & Rentals | Airport Transfers | Inter-State & Logistics*), and `/mtn-services/fibrex` (*MTN FibreX Unlimited | Telecom Products | Sales & Distribution*).
- **`StayBookingWidget` (`src/components/divisions/homes/stay-booking-widget.tsx`):**
  - Sticky right-column card (`rounded-[24px] p-6 bg-white border border-black/[0.08]`) for the Prince & Princess Estate 4-Bedroom Duplex (Kaura, Abuja) and other managed units.
  - Includes a mode toggle (`Nightly Short-Let` vs. `Extended Furnished Stay — Weekly/Monthly`), interactive blocked-date-aware range calendar, guest stepper (max 8 guests for the 4-bed duplex), itemized Naira total, `Reserve Online` button, and `Reserve on WhatsApp` button.
- **`FibrexCoverageCard` (`src/components/divisions/mtn/fibrex-coverage-card.tsx`):**
  - High-clarity card featuring Abuja Estate/District autocomplete, Street Address input, Service Type pills (*Coverage Check, New Installation, Appointment Booking, Subscription Renewal*), the mandatory **`CHECK FIBREX AVAILABILITY IN MY AREA`** CTA (`bg-[#FFCC00] hover:bg-[#E6B800] text-[#1D1D1F] font-semibold rounded-full`), and the permanent legal notice: *"Coverage, installation, speed and service availability are subject to MTN confirmation."*
- **`WhatsAppConciergeButton` (`src/components/layout/whatsapp-concierge-button.tsx`):**
  - Accepts a strongly typed `division` and structured `contextPayload` (Order ID, SKU, Stay Dates, Car Hire Route, Logistics Waybill, or FibreX Address) and builds a clean `https://wa.me/2348064912969?text=...` URL.

---

## 4. Mandatory Loading, Suspense & Empty States
- **Suspense Boundaries & Apple Shimmer Skeletons:**
  - Every dynamic RSC data grid (`FashionCatalogGrid`, `MtnHardwareGrid`, `StayAvailabilityCalendar`, `AdminOrderTable`) must be wrapped in a React `<Suspense>` boundary paired with an Apple-grade neutral shimmer skeleton (`bg-[#E8E8ED]/70 animate-pulse rounded-[22px]`).
  - Layout shift (CLS) during loading must be `0.00` by matching skeleton aspect ratios (`4:5` for fashion, `16:10` for shortlets, `1:1` for telecom routers).
- **Empty States (Zero Dead Ends):**
  - **Empty Bag Drawer:** Displays a minimalist bag illustration, copy *"Your LifestyleNG bag is empty"*, and 4 quick-jump pills corresponding to the 4 corporate divisions (*Shop Wuye Boutique*, *Explore MTN FibreX*, *View Kaura 4-Bed Shortlet*, *Book Abuja Car Hire*).
  - **Zero Filter Matches (`/shop/clothes`):** Displays *"No pieces match your current filters"* with a one-tap `Reset Filters` pill and an `Ask Wuye Boutique Staff on WhatsApp` fallback.
