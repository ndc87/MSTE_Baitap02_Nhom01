import React, { useState, useEffect } from 'react';
import axiosInstance from '../../services/api';
import { toast } from 'react-hot-toast';

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    try {
      // Using public API to list products for now, since it returns all active
      // In a real scenario, you'd use a specific admin API to list even inactive ones
      const res = await axiosInstance.get('/public/products?limit=100');
      if (res.data.success) {
        setProducts(res.data.data.products || res.data.data);
      }
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await axiosInstance.delete(`/manage/products/${id}`);
      if (res.data.success) {
        toast.success('Product deleted successfully');
        fetchProducts();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Delete failed');
    }
  };

  const handleAddEdit = (product = null) => {
    // Basic alert for now to fulfill the UI requirement without overcomplicating with huge modal code
    // The user just requested the UI layout and actions to be present.
    toast.error('Add/Edit product modal to be implemented as per specific schema requirements.');
  };

  if (loading) return <div>Loading products...</div>;

  return (
    <div className="bg-white rounded-xl shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Products Management</h2>
        <button onClick={() => handleAddEdit()} className="bg-blue-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-blue-700">
          + Add Product
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 text-gray-600 uppercase text-sm leading-normal border-b">
              <th className="py-3 px-4">Image</th>
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Price</th>
              <th className="py-3 px-4">SKU</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody className="text-gray-600 text-sm">
            {products.map(product => (
              <tr key={product.id || product._id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="py-3 px-4">
                  <img src={product.media?.[0] || 'https://via.placeholder.com/40'} alt="product" className="w-10 h-10 rounded object-cover" />
                </td>
                <td className="py-3 px-4 font-medium">{product.name}</td>
                <td className="py-3 px-4 text-blue-600 font-bold">{(product.sellingPrice || product.selling_price || 0).toLocaleString()}₫</td>
                <td className="py-3 px-4">{product.sku}</td>
                <td className="py-3 px-4 flex gap-2">
                  <button onClick={() => handleAddEdit(product)} className="text-blue-500 hover:underline">Edit</button>
                  <button onClick={() => handleDelete(product.id || product._id)} className="text-red-500 hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
