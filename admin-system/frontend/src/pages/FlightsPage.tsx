import React, { useState } from 'react';
import { Plane, Search, Plus, Eye, Radio, X } from 'lucide-react';

interface FlightsPageProps {
  currentRole: string;
}

interface FlightItem {
  id: number;
  flightNumber: string;
  airlineName: string;
  airlineLogo: string;
  route: string;
  depTime: string;
  arrTime: string;
  duration: string;
  ecoPrice: number;
  busPrice: number;
  capacity: number;
  booked: number;
  status: 'SCHEDULED' | 'BOARDING' | 'DEPARTED' | 'DELAYED' | 'CANCELLED';
  gate: string;
}

export const FlightsPage: React.FC<FlightsPageProps> = () => {
  const [flights, setFlights] = useState<FlightItem[]>([
    {
      id: 1,
      flightNumber: 'VN 214',
      airlineName: 'Vietnam Airlines',
      airlineLogo: 'assets/images/airlines/vietnam-airlines.png',
      route: 'SGN ➔ HAN',
      depTime: '07:00',
      arrTime: '09:15',
      duration: '2h 15m',
      ecoPrice: 1850000,
      busPrice: 4200000,
      capacity: 180,
      booked: 165,
      status: 'BOARDING',
      gate: '12',
    },
    {
      id: 2,
      flightNumber: 'VJ 132',
      airlineName: 'Vietjet Air',
      airlineLogo: 'assets/images/airlines/vietjet-air.png',
      route: 'SGN ➔ HAN',
      depTime: '08:30',
      arrTime: '10:45',
      duration: '2h 15m',
      ecoPrice: 1190000,
      busPrice: 2800000,
      capacity: 180,
      booked: 148,
      status: 'SCHEDULED',
      gate: '05',
    },
    {
      id: 3,
      flightNumber: 'QH 202',
      airlineName: 'Bamboo Airways',
      airlineLogo: 'assets/images/airlines/bamboo-airways.png',
      route: 'SGN ➔ HAN',
      depTime: '14:00',
      arrTime: '16:15',
      duration: '2h 15m',
      ecoPrice: 1450000,
      busPrice: 3500000,
      capacity: 180,
      booked: 120,
      status: 'SCHEDULED',
      gate: '08',
    },
    {
      id: 4,
      flightNumber: 'VN 116',
      airlineName: 'Vietnam Airlines',
      airlineLogo: 'assets/images/airlines/vietnam-airlines.png',
      route: 'SGN ➔ DAD',
      depTime: '09:00',
      arrTime: '10:20',
      duration: '1h 20m',
      ecoPrice: 1250000,
      busPrice: 2950000,
      capacity: 180,
      booked: 172,
      status: 'DEPARTED',
      gate: '14',
    },
    {
      id: 5,
      flightNumber: 'VJ 628',
      airlineName: 'Vietjet Air',
      airlineLogo: 'assets/images/airlines/vietjet-air.png',
      route: 'SGN ➔ DAD',
      depTime: '11:15',
      arrTime: '12:35',
      duration: '1h 20m',
      ecoPrice: 890000,
      busPrice: 2100000,
      capacity: 180,
      booked: 130,
      status: 'SCHEDULED',
      gate: '03',
    },
    {
      id: 6,
      flightNumber: 'VN 182',
      airlineName: 'Vietnam Airlines',
      airlineLogo: 'assets/images/airlines/vietnam-airlines.png',
      route: 'SGN ➔ PQC',
      depTime: '15:30',
      arrTime: '16:35',
      duration: '1h 05m',
      ecoPrice: 1350000,
      busPrice: 3100000,
      capacity: 180,
      booked: 110,
      status: 'SCHEDULED',
      gate: '16',
    },
  ]);

  const [search, setSearch] = useState('');
  const [selectedFlightForSeatmap, setSelectedFlightForSeatmap] = useState<FlightItem | null>(null);
  const [selectedFlightForStatus, setSelectedFlightForStatus] = useState<FlightItem | null>(null);
  const [newStatus, setNewStatus] = useState<FlightItem['status']>('SCHEDULED');
  const [newGate, setNewGate] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Flight Form State
  const [createForm, setCreateForm] = useState({
    flightNumber: '',
    airlineName: 'Vietnam Airlines',
    route: 'SGN ➔ HAN',
    depTime: '09:00',
    arrTime: '11:15',
    ecoPrice: 1500000,
    busPrice: 3500000,
    gate: '01',
  });

  const filtered = flights.filter(
    (f) =>
      f.flightNumber.toLowerCase().includes(search.toLowerCase()) ||
      f.airlineName.toLowerCase().includes(search.toLowerCase()) ||
      f.route.toLowerCase().includes(search.toLowerCase())
  );

  const handleUpdateStatus = () => {
    if (!selectedFlightForStatus) return;
    setFlights((prev) =>
      prev.map((f) =>
        f.id === selectedFlightForStatus.id
          ? { ...f, status: newStatus, gate: newGate || f.gate }
          : f
      )
    );
    setSelectedFlightForStatus(null);
  };

  const handleCreateFlight = (e: React.FormEvent) => {
    e.preventDefault();
    const newFlight: FlightItem = {
      id: flights.length + 1,
      flightNumber: createForm.flightNumber.toUpperCase(),
      airlineName: createForm.airlineName,
      airlineLogo: 'assets/images/airlines/vietnam-airlines.png',
      route: createForm.route,
      depTime: createForm.depTime,
      arrTime: createForm.arrTime,
      duration: '2h 15m',
      ecoPrice: Number(createForm.ecoPrice),
      busPrice: Number(createForm.busPrice),
      capacity: 180,
      booked: 0,
      status: 'SCHEDULED',
      gate: createForm.gate,
    };
    setFlights([newFlight, ...flights]);
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">Quản Lý Chuyến Bay & Sơ Đồ Ghế</h1>
          <p className="text-xs text-slate-400 mt-1">
            Điều phối lịch trình bay, cấu hình hạng vé, cập nhật trạng thái cất cánh và quản lý sơ đồ khoang hành khách.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20 transition-all flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Chuyến Bay Mới</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-4 rounded-2xl">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo số hiệu (VN 214), hãng bay, chặng bay..."
            className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500"
          />
        </div>
        <div className="text-xs text-slate-400 font-semibold">
          Hiển thị <span className="text-white font-bold">{filtered.length}</span> chuyến bay
        </div>
      </div>

      {/* Flights Table */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Số Hiệu & Hãng</th>
                <th className="p-4">Hành Trình</th>
                <th className="p-4">Giờ Cất / Hạ Cánh</th>
                <th className="p-4">Giá Vé (Eco / Bus)</th>
                <th className="p-4">Lấp Đầy Ghế</th>
                <th className="p-4">Cửa Bay</th>
                <th className="p-4">Trạng Thái</th>
                <th className="p-4 text-right">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((f) => {
                const loadPct = Math.round((f.booked / f.capacity) * 100);
                return (
                  <tr key={f.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-black text-orange-400 text-xs">
                          {f.flightNumber.slice(0, 2)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{f.flightNumber}</div>
                          <div className="text-[11px] text-slate-400">{f.airlineName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-bold text-slate-200 text-sm">{f.route}</span>
                      <div className="text-[11px] text-slate-400">{f.duration}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-white">{f.depTime} ➔ {f.arrTime}</div>
                      <div className="text-[11px] text-emerald-400">Đúng giờ</div>
                    </td>
                    <td className="p-4">
                      <div className="font-bold text-slate-200">{f.ecoPrice.toLocaleString('vi-VN')} ₫</div>
                      <div className="text-[11px] text-orange-400 font-semibold">{f.busPrice.toLocaleString('vi-VN')} ₫ (Bus)</div>
                    </td>
                    <td className="p-4">
                      <div className="w-28 space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-slate-300">{f.booked}/{f.capacity}</span>
                          <span className="font-bold text-orange-400">{loadPct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-blue-500 to-orange-500 rounded-full" style={{ width: `${loadPct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="font-black text-white bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                        {f.gate}
                      </span>
                    </td>
                    <td className="p-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          f.status === 'BOARDING'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                            : f.status === 'DEPARTED'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {f.status === 'BOARDING' ? '● Đang Lên Máy Bay' : f.status === 'DEPARTED' ? '✈ Đang Bay' : '✓ Đúng Lịch'}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedFlightForSeatmap(f)}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1"
                          title="Xem sơ đồ ghế"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Sơ Đồ Ghế</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFlightForStatus(f);
                            setNewStatus(f.status);
                            setNewGate(f.gate);
                          }}
                          className="px-2.5 py-1.5 bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 border border-orange-500/30 rounded-lg font-bold text-[11px] transition-colors flex items-center gap-1"
                          title="Đổi trạng thái"
                        >
                          <Radio className="w-3.5 h-3.5" />
                          <span>Trạng Thái</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seat Map Visualizer Modal */}
      {selectedFlightForSeatmap && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-4xl p-6 relative max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>Sơ Đồ Khoang Ghế — Chuyến Bay {selectedFlightForSeatmap.flightNumber}</span>
                  <span className="text-xs bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded font-bold border border-orange-500/30">
                    Boeing 787-9
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Hành trình: {selectedFlightForSeatmap.route} • Cất cánh {selectedFlightForSeatmap.depTime} • Cửa {selectedFlightForSeatmap.gate}
                </p>
              </div>
              <button
                onClick={() => setSelectedFlightForSeatmap(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Seat Map Legend */}
            <div className="flex items-center justify-center gap-6 py-4 border-b border-slate-800 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-emerald-600"></span>
                <span className="text-slate-300">Còn trống</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-orange-500"></span>
                <span className="text-slate-300">Thương gia (Business)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-rose-600"></span>
                <span className="text-slate-300">Đã đặt</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded bg-amber-500"></span>
                <span className="text-slate-300">Đang giữ tạm</span>
              </div>
            </div>

            {/* Airplane Body Container */}
            <div className="flex-1 overflow-y-auto py-6 px-8 flex justify-center">
              <div className="bg-slate-950/80 border-2 border-slate-800 rounded-3xl p-6 w-96 shadow-2xl">
                {/* Cockpit Nose */}
                <div className="text-center text-xs font-bold text-slate-500 pb-4 border-b border-slate-800 mb-4">
                  ▲ MŨI TÀU BAY & BUỒNG LÁI (COCKPIT)
                </div>

                {/* Rows Generator */}
                <div className="space-y-2">
                  {Array.from({ length: 18 }, (_, r) => {
                    const rowNum = r + 1;
                    const rowStr = rowNum < 10 ? `0${rowNum}` : `${rowNum}`;
                    const isBusiness = rowNum <= 3;
                    const cols = ['A', 'B', 'C', '', 'D', 'E', 'F'];

                    return (
                      <div key={rowNum} className="flex items-center justify-between gap-1">
                        <span className="w-5 text-[10px] font-bold text-slate-500 text-right">{rowStr}</span>
                        <div className="flex items-center gap-1.5 flex-1 justify-center">
                          {cols.map((col, cIdx) => {
                            if (!col) {
                              return <div key={cIdx} className="w-6 text-center text-[10px] text-slate-600">Lối đi</div>;
                            }
                            const isBooked = (rowNum * 7 + col.charCodeAt(0)) % 4 === 0;
                            const seatCode = `${rowStr}${col}`;

                            return (
                              <button
                                key={cIdx}
                                className={`w-7 h-7 rounded-md text-[10px] font-bold flex items-center justify-center transition-transform hover:scale-110 ${
                                  isBooked
                                    ? 'bg-rose-900/60 text-rose-300 border border-rose-800 cursor-not-allowed'
                                    : isBusiness
                                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                                    : 'bg-emerald-700/80 text-white hover:bg-emerald-600 border border-emerald-600/40'
                                }`}
                                title={`Ghế ${seatCode} - ${isBooked ? 'Đã đặt' : isBusiness ? 'Thương gia' : 'Phổ thông'}`}
                              >
                                {col}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Flight Status Updater Modal */}
      {selectedFlightForStatus && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-6 relative">
            <h3 className="text-base font-bold text-white mb-2">
              Cập Nhật Trạng Thái Chuyến Bay {selectedFlightForStatus.flightNumber}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Hệ thống sẽ lập tức bắn sự kiện WebSocket để cập nhật FIDS tại sân bay và trang web khách hàng.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Trạng thái chuyến bay:</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value as FlightItem['status'])}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="SCHEDULED">Đúng Lịch Trình (Scheduled)</option>
                  <option value="BOARDING">Đang Lên Máy Bay (Boarding)</option>
                  <option value="DEPARTED">Đã Khởi Hành (Departed / In-air)</option>
                  <option value="DELAYED">Chậm Chuyến (Delayed)</option>
                  <option value="CANCELLED">Hủy Chuyến (Cancelled)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Cửa khởi hành (Gate):</label>
                <input
                  type="text"
                  value={newGate}
                  onChange={(e) => setNewGate(e.target.value)}
                  placeholder="Ví dụ: 08, 12, 14..."
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:outline-none focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedFlightForStatus(null)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleUpdateStatus}
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20"
                >
                  Xác Nhận & Bắn Sự Kiện Live
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Flight Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-lg p-6 relative">
            <h3 className="text-lg font-black text-white mb-2">Thêm Chuyến Bay Mới Vào Lịch Trình</h3>
            <p className="text-xs text-slate-400 mb-4">
              Khởi tạo chuyến bay, hệ thống sẽ tự động sinh sơ đồ ghế Boeing 787-9 và mở bán trên cổng trực tuyến.
            </p>

            <form onSubmit={handleCreateFlight} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Số hiệu chuyến bay:</label>
                  <input
                    type="text"
                    required
                    placeholder="VN 288"
                    value={createForm.flightNumber}
                    onChange={(e) => setCreateForm({ ...createForm, flightNumber: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white uppercase focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Hãng hàng không:</label>
                  <select
                    value={createForm.airlineName}
                    onChange={(e) => setCreateForm({ ...createForm, airlineName: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="Vietnam Airlines">Vietnam Airlines</option>
                    <option value="Vietjet Air">Vietjet Air</option>
                    <option value="Bamboo Airways">Bamboo Airways</option>
                    <option value="Vietravel Airlines">Vietravel Airlines</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Hành trình:</label>
                <select
                  value={createForm.route}
                  onChange={(e) => setCreateForm({ ...createForm, route: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="SGN ➔ HAN">SGN (TP.HCM) ➔ HAN (Hà Nội)</option>
                  <option value="HAN ➔ SGN">HAN (Hà Nội) ➔ SGN (TP.HCM)</option>
                  <option value="SGN ➔ DAD">SGN (TP.HCM) ➔ DAD (Đà Nẵng)</option>
                  <option value="SGN ➔ PQC">SGN (TP.HCM) ➔ PQC (Phú Quốc)</option>
                  <option value="HAN ➔ CXR">HAN (Hà Nội) ➔ CXR (Cam Ranh)</option>
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Giờ cất cánh:</label>
                  <input
                    type="time"
                    required
                    value={createForm.depTime}
                    onChange={(e) => setCreateForm({ ...createForm, depTime: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Giờ hạ cánh:</label>
                  <input
                    type="time"
                    required
                    value={createForm.arrTime}
                    onChange={(e) => setCreateForm({ ...createForm, arrTime: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Cửa ra máy bay:</label>
                  <input
                    type="text"
                    required
                    value={createForm.gate}
                    onChange={(e) => setCreateForm({ ...createForm, gate: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Giá vé Phổ Thông (VNĐ):</label>
                  <input
                    type="number"
                    step="50000"
                    required
                    value={createForm.ecoPrice}
                    onChange={(e) => setCreateForm({ ...createForm, ecoPrice: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Giá vé Thương Gia (VNĐ):</label>
                  <input
                    type="number"
                    step="100000"
                    required
                    value={createForm.busPrice}
                    onChange={(e) => setCreateForm({ ...createForm, busPrice: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl p-2 text-xs text-white focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-700"
                >
                  Đóng
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-orange-500/20"
                >
                  Tạo Chuyến Bay & Mở Bán
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
