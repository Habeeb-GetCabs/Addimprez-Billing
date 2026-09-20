import { Category, Product, BusinessSettings } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  { 
    id: 'cat_flex_sign', 
    name: 'Flex & Sign Boards', 
    iconName: 'Layers', 
    description: 'Ordinary flex change, star flex change, flex with frame (ordinary & star)' 
  },
  { 
    id: 'cat_glow_sign', 
    name: 'Glow Sign Boards', 
    iconName: 'Sun', 
    description: 'Backlit glow signs, flex change, single side, front & back, powder coat finish' 
  },
  { 
    id: 'cat_led_sign', 
    name: 'LED Signs', 
    iconName: 'Sparkles', 
    description: 'LED sign boards, 3D illuminated letters, high-visibility storefronts' 
  },
  { 
    id: 'cat_vinyl_foam', 
    name: 'Vinyl & Foam Boards', 
    iconName: 'Palette', 
    description: 'Vinyl ordinary, eco vinyl, foam sheet mounting, lamination' 
  },
  { 
    id: 'cat_standees', 
    name: 'Standees & Displays', 
    iconName: 'Maximize2', 
    description: 'Roll up standees (2x5ft, 3x6ft regular & premium), framed standees single & double side' 
  },
  { 
    id: 'cat_acrylic', 
    name: 'Acrylic Products', 
    iconName: 'Square', 
    description: 'Acrylic sneeze guards, acrylic laser products, display stands' 
  },
  { 
    id: 'cat_single_color_notices', 
    name: 'A4/A5 Notices - Single Color', 
    iconName: 'Printer', 
    description: 'Single color notices SS & FB on A4 and A5 sizes in 1000 to 10000 lot quantities' 
  },
  { 
    id: 'cat_pads_books', 
    name: 'Prescription Pads & Bill Books', 
    iconName: 'FileText', 
    description: 'Doctor prescription pads (A4/A5 single & 2 color), 1+1 carbonless duplicate bill books' 
  },
  { 
    id: 'cat_multi_flyers', 
    name: 'Multi-Color Flyers', 
    iconName: 'Copy', 
    description: 'A4 & A5 multicolour flyers / pamphlets (Single Side & Front/Back)' 
  },
  { 
    id: 'cat_folders', 
    name: 'File Folders', 
    iconName: 'Folder', 
    description: '11x17 inch single & 2 color folders, A3 13x19 inch multi-color folders with/without lamination' 
  },
  { 
    id: 'cat_rx_bulk', 
    name: 'Bulk Prescription Pads', 
    iconName: 'BookOpen', 
    description: 'A4 Bond sheet 10-pad (1000 sheets), A4 10-pad, A5 20-pad bulk packages' 
  },
  { 
    id: 'cat_calendars', 
    name: 'Calendars', 
    iconName: 'Calendar', 
    description: 'A5 & A4 7-page table top calendars, A3 single page wall calendars' 
  },
  { 
    id: 'cat_special_services', 
    name: 'Design & Marketing Services', 
    iconName: 'PenTool', 
    description: 'Hourly designing charges, logo design, digital marketing banners per month' 
  },
  { 
    id: 'cat_more_services', 
    name: 'Other Printing & Branding Services', 
    iconName: 'Award', 
    description: 'Visiting cards, ID cards, sticker cutting, pre-ink stamps, tent cards' 
  }
];

