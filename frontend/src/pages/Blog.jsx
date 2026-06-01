import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Blog = () => {
  const posts = [
    { id: 1, title: 'Top 10 Laptop Tốt Nhất Cho Sinh Viên 2026', excerpt: 'Tổng hợp và so sánh chi tiết 10 mẫu laptop phù hợp nhất cho nhu cầu học tập và nghiên cứu.', date: '25 May 2026', category: 'Tech', image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&h=400&fit=crop', readTime: '8 min' },
    { id: 2, title: 'Cách Tiết Kiệm Chi Phí Mua Sắm Online', excerpt: 'Những mẹo và chiến lược giúp bạn mua sắm thông minh hơn, tiết kiệm đến 40% chi phí.', date: '22 May 2026', category: 'Tips', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop', readTime: '5 min' },
    { id: 3, title: 'Review: Tai Nghe Chống Ồn Cho Thư Viện', excerpt: 'Đánh giá 5 mẫu tai nghe chống ồn phù hợp nhất để học tập trong môi trường thư viện.', date: '18 May 2026', category: 'Review', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&h=400&fit=crop', readTime: '6 min' },
    { id: 4, title: 'Xu Hướng Thời Trang Campus Hè 2026', excerpt: 'Khám phá những phong cách thời trang được yêu thích nhất tại các campus đại học mùa hè này.', date: '15 May 2026', category: 'Fashion', image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop', readTime: '4 min' },
    { id: 5, title: 'Hướng Dẫn Setup Bàn Học Hoàn Hảo', excerpt: 'Từ đèn bàn đến giá sách – thiết lập không gian học tập hiệu quả tối đa.', date: '12 May 2026', category: 'Lifestyle', image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=600&h=400&fit=crop', readTime: '7 min' },
    { id: 6, title: 'So Sánh: iPad vs Android Tablet Cho Ghi Chú', excerpt: 'Phân tích ưu nhược điểm của iPad và các tablet Android phổ biến cho việc ghi chú bài giảng.', date: '10 May 2026', category: 'Tech', image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&h=400&fit=crop', readTime: '9 min' },
  ];

  const categoryColors = {
    Tech: 'bg-blue-100 text-blue-700',
    Tips: 'bg-emerald-100 text-emerald-700',
    Review: 'bg-amber-100 text-amber-700',
    Fashion: 'bg-pink-100 text-pink-700',
    Lifestyle: 'bg-purple-100 text-purple-700',
  };

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col font-['Manrope']">
      <Header />
      <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-10 py-12">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 bg-[#004ac6]/10 text-[#004ac6] px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">article</span>
            Campus Insights
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">UTEShop Blog</h1>
          <p className="text-[#434655] text-lg max-w-2xl mx-auto">Tin tức, đánh giá sản phẩm và mẹo mua sắm dành cho cộng đồng sinh viên.</p>
        </div>

        {/* Featured Post */}
        <div className="mb-12 bg-white border border-[#c3c6d7] rounded-3xl overflow-hidden group hover:shadow-xl transition-shadow duration-300 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="aspect-[16/10] lg:aspect-auto overflow-hidden">
              <img src={posts[0].image} alt={posts[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-10 flex flex-col justify-center space-y-4">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${categoryColors[posts[0].category]}`}>{posts[0].category}</span>
                <span className="text-xs text-[#434655]">{posts[0].date}</span>
                <span className="text-xs text-[#434655] flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span>{posts[0].readTime}</span>
              </div>
              <h2 className="text-2xl font-extrabold leading-tight group-hover:text-[#004ac6] transition-colors">{posts[0].title}</h2>
              <p className="text-[#434655] leading-relaxed">{posts[0].excerpt}</p>
              <Link to="#" className="inline-flex items-center gap-2 text-[#004ac6] font-bold text-sm hover:underline mt-2">
                Read Article <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.slice(1).map(post => (
            <article key={post.id} className="bg-white border border-[#c3c6d7] rounded-2xl overflow-hidden group hover:shadow-xl transition-all duration-300 flex flex-col shadow-sm">
              <div className="aspect-[16/10] overflow-hidden">
                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-6 flex flex-col flex-grow space-y-3">
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${categoryColors[post.category]}`}>{post.category}</span>
                  <span className="text-xs text-[#434655]">{post.date}</span>
                </div>
                <h3 className="font-bold text-lg leading-snug group-hover:text-[#004ac6] transition-colors line-clamp-2">{post.title}</h3>
                <p className="text-sm text-[#434655] line-clamp-2 flex-grow">{post.excerpt}</p>
                <div className="flex items-center justify-between pt-3 border-t border-[#c3c6d7]/30 mt-auto">
                  <span className="text-xs text-[#434655] flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">schedule</span>{post.readTime} read</span>
                  <Link to="#" className="text-[#004ac6] font-bold text-xs hover:underline">Read More →</Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Blog;
