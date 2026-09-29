import React from 'react';
import { Search, Bell, Radio, UserCheck } from 'lucide-react';

interface HeaderProps {
  currentRole: string;
  setCurrentRole: (role: string) => void;
}

export const AdminHeader: React.FC<HeaderProps> = ({ currentRole, setCurrentRole }) => {
  return (
    <header className="h-16 bg-[#0d1527]/90 backdrop-blur-md border-b border-slate-800/80 px-8 flex items-center justify-between sticky top-0 z-30">
      {/* Quick Search */}
      <div className="flex items-center gap-3 w-96">
        <div className="relative w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm nhanh PNR (SW882P), số hiệu bay (VN 214), hành khách..."
            className="w-full bg-slate-900/80 border border-slate-700/60 rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Real-time indicator */}
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span className="text-xs font-bold text-emerald-400">WebSocket Live</span>
        </div>

        {/* Role Switcher for quick test/demo */}
        <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700/60 rounded-xl px-3 py-1">
          <UserCheck className="w-3.5 h-3.5 text-orange-400" />
          <span className="text-xs text-slate-400 font-semibold">Chế độ xem:</span>
          <select
            value={currentRole}
            onChange={(e) => setCurrentRole(e.target.value)}
            className="bg-transparent text-xs font-bold text-slate-200 focus:outline-none cursor-pointer"
          >
            <option value="SUPER_ADMIN" className="bg-slate-900 text-slate-200">Super Admin</option>
            <option value="CSKH" className="bg-slate-900 text-slate-200">CSKH (Khách Hàng)</option>
            <option value="ACCOUNTANT" className="bg-slate-900 text-slate-200">Kế Toán (Tài Chính)</option>
            <option value="MARKETING" className="bg-slate-900 text-slate-200">Marketing (Giá & KM)</option>
          </select>
        </div>

        {/* Notifications */}
        <button
          className="relative p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 text-slate-300 transition-colors"
          title="Thông báo"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-orange-500"></span>
        </button>

        {/* Profile Avatar */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-800">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs shadow-md">
            SW
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-bold text-slate-200">Ban Điều Hành SkyWings</div>
            <div className="text-[11px] text-slate-400">admin@skywings.vn</div>
          </div>
        </div>
      </div>
    </header>
  );
};
