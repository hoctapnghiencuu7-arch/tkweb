import React, { useState } from 'react';
import { FileText, Plus, Globe } from 'lucide-react';

export const CMSPage: React.FC = () => {
  const [articles, setArticles] = useState([
    {
      id: 1,
      title: 'Vi Vu Đón Thu - Giảm Đến 35% Chặng Bay Nội Địa',
      type: 'BANNER',
      summary: 'Chương trình áp dụng cho tất cả các chặng bay khởi hành từ SGN và HAN trong tháng 9 & 10.',
      locale: 'vi',
      status: 'Đã xuất bản',
      date: '20/08/2026',
    },
    {
      id: 2,
      title: 'Quy Định Tiêu Chuẩn Hành Lý Xách Tay & Ký Gửi Mới Nhất 2026',
      type: 'POLICY',
      summary: 'Cập nhật điều kiện kích thước kiện hành lý xách tay tối đa 56 x 36 x 23 cm và trọng lượng 7kg-12kg.',
      locale: 'vi',
      status: 'Đã xuất bản',
      date: '01/06/2026',
    },
    {
      id: 3,
      title: 'Làm thế nào để đổi ngày bay hoặc yêu cầu hoàn tiền?',
      type: 'FAQ',
      summary: 'Hành khách có thể tự quản lý đơn hàng tại mục Tra Cứu Vé bằng mã PNR và số điện thoại.',
      locale: 'vi',
      status: 'Đã xuất bản',
      date: '01/09/2026',
    },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newType, setNewType] = useState('BANNER');
  const [newSummary, setNewSummary] = useState('');

  const handleCreateArticle = (e: React.FormEvent) => {
    e.preventDefault();
    setArticles([
      {
        id: articles.length + 1,
        title: newTitle,
        type: newType,
        summary: newSummary,
        locale: 'vi',
        status: 'Đã xuất bản',
        date: '14/09/2026',
      },
      ...articles,
    ]);
    setShowModal(false);
    setNewTitle('');
    setNewSummary('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Quản Trị Nội Dung CMS, Banner & Chính Sách</h1>
          <p className="text-xs text-slate-400 mt-1">
            Quản lý banner trang chủ, tin tức khuyến mãi, giải đáp thắc mắc FAQ và quy chế hành lý hàng không.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Nội Dung Mới</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {articles.map((a) => (
          <div key={a.id} className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  {a.type}
                </span>
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  <span>VI</span>
                </span>
              </div>
              <h3 className="font-bold text-white text-sm line-clamp-2 mb-2">{a.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-3 mb-4">{a.summary}</p>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400">
              <span>{a.date}</span>
              <span className="text-emerald-400 font-bold">● {a.status}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 relative">
            <h3 className="text-base font-black text-white mb-2">Thêm Bài Viết / Banner Mới</h3>
            <form onSubmit={handleCreateArticle} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Loại nội dung:</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="BANNER">Banner Trang Chủ</option>
                  <option value="NEWS">Tin Tức Khuyến Mãi</option>
                  <option value="POLICY">Quy Định / Chính Sách</option>
                  <option value="FAQ">Câu Hỏi Thường Gặp (FAQ)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tiêu đề:</label>
                <input
                  type="text"
                  required
                  placeholder="Tiêu đề bài viết hoặc banner..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tóm tắt nội dung:</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Nội dung tóm tắt hiển thị..."
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20"
                >
                  Đăng Tải
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