export const INITIAL_PRODUCTS: Product[] = [
  // ==========================================
  // PAGE 1: FLEX & SIGN BOARDS (Area-based Sq.ft)
  // ==========================================
  {
    id: 'pg_p1_item1',
    categoryId: 'cat_flex_sign',
    categoryName: 'Flex & Sign Boards',
    name: 'Ordinary Flex Change',
    calculationType: 'AREA',
    defaultUnit: 'Sq.ft',
    defaultRate: 25,
    minPrice: 25,
    maxPrice: 30,
    description: 'Replacement of existing flex banner with fresh ordinary frontlit flex print'
  },
  {
    id: 'pg_p1_item2',
    categoryId: 'cat_flex_sign',
    categoryName: 'Flex & Sign Boards',
    name: 'Star Flex Change',
    calculationType: 'AREA',
    defaultUnit: 'Sq.ft',
    defaultRate: 40,
    minPrice: 40,
    maxPrice: 45,
    description: 'Heavy duty star flex skin replacement with high-gloss vivid color saturation'
  },
  {
    id: 'pg_p1_item3',
    categoryId: 'cat_flex_sign',
    categoryName: 'Flex & Sign Boards',
    name: 'Flex With Frame Ordinary',
    calculationType: 'AREA',
    defaultUnit: 'Sq.ft',
    defaultRate: 50,
    minPrice: 50,
    maxPrice: 60,
    description: 'Complete sign board with 1-inch MS iron frame and ordinary frontlit flex print'
  },
  {
    id: 'pg_p1_item4',
    categoryId: 'cat_flex_sign',
    categoryName: 'Flex & Sign Boards',
    name: 'Flex With Frame Star',
    calculationType: 'AREA',
    defaultUnit: 'Sq.ft',
    defaultRate: 70,
    minPrice: 70,
    maxPrice: 80,
    description: 'Durable iron frame board with high tensile star flex and GI back protection'
  },

  // ==========================================
  // PAGE 1: GLOW SIGN BOARDS (Area-based Sq.ft)
  // ==========================================
  {
    id: 'pg_p1_item5',
    categoryId: 'cat_glow_sign',
    categoryName: 'Glow Sign Boards',
    name: 'Glow Sign board Flex Change',
    calculationType: 'AREA',
    defaultUnit: 'Sq.ft',
    defaultRate: 70,
    minPrice: 70,
    maxPrice: 85,
    description: 'Backlit flex replacement for existing illuminated glow sign board structure'
  },
  {
    id: 'pg_p1_item6',
    categoryId: 'cat_glow_sign',
    categoryName: 'Glow Sign Boards',
    name: 'Glow Sign board Single Side',
    calculationType: 'AREA',
    defaultUnit: 'Sq.ft',
    defaultRate: 250,
    minPrice: 250,
    maxPrice: 280,
    description: 'Single-sided backlit glow sign box with internal illumination & GI sheet back'
  },
  {
    id: 'pg_p1_item7',
    categoryId: 'cat_glow_sign',
    categoryName: 'Glow Sign Boards',
    name: 'Glow Sign Board F&B Powder Cote Finish',
    calculationType: 'AREA',
    defaultUnit: 'Sq.ft',
    defaultRate: 280,
    minPrice: 280,
    maxPrice: 310,
    description: 'Front & Back backlit glow sign with premium powder-coated aluminum/MS frame finish'
  },
  {
    id: 'pg_p1_item8',
    categoryId: 'cat_glow_sign',
    categoryName: 'Glow Sign Boards',
    name: 'Glow Sign board Front & Back',
    calculationType: 'AREA',
    defaultUnit: 'Sq.ft',
    defaultRate: 300,
    minPrice: 300,
    maxPrice: 350,
    description: 'Double-sided illuminated projecting glow sign board with dual backlit flex faces'
  },

  // ==========================================
  // PAGE 1: LED SIGN (Area-based Sq.ft)
  // ==========================================
  {
    id: 'pg_p1_item9',
    categoryId: 'cat_led_sign',
    categoryName: 'LED Signs',
    name: 'LED Sign (3D Illuminated Letters)',
    calculationType: 'AREA',
    defaultUnit: 'Sq.ft',
    defaultRate: 1050,
    minPrice: 900,
    maxPrice: 1200,
    description: 'Premium 3D acrylic LED channel letters with waterproof LED modules & power supply (Range: ₹900 - ₹1200 / Sq.ft)'
  },

  // ==========================================
  // PAGE 1: VINYL & FOAM BOARDS (Area-based Sq.ft)
  // ==========================================
  {
    id: 'pg_p1_item10',
    categoryId: 'cat_vinyl_foam',
    categoryName: 'Vinyl & Foam Boards',
    name: 'Vinyl Ordinary',
    calculationType: 'AREA',
    defaultUnit: 'Sq.ft',
    defaultRate: 60,
    minPrice: 60,
    maxPrice: 70,
    description: 'Standard self-adhesive vinyl printing for indoor/outdoor application'
  },
  {
    id: 'pg_p1_item11',
    categoryId: 'cat_vinyl_foam',
    categoryName: 'Vinyl & Foam Boards',
    name: 'Vinyl Eco (High Resolution Eco-Solvent)',
    calculationType: 'AREA',
    defaultUnit: 'Sq.ft',
    defaultRate: 80,
    minPrice: 80,
    maxPrice: 95,
    description: 'High-definition eco-solvent vinyl printing with rich photographic finish'
  },
  {
    id: 'pg_p1_item12',
    categoryId: 'cat_vinyl_foam',
    categoryName: 'Vinyl & Foam Boards',
    name: 'Form with Vinyl',
    calculationType: 'AREA',
    defaultUnit: 'Sq.ft',
    defaultRate: 90,
    minPrice: 90,
    maxPrice: 105,
    description: 'Foam board / Sunboard (3mm/5mm) mounted with regular vinyl graphic'
  },
  {
    id: 'pg_p1_item13',
    categoryId: 'cat_vinyl_foam',
    categoryName: 'Vinyl & Foam Boards',
    name: 'Form with Eco Vinyl',
    calculationType: 'AREA',
    defaultUnit: 'Sq.ft',
    defaultRate: 120,
    minPrice: 120,
    maxPrice: 135,
    description: 'Foam sheet mounted with high-resolution eco-solvent vinyl graphic'
  },
  {
    id: 'pg_p1_item14',
    categoryId: 'cat_vinyl_foam',
    categoryName: 'Vinyl & Foam Boards',
    name: 'Form With Eco Vinyl & Lamination',
    calculationType: 'AREA',
    defaultUnit: 'Sq.ft',
    defaultRate: 140,
    minPrice: 140,
    maxPrice: 160,
    description: 'Foam sheet with eco-solvent vinyl graphic plus protective matte/gloss lamination'
  },

  // ==========================================
  // PAGE 1: STANDEES & ACRYLIC
  // ==========================================
  {
    id: 'pg_p1_item15',
    categoryId: 'cat_standees',
    categoryName: 'Standees & Displays',
    name: 'Roll Up Standee 2 x 5 Feet',
    calculationType: 'QUANTITY',
    defaultUnit: 'Piece',
    defaultRate: 2200,
    minPrice: 2200,
    maxPrice: 2400,
    description: 'Standard aluminum roll-up standee base with printed media (2 ft wide × 5 ft high)'
  },
  {
    id: 'pg_p1_item16',
    categoryId: 'cat_standees',
    categoryName: 'Standees & Displays',
    name: 'Roll Up Standee 3 x 6 Feet',
    calculationType: 'QUANTITY',
    defaultUnit: 'Piece',
    defaultRate: 3300,
    minPrice: 3300,
    maxPrice: 3500,
    description: 'Standard aluminum roll-up standee base with printed media (3 ft wide × 6 ft high)'
  },
  {
    id: 'pg_p1_item17',
    categoryId: 'cat_standees',
    categoryName: 'Standees & Displays',
    name: 'Roll Up Standee Premium 2 x 5 Feet',
    calculationType: 'QUANTITY',
    defaultUnit: 'Piece',
    defaultRate: 2600,
    minPrice: 2600,
    maxPrice: 2800,
    description: 'Heavy duty luxury teardrop aluminum base standee with premium non-curl film (2x5 ft)'
  },
  {
    id: 'pg_p1_item18',
    categoryId: 'cat_standees',
    categoryName: 'Standees & Displays',
    name: 'Roll Up Standee Premium 3 x 6 Feet',
    calculationType: 'QUANTITY',
    defaultUnit: 'Piece',
    defaultRate: 3600,
    minPrice: 3600,
    maxPrice: 3900,
    description: 'Heavy duty luxury teardrop aluminum base standee with premium non-curl film (3x6 ft)'
  },
  {
    id: 'pg_p1_item19',
    categoryId: 'cat_standees',
    categoryName: 'Standees & Displays',
    name: 'Standee with Frame Front & Back',
    calculationType: 'AREA',
    defaultUnit: 'Sq.ft',
    defaultRate: 145,
    minPrice: 145,
    maxPrice: 160,
    description: 'Structural MS iron framed free-standing display stand with dual sided graphic'
  },
  {
    id: 'pg_p1_item20',
    categoryId: 'cat_standees',
    categoryName: 'Standees & Displays',
    name: 'Standee with Frame',
    calculationType: 'AREA',
    defaultUnit: 'Sq.ft',
    defaultRate: 130,
    minPrice: 130,
    maxPrice: 145,
    description: 'Structural MS iron framed free-standing display stand with single sided graphic'
  },
  {
    id: 'pg_p1_item21',
    categoryId: 'cat_acrylic',
    categoryName: 'Acrylic Products',
    name: 'Acrylic Sneeze Guard',
    calculationType: 'AREA',
    defaultUnit: 'Sq.ft',
    defaultRate: 380,
    minPrice: 380,
    maxPrice: 450,
    description: 'Transparent cast acrylic sneeze shield barrier with supporting base legs'
  },
  {
    id: 'pg_p1_item22',
    categoryId: 'cat_acrylic',
    categoryName: 'Acrylic Products',
    name: 'Acrylic Product (Custom Sign / Fabrication)',
    calculationType: 'AREA',
    defaultUnit: 'Sq.ft',
    defaultRate: 600,
    minPrice: 600,
    maxPrice: 750,
    description: 'Custom laser cut acrylic display, sandwich frames, lettering or memento fabrication'
  },

  // =========================================================================
  // PAGE 2: A4/A5 SINGLE COLOR NOTICES (SS & FB) - Fixed quantity tier packages
  // =========================================================================
  {
    id: 'pg_p2_item1',
    categoryId: 'cat_single_color_notices',
    categoryName: 'A4/A5 Notices - Single Color',
    name: 'A4 Size - Single Color - Notice SS & FB (1000 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (1000 pcs)',
    defaultRate: 1000,
    minPrice: 850,
    maxPrice: 1200,
    description: 'A4 single color notice printing (Single Side or Front & Back) - 1,000 Copies (Range: ₹850 - ₹1,200)'
  },
  {
    id: 'pg_p2_item2',
    categoryId: 'cat_single_color_notices',
    categoryName: 'A4/A5 Notices - Single Color',
    name: 'A4 Size - Single Color - Notice SS & FB (2000 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (2000 pcs)',
    defaultRate: 1700,
    minPrice: 1500,
    maxPrice: 1900,
    description: 'A4 single color notice printing (Single Side or Front & Back) - 2,000 Copies (Range: ₹1,500 - ₹1,900)'
  },
  {
    id: 'pg_p2_item3',
    categoryId: 'cat_single_color_notices',
    categoryName: 'A4/A5 Notices - Single Color',
    name: 'A4 Size - Single Color - Notice SS & FB (5000 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (5000 pcs)',
    defaultRate: 3600,
    minPrice: 3200,
    maxPrice: 4100,
    description: 'A4 single color notice printing (Single Side or Front & Back) - 5,000 Copies (Range: ₹3,200 - ₹4,100)'
  },
  {
    id: 'pg_p2_item4',
    categoryId: 'cat_single_color_notices',
    categoryName: 'A4/A5 Notices - Single Color',
    name: 'A4 Size - Single Color - Notice SS & FB (10000 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (10000 pcs)',
    defaultRate: 7900,
    minPrice: 7300,
    maxPrice: 8500,
    description: 'A4 single color notice printing (Single Side or Front & Back) - 10,000 Copies (Range: ₹7,300 - ₹8,500)'
  },
  {
    id: 'pg_p2_item5',
    categoryId: 'cat_single_color_notices',
    categoryName: 'A4/A5 Notices - Single Color',
    name: 'A5 Size - Single Color - Notice SS & FB (1000 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (1000 pcs)',
    defaultRate: 850,
    minPrice: 750,
    maxPrice: 950,
    description: 'A5 single color notice printing (Single Side or Front & Back) - 1,000 Copies (Range: ₹750 - ₹950)'
  },
  {
    id: 'pg_p2_item6',
    categoryId: 'cat_single_color_notices',
    categoryName: 'A4/A5 Notices - Single Color',
    name: 'A5 Size - Single Color - Notice SS & FB (2000 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (2000 pcs)',
    defaultRate: 1150,
    minPrice: 1000,
    maxPrice: 1300,
    description: 'A5 single color notice printing (Single Side or Front & Back) - 2,000 Copies (Range: ₹1,000 - ₹1,300)'
  },
  {
    id: 'pg_p2_item7',
    categoryId: 'cat_single_color_notices',
    categoryName: 'A4/A5 Notices - Single Color',
    name: 'A5 Size - Single Color - Notice SS & FB (5000 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (5000 pcs)',
    defaultRate: 3600,
    minPrice: 3300,
    maxPrice: 3900,
    description: 'A5 single color notice printing (Single Side or Front & Back) - 5,000 Copies (Range: ₹3,300 - ₹3,900)'
  },
  {
    id: 'pg_p2_item8',
    categoryId: 'cat_single_color_notices',
    categoryName: 'A4/A5 Notices - Single Color',
    name: 'A5 Size - Single Color - Notice SS & FB (10000 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (10000 pcs)',
    defaultRate: 5800,
    minPrice: 5200,
    maxPrice: 6300,
    description: 'A5 single color notice printing (Single Side or Front & Back) - 10,000 Copies (Range: ₹5,200 - ₹6,300)'
  },

  // =========================================================================
  // PAGE 2: PRESCRIPTION PADS & BILL BOOKS (Unit or Lot)
  // =========================================================================
  {
    id: 'pg_p2_item9',
    categoryId: 'cat_pads_books',
    categoryName: 'Prescription Pads & Bill Books',
    name: 'Prescription Pad A4 Size - Single Color',
    calculationType: 'QUANTITY',
    defaultUnit: 'Pad',
    defaultRate: 240,
    minPrice: 240,
    maxPrice: 260,
    description: 'A4 doctor prescription pad (single color print, 100 sheets/pad, 5-pad package = ₹1,200)'
  },
  {
    id: 'pg_p2_item10',
    categoryId: 'cat_pads_books',
    categoryName: 'Prescription Pads & Bill Books',
    name: 'Prescription Pad A5 Size - Single Color',
    calculationType: 'QUANTITY',
    defaultUnit: 'Pad',
    defaultRate: 180,
    minPrice: 180,
    maxPrice: 200,
    description: 'A5 doctor prescription pad (single color print, 100 sheets/pad, 5-pad package = ₹900)'
  },
  {
    id: 'pg_p2_item11',
    categoryId: 'cat_pads_books',
    categoryName: 'Prescription Pads & Bill Books',
    name: 'Prescription Pad A4 Size - 2 Colors',
    calculationType: 'QUANTITY',
    defaultUnit: 'Pad',
    defaultRate: 290,
    minPrice: 290,
    maxPrice: 320,
    description: 'A4 doctor prescription pad (2 color print, 100 sheets/pad, 5-pad package = ₹1,450)'
  },
  {
    id: 'pg_p2_item12',
    categoryId: 'cat_pads_books',
    categoryName: 'Prescription Pads & Bill Books',
    name: 'Prescription Pad A5 Size - 2 Colors',
    calculationType: 'QUANTITY',
    defaultUnit: 'Pad',
    defaultRate: 220,
    minPrice: 220,
    maxPrice: 250,
    description: 'A5 doctor prescription pad (2 color print, 100 sheets/pad, 5-pad package = ₹1,100)'
  },
  {
    id: 'pg_p2_item13',
    categoryId: 'cat_pads_books',
    categoryName: 'Prescription Pads & Bill Books',
    name: 'Bill Book - 1+1 - A5 Size - Single Colors',
    calculationType: 'QUANTITY',
    defaultUnit: 'Book',
    defaultRate: 250,
    minPrice: 250,
    maxPrice: 275,
    description: 'Carbonless duplicate (1+1) bill book, A5 size, numbered & perforated (5-book lot = ₹1,250)'
  },
  {
    id: 'pg_p2_item14',
    categoryId: 'cat_pads_books',
    categoryName: 'Prescription Pads & Bill Books',
    name: 'Bill Book - 1+1 - A4 Size - Single Colors',
    calculationType: 'QUANTITY',
    defaultUnit: 'Book',
    defaultRate: 190,
    minPrice: 190,
    maxPrice: 220,
    description: 'Carbonless duplicate (1+1) bill book, A4 size, single color (5-book lot = ₹950)'
  },
  {
    id: 'pg_p2_item15',
    categoryId: 'cat_folders',
    categoryName: 'File Folders',
    name: 'File Folder - Single Color (11 x 17 Inches)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Piece',
    defaultRate: 35,
    minPrice: 35,
    maxPrice: 40,
    description: 'Single color printed document folder, 11x17 inches heavy card stock with inner pocket'
  },
  {
    id: 'pg_p2_item16',
    categoryId: 'cat_folders',
    categoryName: 'File Folders',
    name: 'File Folder - 2 Colors (11 x 17 Inches)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Piece',
    defaultRate: 45,
    minPrice: 45,
    maxPrice: 50,
    description: 'Two color printed document folder, 11x17 inches heavy card stock with inner pocket'
  },

  // =========================================================================
  // PAGE 3: MULTI-COLOR FLYERS (SS & FB)
  // =========================================================================
  {
    id: 'pg_p3_item1',
    categoryId: 'cat_multi_flyers',
    categoryName: 'Multi-Color Flyers',
    name: 'A4 Size - Multi Color - Flyers SS & FB (1000 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (1000 pcs)',
    defaultRate: 2450,
    minPrice: 2300,
    maxPrice: 2600,
    description: 'A4 multicolour promotional flyers SS & FB - 1,000 Copies (Range: ₹2,300 - ₹2,600)'
  },
  {
    id: 'pg_p3_item2',
    categoryId: 'cat_multi_flyers',
    categoryName: 'Multi-Color Flyers',
    name: 'A4 Size - Multi Color - Flyers SS & FB (2000 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (2000 pcs)',
    defaultRate: 4000,
    minPrice: 3800,
    maxPrice: 4200,
    description: 'A4 multicolour promotional flyers SS & FB - 2,000 Copies (Range: ₹3,800 - ₹4,200)'
  },
  {
    id: 'pg_p3_item3',
    categoryId: 'cat_multi_flyers',
    categoryName: 'Multi-Color Flyers',
    name: 'A4 Size - Multi Color - Flyers SS & FB (5000 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (5000 pcs)',
    defaultRate: 8050,
    minPrice: 7900,
    maxPrice: 8200,
    description: 'A4 multicolour promotional flyers SS & FB - 5,000 Copies (Range: ₹7,900 - ₹8,200)'
  },
  {
    id: 'pg_p3_item4',
    categoryId: 'cat_multi_flyers',
    categoryName: 'Multi-Color Flyers',
    name: 'A4 Size - Multi Color - Flyers SS & FB (10000 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (10000 pcs)',
    defaultRate: 15100,
    minPrice: 14400,
    maxPrice: 15800,
    description: 'A4 multicolour promotional flyers SS & FB - 10,000 Copies (Range: ₹14,400 - ₹15,800)'
  },
  {
    id: 'pg_p3_item5',
    categoryId: 'cat_multi_flyers',
    categoryName: 'Multi-Color Flyers',
    name: 'A5 Size - Multi Color - Flyers SS & FB (2000 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (2000 pcs)',
    defaultRate: 2450,
    minPrice: 2300,
    maxPrice: 2600,
    description: 'A5 multicolour promotional flyers SS & FB - 2,000 Copies (Range: ₹2,300 - ₹2,600)'
  },
  {
    id: 'pg_p3_item6',
    categoryId: 'cat_multi_flyers',
    categoryName: 'Multi-Color Flyers',
    name: 'A5 Size - Multi Color - Flyers SS & FB (4000 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (4000 pcs)',
    defaultRate: 4000,
    minPrice: 3800,
    maxPrice: 4200,
    description: 'A5 multicolour promotional flyers SS & FB - 4,000 Copies (Range: ₹3,800 - ₹4,200)'
  },
  {
    id: 'pg_p3_item7',
    categoryId: 'cat_multi_flyers',
    categoryName: 'Multi-Color Flyers',
    name: 'A5 Size - Multi Color - Flyers SS & FB (6000 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (6000 pcs)',
    defaultRate: 6300,
    minPrice: 5900,
    maxPrice: 6700,
    description: 'A5 multicolour promotional flyers SS & FB - 6,000 Copies (Range: ₹5,900 - ₹6,700)'
  },
  {
    id: 'pg_p3_item8',
    categoryId: 'cat_multi_flyers',
    categoryName: 'Multi-Color Flyers',
    name: 'A5 Size - Multi Color - Flyers SS & FB (10000 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (10000 pcs)',
    defaultRate: 8050,
    minPrice: 7900,
    maxPrice: 8200,
    description: 'A5 multicolour promotional flyers SS & FB - 10,000 Copies (Range: ₹7,900 - ₹8,200)'
  },

  // =========================================================================
  // PAGE 3: A3 13x19 INCH FILE FOLDERS (Multi-Color & Lamination)
  // =========================================================================
  {
    id: 'pg_p3_item9',
    categoryId: 'cat_folders',
    categoryName: 'File Folders',
    name: 'A3 Size - 13 x 19 inches - File Folder Multi color (100 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (100 pcs)',
    defaultRate: 3500,
    minPrice: 3500,
    maxPrice: 3800,
    description: '100 quantity A3 (13x19) multi-color folders (@ ₹35/piece = ₹3,500)'
  },
  {
    id: 'pg_p3_item10',
    categoryId: 'cat_folders',
    categoryName: 'File Folders',
    name: 'A3 Size - 13 x 19 inches - File Folder Multi color (500 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (500 pcs)',
    defaultRate: 15000,
    minPrice: 15000,
    maxPrice: 16000,
    description: '500 quantity A3 (13x19) multi-color folders (@ ₹30/piece = ₹15,000)'
  },
  {
    id: 'pg_p3_item11',
    categoryId: 'cat_folders',
    categoryName: 'File Folders',
    name: 'A3 Size - 13 x 19 inches - File Folder Multi color (1000 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (1000 pcs)',
    defaultRate: 16800,
    minPrice: 16800,
    maxPrice: 18000,
    description: '1,000 quantity A3 (13x19) multi-color folders (@ ₹16.80/piece = ₹16,800)'
  },
  {
    id: 'pg_p3_item12',
    categoryId: 'cat_folders',
    categoryName: 'File Folders',
    name: 'A3 Size - 13 x 19 inches - File Folder Multi color - Lam SS (100 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (100 pcs)',
    defaultRate: 4200,
    minPrice: 4200,
    maxPrice: 4500,
    description: '100 quantity A3 (13x19) multi-color folders with single side lamination (@ ₹42/piece = ₹4,200)'
  },
  {
    id: 'pg_p3_item13',
    categoryId: 'cat_folders',
    categoryName: 'File Folders',
    name: 'A3 Size - 13 x 19 inches - File Folder Multi color - Lam SS (500 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (500 pcs)',
    defaultRate: 19000,
    minPrice: 19000,
    maxPrice: 20000,
    description: '500 quantity A3 (13x19) multi-color folders with single side lamination (@ ₹38/piece = ₹19,000)'
  },
  {
    id: 'pg_p3_item14',
    categoryId: 'cat_folders',
    categoryName: 'File Folders',
    name: 'A3 Size - 13 x 19 inches - File Folder Multi color - Lam SS (1000 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Lot (1000 pcs)',
    defaultRate: 21500,
    minPrice: 21500,
    maxPrice: 22500,
    description: '1,000 quantity A3 (13x19) multi-color folders with single side lamination (@ ₹21.50/piece = ₹21,500)'
  },

  // =========================================================================
  // PAGE 3: BULK PRESCRIPTION PADS
  // =========================================================================
  {
    id: 'pg_p3_item15',
    categoryId: 'cat_rx_bulk',
    categoryName: 'Bulk Prescription Pads',
    name: 'A4 Size Prescription Pad - Bond Sheet - 10 Pad (1000 Sheets)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Set (10 Pads)',
    defaultRate: 2400,
    minPrice: 2400,
    maxPrice: 2600,
    description: '10 pads of A4 prescription pads printed on executive bond paper (100 sheets/pad)'
  },
  {
    id: 'pg_p3_item16',
    categoryId: 'cat_rx_bulk',
    categoryName: 'Bulk Prescription Pads',
    name: 'A4 Size Prescription Pad - 10 Pad (1000 Sheets)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Set (10 Pads)',
    defaultRate: 2200,
    minPrice: 2200,
    maxPrice: 2400,
    description: '10 pads of A4 standard prescription pads (100 sheets/pad)'
  },
  {
    id: 'pg_p3_item17',
    categoryId: 'cat_rx_bulk',
    categoryName: 'Bulk Prescription Pads',
    name: 'A5 Size Prescription Pad - 20 Pad (2000 Sheets)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Set (20 Pads)',
    defaultRate: 4100,
    minPrice: 4100,
    maxPrice: 4400,
    description: '20 pads of A5 standard prescription pads (100 sheets/pad, 2,000 total sheets)'
  },

  // =========================================================================
  // PAGE 3: CALENDARS
  // =========================================================================
  {
    id: 'pg_p3_item18',
    categoryId: 'cat_calendars',
    categoryName: 'Calendars',
    name: 'A5 Size Table Top Calendar - 7 page',
    calculationType: 'QUANTITY',
    defaultUnit: 'Piece',
    defaultRate: 300,
    minPrice: 300,
    maxPrice: 350,
    description: 'Desk calendar, A5 size, 7 double-sided art card leaves with wiro binding & stand'
  },
  {
    id: 'pg_p3_item19',
    categoryId: 'cat_calendars',
    categoryName: 'Calendars',
    name: 'A4 Size Table Top Calendar - 7 page',
    calculationType: 'QUANTITY',
    defaultUnit: 'Piece',
    defaultRate: 450,
    minPrice: 450,
    maxPrice: 500,
    description: 'Executive desk calendar, A4 size, 7 leaves with premium stand & wiro binding'
  },
  {
    id: 'pg_p3_item20',
    categoryId: 'cat_calendars',
    categoryName: 'Calendars',
    name: 'A3 Size Wall Calender - Single Page',
    calculationType: 'QUANTITY',
    defaultUnit: 'Piece',
    defaultRate: 80,
    minPrice: 80,
    maxPrice: 100,
    description: '12-month single sheet poster wall calendar, A3 size on gloss art card with tin mounting'
  },

  // =========================================================================
  // PAGE 3: DESIGNING & MARKETING SPECIAL SERVICES
  // =========================================================================
  {
    id: 'pg_p3_item21',
    categoryId: 'cat_special_services',
    categoryName: 'Design & Marketing Services',
    name: 'Designing Charge Per Hour',
    calculationType: 'QUANTITY',
    defaultUnit: 'Hour',
    defaultRate: 400,
    minPrice: 400,
    maxPrice: 500,
    description: 'Professional graphic design & artwork composition (₹400 / Hour)'
  },
  {
    id: 'pg_p3_item22',
    categoryId: 'cat_special_services',
    categoryName: 'Design & Marketing Services',
    name: 'Logo Design',
    calculationType: 'QUANTITY',
    defaultUnit: 'Design',
    defaultRate: 1200,
    minPrice: 800,
    maxPrice: 2000,
    description: 'Custom corporate 2D/3D logo creation with source vector files (Range: ₹800 - ₹2,000)'
  },
  {
    id: 'pg_p3_item23',
    categoryId: 'cat_special_services',
    categoryName: 'Design & Marketing Services',
    name: 'Digital Marketing - Banners Permonth*',
    calculationType: 'QUANTITY',
    defaultUnit: 'Month',
    defaultRate: 25000,
    minPrice: 25000,
    maxPrice: 30000,
    description: 'Full monthly digital marketing package including creative ad banners, campaigns & posting (₹25,000/Month)'
  },

  // =========================================================================
  // PAGE 4: OUR SERVICES COMPLEMENTARY ITEMS
  // =========================================================================
  {
    id: 'pg_p4_item1',
    categoryId: 'cat_more_services',
    categoryName: 'Other Printing & Branding Services',
    name: 'Visiting Cards - Premium Gloss/Matte (1000 Qty)',
    calculationType: 'QUANTITY',
    defaultUnit: 'Box (1000 pcs)',
    defaultRate: 950,
    minPrice: 850,
    maxPrice: 1200,
    description: '350 GSM art card visiting cards with thermal lamination & round corner option'
  },
  {
    id: 'pg_p4_item2',
    categoryId: 'cat_more_services',
    categoryName: 'Other Printing & Branding Services',
    name: 'ID Cards - RFID / Smart Plastic with Lanyard',
    calculationType: 'QUANTITY',
    defaultUnit: 'Piece',
    defaultRate: 65,
    minPrice: 55,
    maxPrice: 85,
    description: 'Sublimation printed PVC employee ID card with custom printed satin ribbon lanyard'
  },
  {
    id: 'pg_p4_item3',
    categoryId: 'cat_more_services',
    categoryName: 'Other Printing & Branding Services',
    name: 'Die Cut Stickers / Product Labels',
    calculationType: 'QUANTITY',
    defaultUnit: 'Piece',
    defaultRate: 3.5,
    minPrice: 2.5,
    maxPrice: 6,
    description: 'Custom kiss-cut or die-cut shape waterproof vinyl stickers for bottles & jars'
  },
  {
    id: 'pg_p4_item4',
    categoryId: 'cat_more_services',
    categoryName: 'Other Printing & Branding Services',
    name: 'Pre-Ink Self Inking Stamp',
    calculationType: 'QUANTITY',
    defaultUnit: 'Piece',
    defaultRate: 350,
    minPrice: 250,
    maxPrice: 550,
    description: 'Flash technology pre-inked round, oval or rectangular official business stamp'
  },
  {
    id: 'pg_p4_item5',
    categoryId: 'cat_more_services',
    categoryName: 'Other Printing & Branding Services',
    name: 'Tent Card - Table Top Display',
    calculationType: 'QUANTITY',
    defaultUnit: 'Piece',
    defaultRate: 45,
    minPrice: 35,
    maxPrice: 65,
    description: 'Triangular fold rigid card stand for hotel tables, reception counters & menus'
  }
];

