import React, { useState } from 'react';
import { CreditCard, FileCheck, CheckCircle2, RotateCcw, X, ShieldCheck } from 'lucide-react';

export const PaymentsPage: React.FC = () => {
  const [transactions] = useState([
    { id: 1, txCode: 'VNP_20260914_882910', method: 'VNPAY', pnr: 'SW882P', amount: 2268000, time: '14/09/2026 06:20', status: 'SUCCESS' },
    { id: 2, txCode: 'MOMO_94820194821', method: 'MOMO', pnr: 'VJ188K', amount: 1415200, time: '14/09/2026 07:45', status: 'SUCCESS' },
    { id: 3, txCode: 'VISA_AUTH_948192', method: 'THẺ QUỐC TẾ', pnr: 'VN214P', amount: 4536000, time: '14/09/2026 08:12', status: 'SUCCESS' },
    { id: 4, txCode: 'VNP_20260914_748291', method: 'VNPAY', pnr: 'QH88T', amount: 1686000, time: '14/09/2026 08:28', status: 'SUCCESS' },
  ]);

  const [refunds, setRefunds] = useState([
    {
      id: 1,
      pnr: 'QH88T',
      customerName: 'Victoria Sterling',
      amount: 1686000,
      fee: 350000,
      refundPayout: 1336000,
      reason: 'Khách đổi lịch công tác đột xuất cần hủy vé.',
      status: 'PENDING_APPROVAL',
      requestedAt: '14/09/2026 08:35',
    },
  ]);

  const [selectedInvoice, setSelectedInvoice] = useState<{ pnr: string; amount: number; name: string } | null>(null);

  const handleApproveRefund = (id: number) => {
    setRefunds((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: 'APPROVED' } : r))
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-white tracking-tight">Thanh Toán, Đối Soát & Hóa Đơn Điện Tử (VAT)</h1>
        <p className="text-xs text-slate-400 mt-1">
          Giám sát dòng tiền qua các cổng thanh toán (VNPay, Momo, Visa), xét duyệt lệnh hoàn tiền và xuất hóa đơn điện tử hợp lệ.
        </p>
      </div>

      {/* Refunds Queue Card */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-orange-500" />
              <span>Hàng Đợi Xét Duyệt Hoàn Vé (Refund Queue)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Yêu cầu hoàn tiền từ CSKH gửi sang bộ phận Kế toán tài chính duyệt giải ngân.</p>
          </div>
          <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            {refunds.filter((r) => r.status === 'PENDING_APPROVAL').length} yêu cầu chờ duyệt
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Mã PNR & Khách</th>
                <th className="p-3">Thời Gian Yêu Cầu</th>
                <th className="p-3">Lý Do Hủy</th>
                <th className="p-3">Giá Trị Gốc</th>
                <th className="p-3">Khấu Trừ Phí</th>
                <th className="p-3">Thực Hoàn</th>
                <th className="p-3">Trạng Thái</th>
                <th className="p-3 text-right">Phê Duyệt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {refunds.map((r) => (
                <tr key={r.id} className="hover:bg-slate-800/40">
                  <td className="p-3">
                    <span className="font-mono font-black text-orange-400 text-sm">{r.pnr}</span>
                    <div className="text-[11px] text-slate-300 font-bold">{r.customerName}</div>
                  </td>
                  <td className="p-3 text-slate-400">{r.requestedAt}</td>
                  <td className="p-3 text-slate-300 max-w-xs">{r.reason}</td>
                  <td className="p-3 text-slate-300 font-semibold">{r.amount.toLocaleString('vi-VN')} ₫</td>
                  <td className="p-3 text-rose-400 font-semibold">- {r.fee.toLocaleString('vi-VN')} ₫</td>
                  <td className="p-3 text-emerald-400 font-black text-sm">{r.refundPayout.toLocaleString('vi-VN')} ₫</td>
                  <td className="p-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        r.status === 'APPROVED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      }`}
                    >
                      {r.status === 'APPROVED' ? '✓ Đã Phê Duyệt' : '○ Chờ Duyệt'}
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    {r.status === 'PENDING_APPROVAL' ? (
                      <button
                        onClick={() => handleApproveRefund(r.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors text-[11px]"
                      >
                        Duyệt & Hoàn Tiền
                      </button>
                    ) : (
                      <span className="text-slate-500 text-[11px]">Hoàn tất giải ngân</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-orange-500" />
              <span>Nhật Ký Giao Dịch Cổng Thanh Toán Trực Tuyến</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Đối soát giao dịch tự động qua VNPay, MoMo, Visa/Mastercard.</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-3">Mã Giao Dịch</th>
                <th className="p-3">Cổng Thanh Toán</th>
                <th className="p-3">Mã Đơn PNR</th>
                <th className="p-3">Số Tiền</th>
                <th className="p-3">Thời Gian</th>
                <th className="p-3">Trạng Thái</th>
                <th className="p-3 text-right">Hóa Đơn VAT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {transactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-slate-300">{t.txCode}</td>
                  <td className="p-3">
                    <span className="font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 text-[11px]">
                      {t.method}
                    </span>
                  </td>
                  <td className="p-3 font-mono font-black text-white">{t.pnr}</td>
                  <td className="p-3 font-black text-emerald-400">{t.amount.toLocaleString('vi-VN')} ₫</td>
                  <td className="p-3 text-slate-400">{t.time}</td>
                  <td className="p-3">
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-bold text-[11px]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Thành công</span>
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => setSelectedInvoice({ pnr: t.pnr, amount: t.amount, name: 'Hành Khách SkyWings' })}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-[11px] font-bold transition-colors inline-flex items-center gap-1"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-orange-400" />
                      <span>Xuất VAT</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* VAT Electronic Invoice Modal */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-black text-white">Hóa Đơn Điện Tử Giá Trị Gia Tăng (VAT)</h3>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl text-xs space-y-3">
              <div className="text-center pb-3 border-b border-slate-800">
                <div className="font-black text-white text-sm">CÔNG TY CỔ PHẦN HÀNG KHÔNG SKYWINGS</div>
                <div className="text-slate-400">Mã số thuế: 0316889988 • Ký hiệu: 1C26T-0004921</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>Đơn hàng PNR: <strong className="text-orange-400">{selectedInvoice.pnr}</strong></div>
                <div>Ngày phát hành: <strong>14/09/2026</strong></div>
                <div className="col-span-2">Dịch vụ: <strong>Vé máy bay vận chuyển hành khách nội địa</strong></div>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Tiền cước chưa thuế:</span>
                  <span>{Math.round(selectedInvoice.amount / 1.08).toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Thuế suất GTGT (8%):</span>
                  <span>{(selectedInvoice.amount - Math.round(selectedInvoice.amount / 1.08)).toLocaleString('vi-VN')} ₫</span>
                </div>
                <div className="flex justify-between font-black text-sm text-white pt-2 border-t border-slate-800">
                  <span>Tổng tiền thanh toán:</span>
                  <span className="text-orange-400">{selectedInvoice.amount.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-emerald-400 font-bold">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ký số bởi Tổng Cục Thuế (Valid Token)</span>
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => setSelectedInvoice(null)}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold"
              >
                In Hóa Đơn PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
