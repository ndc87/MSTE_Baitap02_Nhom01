require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const cartService = require('./src/services/cartService');

async function testCart() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ Connected to MongoDB');
    
    // Get test user and product
    const user = await User.findOne();
    if (!user) {
      console.error('✗ No user found');
      return;
    }
    console.log(`✓ User found: ${user.email}`);
    
    const product = await Product.findOne();
    if (!product) {
      console.error('✗ No product found');
      return;
    }
    console.log(`✓ Product found: ${product.name}`);
    
    // Test 1: Get empty cart
    console.log('\n--- Test 1: Get empty cart ---');
    let cart = await cartService.getCart(user._id);
    console.log(`✓ Initial cart items: ${cart.length}`);
    
    // Test 2: Add to cart
    console.log('\n--- Test 2: Add to cart ---');
    cart = await cartService.addToCart(user._id, product._id, 2);
    console.log(`✓ Added product to cart. Total items: ${cart.length}`);
    console.log(`  - Quantity: ${cart[0].quantity}`);
    console.log(`  - Product: ${cart[0].product.name}`);
    
    // Test 3: Add same product again (should increase quantity)
    console.log('\n--- Test 3: Add same product again ---');
    cart = await cartService.addToCart(user._id, product._id, 1);
    console.log(`✓ Added same product again. Total items: ${cart.length}`);
    console.log(`  - Quantity: ${cart[0].quantity}`);
    
    // Test 4: Update cart item
    console.log('\n--- Test 4: Update quantity ---');
    const itemId = cart[0].id;
    cart = await cartService.updateCartItem(user._id, itemId, 5);
    console.log(`✓ Updated quantity to 5`);
    console.log(`  - New quantity: ${cart[0].quantity}`);
    
    // Test 5: Get cart (verify)
    console.log('\n--- Test 5: Get cart ---');
    cart = await cartService.getCart(user._id);
    console.log(`✓ Retrieved cart with ${cart.length} item(s)`);
    cart.forEach((item, idx) => {
      console.log(`  ${idx + 1}. ${item.product.name} x ${item.quantity}`);
    });
    
    // Test 6: Remove item
    console.log('\n--- Test 6: Remove item ---');
    cart = await cartService.removeCartItem(user._id, itemId);
    console.log(`✓ Removed item. Remaining items: ${cart.length}`);
    
    // Test 7: Clear cart
    console.log('\n--- Test 7: Clear cart ---');
    await cartService.clearCart(user._id);
    cart = await cartService.getCart(user._id);
    console.log(`✓ Cleared cart. Remaining items: ${cart.length}`);
    
    console.log('\n✅ All tests passed!');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error);
  } finally {
    await mongoose.disconnect();
  }
}

testCart();
