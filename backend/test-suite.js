import axios from 'axios';

const BASE_URL = 'https://krishisetu-cyu2.onrender.com/api';

async function runFullIntegrationTest() {
  console.log('🧪 Starting KrishiSetu Full Integration & Verification Test Suite...\n');
  let passed = 0;
  let failed = 0;

  const assert = (condition, title) => {
    if (condition) {
      console.log(`  ✅ [PASS] ${title}`);
      passed++;
    } else {
      console.error(`  ❌ [FAIL] ${title}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    console.log('--- 1. Health Check ---');
    const health = await axios.get(`${BASE_URL}/health`);
    assert(health.status === 200 && health.data.status === 'online', 'Health endpoint returns 200 online');

    // 2. Auth Login (Farmer)
    console.log('\n--- 2. Authentication Module ---');
    const loginRes = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'farmer@krishisetu.com',
      password: 'password123',
    });
    assert(loginRes.data.success === true, 'Farmer login successful');
    assert(!!loginRes.data.data.token, 'JWT token issued in response');
    const token = loginRes.data.data.token;
    const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

    // 3. User Profile
    const profileRes = await axios.get(`${BASE_URL}/auth/profile`, authHeaders);
    assert(profileRes.data.data.email === 'farmer@krishisetu.com', 'User profile retrieved successfully');

    // 4. Farm Management
    console.log('\n--- 3. Farm Management Module ---');
    const farmsRes = await axios.get(`${BASE_URL}/farms`, authHeaders);
    assert(farmsRes.data.data.length >= 2, `Farms listed (count: ${farmsRes.data.data.length})`);
    const testFarm = farmsRes.data.data[0];

    // Create a temporary farm
    const newFarmRes = await axios.post(
      `${BASE_URL}/farms`,
      {
        farmName: 'Test Automation Orchard',
        area: 4.2,
        soilType: 'Black / Regur',
        irrigationType: 'Drip Irrigation',
        currentCrop: 'Pomegranate',
        location: { villageOrCity: 'Dindori', state: 'Maharashtra' },
      },
      authHeaders
    );
    assert(newFarmRes.data.success === true, 'New farm created');
    const createdFarmId = newFarmRes.data.data._id;

    // Delete temporary farm
    const delFarmRes = await axios.delete(`${BASE_URL}/farms/${createdFarmId}`, authHeaders);
    assert(delFarmRes.data.success === true, 'Farm deleted successfully');

    // 5. Soil Management & AI Analysis
    console.log('\n--- 4. Soil Management Module ---');
    const soilRes = await axios.get(`${BASE_URL}/soil`, authHeaders);
    assert(soilRes.data.data.length > 0, `Soil records retrieved (count: ${soilRes.data.data.length})`);

    const newSoilRes = await axios.post(
      `${BASE_URL}/soil`,
      {
        farmId: testFarm._id,
        ph: 6.7,
        nitrogen: 295,
        phosphorus: 36,
        potassium: 225,
        moisturePercentage: 30,
        organicCarbon: 0.85,
      },
      authHeaders
    );
    assert(newSoilRes.data.data.recommendations.length > 0, 'Soil test auto-generated agronomic recommendations');

    // 6. Crop Records & Revenue
    console.log('\n--- 5. Crop Records & Revenue Module ---');
    const cropsRes = await axios.get(`${BASE_URL}/crops`, authHeaders);
    assert(cropsRes.data.data.length > 0, `Crop records retrieved (count: ${cropsRes.data.data.length})`);
    const totalRev = cropsRes.data.data.reduce((s, c) => s + (c.totalRevenue || 0), 0);
    assert(totalRev > 0, `Crop revenue calculated accurately (Total: ₹${totalRev})`);

    // 7. Weather Module & Agro Alerts
    console.log('\n--- 6. Weather & Radar Module ---');
    const weatherRes = await axios.get(`${BASE_URL}/weather/Nashik`);
    assert(weatherRes.data.success === true, 'Live weather retrieved for Nashik');
    assert(weatherRes.data.data.forecast.length >= 7, '7-day meteorological forecast provided');
    assert(weatherRes.data.data.advisories.length > 0, 'Agro-weather spray & irrigation advisories generated');

    // 8. Marketplace & Cart
    console.log('\n--- 7. Agricultural Marketplace & Cart Module ---');
    const productsRes = await axios.get(`${BASE_URL}/products`);
    assert(productsRes.data.data.length >= 5, `Marketplace catalog loaded (items: ${productsRes.data.data.length})`);
    const buyProduct = productsRes.data.data[0];

    // Add to Cart
    await axios.delete(`${BASE_URL}/cart`, authHeaders); // clear first
    const cartAddRes = await axios.post(
      `${BASE_URL}/cart`,
      { productId: buyProduct._id, quantity: 2 },
      authHeaders
    );
    assert(cartAddRes.data.data.items.length === 1, 'Product added to cart');

    // 9. Order Checkout & AUTOMATIC EXPENSE CREATION
    console.log('\n--- 8. Order Checkout & Automatic Expense Synchronization Module ---');
    const orderRes = await axios.post(
      `${BASE_URL}/orders`,
      {
        shippingAddress: {
          fullName: 'Ramesh Patil',
          phone: '+91 98221 54321',
          street: 'Main Orchard Road',
          city: 'Nashik',
          state: 'Maharashtra',
          pincode: '422003',
        },
        paymentMethod: 'UPI',
        farmId: testFarm._id,
      },
      authHeaders
    );
    assert(orderRes.data.success === true, 'Order created successfully');
    assert(orderRes.data.data.linkedExpense !== null, 'Expense automatically created & linked to order');
    const autoExpense = orderRes.data.data.linkedExpense;
    assert(autoExpense.isAutomatedFromOrder === true, 'Expense flagged as isAutomatedFromOrder: true');

    // 10. Financial Expense Summary & Profit Calculation
    console.log('\n--- 9. Financial Summary & Profit Analytics ---');
    const summaryRes = await axios.get(`${BASE_URL}/expenses/summary`, authHeaders);
    const sum = summaryRes.data.data;
    assert(sum.totalExpenses > 0, `Total expenses calculated (₹${sum.totalExpenses})`);
    assert(sum.purchaseExpenses > 0, `Purchase expenses calculated (₹${sum.purchaseExpenses})`);
    assert(sum.categoryBreakdown.length > 0, 'Category breakdown distribution calculated');
    assert(sum.monthlyTrend.length > 0, 'Monthly expense burn trend calculated');

    // 11. AI Farming Assistant (Krishi Mitra) Contextual Advisory
    console.log('\n--- 10. AI Farming Assistant (Krishi Mitra) Module ---');
    // English Test
    const aiEnRes = await axios.post(
      `${BASE_URL}/ai/ask`,
      {
        prompt: 'Should I irrigate my tomato crop today?',
        farmId: testFarm._id,
        language: 'en',
      },
      authHeaders
    );
    assert(aiEnRes.data.success === true, 'AI assistant responded in English with farm & weather context');
    assert(aiEnRes.data.data.contextUsed.farmName.length > 0, 'Farm context used in AI generation');

    // Hindi Test
    const aiHiRes = await axios.post(
      `${BASE_URL}/ai/ask`,
      {
        prompt: 'टमाटर की फसल में सिंचाई कब करनी चाहिए?',
        farmId: testFarm._id,
        language: 'hi',
      },
      authHeaders
    );
    assert(aiHiRes.data.data.response.includes('सिंचाई') || aiHiRes.data.data.response.includes('परामर्श'), 'AI assistant responded accurately in Hindi (हिन्दी)');

    // Marathi Test
    const aiMrRes = await axios.post(
      `${BASE_URL}/ai/ask`,
      {
        prompt: 'टोमॅटो पिकाला आज पाणी द्यावे का?',
        farmId: testFarm._id,
        language: 'mr',
      },
      authHeaders
    );
    assert(aiMrRes.data.data.response.includes('सिंचन') || aiMrRes.data.data.response.includes('सल्ला'), 'AI assistant responded accurately in Marathi (मराठी)');

    console.log(`\n========================================`);
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log(`========================================\n`);

    if (failed === 0) {
      process.exit(0);
    } else {
      process.exit(1);
    }
  } catch (err) {
    console.error('❌ Test suite encountered fatal error:', err.response?.data || err.message);
    process.exit(1);
  }
}

runFullIntegrationTest();
