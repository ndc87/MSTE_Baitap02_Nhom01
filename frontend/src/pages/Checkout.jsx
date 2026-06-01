import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../services/api';
import { toast } from 'react-hot-toast';
import Header from '../components/Header';

const Checkout = () => {
  const [addressId, setAddressId] = useState('');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCart = async () => {
      try {
        const token = localStorage.getItem('accessToken');
        if (!token) return navigate('/login');
        const response = await axiosInstance.get('/cart');
        if (response.data.success) {
          setItems(response.data.data);
          if (response.data.data.length === 0) navigate('/cart');
        }
      } catch (error) {
        toast.error('Failed to load cart');
      }
    };
    fetchCart();
  }, [navigate]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axiosInstance.post('/orders/checkout', { addressId: "default" });
      if (res.data.success) {
        toast.success('Order placed successfully!');
        navigate('/orders');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Checkout failed');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = items.reduce((acc, item) => acc + (Number(item.product?.sellingPrice) || 0) * item.quantity, 0);
  const total = subtotal + 30000;

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen font-['Manrope']">
      <Header />
      <main className="max-w-[1280px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold mb-8">Checkout</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#c3c6d7]">
              <h3 className="font-bold text-lg mb-4">Shipping Information</h3>
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                <input required type="text" placeholder="Full Name" className="w-full p-3 rounded-xl border border-[#c3c6d7]" />
                <input required type="text" placeholder="Phone Number" className="w-full p-3 rounded-xl border border-[#c3c6d7]" />
                <input required type="text" placeholder="Address" className="w-full p-3 rounded-xl border border-[#c3c6d7]" />
              </form>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-[#c3c6d7]">
              <h3 className="font-bold text-lg mb-4">Payment Method</h3>
              <div className="flex items-center gap-3 p-4 border rounded-xl bg-[#eaedff] border-[#004ac6]">
                <input type="radio" checked readOnly className="w-5 h-5 text-[#004ac6]" />
                <span className="font-bold">Cash on Delivery (COD)</span>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-[#c3c6d7] h-fit">
            <h3 className="font-bold text-lg mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex justify-between items-center text-sm">
                  <span className="text-[#434655] truncate max-w-[150px]">{item.product?.name}</span>
                  <span>x{item.quantity}</span>
                  <span className="font-bold">{((Number(item.product?.sellingPrice) || 0) * item.quantity).toLocaleString()}₫</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-[#434655]">Subtotal</span>
              <span className="font-bold">{subtotal.toLocaleString()}₫</span>
            </div>
            <div className="flex justify-between mb-4 pb-4 border-b">
              <span className="text-[#434655]">Shipping</span>
              <span className="font-bold">30,000₫</span>
            </div>
            <div className="flex justify-between mb-6">
              <span className="font-extrabold text-xl">Total</span>
              <span className="font-extrabold text-xl text-[#004ac6]">{total.toLocaleString()}₫</span>
            </div>
            <button form="checkout-form" disabled={loading} type="submit" className="w-full bg-[#004ac6] text-white py-3 rounded-xl font-bold disabled:opacity-50">
              {loading ? 'Processing...' : 'Place Order'}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
