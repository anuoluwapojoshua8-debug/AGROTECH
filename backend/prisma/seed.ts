import { PrismaClient, UserRole, MerchantStatus, ProductStatus, ProductTag } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding AgroTech database...');

  const passwordHash = await bcrypt.hash('Password123!', 12);

  // ── Users ──────────────────────────────────────────────────────
  const admin = await prisma.user.upsert({
    where: { email: 'admin@agrotech.ng' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'admin@agrotech.ng',
      phone: '+2348010000001',
      passwordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  const buyer1 = await prisma.user.upsert({
    where: { email: 'chidi@example.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'chidi@example.com',
      phone: '+2348020000001',
      passwordHash,
      firstName: 'Chidi',
      lastName: 'Okonkwo',
      role: UserRole.BUYER,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  const buyer2 = await prisma.user.upsert({
    where: { email: 'amina@example.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'amina@example.com',
      phone: '+2348020000002',
      passwordHash,
      firstName: 'Amina',
      lastName: 'Bello',
      role: UserRole.BUYER,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  const merchantUser1 = await prisma.user.upsert({
    where: { email: 'merchant@greenvalley.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'merchant@greenvalley.com',
      phone: '+2348030000001',
      passwordHash,
      firstName: 'Emeka',
      lastName: 'Okafor',
      role: UserRole.SELLER,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  const merchantUser2 = await prisma.user.upsert({
    where: { email: 'merchant@freshlagos.com' },
    update: {},
    create: {
      id: uuidv4(),
      email: 'merchant@freshlagos.com',
      phone: '+2348030000002',
      passwordHash,
      firstName: 'Funke',
      lastName: 'Adebayo',
      role: UserRole.SELLER,
      isEmailVerified: true,
      isPhoneVerified: true,
    },
  });

  // ── Merchants ──────────────────────────────────────────────────
  const merchant1 = await prisma.merchant.upsert({
    where: { userId: merchantUser1.id },
    update: {},
    create: {
      id: uuidv4(),
      userId: merchantUser1.id,
      businessName: 'Green Valley Farms',
      businessAddress: '15 Farm Road, Kubwa, Abuja',
      businessPhone: '+2348030000001',
      description: 'Premium organic farm produce from the heart of Abuja. We deliver fresh vegetables, fruits, and grains straight from our farm to your table.',
      status: MerchantStatus.VERIFIED,
      kycSubmitted: true,
      kycApproved: true,
      tier: 'premium',
      deliveryRadius: 30,
    },
  });

  const merchant2 = await prisma.merchant.upsert({
    where: { userId: merchantUser2.id },
    update: {},
    create: {
      id: uuidv4(),
      userId: merchantUser2.id,
      businessName: 'Fresh Lagos Market',
      businessAddress: '42 Allen Avenue, Ikeja, Lagos',
      businessPhone: '+2348030000002',
      description: 'Lagos premier fresh food market. Wide selection of meat, fish, poultry, and dairy products sourced from trusted suppliers.',
      status: MerchantStatus.PENDING,
      kycSubmitted: false,
      kycApproved: false,
      tier: 'basic',
      deliveryRadius: 15,
    },
  });

  // ── Categories ─────────────────────────────────────────────────
  const categories = await Promise.all([
    prisma.category.upsert({
      where: { slug: 'fruits' },
      update: {},
      create: { id: uuidv4(), name: 'Fruits', slug: 'fruits', description: 'Fresh fruits from local farms', isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: 'vegetables' },
      update: {},
      create: { id: uuidv4(), name: 'Vegetables', slug: 'vegetables', description: 'Farm-fresh vegetables and leafy greens', isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: 'meat' },
      update: {},
      create: { id: uuidv4(), name: 'Meat', slug: 'meat', description: 'Premium beef, goat, and lamb cuts', isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: 'poultry' },
      update: {},
      create: { id: uuidv4(), name: 'Poultry', slug: 'poultry', description: 'Free-range chicken, turkey, and eggs', isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: 'fish-seafood' },
      update: {},
      create: { id: uuidv4(), name: 'Fish & Seafood', slug: 'fish-seafood', description: 'Fresh and smoked fish, prawns, and seafood', isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: 'grains-cereals' },
      update: {},
      create: { id: uuidv4(), name: 'Grains & Cereals', slug: 'grains-cereals', description: 'Locally grown rice, beans, millet, and more', isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: 'dairy' },
      update: {},
      create: { id: uuidv4(), name: 'Dairy', slug: 'dairy', description: 'Fresh milk, yogurt, cheese, and butter', isActive: true },
    }),
    prisma.category.upsert({
      where: { slug: 'beverages' },
      update: {},
      create: { id: uuidv4(), name: 'Beverages', slug: 'beverages', description: 'Natural juices, zobo, kunun, and traditional drinks', isActive: true },
    }),
  ]);

  const catMap = Object.fromEntries(categories.map((c) => [c.slug, c.id]));

  // ── Products ───────────────────────────────────────────────────
  const products = [
    // Merchant 1 — Green Valley Farms (verified)
    { name: 'Fresh Tomatoes', slug: 'fresh-tomatoes', price: 1500, unit: 'kg', organic: true, fresh: true, tags: [ProductTag.FRESH, ProductTag.ORGANIC] },
    { name: 'Organic Sweet Potatoes', slug: 'organic-sweet-potatoes', price: 1200, unit: 'kg', organic: true, fresh: true, tags: [ProductTag.ORGANIC, ProductTag.FRESH] },
    { name: 'Green Bell Peppers', slug: 'green-bell-peppers', price: 800, unit: 'kg', organic: true, fresh: true, tags: [ProductTag.FRESH, ProductTag.ORGANIC] },
    { name: 'Fresh Okro', slug: 'fresh-okro', price: 600, unit: 'kg', organic: false, fresh: true, tags: [ProductTag.FRESH] },
    { name: 'Pineapple (Sugarloaf)', slug: 'pineapple-sugarloaf', price: 2500, unit: 'piece', organic: true, fresh: true, tags: [ProductTag.ORGANIC, ProductTag.FRESH, ProductTag.BEST_SELLER] },
    { name: 'Ripe Plantains (Bunch)', slug: 'ripe-plantains-bunch', price: 1800, unit: 'bunch', organic: false, fresh: true, tags: [ProductTag.FRESH] },
    { name: 'Brown Rice (Local)', slug: 'brown-rice-local', price: 3500, unit: 'kg', organic: true, fresh: false, tags: [ProductTag.ORGANIC, ProductTag.IN_STOCK] },
    { name: 'Fresh Coconut', slug: 'fresh-coconut', price: 400, unit: 'piece', organic: true, fresh: true, tags: [ProductTag.FRESH, ProductTag.ORGANIC] },
    // Merchant 2 — Fresh Lagos Market
    { name: 'Free-Range Chicken (Whole)', slug: 'free-range-chicken-whole', price: 8500, unit: 'kg', organic: false, fresh: true, tags: [ProductTag.FRESH, ProductTag.BEST_SELLER] },
    { name: 'Smoked Catfish', slug: 'smoked-catfish', price: 4500, unit: 'kg', organic: false, fresh: false, tags: [ProductTag.IN_STOCK] },
    { name: 'Goat Meat (Stew Cut)', slug: 'goat-meat-stew-cut', price: 5500, unit: 'kg', organic: false, fresh: true, tags: [ProductTag.FRESH] },
    { name: 'Fresh Prawns', slug: 'fresh-prawns', price: 7000, unit: 'kg', organic: false, fresh: true, tags: [ProductTag.FRESH, ProductTag.BEST_SELLER] },
    { name: 'Fresh Cow Milk (Unpasteurized)', slug: 'fresh-cow-milk', price: 1500, unit: 'litre', organic: true, fresh: true, tags: [ProductTag.ORGANIC, ProductTag.FRESH] },
    { name: 'Zobo Drink (Hibiscus)', slug: 'zobo-drink-hibiscus', price: 500, unit: 'bottle', organic: false, fresh: false, tags: [ProductTag.NEW_ARRIVAL] },
    { name: 'Kunun Aya (Tigernut Milk)', slug: 'kunun-aya-tigernut-milk', price: 700, unit: 'bottle', organic: true, fresh: false, tags: [ProductTag.ORGANIC, ProductTag.NEW_ARRIVAL] },
  ];

  const merchantIds = [merchant1.id, merchant2.id];

  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const merchantId = merchantIds[i < 8 ? 0 : 1];
    const categorySlug = assignCategory(p.name);

    const existing = await prisma.product.findFirst({ where: { slug: p.slug } });
    if (existing) continue;

    await prisma.product.create({
      data: {
        id: uuidv4(),
        merchantId,
        categoryId: catMap[categorySlug],
        name: p.name,
        slug: p.slug,
        description: getDescription(p.name),
        price: p.price,
        comparePrice: Math.round(p.price * 1.2),
        quantity: Math.floor(Math.random() * 80) + 20,
        unit: p.unit,
        images: [`https://picsum.photos/seed/${p.slug}/600/600`, `https://picsum.photos/seed/${p.slug}-2/600/600`],
        tags: p.tags,
        status: ProductStatus.ACTIVE,
        rating: +(3.5 + Math.random() * 1.5).toFixed(1),
        reviewCount: Math.floor(Math.random() * 40) + 5,
        isOrganic: p.organic,
        isFresh: p.fresh,
        isFrozen: false,
        deliveryTime: '1-2 days',
        origin: i < 8 ? 'Abuja, Nigeria' : 'Lagos, Nigeria',
      },
    });
  }

  console.log('✅ Seed completed successfully');
  console.log(`   👤 ${3} users (1 admin, 2 buyers, 2 merchants)`);
  console.log(`   🏪 ${2} merchants`);
  console.log(`   📂 ${categories.length} categories`);
  console.log(`   📦 ${products.length} products`);
  console.log('\n   Login credentials (all users):');
  console.log('   Email: any user email above');
  console.log('   Password: Password123!');
}

function assignCategory(name: string): string {
  if (/tomato|pepper|okro|potato/i.test(name)) return 'vegetables';
  if (/pineapple|plantain|coconut/i.test(name)) return 'fruits';
  if (/chicken|turkey/i.test(name)) return 'poultry';
  if (/goat|beef|lamb|meat/i.test(name)) return 'meat';
  if (/catfish|prawn|fish|seafood|tilapia/i.test(name)) return 'fish-seafood';
  if (/rice|beans|millet|grain|cereal|maize/i.test(name)) return 'grains-cereals';
  if (/milk|yogurt|cheese|butter|dairy|fura/i.test(name)) return 'dairy';
  if (/zobo|kunun|juice|drink|beverage/i.test(name)) return 'beverages';
  return 'vegetables';
}

function getDescription(name: string): string {
  const descriptions: Record<string, string> = {
    'Fresh Tomatoes': 'Vine-ripened, locally sourced tomatoes perfect for stews, salads, and sauces. Grown without harmful pesticides.',
    'Organic Sweet Potatoes': 'Naturally sweet, nutrient-rich sweet potatoes harvested from organic farms in central Nigeria.',
    'Green Bell Peppers': 'Crunchy, fresh green bell peppers ideal for stir-fries, stuffed peppers, and Nigerian sauces.',
    'Fresh Okro': 'Tender, freshly picked okro pods. Perfect for ogbono soup, okro soup, and stews.',
    'Pineapple (Sugarloaf)': 'Extra-sweet sugarloaf pineapple with low acidity. Grown organically in Benue State.',
    'Ripe Plantains (Bunch)': 'Sun-ripened plantains sold by the bunch. Ideal for dodo, porridge, or roasting.',
    'Brown Rice (Local)': 'Nutritious, unpolished local brown rice. High in fiber, grown in Ebonyi State.',
    'Fresh Coconut': 'Freshly harvested mature coconuts. Contains sweet coconut water and white flesh.',
    'Free-Range Chicken (Whole)': 'Whole free-range chicken, farm-raised without hormones. Perfect for pepper soup, stew, or roasting.',
    'Smoked Catfish': 'Richly smoked catfish with traditional spices. Ready to eat or use in sauces and soups.',
    'Goat Meat (Stew Cut)': 'Premium goat meat pre-cut for stews. Tender and flavourful, sourced from northern Nigeria.',
    'Fresh Prawns': 'Large, succulent fresh prawns caught from Nigerian coastal waters. Ideal for jollof rice, stir-fries, and grills.',
    'Fresh Cow Milk (Unpasteurized)': 'Farm-fresh whole milk direct from Fulani herds. Rich and creamy.',
    'Zobo Drink (Hibiscus)': 'Traditional Nigerian zobo drink made from dried hibiscus flowers, ginger, and pineapple.',
    'Kunun Aya (Tigernut Milk)': 'Refreshing tigernut milk drink blended with dates and coconut. Naturally dairy-free.',
  };
  return descriptions[name] || `High-quality ${name.toLowerCase()} sourced directly from local Nigerian farmers.`;
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
