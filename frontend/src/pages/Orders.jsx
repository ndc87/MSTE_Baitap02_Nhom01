import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Header from '../components/Header';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) return navigate('/login');
      const response = await axios.get('http://localhost:5000/api/orders/history', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setOrders(response.data.data.orders);
      }
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [navigate]);

  const handleCancel = async (orderId) => {
    try {
      const token = sessionStorage.getItem('token');
      await axios.put(`http://localhost:5000/api/orders/${orderId}/cancel`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Order canceled');
      fetchOrders();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cancel failed');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen font-['Manrope']">
      <Header />
      <main className="max-w-[1280px] mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold mb-8">My Orders</h1>
        {orders.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[#434655]">You have no orders yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map(order => (
              <div key={order.id} className="bg-white p-6 rounded-2xl border border-[#c3c6d7]">
                <div className="flex justify-between items-center mb-4 pb-4 border-b">
                  <div>
                    <p className="font-bold">Order ID: {order.orderCode}</p>
                    <p className="text-xs text-[#434655]">{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${
                    order.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                    order.status === 'canceled' ? 'bg-red-100 text-red-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {order.status}
                  </span>
                </div>
                <div className="space-y-4 mb-4">
                  {order.items?.map(item => (
                    <div key={item.id} className="flex gap-4 items-center">
                      <div className="flex-grow">
                        <p className="font-bold text-sm">{item.productId?.name || 'Product'}</p>
                        <p className="text-xs text-[#434655]">x{item.quantity}</p>
                      </div>
                      <p className="font-bold text-[#004ac6]">{((item.priceAtBuy || 0) * item.quantity).toLocaleString()}₫</p>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center pt-4 border-t">
                  <p className="font-bold">Total: <span className="text-xl text-[#004ac6]">{(order.totalFinal || 0).toLocaleString()}₫</span></p>
                  {(order.status === 'pending' || order.status === 'confirmed') && (
                    <button onClick={() => handleCancel(order.id)} className="text-red-500 font-bold text-sm hover:underline">
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Orders;
