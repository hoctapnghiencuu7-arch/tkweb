import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Plane, Ticket, DollarSign, TrendingUp, ArrowUpRight, CheckCircle2 } from 'lucide-react';

interface DashboardProps {
  onNavigate: (tab: string) => void;
}

export const DashboardPage: React.FC<DashboardProps> = ({ onNavigate }) => {
  const revenueData = [
    { day: 'T2 (08/09)', revenue: 142 },
    { day: 'T3 (09/09)', revenue: 185 },
    { day: 'T4 (10/09)', revenue: 168 },
    { day: 'T5 (11/09)', revenue: 210 },
    { day: 'T6 (12/09)', revenue: 295 },
    { day: 'T7 (13/09)', revenue: 340 },
    { day: 'CN (14/09)', revenue: 280 },
  ];

  const cabinData = [
    { name: 'Phổ Thông (Economy)', value: 78, color: '#3b82f6' },
    { name: 'Thương Gia (Business)', value: 18, color: '#ff5f38' },
    { name: 'Hạng Nhất (First)', value: 4, color: '#10b981' },
  ];

  const funnelData = [
    { step: '1. Tìm Kiếm Chuyến', users: 14200, pct: '100%', drop: '0%' },
    { step: '2. Xem Danh Sách Chuyến', users: 11500, pct: '81.0%', drop: '-19.0%' },
    { step: '3. Chọn Chuyến & Hạng Vé', users: 7800, pct: '54.9%', drop: '-26.1%' },
    { step: '4. Chọn Chỗ Ngồi (Seatmap)', users: 5900, pct: '41.5%', drop: '-13.4%' },
    { step: '5. Nhập Thông Tin Khách', users: 4600, pct: '32.4%', drop: '-9.1%' },
    { step: '6. Cổng Thanh Toán', users: 3800, pct: '26.8%', drop: '-5.6%' },
    { step: '7. Hoàn Tất Đơn Hàng (PNR)', users: 3420, pct: '24.1%', drop: '-2.7%' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Trung Tâm Vận Hành & Điều Phối Bay</h1>
          <p className="text-xs text-slate-400 mt-1">
            Giám sát thời gian thực số liệu chuyến bay, doanh thu và tỷ lệ chuyển đổi khách hàng chốt đơn.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('flights')}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-1.5"
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Điều Phối Chuyến Bay Mới</span>
          </button>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Chuyến Bay Hoạt Động</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Plane className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-3">128</div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>100% Khởi hành đúng giờ</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Vé Đã Đặt Hôm Nay</span>
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 text-orange-400 flex items-center justify-center">
              <Ticket className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-3">342</div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>92.4% Tỷ lệ lấp đầy ghế</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Doanh Thu Hôm Nay</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-orange-400 mt-3">280.000.000 ₫</div>
          <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% so với hôm qua</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Đánh Giá Hành Khách</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white mt-3">4.9 / 5.0</div>
          <div className="flex items-center gap-1 text-xs font-bold text-slate-400 mt-2">
            <span>Dựa trên 1.420 đánh giá 5★</span>
          </div>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue 7 days */}
        <div className="lg:col-span-2 bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-bold text-white">Xu Hướng Doanh Thu 7 Ngày Gần Nhất</h2>
              <p className="text-xs text-slate-400">Đơn vị: Triệu VNĐ (Triệu ₫)</p>
            </div>
            <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              Tuần Này (VND)
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff5f38" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#ff5f38" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(value: number) => [`${value} Triệu VNĐ`, 'Doanh Thu']}
                />
                <Area type="monotone" dataKey="revenue" stroke="#ff5f38" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cabin Distribution */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-bold text-white">Tỷ Lệ Hạng Vé</h2>
              <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2.5 py-0.5 rounded-full">
                92% lấp đầy
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-2">Phân bổ tỷ trọng các hạng ghế bán ra</p>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={cabinData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {cabinData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                  formatter={(val: number) => [`${val}%`, 'Tỷ trọng']}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Conversion Funnel Bar (Trọng tâm tối ưu chốt đơn) */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Phân Tích Phễu Chuyển Đổi Chốt Đơn (Conversion Funnel Drop-off)</span>
              <span className="text-[11px] bg-emerald-500/20 text-emerald-400 font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                CR: 24.1%
              </span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Theo dõi chính xác hành vi khách hàng bỏ ngang ở từng bước để tối ưu giao diện đặt vé & thanh toán.
            </p>
          </div>
          <button
            onClick={() => onNavigate('pricing')}
            className="text-xs text-orange-400 hover:text-orange-300 font-bold self-start sm:self-auto"
          >
            Cấu hình thời gian giữ chỗ & Khuyến mãi ➔
          </button>
        </div>

        <div className="space-y-3">
          {funnelData.map((f, idx) => {
            const widthPct = parseFloat(f.pct);
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-300">{f.step}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400">{f.users.toLocaleString('vi-VN')} lượt</span>
                    <span className="font-bold text-white w-14 text-right">{f.pct}</span>
                    <span className={`text-[11px] font-bold w-14 text-right ${f.drop === '0%' ? 'text-slate-500' : 'text-rose-400'}`}>
                      {f.drop}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
