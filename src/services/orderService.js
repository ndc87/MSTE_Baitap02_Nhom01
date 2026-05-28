const mongoose = require('mongoose');
const cartService = require('./cartService');
const Product = require('../models/Product');

const generateOrderCode = () => {
  return 'ORD' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
};

const getOrderCollection = () => mongoose.connection.db.collection('orders');

const checkoutCOD = async (userId, addressId) => {
  const items = await cartService.getCart(userId);
  if (!items || items.length === 0) throw new Error('Cart is empty');

  // Calculate totals
  let subtotal = 0;
  for (const item of items) {
    const price = item.product_id.selling_price || item.product_id.base_price || 0;
    subtotal += price * item.quantity;
  }
  const shippingFee = 30000;
  const total = subtotal + shippingFee;

  const collection = getOrderCollection();

  // Create embedded items array
  const embeddedItems = items.map(item => ({
    _id: new mongoose.Types.ObjectId(),
    product: new mongoose.Types.ObjectId(item.product_id.id || item.product_id._id),
    quantity: item.quantity,
    price_at_buy: item.product_id.selling_price || item.product_id.base_price || 0
  }));

  const orderDoc = {
    order_code: generateOrderCode(),
    customer: new mongoose.Types.ObjectId(userId),
    status: 'pending',
    total_base: subtotal,
    shipping_fee: shippingFee,
    discount_total: 0,
    total_final: total,
    payment_status: 'pending',
    payment_method: 'cod',
    shipping_address: '123 Nguyễn Huệ, Q1',
    shipping_phone: '0901234567',
    coin_spent: 0,
    coin_earned: 0,
    items: embeddedItems,
    history: [
      {
        _id: new mongoose.Types.ObjectId(),
        status: 'pending',
        note: 'Đơn mới',
        created_at: new Date()
      }
    ],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  const result = await collection.insertOne(orderDoc);
  const newOrder = await collection.findOne({ _id: result.insertedId });

  // Clear cart
  await cartService.clearCart(userId);

  return newOrder;
};

const getOrders = async (userId, page = 1, limit = 10, status) => {
  const collection = getOrderCollection();
  
  const query = { customer: new mongoose.Types.ObjectId(userId) };
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const ordersCursor = collection.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
  const orders = await ordersCursor.toArray();
  const total = await collection.countDocuments(query);

  const ordersWithPopulatedItems = await Promise.all(orders.map(async (order) => {
    const populatedItems = [];
    for (const item of (order.items || [])) {
      if (!item.product) continue;
      const product = await Product.findById(item.product);
      if (product) {
        let p = typeof product.toObject === 'function' ? product.toObject() : { ...product };
        if (!p.selling_price && p.base_price) p.selling_price = p.base_price;
        if (!p.mrp_price) p.mrp_price = p.selling_price || p.base_price || 0;
        if (Array.isArray(p.media) && p.media.length > 0 && typeof p.media[0] === 'object') {
          p.media = p.media.sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)).map(m => m.media_url);
        }
        populatedItems.push({
          id: item._id ? item._id.toString() : item.product.toString(),
          productId: p,
          quantity: item.quantity,
          priceAtBuy: item.price_at_buy
        });
      }
    }
    
    return {
      id: order._id.toString(),
      orderCode: order.order_code,
      status: order.status,
      totalFinal: order.total_final,
      createdAt: order.createdAt,
      items: populatedItems
    };
  }));

  return { orders: ordersWithPopulatedItems, total, page, totalPages: Math.ceil(total / limit) };
};

const cancelOrder = async (userId, orderId) => {
  const collection = getOrderCollection();
  const order = await collection.findOne({ _id: new mongoose.Types.ObjectId(orderId), customer: new mongoose.Types.ObjectId(userId) });
  
  if (!order) throw new Error('Order not found');

  // Only allow cancellation for pending, confirmed, or preparing statuses
  if (!['pending', 'confirmed', 'preparing'].includes(order.status)) {
    throw new Error('Cannot cancel order in this status');
  }

  const createdAt = order.created_at_timestamp || order.createdAt;
  const timeDiff = (new Date() - createdAt) / (1000 * 60);
  
  let newStatus = 'canceled';
  let note = 'Khách hàng hủy đơn hàng';
  
  // If more than 30 minutes, set to cancel_requested instead
  if (timeDiff > 30) {
    newStatus = 'cancel_requested';
    note = 'Khách hàng yêu cầu hủy (đơn hàng đã chuẩn bị quá 30 phút)';
  }

  await collection.updateOne(
    { _id: order._id },
    { 
      $set: { status: newStatus, updatedAt: new Date() },
      $push: { history: { _id: new mongoose.Types.ObjectId(), status: newStatus, note, created_at: new Date() } }
    }
  );
  
  return await collection.findOne({ _id: order._id });
};

module.exports = {
  checkoutCOD,
  getOrders,
  cancelOrder
};

