import React, { useState } from 'react';
import { Percent, Clock, Plus, Zap, CheckCircle } from 'lucide-react';

export const PricingPage: React.FC = () => {
  // Dynamic Pricing Rules
  const [rules, setRules] = useState([
    { id: 1, name: 'Tăng giá khi cận ngày bay (<= 3 ngày)', condition: 'Thời gian < 72h', adjustment: '+25%', isActive: true },
    { id: 2, name: 'Tăng giá khi tỷ lệ lấp đầy ghế > 80%', condition: 'Occupancy > 80%', adjustment: '+20%', isActive: true },
    { id: 3, name: 'Ưu đãi kích cầu đặt vé sớm (> 30 ngày)', condition: 'Thời gian > 30 ngày', adjustment: '-10%', isActive: true },
  ]);

  // Seat hold timeout setting
  const [seatHoldMinutes, setSeatHoldMinutes] = useState(15);
  const [savedSettings, setSavedSettings] = useState(false);

  // Price Simulator state
  const [simBasePrice, setSimBasePrice] = useState(1500000);
  const [simOccupancy, setSimOccupancy] = useState(85);
  const [simDays, setSimDays] = useState(2);

  // Calculate simulated price
  let simAdj = 0;
  if (simDays <= 3) simAdj += 25;
  if (simOccupancy > 80) simAdj += 20;
  const simFinalPrice = Math.round(simBasePrice * (1 + simAdj / 100));

  // Promos State
  const [promos, setPromos] = useState([
    { id: 1, code: 'BAYHE2026', title: 'Chào Hè Rực Rỡ 2026', discount: '15%', used: '428/2000', expiry: '31/10/2026', status: 'Đang chạy' },
    { id: 2, code: 'SKYWINGS50', title: 'Giảm 50.000đ đơn đầu', discount: '50.000 ₫', used: '1890/5000', expiry: '31/12/2026', status: 'Đang chạy' },
    { id: 3, code: 'THUONGGIA20', title: 'Đặc Quyền Vé Thương Gia', discount: '20%', used: '112/500', expiry: '30/11/2026', status: 'Đang chạy' },
  ]);

  const [showPromoModal, setShowPromoModal] = useState(false);
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoTitle, setNewPromoTitle] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState('10');

  const handleSaveSettings = () => {
    setSavedSettings(true);
    setTimeout(() => setSavedSettings(false), 2500);
  };

  const handleCreatePromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromos([
      {
        id: promos.length + 1,
        code: newPromoCode.toUpperCase(),
        title: newPromoTitle,
        discount: `${newPromoDiscount}%`,
        used: '0/1000',
        expiry: '31/12/2026',
        status: 'Đang chạy',
      },
      ...promos,
    ]);
    setShowPromoModal(false);
    setNewPromoCode('');
    setNewPromoTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Chiến Lược Giá Động & Khuyến Mãi (Conversion Rate)</h1>
        <p className="text-xs text-slate-400 mt-1">
          Tối ưu hóa doanh thu và tỷ lệ chốt đơn tự động theo nhu cầu thị trường, cấu hình thời gian giữ chỗ và chiến dịch voucher.
        </p>
      </div>

      {/* Grid: Dynamic Pricing Rules + Conversion Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Dynamic Pricing Rules Manager */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-500" />
                <span>Quy Tắc Định Giá Động (Dynamic Pricing Algorithm)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Tự động điều chỉnh giá bán theo cung - cầu thời gian thực</p>
            </div>
          </div>

          <div className="space-y-3">
            {rules.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between p-4 bg-slate-800/40 border border-slate-700/60 rounded-xl"
              >
                <div>
                  <div className="font-bold text-white text-xs">{r.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Điều kiện kích hoạt: {r.condition}</div>
                </div>
                <div className="flex items-center gap-4">
                  <span
                    className={`font-black text-xs px-2.5 py-1 rounded-lg ${
                      r.adjustment.startsWith('+')
                        ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                        : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    }`}
                  >
                    {r.adjustment}
                  </span>
                  <input
                    type="checkbox"
                    checked={r.isActive}
                    onChange={() =>
                      setRules(rules.map((item) => (item.id === r.id ? { ...item, isActive: !item.isActive } : item)))
                    }
                    className="w-4 h-4 accent-orange-500 rounded cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Real-time Simulator */}
          <div className="mt-6 p-4 bg-slate-950/70 border border-slate-800 rounded-xl">
            <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-3">
              Mô Phỏng Tính Giá Thời Gian Thực (Live Price Simulator)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
              <div>
                <label className="block text-slate-400 mb-1">Giá cơ bản (VNĐ):</label>
                <input
                  type="number"
                  step="100000"
                  value={simBasePrice}
                  onChange={(e) => setSimBasePrice(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Tỷ lệ lấp đầy ghế (%):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={simOccupancy}
                  onChange={(e) => setSimOccupancy(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold"
                />
              </div>
              <div>
                <label className="block text-slate-400 mb-1">Số ngày tới chuyến bay:</label>
                <input
                  type="number"
                  min="0"
                  value={simDays}
                  onChange={(e) => setSimDays(Number(e.target.value))}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white font-bold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
              <span className="text-xs text-slate-300 font-semibold">
                Biến động áp dụng: <strong className="text-orange-400">+{simAdj}%</strong>
              </span>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">GIÁ BÁN CUỐI CÙNG:</span>
                <span className="text-lg font-black text-white">{simFinalPrice.toLocaleString('vi-VN')} ₫</span>
              </div>
            </div>
          </div>
        </div>

        {/* Seat Hold Timeout Setting */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-orange-500" />
              <span>Thời Gian Giữ Chỗ Tạm (Seat Hold Lock)</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Cấu hình thời gian khóa giữ ghế khi khách đang trong luồng thanh toán. Quá thời gian này, ghế sẽ tự động nhả về trạng thái trống.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  Thời gian giữ chỗ (phút):
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="5"
                    max="60"
                    value={seatHoldMinutes}
                    onChange={(e) => setSeatHoldMinutes(Number(e.target.value))}
                    className="w-28 bg-slate-800 border border-slate-700 rounded-xl p-2 text-sm text-white font-bold text-center focus:outline-none focus:border-orange-500"
                  />
                  <span className="text-xs text-slate-400 font-semibold">Khuyến nghị IATA: 15 phút</span>
                </div>
              </div>

              <div className="bg-slate-800/40 border border-slate-700 p-3 rounded-xl text-xs space-y-1 text-slate-300">
                <div className="font-bold text-white">⚡ Tác động đến chuyển đổi (CR):</div>
                <div>• Quá ngắn (&lt; 10p): Khách vội vàng, dễ bỏ cuộc nếu thẻ bị lỗi OTP.</div>
                <div>• Quá dài (&gt; 30p): Khóa ghế ảo khiến khách khác không mua được.</div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              onClick={handleSaveSettings}
              className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
            >
              {savedSettings ? (
                <>
                  <CheckCircle className="w-4 h-4 text-white" />
                  <span>Đã Áp Dụng Cấu Hình Mới</span>
                </>
              ) : (
                <span>Lưu & Đồng Bộ Toàn Hệ Thống</span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Promo Codes & Vouchers Table */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Percent className="w-4 h-4 text-orange-500" />
              <span>Danh Sách Mã Giảm Giá & Flash Sale</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Quản lý các chương trình ưu đãi hiển thị tại trang thanh toán.</p>
          </div>
          <button
            onClick={() => setShowPromoModal(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tạo Voucher Mới</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Mã Code</th>
                <th className="p-3">Chương Trình</th>
                <th className="p-3">Mức Giảm</th>
                <th className="p-3">Lượt Sử Dụng</th>
                <th className="p-3">Hạn Dùng</th>
                <th className="p-3">Trạng Thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {promos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-800/40">
                  <td className="p-3">
                    <span className="font-black text-orange-400 font-mono tracking-wider bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20">
                      {p.code}
                    </span>
                  </td>
                  <td className="p-3 font-bold text-white">{p.title}</td>
                  <td className="p-3 font-black text-emerald-400">{p.discount}</td>
                  <td className="p-3 font-bold text-slate-300">{p.used}</td>
                  <td className="p-3 text-slate-400">{p.expiry}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ● {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Promo Modal */}
      {showPromoModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-6 relative">
            <h3 className="text-base font-black text-white mb-2">Tạo Mã Giảm Giá Mới</h3>
            <form onSubmit={handleCreatePromo} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mã code:</label>
                <input
                  type="text"
                  required
                  placeholder="VD: VIETNAM2026"
                  value={newPromoCode}
                  onChange={(e) => setNewPromoCode(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white uppercase font-mono focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tên chương trình:</label>
                <input
                  type="text"
                  required
                  placeholder="Khuyến Mãi Đặc Biệt Mùa Thu"
                  value={newPromoTitle}
                  onChange={(e) => setNewPromoTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tỷ lệ giảm (%):</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="100"
                  value={newPromoDiscount}
                  onChange={(e) => setNewPromoDiscount(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPromoModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20"
                >
                  Phát Hành Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
