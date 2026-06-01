require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const Cart = require('./src/models/Cart');
const CartItem = require('./src/models/CartItem');
const cartService = require('./src/services/cartService');

async function debug() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // 1. Get first user
  const user = await User.findOne();
  if (!user) {
    console.log('No user found');
    return;
  }
  console.log('User:', user.email, user._id);

  // 2. Get first product
  const product = await Product.findOne();
  if (!product) {
    console.log('No product found');
    return;
  }
  console.log('Product:', product.name, product._id);

  // 3. Test addToCart
  console.log('\n--- Test addToCart ---');
  try {
    const items = await cartService.addToCart(user._id, product._id, 1);
    console.log('Cart Items after add:', JSON.stringify(items, null, 2));
  } catch (err) {
    console.error('addToCart error:', err.message);
    console.error(err);
  }

  // 4. Test getCart
  console.log('\n--- Test getCart ---');
  try {
    const cart = await cartService.getCart(user._id);
    console.log('Cart Items:', JSON.stringify(cart, null, 2));
  } catch (err) {
    console.error('getCart error:', err.message);
  }

  await mongoose.disconnect();
}

debug().catch(console.error);
