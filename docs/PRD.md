# Product Requirements Document (PRD) — LifestyleNG.com
**Project:** LifestyleNG.com — Unified Multi-Service Platform  
**Parent Organization:** Lifestyle Corporate Networks Ltd. (Plot 12, Corporate Avenue, Garki, Abuja, FCT, Nigeria)  
**Brand Tagline:** *"Wear It. Connect It. Stay in It. Move with It."*  
**Priority Level:** CRITICAL (Canonical Product & Business Scope)

## 1. Executive Summary & Corporate Architecture
**Lifestyle Corporate Networks Ltd.** is a premier Abuja-headquartered multi-sector enterprise located at **Plot 12, Corporate Avenue, Garki, Abuja, FCT, Nigeria**. It provides strategic direction, business development, administration, and operational oversight across **four equal subsidiary divisions** and **12 mandatory operational sub-pillars** under a single unified digital storefront: **LifestyleNG.com**.

Every division carries equal visual weight on the homepage (`/`) and primary navigation, unified by an Apple Human Interface Guidelines (HIG) aesthetic, zero-trust kobo financial architecture, and instant WhatsApp concierge escalation (`+2348064912969`).

---

## 2. The 4 Equal Corporate Divisions & 12 Mandatory Sub-Pillars

### Division 1: Lifestyle Boutique (Homes) (`/stays`)
1. **Short-Let Apartments:**
   - Anchored by the flagship **4-Bedroom Luxury Duplex at Prince & Princess Estate, Kaura District, Abuja** (max 8 guests, en-suite bedrooms, 24/7 backup power, high-speed internet, gated security) plus additional curated Abuja short-let apartments.
   - Real-time blocked-date-aware calendar preventing overlapping reservations (`SELECT ... FOR UPDATE`).
2. **Furnished Accommodation:**
   - Extended weekly (`>= 7 nights`) and monthly (`>= 28 nights`) furnished corporate and residential accommodation with automatic duration-tier rate computation.
3. **Property & Apartment Management:**
   - Dedicated landlord and property owner onboarding portal (`property_management_requests`) for turnkey short-let, corporate lease, and facility management across Abuja districts (Maitama, Asokoro, Wuse II, Guzape, Kaura, Katampe, Jabi, Wuye).

### Division 2: Lifestyle Boutique (Fashion) (`/shop/clothes`)
1. **Clothing & Fashion Retail:**
   - Ready-to-wear luxury and contemporary apparel for men and women with multi-attribute SKU variants (Sizes `XS` through `XXL`, color swatches).
2. **Shoes, Bags & Accessories:**
   - Complete footwear (`EU 37` – `EU 46`), leather handbags, travel luggage, and statement fashion accessories with material/hardware finish variants.
3. **Online & Physical Boutique Operations (Wuye Omnichannel):**
   - Seamless unification of online shopping (`/shop/clothes`) with the physical flagship boutique at **Suite 83 / Block B70, H&A Plaza, Wuye, Abuja**:
     - **Doorstep Delivery:** Intra-Abuja dispatch and nationwide inter-state courier delivery.
     - **Click-and-Collect (Free Wuye Pickup — `₦0`):** Buy online, pick up at Suite 83 / Block B70, H&A Plaza, Wuye, Abuja.
     - **POS Walk-In Stock Sync:** Real-time atomic inventory synchronization between the Wuye showroom floor and online checkout.
     - **Strict 24-Hour Return Policy:** Returns and exchanges are strictly accepted within **24 hours of receipt** (`delivered_at` or `picked_up_at`) in original unworn/unopened condition with tags intact.

### Division 3: Lifestyle Logistics (`/car-hire`)
1. **Car Hire & Vehicle Rentals:**
   - Hourly and daily chauffeur-driven or executive vehicle rentals within Abuja (Executive Sedans, Luxury SUVs, Executive Buses).
   - Enforces a **2-hour minimum advance booking recommendation** (`isUnderTwoHoursNotice` warning and priority WhatsApp escalation when pickup is `< 2 hours` away).
2. **Airport Transfers (`ABV`):**
   - Dedicated Nnamdi Azikiwe International Airport (`ABV`) pickup and drop-off scheduling with mandatory flight number tracking (`flightNumber`) and terminal meet-and-greet options.
3. **Inter-State Transportation & Logistics Services:**
   - Chauffeur-driven inter-state passenger charter from Abuja across all 36 Nigerian states.
   - Commercial and personal cargo, parcel, dispatch, and haulage bookings (`logistics_shipments`) with automated waybill generation (`LNG-WB-...`).

