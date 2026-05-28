import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import axiosInstance from '../services/api';
import Header from '../components/Header';

const Cart = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return navigate('/login');
      const response = await axiosInstance.get('/cart');
      if (response.data.success) {
        setItems(response.data.data);
      }
    } catch (error) {
      console.error('Fetch cart error:', error);
      toast.error('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  const handleUpdate = async (itemId, quantity) => {
    try {
      await axiosInstance.put(`/cart/update/${itemId}`, { quantity });
      window.dispatchEvent(new Event('cartUpdated'));
      fetchCart();
    } catch (error) {
      console.error('Update cart error:', error);
      toast.error('Update failed');
    }
  };

  const handleRemove = async (itemId) => {
    try {
      await axiosInstance.delete(`/cart/remove/${itemId}`);
      window.dispatchEvent(new Event('cartUpdated'));
      fetchCart();
      toast.success('Removed from cart');
    } catch (error) {
      console.error('Remove cart error:', error);
      toast.error('Failed to remove');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const total = items.reduce((acc, item) => acc + (item.productId?.sellingPrice || 0) * item.quantity, 0);

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen font-['Manrope']">
      <Header />
      <main className="max-w-[1280px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold mb-8">Your Cart</h1>
        {items.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#434655] mb-4">Your cart is empty.</p>
            <Link to="/" className="bg-[#004ac6] text-white px-6 py-2 rounded-xl">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              {items.map(item => (
                <div key={item.id} className="bg-white p-4 rounded-2xl border border-[#c3c6d7] flex items-center gap-4">
                  <img src={item.productId?.media?.[0] || 'https://via.placeholder.com/100'} className="w-24 h-24 object-cover rounded-xl" />
                  <div className="flex-grow">
                    <h3 className="font-bold">{item.productId?.name || 'Product'}</h3>
                    <p className="text-[#004ac6] font-extrabold">{(item.productId?.sellingPrice || 0).toLocaleString()}₫</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleUpdate(item.id, item.quantity - 1)} className="w-8 h-8 flex items-center justify-center bg-[#eaedff] rounded-lg">-</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => handleUpdate(item.id, item.quantity + 1)} className="w-8 h-8 flex items-center justify-center bg-[#eaedff] rounded-lg">+</button>
                  </div>
                  <button onClick={() => handleRemove(item.id)} className="text-red-500 hover:text-red-700 p-2">
                    <span className="material-symbols-outlined">delete</span>
                  </button>
                </div>
              ))}
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#c3c6d7] h-fit">
              <h3 className="font-bold text-lg mb-4">Order Summary</h3>
              <div className="flex justify-between mb-2">
                <span className="text-[#434655]">Subtotal</span>
                <span className="font-bold">{total.toLocaleString()}₫</span>
              </div>
              <div className="flex justify-between mb-4 pb-4 border-b">
                <span className="text-[#434655]">Shipping</span>
                <span className="font-bold">Calculated at checkout</span>
              </div>
              <div className="flex justify-between mb-6">
                <span className="font-extrabold text-xl">Total</span>
                <span className="font-extrabold text-xl text-[#004ac6]">{total.toLocaleString()}₫</span>
              </div>
              <button onClick={() => navigate('/checkout')} className="w-full bg-[#004ac6] text-white py-3 rounded-xl font-bold">Proceed to Checkout</button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Cart;
