require('dotenv').config();
const connectDB = require('./src/config/db');
const User = require('./src/models/User');
const Product = require('./src/models/Product');
const cartService = require('./src/services/cartService');

async function run() {
  await connectDB();
  const user = await User.findOne({ email: 'admin@uteshop.vn' });
  const product = await Product.findOne();
  
  await cartService.addToCart(user._id, product._id, 1);
  const items = await cartService.getCart(user._id);
  console.log(JSON.stringify(items, null, 2));
  process.exit(0);
}
run();