### Division 4: Lifestyle MTN Services (`/mtn-services/fibrex` & `/mtn-fibrex`)
1. **MTN FibreX Unlimited:**
   - Coverage verification, home/office fiber installation arrangements, appointment bookings, and subscription/renewal assistance across Abuja estates.
   - Prominent mandatory CTA: **`CHECK FIBREX AVAILABILITY IN MY AREA`** routing structured estate/address payloads to WhatsApp (`+2348064912969`).
   - Mandatory legal disclaimer displayed on all FibreX views and messages:
     > *"Coverage, installation, speed and service availability are subject to MTN confirmation."*
2. **MTN Telecommunications Products & Services:**
   - Full e-commerce catalog and cart/checkout integration for MTN 5G Broadband Routers, 4G LTE Routers, Pocket MiFis, Outdoor CPE Antennas, and data/service plans.
3. **MTN-Related Sales & Distribution:**
   - B2B bulk hardware procurement, enterprise fleet connectivity, and trade sub-dealer onboarding workflows (`mtn_distribution_requests`).

---

## 3. Canonical Site Map (9 Public Storefront Routes + Customer & Admin Portals)
1. **`/` (Homepage):** Equal 4-Division Bento Grid, Hero Monolith (*"Wear It. Connect It. Stay in It. Move with It."*), Featured Wuye Fashion & MTN Hardware Shelf, Kaura 4-Bed Duplex Spotlight, Fleet & FibreX Quick-Actions.
2. **`/shop/clothes` & `/shop/clothes/[slug]`:** Lifestyle Boutique (Fashion) catalog, sub-pillar filters (*Clothing | Shoes | Bags | Accessories*), Wuye Click-and-Collect badge, and 24-hour return policy banner.
3. **`/mtn-services/fibrex` (and `308` redirect from `/mtn-fibrex`):** Segmented 3-pillar hub (*MTN FibreX Unlimited | Telecom Products | Sales & Distribution*) with the `CHECK FIBREX AVAILABILITY IN MY AREA` workflow.
4. **`/stays` & `/stays/[slug]`:** Segmented 3-pillar Homes hub (*Short-Let Apartments | Furnished Accommodation | Property Management*), anchored by the Prince & Princess Estate 4-Bedroom Luxury Duplex in Kaura, Abuja.
5. **`/car-hire`:** Segmented 3-pillar Logistics hub (*Car Hire & Rentals | Airport Transfers | Inter-State & Logistics*) with 2-hour notice detection and `BOOK A CAR ON WHATSAPP`.
6. **`/about`:** Corporate profile of **Lifestyle Corporate Networks Ltd.** (Plot 12, Corporate Avenue, Garki, Abuja) and its 4 subsidiary divisions.
7. **`/contact`:** Interactive contact hub featuring **Suite 83 / Block B70, H&A Plaza, Wuye**, **Prince & Princess Estate, Kaura**, **Plot 12, Corporate Avenue, Garki**, and the 3 official phone/WhatsApp lines (`+2348064912969`, `+2349134275487`, `+2348125326496`).
8. **`/faqs`:** 9 categorized accordions covering Wuye Pickup, 24-Hour Returns, Kaura Shortlet Rules, Furnished Stays, Property Management, Car Hire 2-Hour Lead Time, Airport Transfers, Cargo Waybills, and MTN FibreX Confirmation.
9. **`/booking-form`:** Unified Multi-Service Booking & Enquiry Console allowing rapid switching across all 4 divisions in one place.
10. **`/checkout` & `/checkout/verify`:** Zero-trust Paystack/Flutterwave checkout with Wuye In-Store Pickup (`₦0`) vs. Doorstep Delivery and mandatory 24-hour return policy acknowledgment.
11. **`/account/orders` & `/account/bookings`:** Customer self-service portal with live countdown badge for the 24-hour return window.
12. **`/admin/*`:** Role-protected (`ADMIN` / `SUPER_ADMIN`) executive CMS across Products/POS, Orders/Returns, Stays/Property Mgmt, Logistics/Fleet, and MTN FibreX/Distribution.

---

## 4. Official Corporate Contacts & Physical Locations
- **Corporate Headquarters:** Plot 12, Corporate Avenue, Garki, Abuja, FCT, Nigeria
- **Physical Fashion Boutique & Click-and-Collect Hub:** Suite 83 / Block B70, H&A Plaza, Wuye, Abuja, FCT, Nigeria
- **Flagship Short-Let Property:** 4-Bedroom Luxury Duplex, Prince & Princess Estate, Kaura District, Abuja, FCT, Nigeria
- **Primary WhatsApp Concierge & Phone:** `+2348064912969`
- **Secondary Support Lines:** `+2349134275487`, `+2348125326496`