export const INITIAL_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: 'Pixel Graphic',
  tagline: 'create the dreams...',
  logoUrl: '',
  address: '286, D.B Road, R.S Puram, Coimbatore - 641 002.',
  phone: '95 6666 4663, 95 6632 9666',
  email: 'pixelgraphic.cbe@gmail.com',
  gstNumber: '33AABCP1234F1Z0',
  panNumber: 'AABCP1234F',
  quotationPrefix: 'PG-QT-',
  invoicePrefix: 'PG-INV-',
  nextQuotationNumber: 101,
  nextInvoiceNumber: 201,
  defaultTaxPercentage: 18,
  taxEnabledByDefault: false,
  currency: '₹',
  bankName: 'State Bank of India',
  bankAccountNumber: '38992019482',
  bankIfsc: 'SBIN0004521',
  upiId: '9566664663@upi',
  termsAndConditions: [
    'Any Design & Spelling Corrections Is At Customer Risk.',
    'Incase Of Any Spelling Mistakes Company Is Not Responsible.',
    'Designing Charge Separate.',
    'Once The Designing Works Gets Over The Job Will Be Deliver In 1 Or 2 Days.',
    '60% Advance Before Work Starts.',
    'After Finishing The Work Balance Payment Need To Be Settled Within A Week.',
    'Angle Charges Separate.',
    'Fitting Labor Charges Separate.',
    'Ladder Or Scuff Folding Charges Separate.',
    'Transport Charges Separate.',
    'Amount May Be Varied For Some Critical Works.',
    'This Quotation Is Valid For 2021 Only. If Any Changes In Rate We Will Intimate you.'
  ]
};
