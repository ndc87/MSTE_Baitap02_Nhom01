import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from 'react-router-dom';
import Register from './pages/Register';
import VerifyOTP from './pages/VerifyOTP';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import Home from './pages/Home';
import ProductDetail from './pages/ProductDetail';
import Search from './pages/Search';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import Promotions from './pages/Promotions';
import Blog from './pages/Blog';
import Support from './pages/Support';
import AdminLayout from './components/admin/AdminLayout';
import AdminProducts from './pages/admin/AdminProducts';
import AdminOrders from './pages/admin/AdminOrders';

import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';

// Redirect /category/:slug → /search?category=slug
const CategoryRedirect = () => {
  const { slug } = useParams();
  return <Navigate to={`/search?category=${slug}`} replace />;
};

function App() {
  const { user } = useSelector((state) => state.auth);

  return (
    <Router>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/verify-otp" element={<VerifyOTP />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/user/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
        <Route path="/login" element={!user ? <Login /> : (user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/" />)} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route path="/search" element={<Search />} />
        <Route path="/category/:slug" element={<CategoryRedirect />} />
        <Route path="/" element={user ? <Home /> : <Navigate to="/login" />} />
        {/* Cart & Checkout */}
        <Route path="/cart" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        {/* Promotions, Blog, Support */}
        <Route path="/promotions" element={<Promotions />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/support" element={<Support />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<div className="text-xl font-bold">Welcome to Admin Dashboard</div>} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
        </Route>

        {/* Cấu hình các route không tồn tại (404) */}
        <Route path="*" element={<div className="min-h-screen flex items-center justify-center text-2xl font-bold">404 - Page Not Found</div>} />
      </Routes>
    </Router>
  );
}

export default App;
