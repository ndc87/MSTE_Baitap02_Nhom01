import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Promotions = () => {
  const promos = [
    { id: 1, title: 'Back-to-School Sale', discount: '20%', desc: 'Giảm giá 20% cho tất cả đồ dùng học tập, sách vở và thiết bị công nghệ.', badge: 'HOT', color: 'from-[#004ac6] to-[#0066ff]', icon: 'school' },
    { id: 2, title: 'Flash Friday Deals', discount: '50%', desc: 'Mỗi thứ Sáu - giảm sốc lên đến 50% cho các sản phẩm được chọn.', badge: 'FLASH', color: 'from-red-500 to-orange-500', icon: 'bolt' },
    { id: 3, title: 'Student Exclusive', discount: '15%', desc: 'Ưu đãi dành riêng cho sinh viên đã xác minh tài khoản .edu.', badge: 'EXCLUSIVE', color: 'from-emerald-500 to-teal-500', icon: 'verified_user' },
    { id: 4, title: 'Free Shipping Week', discount: 'FREE', desc: 'Miễn phí vận chuyển toàn quốc cho đơn hàng từ 200.000₫.', badge: 'LIMITED', color: 'from-purple-500 to-indigo-500', icon: 'local_shipping' },
  ];

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col font-['Manrope']">
      <Header />
      <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-10 py-12">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-600 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">local_fire_department</span>
            Limited Time Offers
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Promotions & Deals</h1>
          <p className="text-[#434655] text-lg max-w-2xl mx-auto">Khám phá các chương trình khuyến mãi đặc biệt dành cho sinh viên và cộng đồng học thuật.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {promos.map(promo => (
            <div key={promo.id} className={`relative bg-gradient-to-br ${promo.color} rounded-3xl p-8 text-white overflow-hidden group hover:scale-[1.02] transition-transform duration-300 shadow-lg`}>
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/20 transition-colors"></div>
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-8 -mb-8 blur-xl"></div>
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest">{promo.badge}</span>
                  <span className="material-symbols-outlined text-4xl opacity-50">{promo.icon}</span>
                </div>
                <p className="text-5xl font-extrabold mb-2">{promo.discount}</p>
                <h3 className="text-xl font-bold mb-2">{promo.title}</h3>
                <p className="text-white/80 text-sm mb-6 leading-relaxed">{promo.desc}</p>
                <Link to="/search" className="inline-flex items-center gap-2 bg-white text-[#131b2e] px-6 py-3 rounded-full font-bold text-sm hover:bg-white/90 transition-colors shadow-md">
                  Shop Now
                  <span className="material-symbols-outlined text-sm">arrow_forward</span>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-white border border-[#c3c6d7] rounded-3xl p-10 text-center shadow-sm">
          <span className="material-symbols-outlined text-5xl text-[#004ac6] mb-4">notifications_active</span>
          <h2 className="text-2xl font-extrabold mb-2">Không bỏ lỡ ưu đãi!</h2>
          <p className="text-[#434655] mb-6 max-w-lg mx-auto">Đăng ký nhận thông báo để được cập nhật các chương trình khuyến mãi mới nhất.</p>
          <div className="flex gap-3 max-w-md mx-auto">
            <input type="email" placeholder="email@student.edu.vn" className="flex-grow bg-[#f7f9ff] border border-[#c3c6d7] rounded-full px-6 py-3 text-sm outline-none focus:border-[#004ac6] transition-colors" />
            <button className="bg-[#004ac6] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-blue-700 transition-colors shadow-md">Subscribe</button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Promotions;
