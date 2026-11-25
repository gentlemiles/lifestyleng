import type {
  FleetVehicleView,
  ProductCatalogItem,
  StayPropertyView,
} from '@/types';

export const SEED_FASHION_PRODUCTS: ProductCatalogItem[] = [
  {
    id: '11111111-1111-4111-8111-111111111109',
    division: 'FASHION_BOUTIQUE',
    subPillar: 'SHOES',
    slug: 'classic-leather-loafers',
    title: 'Classic Leather Loafers',
    subtitle: 'Footwear > Men • Handcrafted black calfskin slip-on loafers.',
    description:
      'Full-grain leather upper with cushioned insole and non-slip rubber sole. Made for formal and smart-casual wear. Available for Abuja delivery or free pickup at Suite 83 / Block B70, H&A Plaza, Wuye, Abuja.',
    basePriceKobo: 3950000, // ₦39,500 sale price
    compareAtPriceKobo: 4500000, // ₦45,000 regular price
    images: [
      'https://images.unsplash.com/photo-1533867617858-e7b97e060509?auto=format&fit=crop&w=1000&q=85',
      'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1000&q=85',
    ],
    specifications: {
      Category: 'Footwear > Men',
      SKU: 'SKU-001',
      Upper: 'Full-Grain Black Calfskin Leather',
      Outsole: 'Cushioned Insole & Non-Slip Rubber Sole',
      Weight: '0.8 kg',
      BoutiqueLocation: 'Suite 83 / Block B70, H&A Plaza, Wuye, Abuja',
      ReturnPolicy: 'Strict 24-Hour Return & Exchange Guarantee Upon Receipt',
    },
    isWuyePickupEligible: true,
    variants: [
      {
        id: '21111111-1111-4111-8111-111111111118',
        productId: '11111111-1111-4111-8111-111111111109',
        sku: 'SKU-001',
        title: 'Black Calfskin / Classic Slip-On',
        size: 'Standard',
        colorName: 'Black Calfskin',
        colorHex: '#1A1A1D',
        materialFinish: 'Full-Grain Leather',
        priceKobo: 3950000,
        compareAtPriceKobo: 4500000,
        availableStock: 25,
        wuyeFloorStock: 12,
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111110',
    division: 'FASHION_BOUTIQUE',
    subPillar: 'BAGS',
    slug: 'minimalist-canvas-tote',
    title: 'Minimalist Canvas Tote',
    subtitle: 'Bags > Unisex • Heavy-duty 16oz organic cotton everyday tote.',
    description:
      'Reinforced stitching with internal zippered laptop pocket (fits up to 15-inch laptops) and magnetic snap closure. Available for Abuja delivery or free pickup at Suite 83 / Block B70, H&A Plaza, Wuye, Abuja.',
    basePriceKobo: 1800000, // ₦18,000
    compareAtPriceKobo: null,
    images: [
      'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=1000&q=85',
    ],
    specifications: {
      Category: 'Bags > Unisex',
      SKU: 'SKU-002',
      Material: '16oz Heavy-Duty Organic Cotton Canvas',
      Compartment: 'Internal Zippered 15" Laptop Pocket & Magnetic Snap Closure',
      Weight: '0.4 kg',
      BoutiqueLocation: 'Suite 83 / Block B70, H&A Plaza, Wuye, Abuja',
      ReturnPolicy: 'Strict 24-Hour Return & Exchange Guarantee Upon Receipt',
    },
    isWuyePickupEligible: true,
    variants: [
      {
        id: '21111111-1111-4111-8111-111111111119',
        productId: '11111111-1111-4111-8111-111111111110',
        sku: 'SKU-002',
        title: 'One Size / Warm Natural Canvas',
        size: 'One Size',
        colorName: 'Warm Natural Canvas',
        colorHex: '#B5946B',
        materialFinish: '16oz Organic Cotton',
        priceKobo: 1800000,
        compareAtPriceKobo: null,
        availableStock: 50,
        wuyeFloorStock: 25,
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111111',
    division: 'FASHION_BOUTIQUE',
    subPillar: 'CLOTHING',
    slug: 'signature-heavyweight-tee',
    title: 'Signature Heavyweight Tee',
    subtitle: 'Apparel > T-Shirts • 300gsm boxy-fit cotton t-shirt in 3 sizes.',
    description:
      'Pre-shrunk 100% combed cotton t-shirt with ribbed crewneck collar and dropped shoulders. Available in sizes M, L, and XL for delivery or free pickup at Suite 83 / Block B70, H&A Plaza, Wuye, Abuja.',
    basePriceKobo: 1950000, // ₦19,500 starting sale price
    compareAtPriceKobo: 2200000, // ₦22,000 regular price
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1000&q=85',
    ],
    specifications: {
      Category: 'Apparel > T-Shirts',
      ParentSKU: 'SKU-003',
      Fabric: '300gsm Pre-Shrunk 100% Combed Cotton',
      Fit: 'Boxy Fit • Ribbed Crewneck & Dropped Shoulders',
      Weight: '0.3 kg (M/L) • 0.35 kg (XL)',
      BoutiqueLocation: 'Suite 83 / Block B70, H&A Plaza, Wuye, Abuja',
      ReturnPolicy: 'Strict 24-Hour Return & Exchange Guarantee Upon Receipt',
    },
    isWuyePickupEligible: true,
    variants: [
      {
        id: '21111111-1111-4111-8111-111111111120',
        productId: '11111111-1111-4111-8111-111111111111',
        sku: 'SKU-003-M',
        title: 'Medium (M)',
        size: 'M',
        colorName: 'Classic Obsidian',
        colorHex: '#141416',
        priceKobo: 1950000, // ₦19,500 sale (regular ₦22,000)
        compareAtPriceKobo: 2200000,
        availableStock: 15,
        wuyeFloorStock: 8,
      },
      {
        id: '21111111-1111-4111-8111-111111111121',
        productId: '11111111-1111-4111-8111-111111111111',
        sku: 'SKU-003-L',
        title: 'Large (L)',
        size: 'L',
        colorName: 'Classic Obsidian',
        colorHex: '#141416',
        priceKobo: 1950000, // ₦19,500 sale (regular ₦22,000)
        compareAtPriceKobo: 2200000,
        availableStock: 20,
        wuyeFloorStock: 10,
      },
      {
        id: '21111111-1111-4111-8111-111111111122',
        productId: '11111111-1111-4111-8111-111111111111',
        sku: 'SKU-003-XL',
        title: 'Extra Large (XL)',
        size: 'XL',
        colorName: 'Classic Obsidian',
        colorHex: '#141416',
        priceKobo: 2100000, // ₦21,000 sale (regular ₦24,000)
        compareAtPriceKobo: 2400000,
        availableStock: 10,
        wuyeFloorStock: 6,
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111101',
    division: 'FASHION_BOUTIQUE',
    subPillar: 'CLOTHING',
    slug: 'structured-linen-safari-jacket-desert-sand',
    title: 'Structured Linen Safari Jacket',
    subtitle: 'Outerwear · Atelier • 100% Breathable Linen • Desert Sand',
    description:
      'Unstructured beige linen safari jacket tailored with dual pleated flap chest pockets and horn buttons. Vetted for immediate concierge fitting at Suite 83 / Block B70, H&A Plaza, Wuye, Abuja or same-day FCT dispatch.',
    basePriceKobo: 4850000, // ₦48,500
    compareAtPriceKobo: 5600000,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuB3NLoQz82XketNfroueG-PogF7GvCZlqGPc3wr1S_k85PJUqYNsHcLqd42XWZfZ7-nYGfCVu61PZZr6xVi6vrkPpbeTxwB-iof1VtL_xwV4PtncUB_NNUzbm7nKsnED64TD3r4Id1LNryOpezY47e_jQN0Pl3UWCa4K2TwRhf-5HsB6L-ebghUspJQSD8pkgo52LQbTzMCzJAKuLsGFbonPB5-Blij3xPV3KoxFBk',
    ],
    specifications: {
      Category: 'Outerwear · Atelier (New Season)',
      Fabric: '100% Breathable Italian Linen',
      Cut: 'Relaxed Executive Cut',
      BoutiqueLocation: 'Suite 83 / Block B70, H&A Plaza, Wuye, Abuja',
      ReturnPolicy: 'Strict 24-Hour Return & Exchange Guarantee Upon Receipt',
    },
    isWuyePickupEligible: true,
    variants: [
      {
        id: '21111111-1111-4111-8111-111111111101',
        productId: '11111111-1111-4111-8111-111111111101',
        sku: 'LCN-FSH-SAF-M-SND',
        title: 'Medium (M) / Desert Sand',
        size: 'M',
        colorName: 'Desert Sand',
        colorHex: '#E3D9C6',
        priceKobo: 4850000,
        compareAtPriceKobo: 5600000,
        availableStock: 6,
        wuyeFloorStock: 4,
      },
      {
        id: '21111111-1111-4111-8111-111111111102',
        productId: '11111111-1111-4111-8111-111111111101',
        sku: 'LCN-FSH-SAF-L-SND',
        title: 'Large (L) / Desert Sand',
        size: 'L',
        colorName: 'Desert Sand',
        colorHex: '#E3D9C6',
        priceKobo: 4850000,
        compareAtPriceKobo: 5600000,
        availableStock: 8,
        wuyeFloorStock: 5,
      },
      {
        id: '21111111-1111-4111-8111-111111111103',
        productId: '11111111-1111-4111-8111-111111111101',
        sku: 'LCN-FSH-SAF-XL-OLV',
        title: 'Extra Large (XL) / Olive Green',
        size: 'XL',
        colorName: 'Olive Green',
        colorHex: '#1C2826',
        priceKobo: 4850000,
        compareAtPriceKobo: 5600000,
        availableStock: 5,
        wuyeFloorStock: 3,
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111102',
    division: 'FASHION_BOUTIQUE',
    subPillar: 'CLOTHING',
    slug: 'merino-knit-polo-obsidian-black',
    title: 'Merino Knit Polo',
    subtitle: 'Knitwear · Bestseller • Obsidian Black · Ultra-fine 18-Gauge',
    description:
      'Fine-gauge knit obsidian black merino wool polo shirt with mother-of-pearl buttons and crisp ribbed collar. Stocked at Suite 83 / Block B70, H&A Plaza, Wuye, Abuja.',
    basePriceKobo: 3800000, // ₦38,000
    compareAtPriceKobo: null,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuByBmyGTcXWQCjPe3a15j7z1xng2VlRUOPlnjjVN1zVCxjoTdhJE7R43HCmthq7DsQRhCqijallFOR1g7PHHiiMl_5eimm7h_JG9xDPUc0AWdXycBT04O1plOyeXCXc2Nt_kYOzBxlMuu3Zv3x09nR7baZaHRcEJ4LT55Ag_7NN-cynR8d11ycs3Aot5HcEXUxUUnqQO6tfvDGOnKHkjzExk_2-HSKdp4zPHj8UG6s',
    ],
    specifications: {
      Category: 'Knitwear (Bestseller)',
      Material: 'Ultra-Fine 18-Gauge Merino Wool',
      BoutiqueLocation: 'Suite 83 / Block B70, H&A Plaza, Wuye, Abuja',
      ReturnPolicy: 'Strict 24-Hour Return & Exchange Guarantee Upon Receipt',
    },
    isWuyePickupEligible: true,
    variants: [
      {
        id: '21111111-1111-4111-8111-111111111104',
        productId: '11111111-1111-4111-8111-111111111102',
        sku: 'LCN-FSH-KNT-M-OBS',
        title: 'Medium (M) / Obsidian Black',
        size: 'M',
        colorName: 'Obsidian Black',
        colorHex: '#121214',
        priceKobo: 3800000,
        availableStock: 7,
        wuyeFloorStock: 4,
      },
      {
        id: '21111111-1111-4111-8111-111111111105',
        productId: '11111111-1111-4111-8111-111111111102',
        sku: 'LCN-FSH-KNT-L-SLV',
        title: 'Large (L) / Silver Birch',
        size: 'L',
        colorName: 'Silver Birch',
        colorHex: '#C2C0B8',
        priceKobo: 3800000,
        availableStock: 6,
        wuyeFloorStock: 4,
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111106',
    division: 'FASHION_BOUTIQUE',
    subPillar: 'CLOTHING',
    slug: 'tailored-italian-cotton-trousers-cream',
    title: 'Tailored Italian Cotton Trousers',
    subtitle: 'Trousers · Menswear • Cream · Relaxed Taper & Double Pleat',
    description:
      'Refined Italian cotton tailored trousers featuring forward double pleats, extended tab waistband, and sharp pressed crease. Available for private fitting at Wuye Plaza.',
    basePriceKobo: 5400000, // ₦54,000
    compareAtPriceKobo: null,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBzhbEIMSwT2-BJagWSn1qXf4TEHIpNC5wBeAbo_yRVsF32n6OAZcDekHNz7QpuWj4e_BwCk0fVRIxro5zZWZ7wFVOb7zEKV8PomK5vjgvD7tIEMP9DcjhpjBH41EMNq25mjGucoe8bjYgYahsC6h_b77rvUIAFUcLDPhI3fzmrDE2GXhxcRjxYCr_dotsy0mfMvLjos6LUba0wDu-iQ3hGjOY9xTQaljlhyCAvMmA',
    ],
    specifications: {
      Category: 'Trousers · Menswear (Atelier Fit)',
      Fabric: '100% Brushed Italian Cotton Twill',
      Waistband: 'Extended Tab with Side Adjusters',
      BoutiqueLocation: 'Suite 83 / Block B70, H&A Plaza, Wuye, Abuja',
    },
    isWuyePickupEligible: true,
    variants: [
      {
        id: '21111111-1111-4111-8111-111111111110',
        productId: '11111111-1111-4111-8111-111111111106',
        sku: 'LCN-FSH-TRS-M-CRM',
        title: 'Medium (M / 32) / Cream',
        size: 'M',
        colorName: 'Cream',
        colorHex: '#EAE7DC',
        priceKobo: 5400000,
        availableStock: 6,
        wuyeFloorStock: 4,
      },
      {
        id: '21111111-1111-4111-8111-111111111111',
        productId: '11111111-1111-4111-8111-111111111106',
        sku: 'LCN-FSH-TRS-L-NVY',
        title: 'Large (L / 34) / Deep Navy',
        size: 'L',
        colorName: 'Deep Navy',
        colorHex: '#2B3A42',
        priceKobo: 5400000,
        availableStock: 5,
        wuyeFloorStock: 3,
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111104',
    division: 'FASHION_BOUTIQUE',
    subPillar: 'BAGS',
    slug: 'handcrafted-pebble-leather-tote-cognac',
    title: 'Handcrafted Pebble Leather Tote',
    subtitle: 'Leather Goods · Limited Edition • Cognac Brown · Laptop Compartment',
    description:
      'Luxury handcrafted full-grain pebble leather tote bag in rich warm cognac brown with brushed antique brass hardware, reinforced rolled handles, and dedicated 16" laptop compartment.',
    basePriceKobo: 8500000, // ₦85,000
    compareAtPriceKobo: 9800000,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuCCOENGScJTyO0FW5oqX1h5BXHsyjGr9Uq8iQBBNtJMlRdWJeDftt6bxGvSWp0NXbL7hXxGM85jmu__cksH_mqxnw9Q1tzM4nXcMYQNVrGyw8F5c80Yl5Addnlq2eq5WwK5-MegCbuEuxxKH-pzfh925l1SP6EyVESgqAisET2an6dggkVzkAyDwM_2YDrX5RH6j5eygIzbd4_nj0tmTsmwb4xuRp6umQwxwSzD4VA',
    ],
    specifications: {
      Material: 'Full-Grain Pebble Calfskin Leather',
      Hardware: 'Brushed Antique Brass',
      Compartment: 'Padded 16" Executive Laptop Sleeve',
      BoutiqueLocation: 'Suite 83 / Block B70, H&A Plaza, Wuye, Abuja',
    },
    isWuyePickupEligible: true,
    variants: [
      {
        id: '21111111-1111-4111-8111-111111111108',
        productId: '11111111-1111-4111-8111-111111111104',
        sku: 'LCN-FSH-BAG-TOTE-CGN',
        title: 'One Size / Cognac Brown',
        size: 'One Size',
        colorName: 'Cognac Brown',
        colorHex: '#9E5B32',
        materialFinish: 'Full-Grain Leather',
        priceKobo: 8500000,
        compareAtPriceKobo: 9800000,
        availableStock: 6,
        wuyeFloorStock: 4,
      },
      {
        id: '21111111-1111-4111-8111-111111111112',
        productId: '11111111-1111-4111-8111-111111111104',
        sku: 'LCN-FSH-BAG-TOTE-ONX',
        title: 'One Size / Onyx Black',
        size: 'One Size',
        colorName: 'Onyx Black',
        colorHex: '#111111',
        materialFinish: 'Full-Grain Leather',
        priceKobo: 8500000,
        compareAtPriceKobo: 9800000,
        availableStock: 4,
        wuyeFloorStock: 2,
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111107',
    division: 'FASHION_BOUTIQUE',
    subPillar: 'CLOTHING',
    slug: 'cashmere-blend-overshirt-slate-blue',
    title: 'Cashmere-Blend Overshirt',
    subtitle: 'Layering · Autumn Drop • Slate Blue · Unlined Comfort',
    description:
      'Crafted from brushed cashmere and virgin wool blend in slate blue with horn button closures and clean angled pocketing for refined executive travel.',
    basePriceKobo: 6200000, // ₦62,000
    compareAtPriceKobo: null,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD-pNL3edKLfiWxs1PbXtjBHZFNtz5PfLJGQQwXDJwKMB8X9MQdseIO6xxgviuFMhbDp4CREg4we6zmoC8zLfR6QT6MUyxLQKYYl3SQf1DAZzmxeWubMphUm93CBKueBskcEZK1fGegI4dgn9mBJ48KtEZbygOXK1UgmjgObTR-IPuKkPjmyXsXM7_325voPgmqFZqhDsonlX0yAH1sdDK_mkmxiUL4fR4jQK62Kcs',
    ],
    specifications: {
      Category: 'Layering (Autumn Drop)',
      Blend: 'Brushed Cashmere & Virgin Wool',
      BoutiqueLocation: 'Suite 83 / Block B70, H&A Plaza, Wuye, Abuja',
    },
    isWuyePickupEligible: true,
    variants: [
      {
        id: '21111111-1111-4111-8111-111111111113',
        productId: '11111111-1111-4111-8111-111111111107',
        sku: 'LCN-FSH-OVR-L-SLT',
        title: 'Large (L) / Slate Blue',
        size: 'L',
        colorName: 'Slate Blue',
        colorHex: '#52657A',
        priceKobo: 6200000,
        availableStock: 5,
        wuyeFloorStock: 3,
      },
      {
        id: '21111111-1111-4111-8111-111111111114',
        productId: '11111111-1111-4111-8111-111111111107',
        sku: 'LCN-FSH-OVR-XL-TPE',
        title: 'Extra Large (XL) / Heather Taupe',
        size: 'XL',
        colorName: 'Heather Taupe',
        colorHex: '#8E8D8A',
        priceKobo: 6200000,
        availableStock: 4,
        wuyeFloorStock: 2,
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111103',
    division: 'FASHION_BOUTIQUE',
    subPillar: 'SHOES',
    slug: 'burnished-venetian-loafers-deep-oxblood',
    title: 'Burnished Venetian Loafers',
    subtitle: 'Footwear · Handcrafted • Deep Oxblood · Calfskin Insole & Vibram Sole',
    description:
      'Burnished oxblood leather Venetian loafers with hand-stitched apron details, supple calfskin lining, and low-profile Vibram outsoles. Available for fitting at Suite 83, H&A Plaza, Wuye.',
    basePriceKobo: 7400000, // ₦74,000
    compareAtPriceKobo: 8500000,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAowUvWdj0ETpNV_SdS54_c0ZylMdSynkSMiw4hIZKL0gGptgczdwFrUhXccnVU4gRYv3bVfqrtskHivQhB0wrCc3BbC0iLEn4Vb6uQSmpmB-jjvNwNGjW3k9i_qeLeKeq6wjDfSnAtZnGBYgHWqb6ktIf3I0TsaFOmG0TcutHUlFE7nNRQJBN9rpb87NZS_VZ9RVjHHw43Ta4qf0gFIDf7ikjYGITpnNbfX6EYihA',
    ],
    specifications: {
      Upper: 'Hand-Burnished Tuscan Calfskin',
      Outsole: 'Low-Profile Vibram Sole',
      BoutiqueLocation: 'Suite 83 / Block B70, H&A Plaza, Wuye, Abuja',
      ReturnPolicy: 'Eligible within 24 hours of receipt (unworn)',
    },
    isWuyePickupEligible: true,
    variants: [
      {
        id: '21111111-1111-4111-8111-111111111106',
        productId: '11111111-1111-4111-8111-111111111103',
        sku: 'LCN-FSH-SHOE-42-OXB',
        title: 'EU 42 / Deep Oxblood',
        shoeSizeEu: 42,
        colorName: 'Deep Oxblood',
        colorHex: '#541E24',
        materialFinish: 'Full-Grain Leather',
        priceKobo: 7400000,
        compareAtPriceKobo: 8500000,
        availableStock: 5,
        wuyeFloorStock: 3,
      },
      {
        id: '21111111-1111-4111-8111-111111111107',
        productId: '11111111-1111-4111-8111-111111111103',
        sku: 'LCN-FSH-SHOE-43-NRO',
        title: 'EU 43 / Nero Black',
        shoeSizeEu: 43,
        colorName: 'Nero Black',
        colorHex: '#181818',
        materialFinish: 'Full-Grain Leather',
        priceKobo: 7400000,
        compareAtPriceKobo: 8500000,
        availableStock: 4,
        wuyeFloorStock: 2,
      },
      {
        id: '21111111-1111-4111-8111-111111111115',
        productId: '11111111-1111-4111-8111-111111111103',
        sku: 'LCN-FSH-SHOE-44-OXB',
        title: 'EU 44 / Deep Oxblood',
        shoeSizeEu: 44,
        colorName: 'Deep Oxblood',
        colorHex: '#541E24',
        materialFinish: 'Full-Grain Leather',
        priceKobo: 7400000,
        compareAtPriceKobo: 8500000,
        availableStock: 3,
        wuyeFloorStock: 2,
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111108',
    division: 'FASHION_BOUTIQUE',
    subPillar: 'CLOTHING',
    slug: 'monogram-silk-resort-shirt-terracotta',
    title: 'Monogram Silk Resort Shirt',
    subtitle: 'Shirts · Silk • Terracotta · Camp Collar',
    description:
      'Lightweight silk twill camp-collar resort shirt in subtle terracotta and sand geometric interlocking patterns with refined drape.',
    basePriceKobo: 4200000, // ₦42,000
    compareAtPriceKobo: null,
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBMjplrTBlPqE_Rzfb6_aUZbz5Nk-fLJeKfpqwC445R6rwGAZJ8_YM6BFnH-UQkMdmwcfZ1BsC25LRuITCbfY_-dFpg_ilI6m2KPMSDF2HwczDm4C1xt4q2dOF6EmD878KAn71BetGqHK2JUl6VfzeeNTp214JQqWCqoAtQrVW0eRvSxXlGTGt_Nr7uC1zxOdafetHDvv0amysul6MTDg7fWYZv-Le1GCLM68ftIaM',
    ],
    specifications: {
      Category: 'Shirts · Silk (Resortwear)',
      Material: '100% Mulberry Silk Twill',
      Collar: 'Relaxed Camp Collar',
      BoutiqueLocation: 'Suite 83 / Block B70, H&A Plaza, Wuye, Abuja',
    },
    isWuyePickupEligible: true,
    variants: [
      {
        id: '21111111-1111-4111-8111-111111111116',
        productId: '11111111-1111-4111-8111-111111111108',
        sku: 'LCN-FSH-SRT-M-TRC',
        title: 'Medium (M) / Terracotta',
        size: 'M',
        colorName: 'Terracotta',
        colorHex: '#B85D3A',
        priceKobo: 4200000,
        availableStock: 6,
        wuyeFloorStock: 4,
      },
      {
        id: '21111111-1111-4111-8111-111111111117',
        productId: '11111111-1111-4111-8111-111111111108',
        sku: 'LCN-FSH-SRT-L-SGE',
        title: 'Large (L) / Sage Green',
        size: 'L',
        colorName: 'Sage Green',
        colorHex: '#3B5249',
        priceKobo: 4200000,
        availableStock: 5,
        wuyeFloorStock: 3,
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111105',
    division: 'FASHION_BOUTIQUE',
    subPillar: 'ACCESSORIES',
    slug: 'polarized-acetate-navigator-sunglasses',
    title: 'Polarized Titanium & Acetate Navigator Sunglasses',
    subtitle: 'Accessories · Eyewear • UV400 Anti-Reflective Lens • Hand-Polished Frame',
    description:
      'Featherweight Japanese titanium bridge paired with tortoise-shell Mazzucchelli acetate temples. Includes protective hard leather case at our Wuye Atelier.',
    basePriceKobo: 5800000, // ₦58,000
    compareAtPriceKobo: 6800000,
    images: [
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1000&q=85',
    ],
    specifications: {
      Protection: '100% UV400 Polarized',
      Frame: 'Japanese Titanium & Acetate',
      BoutiqueLocation: 'Suite 83 / Block B70, H&A Plaza, Wuye, Abuja',
    },
    isWuyePickupEligible: true,
    variants: [
      {
        id: '21111111-1111-4111-8111-111111111109',
        productId: '11111111-1111-4111-8111-111111111105',
        sku: 'LCN-FSH-ACC-SUN-TRT',
        title: 'One Size / Havana Tortoise & Gold',
        size: 'One Size',
        colorName: 'Havana Tortoise',
        colorHex: '#5C3A21',
        materialFinish: 'Gold Hardware',
        priceKobo: 5800000,
        compareAtPriceKobo: 6800000,
        availableStock: 9,
        wuyeFloorStock: 6,
      },
    ],
  },
];

export const SEED_MTN_PRODUCTS: ProductCatalogItem[] = [
  {
    id: '11111111-1111-4111-8111-111111111201',
    division: 'MTN_SERVICES',
    subPillar: 'MTN_HARDWARE',
    slug: 'mtn-5g-home-broadband-router-wi-fi-6',
    title: 'MTN 5G Broadband Router (Wi-Fi 6)',
    subtitle: 'ZTE / Huawei High-Spec • Up to 1Gbps • Includes 100GB Welcome Data',
    description:
      'Official MTN 5G indoor CPE router with plug-and-play ultra-fast Wi-Fi 6 connectivity for Abuja homes and corporate offices. Connects up to 64 devices simultaneously with 100GB initial data bonus.',
    basePriceKobo: 6500000, // ₦65,000
    compareAtPriceKobo: 7500000,
    images: [
      'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=1000&q=85',
    ],
    specifications: {
      Network: '5G NR / 4G LTE-A Cat 19 Fallback',
      WiFiStandard: 'Wi-Fi 6 (802.11ax) Dual-Band',
      MaxDevices: 'Up to 64 Concurrent Devices',
      WelcomeBonus: 'Includes 100GB Welcome Data',
    },
    isWuyePickupEligible: true,
    variants: [
      {
        id: '21111111-1111-4111-8111-111111111201',
        productId: '11111111-1111-4111-8111-111111111201',
        sku: 'LCN-MTN-5G-RTR-STD',
        title: 'Standard 5G Router + 100GB SIM Pack',
        size: 'One Size',
        colorName: 'Arctic White',
        colorHex: '#FFFFFF',
        priceKobo: 6500000,
        compareAtPriceKobo: 7500000,
        availableStock: 15,
        wuyeFloorStock: 10,
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111202',
    division: 'MTN_SERVICES',
    subPillar: 'MTN_HARDWARE',
    slug: 'mtn-4g-lte-pocket-mifi-pro',
    title: 'MTN 4G+ LTE Pocket MiFi (3000mAh)',
    subtitle: '12-Hour All-Day Battery • 16 Devices • Includes 30GB Bonus Data',
    description:
      'Compact high-speed mobile hotspot engineered for executives travelling across Abuja and inter-state routes. Includes 3000mAh battery and 30GB bonus data on activation.',
    basePriceKobo: 1850000, // ₦18,500
    compareAtPriceKobo: null,
    images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=1000&q=85',
    ],
    specifications: {
      Network: '4G LTE Cat 6 High-Speed',
      Battery: '3000mAh Rechargeable (Up to 12 Hours)',
      MaxDevices: '16 Wi-Fi Enabled Devices',
      WelcomeBonus: 'Includes 30GB Activation Bonus',
    },
    isWuyePickupEligible: true,
    variants: [
      {
        id: '21111111-1111-4111-8111-111111111202',
        productId: '11111111-1111-4111-8111-111111111202',
        sku: 'LCN-MTN-4G-MIFI-PRO',
        title: 'Pocket MiFi + 30GB Starter SIM',
        size: 'One Size',
        colorName: 'Matte Black',
        colorHex: '#1D1D1F',
        priceKobo: 1850000,
        availableStock: 24,
        wuyeFloorStock: 15,
      },
    ],
  },
  {
    id: '11111111-1111-4111-8111-111111111203',
    division: 'MTN_SERVICES',
    subPillar: 'MTN_HARDWARE',
    slug: 'mtn-outdoor-high-gain-cpe-enterprise-kit',
    title: 'MTN High-Gain Outdoor CPE Antenna',
    subtitle: 'Weatherproof IP65 Directional Antenna • Ideal for Estates & Villas',
    description:
      'High-gain outdoor CPE unit with Power-over-Ethernet (PoE) and indoor Wi-Fi 6 gateway for maximum signal reception across Abuja estates and multi-floor compounds.',
    basePriceKobo: 3500000, // ₦35,000
    compareAtPriceKobo: 4200000,
    images: [
      'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1000&q=85',
    ],
    specifications: {
      Protection: 'IP65 Weatherproof Outdoor Rating',
      Power: 'PoE (Power over Ethernet) Included',
      UseCase: 'Multi-Floor Duplexes & Corporate Compounds',
    },
    isWuyePickupEligible: true,
    variants: [
      {
        id: '21111111-1111-4111-8111-111111111203',
        productId: '11111111-1111-4111-8111-111111111203',
        sku: 'LCN-MTN-CPE-OUTDOOR',
        title: 'Outdoor High-Gain CPE Unit',
        size: 'One Size',
        colorName: 'Industrial White',
        colorHex: '#F5F5F7',
        priceKobo: 3500000,
        compareAtPriceKobo: 4200000,
        availableStock: 10,
        wuyeFloorStock: 5,
      },
    ],
  },
];

export const SEED_STAY_PROPERTIES: StayPropertyView[] = [
  {
    id: '31111111-1111-4111-8111-111111111101',
    slug: 'kaura-4-bedroom-luxury-duplex',
    title: 'The Residence at Prince & Princess — 4-Bedroom Luxury Duplex',
    subtitle:
      '4 Rooms All En-Suite (2 Double Beds, 4 Single Beds • Max 8 Persons) • Rent Per Room or Whole Apartment • Kaura District, Abuja',
    category: 'Short-Let Duplex',
    district: 'Kaura District, Abuja',
    estateName: 'Prince & Princess Estate',
    address:
      'House 43, 1st Crescent, Off Drive 2, Prince & Princess Estate, First gate, opposite Kaura Market, Kaura District',
    bedrooms: 4,
    bathrooms: 5,
    maxGuests: 8,
    livingRoomSizeSqm: 22,
    defaultEnsuiteSizeSqm: 3,
    nightlyRateKobo: 12000000, // ₦120,000 / night (Whole 4-Bedroom Apartment)
    weeklyRateKobo: 78000000, // ₦780,000 / week
    monthlyRateKobo: 295000000, // ₦2,950,000 / month
    cautionDepositKobo: 5000000, // ₦50,000 refundable caution deposit
    aboutIntro:
      'Experience comfort, convenience and relaxation in our fully furnished apartment, thoughtfully designed to provide a cosy, homely and enjoyable stay for individuals, families and business travellers.',
    ourPromise:
      'A comfortable home away from home, where convenience meets relaxation and every detail is designed to make your stay enjoyable.',
    amenityGroups: [
      {
        id: 'ag-comfort',
        title: 'Comfort & Living',
        items: [
          'Fully furnished and tastefully arranged apartment',
          'Cosy living room with comfortable seating and warm blankets for relaxation',
        ],
      },
      {
        id: 'ag-recreation',
        title: 'Recreation & Entertainment',
        items: [
          'Table soccer for fun and friendly competition',
          'Traditional Ayo board game',
          'Collection of inspirational and interesting books for reading and relaxation',
        ],
      },
      {
        id: 'ag-dining',
        title: 'Dining & Kitchen Facilities',
        items: [
          'Complete dining set for comfortable dining',
          'Coffee maker for freshly brewed coffee',
          'Fully equipped kitchen featuring a microwave, oven and gas burner',
          'Filled gas cylinder provided',
          'Kitchen smoke/heat extractor for ventilation',
        ],
      },
      {
        id: 'ag-connectivity',
        title: 'Connectivity & Entertainment',
        items: [
          'Fast MTN FibreX Wi-Fi for seamless internet connectivity',
          'Smart Cable TV with access to Netflix and YouTube',
        ],
      },
      {
        id: 'ag-power',
        title: 'Power Supply',
        items: [
          '24/7 electricity supported by solar panels and battery backup to ensure uninterrupted comfort',
        ],
      },
      {
        id: 'ag-security',
        title: 'Security',
        items: [
          '24/7 security personnel on-site',
          'Outdoor security cameras for additional monitoring',
          'Secure entrance with a security-code access system',
        ],
      },
      {
        id: 'ag-housekeeping',
        title: 'Housekeeping Services',
        items: [
          'Professional cleaning and general housekeeping three times a week to maintain a clean, fresh and comfortable environment',
        ],
      },
    ],
    rooms: [
      {
        id: 'room-kaura-deluxe-1',
        name: 'Deluxe Room 1',
        roomSizeSqm: 15,
        ensuiteSizeSqm: 3,
        bedType: '1 Queen-size bed',
        occupancy: 2,
        nightlyRateKobo: 5800000, // ₦58,000
        imageUrl: '/images/stays/prince-and-princess/deluxe-room-1.jpg',
        description:
          'Spacious 15 sqm primary suite with a 3 sqm private en-suite bathroom, Queen-size bed, Smart Cable TV, and MTN FibreX Wi-Fi.',
      },
      {
        id: 'room-kaura-deluxe-2',
        name: 'Deluxe Room 2',
        roomSizeSqm: 14,
        ensuiteSizeSqm: 3,
        bedType: '1 Queen-size bed',
        occupancy: 2,
        nightlyRateKobo: 5500000, // ₦55,000
        imageUrl: '/images/stays/prince-and-princess/deluxe-room-2.jpg',
        description:
          'Bright 14 sqm room with a 3 sqm private en-suite bathroom, Queen-size bed, split A/C, and wall mirror.',
      },
      {
        id: 'room-kaura-double-1',
        name: 'Double Room 1',
        roomSizeSqm: 14,
        ensuiteSizeSqm: 3,
        bedType: '2 Single beds',
        occupancy: 2,
        nightlyRateKobo: 5500000, // ₦55,000
        imageUrl: '/images/stays/prince-and-princess/double-room-1.jpg',
        description:
          'Well-appointed 14 sqm twin room with 2 single beds and a 3 sqm private en-suite bathroom.',
      },
      {
        id: 'room-kaura-double-2',
        name: 'Double Room 2',
        roomSizeSqm: 12,
        ensuiteSizeSqm: 3,
        bedType: '2 Single beds',
        occupancy: 2,
        nightlyRateKobo: 5000000, // ₦50,000
        imageUrl: '/images/stays/prince-and-princess/double-room-2.jpg',
        description:
          'Cosy 12 sqm twin room featuring 2 single beds and a 3 sqm private en-suite bathroom.',
      },
    ],
    amenities: [
      '4 Rooms All En-Suite (2 Double Beds & 4 Single Beds • Max 8 Persons)',
      'Flexible Rental: Can Be Rented Per Room or Whole Apartment',
      'No Pets Allowed',
      '24/7 Electricity Supported by Solar Panels & Battery Backup',
      'Fast MTN FibreX Wi-Fi & Smart Cable TV (Netflix & YouTube)',
      '24/7 Security Personnel, Outdoor Cameras & Security-Code Entrance',
      'Fully Equipped Kitchen (Microwave, Oven, Gas Burner, Coffee Maker & Extractor)',
      'Table Soccer, Traditional Ayo Board Game & Books Collection',
      'Professional Cleaning & Housekeeping Three Times a Week',
    ],
    images: [
      '/images/stays/prince-and-princess/living-room-hero.jpg',
      '/images/stays/prince-and-princess/living-room-ayo-and-lounge.jpg',
      '/images/stays/prince-and-princess/deluxe-room-1.jpg',
      '/images/stays/prince-and-princess/dining-and-coffee-bar.jpg',
      '/images/stays/prince-and-princess/table-soccer-recreation.jpg',
      '/images/stays/prince-and-princess/equipped-kitchen.jpg',
      '/images/stays/prince-and-princess/ensuite-bathroom.jpg',
      '/images/stays/prince-and-princess/exterior-front.jpg',
    ],
    isFlagship: true,
    blockedDates: [
      {
        startDate: '2026-12-24',
        endDate: '2026-12-28',
        reason: 'CONFIRMED_GUEST_STAY',
      },
    ],
  },
  {
    id: '31111111-1111-4111-8111-111111111102',
    slug: 'wuye-2-bedroom-executive-furnished-suite',
    title: 'Wuye Heights 2-Bedroom Executive Suite',
    subtitle: 'Short-Stay & Monthly Corporate Lease • 3 Mins from H&A Plaza, Wuye',
    category: 'Executive Suite',
    district: 'Wuye District, Abuja',
    estateName: 'Wuye Executive Courts',
    address: 'Plot 18, Off Olusegun Obasanjo Way, Wuye District, Abuja, FCT',
    bedrooms: 2,
    bathrooms: 3,
    maxGuests: 4,
    livingRoomSizeSqm: 18,
    defaultEnsuiteSizeSqm: 3,
    nightlyRateKobo: 7500000, // ₦75,000 / night
    weeklyRateKobo: 48000000, // ₦480,000 / week
    monthlyRateKobo: 180000000, // ₦1,800,000 / month
    cautionDepositKobo: 3000000, // ₦30,000
    aboutIntro:
      'Modern 2-bedroom corporate suite in Wuye District, positioned three minutes from our Suite 83, H&A Plaza boutique.',
    ourPromise:
      'Reliable corporate comfort with uninterrupted solar hybrid power and fiber connectivity.',
    amenityGroups: [
      {
        id: 'ag-wuye-living',
        title: 'Comfort & Connectivity',
        items: [
          '2 en-suite bedrooms with orthopedic mattresses',
          '18 sqm living room and dining area',
          'High-speed MTN FibreX Wi-Fi and Smart TV',
          '24/7 solar hybrid inverter and security gatehouse',
        ],
      },
    ],
    rooms: [
      {
        id: 'room-wuye-1',
        name: 'Executive Room 1',
        roomSizeSqm: 14,
        ensuiteSizeSqm: 3,
        bedType: '1 Queen-size bed',
        occupancy: 2,
        nightlyRateKobo: 4200000,
        imageUrl:
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=85',
        description: 'Primary en-suite bedroom with Queen-size bed and work desk.',
      },
      {
        id: 'room-wuye-2',
        name: 'Executive Room 2',
        roomSizeSqm: 13,
        ensuiteSizeSqm: 3,
        bedType: '1 Queen-size bed',
        occupancy: 2,
        nightlyRateKobo: 3800000,
        imageUrl:
          'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=85',
        description: 'Second en-suite bedroom with Queen-size bed.',
      },
    ],
    amenities: [
      '2 En-Suite Bedrooms',
      '24/7 Power & Solar Hybrid System',
      'High-Speed MTN FibreX Internet & Dedicated Workspace',
      'Walking Distance to Suite 83, H&A Plaza, Wuye',
      'Gated Access & CCTV Surveillance',
    ],
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=85',
    ],
    isFlagship: false,
    blockedDates: [],
  },
  {
    id: '31111111-1111-4111-8111-111111111103',
    slug: 'maitama-3-bedroom-diplomatic-penthouse',
    title: 'Maitama 3-Bedroom Diplomatic Penthouse',
    subtitle: 'Extended Corporate & Diplomatic Accommodation • Maitama, Abuja',
    category: 'Diplomatic Penthouse',
    district: 'Maitama District, Abuja',
    estateName: 'Maitama Diplomatic Enclave',
    address: 'No. 14 Nile Street, Maitama District, Abuja, FCT, Nigeria',
    bedrooms: 3,
    bathrooms: 4,
    maxGuests: 6,
    livingRoomSizeSqm: 28,
    defaultEnsuiteSizeSqm: 4,
    nightlyRateKobo: 16000000, // ₦160,000 / night
    weeklyRateKobo: 102000000, // ₦1,020,000 / week
    monthlyRateKobo: 380000000, // ₦3,800,000 / month
    cautionDepositKobo: 5000000, // ₦50,000
    aboutIntro:
      'Spacious 3-bedroom diplomatic penthouse in Maitama with private terrace, 24/7 solar-backed power, and dedicated MTN FibreX connectivity.',
    ourPromise:
      'Quiet diplomatic-grade hospitality in the center of Abuja.',
    amenityGroups: [
      {
        id: 'ag-maitama-1',
        title: 'Penthouse Highlights',
        items: [
          '3 en-suite bedrooms with private terrace access',
          '28 sqm living lounge and formal dining room',
          '24/7 power backup and diplomatic enclave security',
        ],
      },
    ],
    rooms: [
      {
        id: 'room-maitama-1',
        name: 'Diplomatic Master Suite',
        roomSizeSqm: 18,
        ensuiteSizeSqm: 4,
        bedType: '1 King-size bed',
        occupancy: 2,
        nightlyRateKobo: 6500000,
        imageUrl:
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=85',
        description: 'Master suite with private terrace view and 4 sqm en-suite.',
      },
      {
        id: 'room-maitama-2',
        name: 'Deluxe Suite 2',
        roomSizeSqm: 15,
        ensuiteSizeSqm: 4,
        bedType: '1 Queen-size bed',
        occupancy: 2,
        nightlyRateKobo: 5500000,
        imageUrl:
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=85',
        description: 'En-suite guest bedroom with Queen-size bed.',
      },
      {
        id: 'room-maitama-3',
        name: 'Twin Suite 3',
        roomSizeSqm: 14,
        ensuiteSizeSqm: 3,
        bedType: '2 Single beds',
        occupancy: 2,
        nightlyRateKobo: 5000000,
        imageUrl:
          'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=85',
        description: 'En-suite twin bedroom with 2 single beds.',
      },
    ],
    amenities: [
      '3 Luxury En-Suite Bedrooms',
      'Panoramic Maitama Terrace',
      'Chauffeur Car Hire Priority Integration',
      '24/7 Power & Diplomatic-Grade Security',
    ],
    images: [
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=85',
    ],
    isFlagship: false,
    blockedDates: [],
  },
  {
    id: '31111111-1111-4111-8111-111111111104',
    slug: 'guzape-hilltop-5-bedroom-diplomatic-villa',
    title: 'Guzape Hilltop 5-Bedroom Diplomatic Villa',
    subtitle: 'Private Hilltop Compound with Security Lounge • Guzape, Abuja',
    category: 'Luxury Villa',
    district: 'Guzape District, Abuja',
    estateName: 'Guzape Hills Diplomatic Zone',
    address: 'Plot 402, Asokoro-Guzape Hilltop Corridor, Guzape District, Abuja',
    bedrooms: 5,
    bathrooms: 6,
    maxGuests: 10,
    livingRoomSizeSqm: 34,
    defaultEnsuiteSizeSqm: 4,
    nightlyRateKobo: 22000000, // ₦220,000 / night
    weeklyRateKobo: 140000000, // ₦1,400,000 / week
    monthlyRateKobo: 520000000, // ₦5,200,000 / month
    cautionDepositKobo: 10000000, // ₦100,000
    aboutIntro:
      'Five-bedroom hilltop villa in Guzape designed for visiting delegations, families, and executive retreats.',
    ourPromise:
      'Complete privacy, panoramic hilltop views, and 24/7 power and security.',
    amenityGroups: [
      {
        id: 'ag-guzape-1',
        title: 'Villa Highlights',
        items: [
          '5 en-suite bedrooms across two floors',
          '34 sqm main living room and private dining hall',
          'Dedicated 250Mbps MTN FibreX connection',
          '24/7 solar hybrid power and gated security post',
        ],
      },
    ],
    rooms: [
      {
        id: 'room-guzape-1',
        name: 'Hilltop Master Suite',
        roomSizeSqm: 20,
        ensuiteSizeSqm: 4,
        bedType: '1 King-size bed',
        occupancy: 2,
        nightlyRateKobo: 6800000,
        imageUrl:
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
        description: 'Primary hilltop suite with balcony and 4 sqm en-suite.',
      },
      {
        id: 'room-guzape-2',
        name: 'Deluxe Suite 2',
        roomSizeSqm: 16,
        ensuiteSizeSqm: 4,
        bedType: '1 Queen-size bed',
        occupancy: 2,
        nightlyRateKobo: 5800000,
        imageUrl:
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
        description: 'En-suite guest room with Queen-size bed.',
      },
    ],
    amenities: [
      '5 Autonomous En-Suite Bedrooms',
      'Panoramic Abuja City Views',
      'Dedicated 250Mbps MTN FibreX Pipe',
      'Chauffeur Staging Bay',
    ],
    images: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85',
    ],
    isFlagship: false,
    blockedDates: [],
  },
];

export const SEED_FLEET_VEHICLES: FleetVehicleView[] = [
  {
    id: '41111111-1111-4111-8111-111111111102',
    slug: 'executive-sedan-camry-lexus-es',
    name: 'Executive Sedan (Toyota Camry / Lexus ES)',
    category: 'EXECUTIVE_SEDAN',
    hourlyRateKobo: 1000000, // ₦10,000 / hr
    dailyIntraCityRateKobo: 4500000, // ₦45,000 / day (Abuja Intra-City per Stitch PRD)
    airportTransferRateKobo: 3000000, // ₦30,000 One-Way (₦55k–₦65k Roundtrip)
    interStateDailyRateKobo: 9500000, // ₦95,000 / day Inter-State
    passengerCapacity: 3,
    luggageCapacity: 2,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuClAecYgT6zOwBuBSPCgSZOayKzXrf_WctoAg5O3_TZJlRD_TYHczdK4ErOVYwq5WwZjzP_ElxoPiAkpAAFWMLliWreZ9RiuncQh6f9JzVj6ioEmOluxZanbIizmX0G0DuBcgbO4SiglAWROqau93I_EIHNUQTC0cx6ryf2-o5iGUZrh_bxLvEzGMag_15UzudYr8Y29yhk4MK8XJVnKEZYOo40mJr9tQXinWtBJt0',
    isAvailable: true,
  },
  {
    id: '41111111-1111-4111-8111-111111111101',
    slug: 'toyota-land-cruiser-prado-vx-executive',
    name: 'Luxury SUV (Toyota Land Cruiser Prado V8 / Lexus GX)',
    category: 'LUXURY_SUV',
    hourlyRateKobo: 1800000, // ₦18,000 / hr
    dailyIntraCityRateKobo: 9500000, // ₦95,000 / day (Abuja Intra-City per Stitch PRD)
    airportTransferRateKobo: 5500000, // ₦55,000 One-Way (₦95,000 Roundtrip)
    interStateDailyRateKobo: 16500000, // ₦165,000 / day Inter-State
    passengerCapacity: 4,
    luggageCapacity: 4,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBR1N7LJxKLCfEgxQ0xypWGlDLNNuDJ6irFejKaFS67ck3QRrwYBmVbgZlwgztiA41KCjyvlFiR4myNPB0Ca2qPjhuojWtubmMIignCA6Q6USioKGzby0HOpsEfHGXY41XufpMGDLT9GjR4SceBU4VRD8CV-IC0iropen6cYFrvA65y5f8qA_SzCPn1gFZvtjWBTCeNE6FiPDRUzzdvAhhazOinwbg-3X4Foal65vU',
    isAvailable: true,
  },
  {
    id: '41111111-1111-4111-8111-111111111104',
    slug: 'toyota-hiace-executive-vip-van',
    name: 'Executive VIP Van (Toyota HiAce 10-Pax Captain Seats)',
    category: 'EXECUTIVE_BUS',
    hourlyRateKobo: 2200000, // ₦22,000 / hr
    dailyIntraCityRateKobo: 14000000, // ₦140,000 / day (Abuja Intra-City per Stitch PRD)
    airportTransferRateKobo: 7500000, // ₦75,000 One-Way (₦135,000 Roundtrip)
    interStateDailyRateKobo: 21000000, // ₦210,000 / day Inter-State
    passengerCapacity: 10,
    luggageCapacity: 10,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDzkYTyu9DfZxckQ7oI0wmRt7GY_qDPUdCyoLCb9Rib3-H0sJx3BbYkR9aFx9JjAWC5iXERMf72OgA9bpquniSoh-rJPuSxGEIczkE8KktPmlsFSBFz0JsAGPKOAYvK1NWIQuwKlkpHpIAygt5WNoBNbb7W6_5KmgJMG-NRTAwJVmbwvRYidCAIqLvbWjAvlQ2RRtn1b4VWo1qcouTJbanxhqbWME5vk0EEbx5lQkw',
    isAvailable: true,
  },
  {
    id: '41111111-1111-4111-8111-111111111103',
    slug: 'lexus-lx570-diplomatic-flagship-suv',
    name: 'Lexus LX 570 Diplomatic Escort Flagship SUV',
    category: 'LUXURY_SUV',
    hourlyRateKobo: 3200000, // ₦32,000 / hr
    dailyIntraCityRateKobo: 18500000, // ₦185,000 / day
    airportTransferRateKobo: 8500000, // ₦85,000 ABV Airport VIP Tarmac Protocol
    interStateDailyRateKobo: 28000000, // ₦280,000 / day Inter-State
    passengerCapacity: 4,
    luggageCapacity: 4,
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD9Nq8Eo1IZjJoXoQUTnAPzPhTx53Xolmhg8lVgXM7evqnADm-2w3_a8wetqkgBX-xI-UAiR0MKbDKFZVHX-yGlDzObK2qQ4VANUnY8oLZ1aajGK-KKTYYc3xauhrrkTXivdsPNJIno0EKqmVi3uw-rZZzctIUTKvP24g2zR85T0wvkDQ1U6hch-1zUan4bEmWrkhdXqd1SouZDcWKDyG6HjsTIYUcwQ6uyF9y7v2E',
    isAvailable: true,
  },
];

export const SEED_PRODUCTS_ALL: ProductCatalogItem[] = [
  ...SEED_FASHION_PRODUCTS,
  ...SEED_MTN_PRODUCTS,
];
