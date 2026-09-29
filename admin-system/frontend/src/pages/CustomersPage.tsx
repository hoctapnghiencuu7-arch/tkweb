import React, { useState } from 'react';
import { Search, ShieldAlert, CheckCircle, Award } from 'lucide-react';

interface CustomerItem {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  loyaltyTier: 'DIAMOND' | 'GOLD' | 'SILVER';
  points: number;
  spend: number;
  flightsFlown: number;
  isBlacklisted: boolean;
  blacklistReason?: string;
  dietary?: string;
}

export const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<CustomerItem[]>([
    {
      id: 1,
      fullName: 'Trần Minh Quang',
      email: 'minhquang.tran@gmail.com',
      phone: '0912345678',
      loyaltyTier: 'DIAMOND',
      points: 24500,
      spend: 142000000,
      flightsFlown: 38,
      isBlacklisted: false,
      dietary: 'Ăn chay (Vegetarian)',
    },
    {
      id: 2,
      fullName: 'Nguyễn Thị Hương Mai',
      email: 'huongmai.nguyen@yahoo.com',
      phone: '0987654321',
      loyaltyTier: 'GOLD',
      points: 8900,
      spend: 48500000,
      flightsFlown: 14,
      isBlacklisted: false,
      dietary: 'Tiêu chuẩn',
    },
    {
      id: 3,
      fullName: 'Phạm Đức Anh',
      email: 'ducanh.pham@outlook.com',
      phone: '0933445566',
      loyaltyTier: 'SILVER',
      points: 1200,
      spend: 12800000,
      flightsFlown: 4,
      isBlacklisted: true,
      blacklistReason: 'Hành vi gây rối trật tự tại phòng chờ thương gia ngày 15/08/2026.',
      dietary: 'Tiêu chuẩn',
    },
  ]);

  const [search, setSearch] = useState('');

  const toggleBlacklist = (id: number) => {
    setCustomers((prev) =>
      prev.map((c) => {
        if (c.id === id) {
          const nextState = !c.isBlacklisted;
          return {
            ...c,
            isBlacklisted: nextState,
            blacklistReason: nextState ? 'Vi phạm quy chế hàng không theo quyết định an ninh.' : undefined,
          };
        }
        return c;
      })
    );
  };

  const filtered = customers.filter(
    (c) =>
      c.fullName.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Quản Lý Khách Hàng 360 & Hội Viên SkyWings</h1>
        <p className="text-xs text-slate-400 mt-1">
          Hồ sơ khách hàng, hạn mức tích lũy dặm bay, lịch sử chi tiêu và danh sách hạn chế an ninh hàng không (Blacklist).
        </p>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-2xl flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo họ tên, email, số điện thoại..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Khách Hàng & Liên Hệ</th>
                <th className="p-4">Hạng Hội Viên</th>
                <th className="p-4">Dặm Thưởng Tích Lũy</th>
                <th className="p-4">Tổng Chi Tiêu</th>
                <th className="p-4">Số Chuyến Bay</th>
                <th className="p-4">Yêu Cầu Đặc Biệt</th>
                <th className="p-4">An Ninh / Blacklist</th>
                <th className="p-4 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-slate-800/40">
                  <td className="p-4">
                    <div className="font-bold text-white text-sm">{c.fullName}</div>
                    <div className="text-[11px] text-slate-400">{c.email} • {c.phone}</div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        c.loyaltyTier === 'DIAMOND'
                          ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          : c.loyaltyTier === 'GOLD'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-slate-700/50 text-slate-300 border border-slate-600'
                      }`}
                    >
                      <Award className="w-3.5 h-3.5" />
                      <span>{c.loyaltyTier}</span>
                    </span>
                  </td>
                  <td className="p-4">
                    <span className="font-black text-orange-400 text-sm">
                      {c.points.toLocaleString('vi-VN')} dặm
                    </span>
                  </td>
                  <td className="p-4 font-bold text-slate-200">
                    {c.spend.toLocaleString('vi-VN')} ₫
                  </td>
                  <td className="p-4 font-black text-white">{c.flightsFlown} chuyến</td>
                  <td className="p-4 text-slate-400 text-[11px]">{c.dietary}</td>
                  <td className="p-4">
                    {c.isBlacklisted ? (
                      <div>
                        <span className="inline-flex items-center gap-1 text-rose-400 font-bold bg-rose-500/20 px-2 py-0.5 rounded border border-rose-500/30 text-[11px]">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          <span>HẠN CHẾ BAY</span>
                        </span>
                        {c.blacklistReason && (
                          <div className="text-[10px] text-rose-300/80 mt-1 max-w-xs">{c.blacklistReason}</div>
                        )}
                      </div>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Bình thường</span>
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => toggleBlacklist(c.id)}
                      className={`px-3 py-1.5 rounded-lg text-[11px] font-bold transition-colors ${
                        c.isBlacklisted
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-400 hover:bg-rose-500/30 border border-rose-500/30'
                      }`}
                    >
                      {c.isBlacklisted ? 'Gỡ Hạn Chế' : 'Đưa Vào Blacklist'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
