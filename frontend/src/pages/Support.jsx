import React, { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import toast from 'react-hot-toast';

const Support = () => {
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '' });

  const faqs = [
    { q: 'Làm sao để đặt hàng trên UTEShop?', a: 'Chọn sản phẩm → Thêm vào giỏ hàng → Vào giỏ hàng → Bấm "Proceed to Checkout" → Điền địa chỉ giao hàng → Xác nhận đơn hàng.' },
    { q: 'Thời gian giao hàng là bao lâu?', a: 'Đơn hàng nội thành: 1-2 ngày. Đơn hàng ngoại thành / tỉnh: 3-5 ngày làm việc. Miễn phí vận chuyển cho đơn từ 200.000₫.' },
    { q: 'Chính sách đổi trả hàng?', a: 'UTEShop hỗ trợ đổi/trả hàng trong vòng 7 ngày kể từ ngày nhận hàng. Sản phẩm phải còn nguyên tem mác, chưa qua sử dụng.' },
    { q: 'Làm sao để hủy đơn hàng?', a: 'Vào mục "My Orders", chọn đơn hàng cần hủy và bấm "Cancel Order". Lưu ý: chỉ có thể hủy đơn trong vòng 30 phút sau khi đặt.' },
    { q: 'Phương thức thanh toán nào được hỗ trợ?', a: 'Hiện tại UTEShop hỗ trợ thanh toán khi nhận hàng (COD). Chúng tôi đang phát triển thêm các phương thức thanh toán online.' },
  ];

  const [openFaq, setOpenFaq] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    toast.success('Tin nhắn của bạn đã được gửi! Chúng tôi sẽ phản hồi trong 24h.');
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="bg-[#faf8ff] text-[#131b2e] min-h-screen flex flex-col font-['Manrope']">
      <Header />
      <main className="flex-grow max-w-[1440px] mx-auto w-full px-4 md:px-10 py-12">
        <div className="text-center mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest">
            <span className="material-symbols-outlined text-sm">support_agent</span>
            We're Here to Help
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight">Support Center</h1>
          <p className="text-[#434655] text-lg max-w-2xl mx-auto">Bạn cần hỗ trợ? Tìm câu trả lời nhanh hoặc liên hệ đội ngũ chăm sóc khách hàng của chúng tôi.</p>
        </div>

        {/* Contact Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          {[
            { icon: 'mail', title: 'Email', info: 'support@uteshop.edu.vn', desc: 'Phản hồi trong 24h' },
            { icon: 'call', title: 'Hotline', info: '1900-UTE-SHOP', desc: 'T2-T7, 8:00 - 22:00' },
            { icon: 'forum', title: 'Live Chat', info: 'Chat ngay', desc: 'Trực tuyến 24/7' },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-[#c3c6d7] rounded-2xl p-8 text-center hover:shadow-lg transition-shadow group shadow-sm">
              <div className="w-16 h-16 bg-[#eaedff] rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#004ac6] transition-colors">
                <span className="material-symbols-outlined text-2xl text-[#004ac6] group-hover:text-white transition-colors">{item.icon}</span>
              </div>
              <h3 className="font-bold text-lg mb-1">{item.title}</h3>
              <p className="text-[#004ac6] font-bold mb-1">{item.info}</p>
              <p className="text-xs text-[#434655]">{item.desc}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* FAQ */}
          <div>
            <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ac6]">help</span>
              Câu Hỏi Thường Gặp
            </h2>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white border border-[#c3c6d7] rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex items-center justify-between p-5 text-left font-bold text-sm hover:text-[#004ac6] transition-colors"
                  >
                    {faq.q}
                    <span className={`material-symbols-outlined text-sm transition-transform ${openFaq === i ? 'rotate-180' : ''}`}>expand_more</span>
                  </button>
                  {openFaq === i && (
                    <div className="px-5 pb-5 text-sm text-[#434655] leading-relaxed border-t border-[#c3c6d7]/30 pt-4">
                      {faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Contact Form */}
          <div>
            <h2 className="text-2xl font-extrabold mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-[#004ac6]">edit_note</span>
              Gửi Tin Nhắn
            </h2>
            <form onSubmit={handleSubmit} className="bg-white border border-[#c3c6d7] rounded-2xl p-8 space-y-5 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[#505f76] mb-2 block">Họ và tên</label>
                  <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#f7f9ff] border border-[#c3c6d7] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#004ac6] transition-colors" placeholder="Nguyễn Văn A" />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-[#505f76] mb-2 block">Email</label>
                  <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#f7f9ff] border border-[#c3c6d7] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#004ac6] transition-colors" placeholder="email@student.edu.vn" />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#505f76] mb-2 block">Chủ đề</label>
                <select required value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} className="w-full bg-[#f7f9ff] border border-[#c3c6d7] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#004ac6] transition-colors">
                  <option value="">Chọn chủ đề...</option>
                  <option value="order">Vấn đề đơn hàng</option>
                  <option value="payment">Thanh toán</option>
                  <option value="return">Đổi/Trả hàng</option>
                  <option value="account">Tài khoản</option>
                  <option value="other">Khác</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-[#505f76] mb-2 block">Nội dung</label>
                <textarea required rows={5} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-[#f7f9ff] border border-[#c3c6d7] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#004ac6] transition-colors resize-none" placeholder="Mô tả chi tiết vấn đề của bạn..." />
              </div>
              <button type="submit" className="w-full bg-[#004ac6] text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">send</span>
                Gửi Tin Nhắn
              </button>
            </form>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Support;
