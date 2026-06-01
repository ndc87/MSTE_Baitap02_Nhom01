const mongoose = require('mongoose');
const cartService = require('./cartService');
const Product = require('../models/Product');

const generateOrderCode = () => {
  return 'ORD' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
};

const getOrderCollection = () => mongoose.connection.db.collection('orders');

const Order = require('../models/Order');
const OrderItem = require('../models/OrderItem');
const OrderStatusHistory = require('../models/OrderStatusHistory');
const PaymentOrder = require('../models/PaymentOrder');

const checkoutCOD = async (userId, addressId) => {
  const items = await cartService.getCart(userId);
  if (!items || items.length === 0) throw new Error('Cart is empty');

  // Group items by shop_id
  const itemsByShop = {};
  let totalSubtotal = 0;

  for (const item of items) {
    const shopId = item.product.shop_id || item.product.shop;
    if (!shopId) throw new Error(`Product ${item.product.name} has no shop associated`);
    
    const sId = shopId.toString();
    if (!itemsByShop[sId]) {
      itemsByShop[sId] = [];
    }
    itemsByShop[sId].push(item);
    
    const price = item.product.selling_price || item.product.base_price || 0;
    totalSubtotal += price * item.quantity;
  }

  const shippingFee = 30000;
  const totalFinal = totalSubtotal + shippingFee;

  // 1. Create PaymentOrder
  const paymentOrder = await PaymentOrder.create({
    payment_code: 'PAY-' + Date.now().toString().slice(-6) + Math.floor(Math.random() * 1000).toString().padStart(3, '0'),
    customer_id: userId,
    subtotal_amount: totalSubtotal,
    shipping_amount: shippingFee,
    final_amount: totalFinal,
    payment_method: 'cod',
    payment_status: 'pending'
  });

  const createdOrders = [];

  // 2. Create Orders for each shop
  for (const [shopId, shopItems] of Object.entries(itemsByShop)) {
    let shopSubtotal = 0;
    for (const item of shopItems) {
      const price = item.product.selling_price || item.product.base_price || 0;
      shopSubtotal += price * item.quantity;
    }
    
    const shopShippingFee = Math.round(shippingFee / Object.keys(itemsByShop).length);
    const shopTotalFinal = shopSubtotal + shopShippingFee;

    const order = await Order.create({
      order_code: generateOrderCode(),
      payment_order_id: paymentOrder._id,
      customer_id: userId,
      shop_id: shopId,
      status: 'pending',
      subtotal_amount: shopSubtotal,
      shipping_fee: shopShippingFee,
      total_final: shopTotalFinal,
      payment_status: 'pending'
    });

    createdOrders.push(order);

    // Create OrderItems
    for (const item of shopItems) {
      const price = item.product.selling_price || item.product.base_price || 0;
      await OrderItem.create({
        order_id: order._id,
        product_id: item.product_id,
        quantity: item.quantity,
        price_at_buy: price
      });
    }

    // Create OrderStatusHistory
    await OrderStatusHistory.create({
      order_id: order._id,
      status: 'pending',
      note: 'Đơn mới',
      updated_by: userId
    });
  }

  // Clear cart
  await cartService.clearCart(userId);

  return createdOrders;
};

const getOrders = async (userId, page = 1, limit = 10, status) => {
  const query = { customer_id: userId };
  if (status) query.status = status;

  const skip = (page - 1) * limit;
  const orders = await Order.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
  const total = await Order.countDocuments(query);

  const ordersWithPopulatedItems = await Promise.all(orders.map(async (order) => {
    const orderItems = await OrderItem.find({ order_id: order._id }).populate('product_id');
    const populatedItems = [];
    
    for (const item of orderItems) {
      if (!item.product_id) continue;
      let p = typeof item.product_id.toObject === 'function' ? item.product_id.toObject() : { ...item.product_id };
      if (!p.selling_price && p.base_price) p.selling_price = p.base_price;
      if (!p.mrp_price) p.mrp_price = p.selling_price || p.base_price || 0;
      
      const ProductMedia = require('../models/ProductMedia');
      const media = await ProductMedia.find({ product_id: p._id }).sort({ sort_order: 1 }).limit(1);
      if (media.length > 0) {
        p.media = [media[0].media_url];
      }

      populatedItems.push({
        id: item._id.toString(),
        productId: p,
        quantity: item.quantity,
        priceAtBuy: item.price_at_buy
      });
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
  const order = await Order.findOne({ _id: orderId, customer_id: userId });
  
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

  order.status = newStatus;
  await order.save();

  await OrderStatusHistory.create({
    order_id: order._id,
    status: newStatus,
    note,
    updated_by: userId
  });
  
  return order;
};

module.exports = {
  checkoutCOD,
  getOrders,
  cancelOrder,
  getOrderById: async (userId, orderId) => {
    const order = await Order.findOne({ _id: orderId, customer_id: userId });
    if (!order) return null;

    const orderItems = await OrderItem.find({ order_id: order._id }).populate('product_id');
    const populatedItems = [];

    for (const item of orderItems) {
      if (!item.product_id) continue;
      let p = typeof item.product_id.toObject === 'function' ? item.product_id.toObject() : { ...item.product_id };
      const ProductMedia = require('../models/ProductMedia');
      const media = await ProductMedia.find({ product_id: p._id }).sort({ sort_order: 1 }).limit(1);
      if (media.length > 0) p.media = [media[0].media_url];

      populatedItems.push({
        id: item._id.toString(),
        productId: p,
        quantity: item.quantity,
        priceAtBuy: item.price_at_buy
      });
    }

    return {
      id: order._id.toString(),
      orderCode: order.order_code,
      status: order.status,
      subtotalAmount: order.subtotal_amount,
      shippingFee: order.shipping_fee,
      totalFinal: order.total_final,
      paymentStatus: order.payment_status,
      createdAt: order.createdAt,
      items: populatedItems
    };
  }
};


