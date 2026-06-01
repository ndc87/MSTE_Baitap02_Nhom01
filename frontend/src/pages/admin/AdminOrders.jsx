import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/api';
import { toast } from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      const res = await axiosInstance.get('/manage/orders');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const res = await axiosInstance.put(`/manage/orders/${orderId}/status`, { status: newStatus });
      if (res.data.success) {
        toast.success('Order status updated');
        // Update local state to reflect change without full refetch
        setOrders(orders.map(o => o.id === orderId || o._id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update status');
      fetchOrders(); // Revert back on error
    }
  };

  const handleCancelRequest = async (orderId, action) => {
    try {
      const res = await axiosInstance.post(`/manage/orders/${orderId}/cancel-request`, { action });
      if (res.data.success) {
        toast.success(`Cancel request ${action}d`);
        fetchOrders();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to process request');
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <h2 className="text-2xl font-bold mb-6">Orders Management</h2>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal border-b">
              <th className="py-3 px-4">Order Code</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {orders.map(order => (
              <tr key={order.id || order._id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4 font-bold">{order.orderCode || order.order_code}</td>
                <td className="py-3 px-4">{order.customerId?.fullName || order.customer_id?.full_name || 'Unknown'}</td>
                <td className="py-3 px-4 text-blue-600 font-bold">{(order.totalFinal || order.total_final || 0).toLocaleString()}₫</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-1 rounded text-xs ${order.paymentStatus === 'success' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {order.paymentStatus || order.payment_status}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <select 
                    value={order.status} 
                    onChange={(e) => handleStatusChange(order.id || order._id, e.target.value)}
                    className="border rounded p-1 text-sm bg-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="preparing">Preparing</option>
                    <option value="shipping">Shipping</option>
                    <option value="delivered">Delivered</option>
                    <option value="cancel_requested">Cancel Requested</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </td>
                <td className="py-3 px-4">
                  {order.status === 'cancel_requested' && (
                    <div className="flex gap-2">
                      <button onClick={() => handleCancelRequest(order.id || order._id, 'approve')} className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600">Approve Cancel</button>
                      <button onClick={() => handleCancelRequest(order.id || order._id, 'reject')} className="text-xs bg-gray-500 text-white px-2 py-1 rounded hover:bg-gray-600">Reject</button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
