import React, { useState } from 'react';
import { ShieldCheck, History, Check, X as XIcon, User } from 'lucide-react';

export const StaffPage: React.FC = () => {
  const [users] = useState([
    { id: 1, name: 'Quản Trị Viên Trưởng', email: 'admin@skywings.vn', role: 'SUPER_ADMIN', status: 'ACTIVE', lastLogin: '14/09/2026 08:15' },
    { id: 2, name: 'Nguyễn Thùy Linh', email: 'cskh@skywings.vn', role: 'CSKH', status: 'ACTIVE', lastLogin: '14/09/2026 07:30' },
    { id: 3, name: 'Trần Đình Trọng', email: 'ketoan@skywings.vn', role: 'ACCOUNTANT', status: 'ACTIVE', lastLogin: '14/09/2026 08:00' },
    { id: 4, name: 'Lê Hoàng Yến', email: 'marketing@skywings.vn', role: 'MARKETING', status: 'ACTIVE', lastLogin: '14/09/2026 08:05' },
  ]);

  const [auditLogs] = useState([
    { id: 1, user: 'Quản Trị Viên Trưởng', action: 'UPDATE_STATUS', entity: 'flights', target: 'VN 214', desc: 'Chuyển trạng thái chuyến bay sang Boarding (Cửa 12)', time: '14/09/2026 06:30' },
    { id: 2, user: 'Nguyễn Thùy Linh (CSKH)', action: 'SEAT_ASSIGN', entity: 'bookings', target: 'SW882P', desc: 'Gán chỗ ngồi 10F cho hành khách Trần Minh Quang', time: '14/09/2026 06:40' },
    { id: 3, user: 'Lê Hoàng Yến (MKT)', action: 'CREATE_PROMO', entity: 'promo_codes', target: 'BAYHE2026', desc: 'Kích hoạt chiến dịch giảm giá 15% mùa hè', time: '14/09/2026 07:10' },
    { id: 4, user: 'Trần Đình Trọng (Kế Toán)', action: 'REFUND_APPROVE', entity: 'refunds', target: 'QH88T', desc: 'Duyệt hoàn tiền 1.336.000 ₫ cho PNR QH88T', time: '14/09/2026 08:38' },
  ]);

  const permissionsMatrix = [
    { module: 'Lịch Trình Bay & Ghế', superAdmin: true, cskh: true, accountant: false, marketing: false },
    { module: 'Đơn Hàng PNR & Sửa Khách', superAdmin: true, cskh: true, accountant: true, marketing: false },
    { module: 'Định Giá Động & Khuyến Mãi', superAdmin: true, cskh: false, accountant: false, marketing: true },
    { module: 'Khách Hàng & Blacklist', superAdmin: true, cskh: true, accountant: false, marketing: false },
    { module: 'Duyệt Hoàn Tiền & Xuất VAT', superAdmin: true, cskh: false, accountant: true, marketing: false },
    { module: 'Báo Cáo Doanh Thu & BI', superAdmin: true, cskh: false, accountant: true, marketing: true },
    { module: 'Cấu Hình Hệ Thống & CMS', superAdmin: true, cskh: false, accountant: false, marketing: true },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Nhân Sự, Phân Quyền (RBAC) & Nhật Ký Hoạt Động (Audit Trail)</h1>
        <p className="text-xs text-slate-400 mt-1">
          Quản lý tài khoản quản trị nội bộ, ma trận phân quyền chi tiết theo vị trí và nhật ký kiểm toán bất biến.
        </p>
      </div>

      {/* Staff & Roles Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Staff Table */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-orange-500" />
            <span>Danh Sách Tài Khoản Quản Trị</span>
          </h2>

          <div className="space-y-3">
            {users.map((u) => (
              <div
                key={u.id}
                className="flex items-center justify-between p-3.5 bg-slate-800/40 border border-slate-700/60 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-700 font-bold text-xs flex items-center justify-center text-white">
                    {u.name.slice(0, 2)}
                  </div>
                  <div>
                    <div className="font-bold text-white text-xs">{u.name}</div>
                    <div className="text-[11px] text-slate-400">{u.email}</div>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                    {u.role}
                  </span>
                  <div className="text-[10px] text-slate-500 mt-0.5">Online: {u.lastLogin}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RBAC Matrix */}
        <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
          <h2 className="text-base font-bold text-white flex items-center gap-2 mb-4">
            <ShieldCheck className="w-4 h-4 text-orange-500" />
            <span>Ma Trận Phân Quyền (RBAC Matrix)</span>
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/60 text-slate-400 font-bold border-b border-slate-800 text-[11px]">
                <tr>
                  <th className="p-2.5">Phân Hệ</th>
                  <th className="p-2.5 text-center">Admin</th>
                  <th className="p-2.5 text-center">CSKH</th>
                  <th className="p-2.5 text-center">Kế Toán</th>
                  <th className="p-2.5 text-center">Marketing</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {permissionsMatrix.map((pm, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="p-2.5 font-bold text-slate-300">{pm.module}</td>
                    <td className="p-2.5 text-center">{pm.superAdmin ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XIcon className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                    <td className="p-2.5 text-center">{pm.cskh ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XIcon className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                    <td className="p-2.5 text-center">{pm.accountant ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XIcon className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                    <td className="p-2.5 text-center">{pm.marketing ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <XIcon className="w-4 h-4 text-slate-600 mx-auto" />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <History className="w-4 h-4 text-orange-500" />
              <span>Nhật Ký Thao Tác Hệ Thống (Audit Trail Logs)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Ghi lại vết mọi thay đổi dữ liệu: người thực hiện, thời gian và giá trị thay đổi.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Nhân Sự Thực Hiện</th>
                <th className="p-3">Hành Động</th>
                <th className="p-3">Đối Tượng (Target)</th>
                <th className="p-3">Mô Tả Thay Đổi</th>
                <th className="p-3 text-right">Thời Gian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {auditLogs.map((al) => (
                <tr key={al.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-bold text-white">{al.user}</td>
                  <td className="p-3">
                    <span className="font-mono font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 text-[11px]">
                      {al.action}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-bold text-slate-300">{al.target}</td>
                  <td className="p-3 text-slate-300 max-w-md">{al.desc}</td>
                  <td className="p-3 text-right text-slate-400">{al.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
