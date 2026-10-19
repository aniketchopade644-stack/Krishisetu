import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Farm from '../models/Farm.js';
import SoilRecord from '../models/SoilRecord.js';
import CropRecord from '../models/CropRecord.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import Expense from '../models/Expense.js';
import AIChat from '../models/AIChat.js';

dotenv.config();

const connectDB = async () => {
  try {
    const connUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/krishisetu';
    await mongoose.connect(connUri);
    console.log('✅ Connected to MongoDB for database seeding');
  } catch (err) {
    console.error('❌ DB Connection error in seeder:', err.message);
    process.exit(1);
  }
};

const seedDatabase = async () => {
  await connectDB();

  try {
    console.log('🧹 Purging existing collections...');
    await User.deleteMany({});
    await Farm.deleteMany({});
    await SoilRecord.deleteMany({});
    await CropRecord.deleteMany({});
    await Product.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});
    await Expense.deleteMany({});
    await AIChat.deleteMany({});

    console.log('🌱 Creating Seed Users...');

    const farmer = await User.create({
      name: 'Ramesh Patil',
      email: 'farmer@krishisetu.com',
      password: 'password123',
      role: 'farmer',
      preferredLanguage: 'en',
      theme: 'light',
      phone: '+91 98221 54321',
      location: {
        city: 'Nashik',
        state: 'Maharashtra',
        country: 'India',
        pincode: '422003',
      },
      bio: 'Progressive horticulturist and grain farmer with 12+ years of precision farming experience.',
    });

    const seller = await User.create({
      name: 'Kisan Agro Direct & Seed Corp',
      email: 'seller@krishisetu.com',
      password: 'password123',
      role: 'seller',
      preferredLanguage: 'hi',
      theme: 'light',
      phone: '+91 94230 87654',
      location: {
        city: 'Pune',
        state: 'Maharashtra',
        country: 'India',
        pincode: '411037',
      },
      bio: 'Authorized agricultural distributor for certified seeds, bio-fertilizers, and modern drip systems.',
    });

    const admin = await User.create({
      name: 'KrishiSetu Admin',
      email: 'admin@krishisetu.com',
      password: 'password123',
      role: 'admin',
      preferredLanguage: 'en',
      phone: '+91 99000 11223',
    });

    console.log('🚜 Creating Demo Farms...');
    const farm1 = await Farm.create({
      owner: farmer._id,
      farmName: 'Sahyadri Bio-Orchard & Plots',
      location: {
        villageOrCity: 'Dindori, Nashik',
        district: 'Nashik',
        state: 'Maharashtra',
        latitude: 20.201,
        longitude: 73.834,
      },
      area: 8.5,
      areaUnit: 'acres',
      soilType: 'Black / Regur',
      irrigationType: 'Drip Irrigation',
      currentCrop: 'Tomato (Abhinav F1)',
      sowingDate: new Date('2026-07-15'),
      expectedHarvestDate: new Date('2026-10-30'),
      status: 'active',
      notes: 'Equipped with solar drip automated fertigation. High organic matter black soil.',
    });

    const farm2 = await Farm.create({
      owner: farmer._id,
      farmName: 'Godavari Riverfront Agro-Estate',
      location: {
        villageOrCity: 'Niphad, Nashik',
        district: 'Nashik',
        state: 'Maharashtra',
        latitude: 20.08,
        longitude: 74.11,
      },
      area: 12.0,
      areaUnit: 'acres',
      soilType: 'Alluvial',
      irrigationType: 'Sprinkler',
      currentCrop: 'Soybean (JS 335)',
      sowingDate: new Date('2026-06-25'),
      expectedHarvestDate: new Date('2026-10-10'),
      status: 'active',
      notes: 'High drainage alluvial plot suitable for multi-cropping pulses and oilseeds.',
    });

    console.log('🧪 Creating Soil Health Test Records...');
    await SoilRecord.create([
      {
        farm: farm1._id,
        user: farmer._id,
        testDate: new Date('2026-06-10'),
        ph: 6.8,
        nitrogen: 310,
        phosphorus: 38,
        potassium: 220,
        soilType: 'Black / Regur',
        moisturePercentage: 32,
        organicCarbon: 0.78,
        electricalConductivity: 0.65,
        sampleLocation: 'North-East Orchard Block',
        labName: 'Nashik District Soil Testing Lab',
        recommendations: [
          'Optimal soil pH (6.8) suitable for most crop nutrient uptake.',
          'Sufficient available Nitrogen (310 kg/ha). Maintain balanced application.',
          'Medium Phosphorus (38 kg/ha). Adequate for root development.',
          'Adequate Potassium (220 kg/ha). Supports sturdy plant stems and drought resistance.',
        ],
      },
      {
        farm: farm1._id,
        user: farmer._id,
        testDate: new Date('2026-08-01'),
        ph: 6.6,
        nitrogen: 285,
        phosphorus: 34,
        potassium: 205,
        soilType: 'Black / Regur',
        moisturePercentage: 28,
        organicCarbon: 0.82,
        electricalConductivity: 0.6,
        sampleLocation: 'Central Fertigation Sector',
        labName: 'Krishi Vigyan Kendra Mobile Kit',
        recommendations: [
          'Optimal soil pH (6.6) for tomato fruiting.',
          'Good nutrient retention observed post-monsoon application.',
        ],
      },
      {
        farm: farm2._id,
        user: farmer._id,
        testDate: new Date('2026-05-20'),
        ph: 7.2,
        nitrogen: 260,
        phosphorus: 29,
        potassium: 190,
        soilType: 'Alluvial',
        moisturePercentage: 25,
        organicCarbon: 0.62,
        electricalConductivity: 0.72,
        sampleLocation: 'Block B - Plot 4',
        labName: 'Godavari Agri-Research Foundation',
        recommendations: [
          'Soil pH is normal (7.2).',
          'Nitrogen slightly low. Supplement with Rhizobium bio-fertilizer.',
        ],
      },
    ]);

    console.log('🌾 Creating Crop Records...');
    await CropRecord.create([
      {
        farm: farm1._id,
        user: farmer._id,
        cropName: 'Tomato (Abhinav F1)',
        variety: 'Syngenta Semi-Indeterminate',
        season: 'Kharif (Monsoon)',
        sowingDate: new Date('2026-07-15'),
        expectedHarvestDate: new Date('2026-10-30'),
        yieldQuantity: 420,
        yieldUnit: 'crates',
        sellingPricePerUnit: 450,
        totalRevenue: 189000,
        status: 'vegetative',
        notes: 'Drip fertigation scheduled thrice a week.',
      },
      {
        farm: farm2._id,
        user: farmer._id,
        cropName: 'Soybean (JS 335)',
        variety: 'Certified Breeder Seed',
        season: 'Kharif (Monsoon)',
        sowingDate: new Date('2026-06-25'),
        expectedHarvestDate: new Date('2026-10-10'),
        yieldQuantity: 95,
        yieldUnit: 'quintals',
        sellingPricePerUnit: 4800,
        totalRevenue: 456000,
        status: 'flowering',
        notes: 'Excellent canopy coverage, pods forming well.',
      },
      {
        farm: farm1._id,
        user: farmer._id,
        cropName: 'Sharbati Premium Wheat',
        variety: 'HD-2967',
        season: 'Rabi (Winter)',
        sowingDate: new Date('2025-11-10'),
        expectedHarvestDate: new Date('2026-03-20'),
        actualHarvestDate: new Date('2026-03-22'),
        yieldQuantity: 140,
        yieldUnit: 'quintals',
        sellingPricePerUnit: 2650,
        totalRevenue: 371000,
        status: 'sold',
        notes: 'Previous season harvest successfully sold at APMC market.',
      },
    ]);

    console.log('🛍️ Creating Marketplace Agricultural Catalog...');
    const products = await Product.create([
      {
        seller: seller._id,
        title: 'Syngenta Abhinav F1 Hybrid Tomato Seeds (10g)',
        description:
          'High yielding semi-indeterminate hybrid with exceptional tolerance to TYLCV virus and bacterial wilt. High firm fruits ideal for distant transit.',
        category: 'Seeds',
        price: 850,
        originalPrice: 999,
        stockQuantity: 45,
        unit: 'packet',
        imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=600&q=80',
        brand: 'Syngenta Seeds',
        rating: 4.9,
        reviewCount: 42,
        isFeatured: true,
      },
      {
        seller: seller._id,
        title: 'IFFCO Nano Urea Liquid (500 ml Bottle)',
        description:
          'Revolutionary nanotechnology-based liquid fertilizer providing 4% nitrogen. 1 bottle of 500ml replaces 1 conventional 45kg bag of Urea.',
        category: 'Fertilizers',
        price: 225,
        originalPrice: 250,
        stockQuantity: 120,
        unit: 'piece',
        imageUrl: 'https://images.unsplash.com/photo-1585314062340-f1a5a7c9328d?auto=format&fit=crop&w=600&q=80',
        brand: 'IFFCO',
        rating: 4.8,
        reviewCount: 98,
        isFeatured: true,
      },
      {
        seller: seller._id,
        title: 'Neem Baan 10,000 PPM Organic Bio-Insecticide (1 Liter)',
        description:
          'Pure cold-pressed Azadirachtin neem oil formulation. Highly effective repellent against whitefly, thrips, aphid, and leaf miner.',
        category: 'Pesticides',
        price: 680,
        originalPrice: 800,
        stockQuantity: 60,
        unit: 'liter',
        imageUrl: 'https://images.unsplash.com/photo-1615811361523-6bd03d7748e7?auto=format&fit=crop&w=600&q=80',
        brand: 'Agro Bio-Shield',
        rating: 4.7,
        reviewCount: 31,
        isFeatured: true,
      },
      {
        seller: seller._id,
        title: 'Mahyco Hybrid Cotton BG-II Seeds (450g Pack)',
        description:
          'Bollgard-II certified hybrid cotton seeds with superior sucking pest tolerance and long staple fiber quality.',
        category: 'Seeds',
        price: 864,
        originalPrice: 920,
        stockQuantity: 80,
        unit: 'packet',
        imageUrl: 'https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=600&q=80',
        brand: 'Mahyco Seeds',
        rating: 4.6,
        reviewCount: 54,
        isFeatured: false,
      },
      {
        seller: seller._id,
        title: 'Organic Trichoderma Enriched Vermicompost (40kg Bag)',
        description:
          '100% pure organic earthworm compost fortified with beneficial Trichoderma viride and mycorrhiza bio-cultures.',
        category: 'Fertilizers',
        price: 490,
        originalPrice: 600,
        stockQuantity: 150,
        unit: 'bag (50kg)',
        imageUrl: 'https://images.unsplash.com/photo-1628352081506-83c43123ed6d?auto=format&fit=crop&w=600&q=80',
        brand: 'Sahyadri Organic Care',
        rating: 4.9,
        reviewCount: 65,
        isFeatured: true,
      },
      {
        seller: seller._id,
        title: 'Jain Drip Inline Lateral Pipe 16mm (400m Coil)',
        description:
          'Class 2 ISI marked drip tube with 40cm emitter spacing delivering 2.4 LPH uniform discharge rate. UV stabilized for long outdoor life.',
        category: 'Irrigation',
        price: 3200,
        originalPrice: 3800,
        stockQuantity: 25,
        unit: 'set',
        imageUrl: 'https://images.unsplash.com/photo-1563514227147-6d2ff665a6a0?auto=format&fit=crop&w=600&q=80',
        brand: 'Jain Irrigation Systems',
        rating: 4.9,
        reviewCount: 19,
        isFeatured: true,
      },
      {
        seller: seller._id,
        title: 'Professional 16L Battery Operated Knapsack Sprayer',
        description:
          '12V 8Ah lithium-ion battery sprayer with adjustable brass telescopic lance and 4 specialized spraying nozzles.',
        category: 'Equipment',
        price: 2650,
        originalPrice: 3200,
        stockQuantity: 18,
        unit: 'piece',
        imageUrl: 'https://images.unsplash.com/photo-1589923188900-85dae523342b?auto=format&fit=crop&w=600&q=80',
        brand: 'Kisan Shakti Tools',
        rating: 4.8,
        reviewCount: 38,
        isFeatured: false,
      },
      {
        seller: seller._id,
        title: 'Water Soluble NPK 19:19:19 Fertilizer (1kg Pack)',
        description:
          '100% water-soluble foliar spray and fertigation fertilizer for quick vegetative surge and balanced plant vigor.',
        category: 'Fertilizers',
        price: 180,
        originalPrice: 220,
        stockQuantity: 200,
        unit: 'kg',
        imageUrl: 'https://images.unsplash.com/photo-1605000797499-95a51c5269ae?auto=format&fit=crop&w=600&q=80',
        brand: 'Mahadhan Agro',
        rating: 4.7,
        reviewCount: 72,
        isFeatured: false,
      },
    ]);

    console.log('💳 Creating Seed Order & Automatic Linked Expense...');
    const orderItems = [
      {
        product: products[0]._id,
        title: products[0].title,
        quantity: 2,
        price: products[0].price,
        category: 'Seeds',
        unit: 'packet',
        imageUrl: products[0].imageUrl,
        seller: seller._id,
      },
      {
        product: products[1]._id,
        title: products[1].title,
        quantity: 4,
        price: products[1].price,
        category: 'Fertilizers',
        unit: 'piece',
        imageUrl: products[1].imageUrl,
        seller: seller._id,
      },
    ];

    const orderSubtotal = 2 * 850 + 4 * 225; // 1700 + 900 = 2600
    const shippingFee = 0;
    const totalAmount = orderSubtotal + shippingFee;

    const seedOrder = await Order.create({
      orderNumber: 'KS-8921-2026',
      buyer: farmer._id,
      items: orderItems,
      subtotal: orderSubtotal,
      shippingFee,
      totalAmount,
      shippingAddress: {
        fullName: 'Ramesh Patil',
        phone: '+91 98221 54321',
        street: 'Sahyadri Bio-Farm, Near Dindori Sugar Factory',
        city: 'Nashik',
        state: 'Maharashtra',
        pincode: '422003',
      },
      paymentMethod: 'UPI',
      paymentStatus: 'Paid',
      orderStatus: 'Delivered',
      autoExpenseCreated: true,
    });

    // Auto-synchronized expense record
    const autoExpense = await Expense.create({
      user: farmer._id,
      farm: farm1._id,
      title: 'Agri-Store Purchase: Tomato Seeds & IFFCO Nano Urea',
      category: 'Seeds',
      amount: totalAmount,
      date: new Date('2026-08-12'),
      isAutomatedFromOrder: true,
      orderReference: seedOrder._id,
      orderNumber: seedOrder.orderNumber,
      paymentMode: 'Online Store Purchase',
      notes: `Auto-generated from KrishiSetu Marketplace Order #${seedOrder.orderNumber}`,
    });

    seedOrder.linkedExpenseId = autoExpense._id;
    await seedOrder.save();

    console.log('💰 Creating Manual Farm Expenses...');
    await Expense.create([
      {
        user: farmer._id,
        farm: farm1._id,
        title: 'Farm Labour Charges (Transplanting & Staking)',
        category: 'Labour',
        amount: 8500,
        date: new Date('2026-07-20'),
        paymentMode: 'Cash',
        notes: 'Payment for 6 field workers for tomato staking and weeding.',
        isAutomatedFromOrder: false,
      },
      {
        user: farmer._id,
        farm: farm1._id,
        title: 'Drip Irrigation Electricity & Pump Maintenance',
        category: 'Irrigation',
        amount: 3200,
        date: new Date('2026-08-05'),
        paymentMode: 'UPI',
        notes: 'Monthly power bill and inline filter servicing.',
        isAutomatedFromOrder: false,
      },
      {
        user: farmer._id,
        farm: farm2._id,
        title: 'Tractor Ploughing & Bed Preparation Contract',
        category: 'Equipment',
        amount: 7200,
        date: new Date('2026-06-20'),
        paymentMode: 'Bank Transfer',
        notes: 'Rotavator and deep tillage for soybean sowing.',
        isAutomatedFromOrder: false,
      },
      {
        user: farmer._id,
        farm: farm2._id,
        title: 'Local APMC Mandi Produce Transportation',
        category: 'Transportation',
        amount: 4500,
        date: new Date('2026-08-25'),
        paymentMode: 'Cash',
        notes: 'Truck freight charges to Nashik APMC.',
        isAutomatedFromOrder: false,
      },
    ]);

    console.log('✨ Seed database populated successfully!');
    console.log('----------------------------------------------------');
    console.log('Demo Credentials:');
    console.log('👨‍🌾 Farmer : farmer@krishisetu.com | password123');
    console.log('🏪 Seller : seller@krishisetu.com | password123');
    console.log('🛡️ Admin  : admin@krishisetu.com  | password123');
    console.log('----------------------------------------------------');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeder error:', error);
    process.exit(1);
  }
};

seedDatabase();
