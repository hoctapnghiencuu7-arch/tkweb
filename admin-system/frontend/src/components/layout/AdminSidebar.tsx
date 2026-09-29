import React from 'react';
import {
  LayoutDashboard,
  Plane,
  Ticket,
  Percent,
  Users,
  CreditCard,
  ShieldCheck,
  FileText,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentRole: string;
}

export const AdminSidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, currentRole }) => {
  const navItems = [
    { id: 'dashboard', label: 'Tổng Quan', icon: LayoutDashboard, badge: null },
    { id: 'flights', label: 'Lịch Trình Bay', icon: Plane, badge: '8 chuyến' },
    { id: 'bookings', label: 'Đơn Đặt Vé PNR', icon: Ticket, badge: '5 mới' },
    { id: 'pricing', label: 'Giá & Khuyến Mãi', icon: Percent, badge: 'Flash Sale' },
    { id: 'customers', label: 'Khách Hàng 360', icon: Users, badge: null },
    { id: 'payments', label: 'Thanh Toán & VAT', icon: CreditCard, badge: '1 hoàn vé' },
    { id: 'staff', label: 'Phân Quyền & Audit', icon: ShieldCheck, badge: null },
    { id: 'cms', label: 'Nội Dung CMS', icon: FileText, badge: null },
  ];

  return (
    <aside className="w-64 bg-[#0d1527] border-r border-slate-800/80 flex flex-col justify-between shrink-0 h-screen sticky top-0">
      <div>
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
            <Plane className="w-6 h-6 rotate-45" />
          </div>
          <div>
            <div className="font-black text-lg tracking-tight text-white flex items-center gap-1.5">
              Sky<span className="text-orange-500">Wings</span>
              <span className="text-[10px] bg-orange-500/20 text-orange-400 font-bold px-1.5 py-0.5 rounded border border-orange-500/30">PRO</span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Bảng Điều Hành Hàng Không</p>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-md shadow-orange-500/25'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-black/25 text-white'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Role indicator */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-slate-800/50 rounded-xl p-3 border border-slate-700/60 mb-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Vai Trò Hiện Tại:</span>
            <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
              {currentRole}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs text-slate-300 font-medium">IATA Certified • VN Node #1</span>
          </div>
        </div>

        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 px-3 text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800/60 rounded-lg border border-slate-700/40 transition-colors"
        >
          <span>Xem Trang Khách Hàng</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </aside>
  );
};
