import React, { useState } from 'react';
import { Search, FileText, QrCode, Edit3, RotateCcw, X, Check } from 'lucide-react';

interface BookingItem {
  id: number;
  pnrCode: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  passengerName: string;
  idCard: string;
  flightNumber: string;
  route: string;
  depTime: string;
  seatNumber: string;
  cabinClass: string;
  totalAmount: number;
  bookingStatus: 'CONFIRMED' | 'PENDING' | 'REFUND_REQUESTED' | 'REFUNDED' | 'CANCELLED';
  paymentStatus: 'PAID' | 'UNPAID' | 'REFUNDED';
  baggage: string;
}

export const BookingsPage: React.FC = () => {
  const [bookings, setBookings] = useState<BookingItem[]>([
    {
      id: 1,
      pnrCode: 'SW882P',
      contactName: 'Trần Minh Quang',
      contactEmail: 'minhquang.tran@gmail.com',
      contactPhone: '0912345678',
      passengerName: 'Trần Minh Quang',
      idCard: '079095012849',
      flightNumber: 'VN 214',
      route: 'SGN ➔ HAN',
      depTime: '14/09/2026 07:00',
      seatNumber: '10F',
      cabinClass: 'Phổ Thông',
      totalAmount: 2268000,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID',
      baggage: '20kg ký gửi',
    },
    {
      id: 2,
      pnrCode: 'VJ188K',
      contactName: 'Nguyễn Thị Hương Mai',
      contactEmail: 'huongmai.nguyen@yahoo.com',
      contactPhone: '0987654321',
      passengerName: 'Nguyễn Thị Hương Mai',
      idCard: '001198034512',
      flightNumber: 'VJ 132',
      route: 'SGN ➔ HAN',
      depTime: '14/09/2026 08:30',
      seatNumber: '14C',
      cabinClass: 'Phổ Thông',
      totalAmount: 1415200,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID',
      baggage: '15kg ký gửi',
    },
    {
      id: 3,
      pnrCode: 'VN214P',
      contactName: 'Michael H. Peter',
      contactEmail: 'peter.m@globex.com',
      contactPhone: '+84909876543',
      passengerName: 'Michael H. Peter',
      idCard: 'P09481920',
      flightNumber: 'VN 214',
      route: 'SGN ➔ HAN',
      depTime: '14/09/2026 07:00',
      seatNumber: '02B',
      cabinClass: 'Thương Gia',
      totalAmount: 4536000,
      bookingStatus: 'CONFIRMED',
      paymentStatus: 'PAID',
      baggage: '30kg ký gửi',
    },
    {
      id: 4,
      pnrCode: 'QH88T',
      contactName: 'Victoria Sterling',
      contactEmail: 'victoria.s@skywings.vn',
      contactPhone: '0933221144',
      passengerName: 'Victoria Sterling',
      idCard: 'GB9482103',
      flightNumber: 'QH 202',
      route: 'SGN ➔ HAN',
      depTime: '14/09/2026 14:00',
      seatNumber: '16D',
      cabinClass: 'Phổ Thông',
      totalAmount: 1686000,
      bookingStatus: 'REFUND_REQUESTED',
      paymentStatus: 'PAID',
      baggage: 'Tiêu chuẩn',
    },
    {
      id: 5,
      pnrCode: 'FZ808D',
      contactName: 'David Henderson',
      contactEmail: 'henderson.d@airline.com',
      contactPhone: '0977665544',
      passengerName: 'David Henderson',
      idCard: 'AUS849201',
      flightNumber: 'VN 116',
      route: 'SGN ➔ DAD',
      depTime: '14/09/2026 09:00',
      seatNumber: '19F',
      cabinClass: 'Phổ Thông',
      totalAmount: 1400000,
      bookingStatus: 'PENDING',
      paymentStatus: 'UNPAID',
      baggage: 'Tiêu chuẩn',
    },
  ]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBookingForEdit, setSelectedBookingForEdit] = useState<BookingItem | null>(null);
  const [selectedBookingForEticket, setSelectedBookingForEticket] = useState<BookingItem | null>(null);
  const [selectedBookingForRefund, setSelectedBookingForRefund] = useState<BookingItem | null>(null);

  // Edit form state
  const [editPassengerName, setEditPassengerName] = useState('');
  const [editIdCard, setEditIdCard] = useState('');
  const [editSeat, setEditSeat] = useState('');

  const filtered = bookings.filter((b) => {
    const matchesSearch =
      b.pnrCode.toLowerCase().includes(search.toLowerCase()) ||
      b.passengerName.toLowerCase().includes(search.toLowerCase()) ||
      b.contactEmail.toLowerCase().includes(search.toLowerCase()) ||
      b.flightNumber.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.bookingStatus === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleSavePassenger = () => {
    if (!selectedBookingForEdit) return;
    setBookings((prev) =>
      prev.map((b) =>
        b.id === selectedBookingForEdit.id
          ? {
              ...b,
              passengerName: editPassengerName || b.passengerName,
              idCard: editIdCard || b.idCard,
              seatNumber: editSeat || b.seatNumber,
            }
          : b
      )
    );
    setSelectedBookingForEdit(null);
  };

  const handleConfirmRefund = () => {
    if (!selectedBookingForRefund) return;
    setBookings((prev) =>
      prev.map((b) =>
        b.id === selectedBookingForRefund.id
          ? { ...b, bookingStatus: 'REFUND_REQUESTED' }
          : b
      )
    );
    setSelectedBookingForRefund(null);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Quản Lý Đơn Đặt Vé & Mã PNR</h1>
          <p className="text-xs text-slate-400 mt-1">
            Tra cứu đơn hàng, hỗ trợ đổi tên/ghế cho hành khách, xuất vé điện tử E-ticket và xử lý hoàn hủy vé.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã PNR (SW882P), tên hành khách, email..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {['ALL', 'CONFIRMED', 'PENDING', 'REFUND_REQUESTED', 'REFUNDED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold text-xs whitespace-nowrap transition-colors ${
                statusFilter === st
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-800/60 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {st === 'ALL'
                ? 'Tất Cả'
                : st === 'CONFIRMED'
                ? 'Đã Xác Nhận'
                : st === 'PENDING'
                ? 'Chờ Thanh Toán'
                : st === 'REFUND_REQUESTED'
                ? 'Yêu Cầu Hoàn'
                : 'Đã Hoàn Tiền'}
            </button>
          ))}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Mã PNR</th>
                <th className="p-4">Hành Khách & Giấy Tờ</th>
                <th className="p-4">Chuyến Bay & Tuyến</th>
                <th className="p-4">Ghế & Dịch Vụ</th>
                <th className="p-4">Tổng Tiền</th>
                <th className="p-4">Trạng Thái Đơn</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-4">
                    <span className="font-black text-orange-400 text-sm tracking-wider font-mono">
                      {b.pnrCode}
                    </span>
                    <div className="text-[11px] text-slate-400 mt-0.5">{b.contactEmail}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-white text-sm">{b.passengerName}</div>
                    <div className="text-[11px] text-slate-400">CCCD/HC: {b.idCard}</div>
                  </td>
                  <td className="p-4">
                    <div className="font-bold text-slate-200">{b.flightNumber} • {b.route}</div>
                    <div className="text-[11px] text-slate-400">{b.depTime}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5">
                      <span className="font-black text-xs text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        {b.seatNumber}
                      </span>
                      <span className="text-[11px] text-slate-400">{b.cabinClass}</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{b.baggage}</div>
                  </td>
                  <td className="p-4">
                    <span className="font-bold text-white text-sm">{b.totalAmount.toLocaleString('vi-VN')} ₫</span>
                    <div className="text-[11px]">
                      {b.paymentStatus === 'PAID' ? (
                        <span className="text-emerald-400 font-bold">● Đã thanh toán</span>
                      ) : (
                        <span className="text-amber-400 font-bold">○ Chưa thanh toán</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold text-[11px] ${
                        b.bookingStatus === 'CONFIRMED'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : b.bookingStatus === 'REFUND_REQUESTED'
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : b.bookingStatus === 'REFUNDED'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}
                    >
                      {b.bookingStatus === 'CONFIRMED'
                        ? 'Đã Xác Nhận'
                        : b.bookingStatus === 'REFUND_REQUESTED'
                        ? 'Chờ Duyệt Hoàn'
                        : b.bookingStatus === 'REFUNDED'
                        ? 'Đã Hoàn Tiền'
                        : 'Đang Giữ Chỗ'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => setSelectedBookingForEticket(b)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                        title="Xem Vé Điện Tử (E-ticket)"
                      >
                        <FileText className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedBookingForEdit(b);
                          setEditPassengerName(b.passengerName);
                          setEditIdCard(b.idCard);
                          setEditSeat(b.seatNumber);
                        }}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition-colors"
                        title="Sửa thông tin hành khách"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      {b.bookingStatus === 'CONFIRMED' && (
                        <button
                          onClick={() => setSelectedBookingForRefund(b)}
                          className="p-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 rounded-lg transition-colors"
                          title="Yêu cầu hoàn tiền vé"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Passenger Modal */}
      {selectedBookingForEdit && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 relative">
            <h3 className="text-base font-bold text-white mb-1">
              Chỉnh Sửa Thông Tin Hành Khách (PNR {selectedBookingForEdit.pnrCode})
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Mọi thay đổi sẽ được ghi vào Audit Log để đảm bảo an ninh hàng không IATA.
            </p>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Họ và tên hành khách:</label>
                <input
                  type="text"
                  value={editPassengerName}
                  onChange={(e) => setEditPassengerName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Số CCCD / Hộ chiếu:</label>
                <input
                  type="text"
                  value={editIdCard}
                  onChange={(e) => setEditIdCard(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Số ghế gán mới:</label>
                <input
                  type="text"
                  value={editSeat}
                  onChange={(e) => setEditSeat(e.target.value)}
                  placeholder="Ví dụ: 12A, 14C..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white uppercase focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setSelectedBookingForEdit(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleSavePassenger}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20"
                >
                  Lưu Thay Đổi & Ghi Log
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* E-Ticket Modal (Printable Boarding Pass with QR Code) */}
      {selectedBookingForEticket && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-xl p-6 relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <QrCode className="w-5 h-5 text-orange-500" />
                <h3 className="text-base font-black text-white">Thẻ Lên Máy Bay Điện Tử (E-Boarding Pass)</h3>
              </div>
              <button
                onClick={() => setSelectedBookingForEticket(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Boarding Pass Paper Card */}
            <div className="bg-slate-950 border-2 border-dashed border-slate-700 rounded-2xl p-6 text-slate-200">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div>
                  <span className="text-lg font-black text-white">Sky<span className="text-orange-500">Wings</span> Airlines</span>
                  <div className="text-xs text-slate-400">Electronic Ticket Passenger Receipt</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-bold uppercase">MÃ PNR</div>
                  <div className="text-xl font-black text-orange-400 font-mono tracking-widest">
                    {selectedBookingForEticket.pnrCode}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">HÀNH KHÁCH</span>
                  <div className="text-sm font-black text-white">{selectedBookingForEticket.passengerName}</div>
                  <div className="text-xs text-slate-400">CCCD: {selectedBookingForEticket.idCard}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">CHUYẾN BAY</span>
                  <div className="text-sm font-black text-white">{selectedBookingForEticket.flightNumber}</div>
                  <div className="text-xs text-slate-400">{selectedBookingForEticket.route}</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 bg-slate-900/90 p-4 rounded-xl border border-slate-800 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">KHỞI HÀNH</span>
                  <div className="text-xs font-black text-white">{selectedBookingForEticket.depTime}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">SỐ GHẾ</span>
                  <div className="text-sm font-black text-orange-400">{selectedBookingForEticket.seatNumber}</div>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase">HẠNG VÉ</span>
                  <div className="text-xs font-bold text-white">{selectedBookingForEticket.cabinClass}</div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <div className="text-xs text-slate-400">
                  Tổng tiền đã thu: <strong className="text-white">{selectedBookingForEticket.totalAmount.toLocaleString('vi-VN')} ₫</strong>
                </div>
                <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" />
                  <span>Xác thực IATA hợp lệ</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 mt-4">
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-md shadow-orange-500/20"
              >
                In Thẻ / Xuất PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Request Calculator Modal */}
      {selectedBookingForRefund && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 relative">
            <h3 className="text-base font-bold text-white mb-2">
              Xác Nhận Yêu Cầu Hoàn Vé (PNR {selectedBookingForRefund.pnrCode})
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Hệ thống tự động áp dụng chính sách biểu giá hoàn vé hàng không tiêu chuẩn.
            </p>

            <div className="bg-slate-800/70 p-4 rounded-xl border border-slate-700 space-y-2 text-xs mb-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Tổng giá trị ban đầu:</span>
                <span className="font-bold text-white">{selectedBookingForRefund.totalAmount.toLocaleString('vi-VN')} ₫</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Khấu trừ phí hủy theo quy chế:</span>
                <span className="font-bold text-rose-400">- 350.000 ₫</span>
              </div>
              <div className="border-t border-slate-700 pt-2 flex justify-between font-black text-sm">
                <span className="text-orange-400">Số tiền hoàn trả khách:</span>
                <span className="text-emerald-400">
                  {(selectedBookingForRefund.totalAmount - 350000).toLocaleString('vi-VN')} ₫
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedBookingForRefund(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
              >
                Đóng
              </button>
              <button
                type="button"
                onClick={handleConfirmRefund}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-600/20"
              >
                Gửi Lệnh Hoàn Vé Sang Kế Toán
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
