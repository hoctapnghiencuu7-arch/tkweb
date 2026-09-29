import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { store } from '../../database/store.js';
import { authenticateToken, requireRoles } from '../../middlewares/auth.middleware.js';
import { Flight, FlightStatus, FlightSeat } from '../../types/index.js';

const router = Router();

// GET /api/flights - List flights with filtering & pagination
router.get('/', (req: Request, res: Response) => {
  const {
    departureAirportId,
    arrivalAirportId,
    airlineId,
    status,
    search,
    page = '1',
    limit = '10',
  } = req.query;

  let result = store.flights.filter((f) => !f.deletedAt);

  if (departureAirportId) {
    result = result.filter((f) => f.departureAirportId === Number(departureAirportId));
  }
  if (arrivalAirportId) {
    result = result.filter((f) => f.arrivalAirportId === Number(arrivalAirportId));
  }
  if (airlineId) {
    result = result.filter((f) => f.airlineId === Number(airlineId));
  }
  if (status) {
    result = result.filter((f) => f.status === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    result = result.filter(
      (f) =>
        f.flightNumber.toLowerCase().includes(q) ||
        f.airline?.name.toLowerCase().includes(q) ||
        f.departureAirport?.iataCode.toLowerCase().includes(q) ||
        f.arrivalAirport?.iataCode.toLowerCase().includes(q)
    );
  }

  const total = result.length;
  const p = Math.max(1, parseInt(String(page)));
  const l = Math.max(1, parseInt(String(limit)));
  const startIndex = (p - 1) * l;
  const paginated = result.slice(startIndex, startIndex + l);

  res.json({
    success: true,
    data: {
      items: paginated,
      meta: {
        total,
        page: p,
        limit: l,
        totalPages: Math.ceil(total / l),
      },
    },
  });
});

// GET /api/flights/:id - Flight details with seat map
router.get('/:id', (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const flight = store.flights.find((f) => f.id === id && !f.deletedAt);

  if (!flight) {
    res.status(404).json({ success: false, message: 'Không tìm thấy chuyến bay.' });
    return;
  }

  res.json({
    success: true,
    data: flight,
  });
});

const CreateFlightSchema = z.object({
  flightNumber: z.string().min(2, 'Mã chuyến bay không hợp lệ'),
  airlineId: z.number(),
  aircraftId: z.number().optional(),
  departureAirportId: z.number(),
  arrivalAirportId: z.number(),
  departureTime: z.string(),
  arrivalTime: z.string(),
  economyPrice: z.number().min(100000, 'Giá vé phổ thông tối thiểu 100.000đ'),
  businessPrice: z.number().min(500000, 'Giá vé thương gia tối thiểu 500.000đ'),
  gate: z.string().optional(),
});

// POST /api/flights - Create new flight
router.post('/', authenticateToken, requireRoles('SUPER_ADMIN'), (req: Request, res: Response) => {
  const body = CreateFlightSchema.parse(req.body);

  const depTime = new Date(body.departureTime);
  const arrTime = new Date(body.arrivalTime);
  const dur = Math.max(30, Math.round((arrTime.getTime() - depTime.getTime()) / (1000 * 60)));

  const newId = store.flights.length > 0 ? Math.max(...store.flights.map((f) => f.id)) + 1 : 1;

  // Auto-generate basic seat grid
  const seats: FlightSeat[] = [];
  const cols = ['A', 'B', 'C', 'D', 'E', 'F'];
  for (let r = 1; r <= 20; r++) {
    const rowStr = r < 10 ? `0${r}` : `${r}`;
    const isBus = r <= 3;
    for (const c of cols) {
      seats.push({
        flightId: newId,
        seatNumber: `${rowStr}${c}`,
        seatClass: isBus ? 'BUSINESS' : 'ECONOMY',
        seatType: c === 'A' || c === 'F' ? 'WINDOW' : c === 'C' || c === 'D' ? 'AISLE' : 'MIDDLE',
        extraCharge: 0,
        status: 'AVAILABLE',
      });
    }
  }

  const newFlight: Flight = {
    id: newId,
    uuid: `flt-${newId.toString().padStart(4, '0')}`,
    flightNumber: body.flightNumber.toUpperCase(),
    airlineId: body.airlineId,
    airline: store.airlines.find((a) => a.id === body.airlineId),
    aircraftId: body.aircraftId || 1,
    aircraft: store.aircrafts.find((ac) => ac.id === (body.aircraftId || 1)),
    departureAirportId: body.departureAirportId,
    departureAirport: store.airports.find((ap) => ap.id === body.departureAirportId),
    arrivalAirportId: body.arrivalAirportId,
    arrivalAirport: store.airports.find((ap) => ap.id === body.arrivalAirportId),
    departureTime: body.departureTime,
    arrivalTime: body.arrivalTime,
    flightDurationMinutes: dur,
    status: 'SCHEDULED',
    gate: body.gate || '01',
    lowSeatThreshold: 15,
    isRecurring: false,
    isMultiLeg: false,
    fareClasses: [
      {
        id: newId * 10 + 1,
        flightId: newId,
        cabinClass: 'ECONOMY',
        name: 'Phổ thông Tiêu chuẩn',
        basePrice: body.economyPrice,
        taxAndFees: 120000,
        baggageCabinKg: 7,
        baggageCheckedKg: 20,
        isRefundable: true,
        refundFee: 350000,
        isChangeable: true,
        changeFee: 250000,
        seatCapacity: 102,
        seatsBooked: 0,
      },
      {
        id: newId * 10 + 2,
        flightId: newId,
        cabinClass: 'BUSINESS',
        name: 'Thương gia Linh hoạt',
        basePrice: body.businessPrice,
        taxAndFees: 250000,
        baggageCabinKg: 14,
        baggageCheckedKg: 30,
        isRefundable: true,
        refundFee: 150000,
        isChangeable: true,
        changeFee: 0,
        seatCapacity: 18,
        seatsBooked: 0,
      },
    ],
    seats,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: req.user?.id,
    deletedAt: null,
  };

  store.flights.unshift(newFlight);

  store.recordAuditLog(
    req.user?.id,
    req.user?.fullName || 'Admin',
    'CREATE',
    'flights',
    newFlight.flightNumber,
    `Tạo mới chuyến bay ${newFlight.flightNumber} (${newFlight.departureAirport?.iataCode} -> ${newFlight.arrivalAirport?.iataCode})`,
    undefined,
    { flightNumber: newFlight.flightNumber }
  );

  res.status(201).json({
    success: true,
    message: `Tạo thành công chuyến bay ${newFlight.flightNumber}.`,
    data: newFlight,
  });
});

// PUT /api/flights/:id/status - Update real-time status (Broadcast via WebSocket)
router.put('/:id/status', authenticateToken, (req: Request, res: Response) => {
  const id = Number(req.params.id);
  const { status, delayReason, gate } = req.body;

  const flight = store.flights.find((f) => f.id === id);
  if (!flight) {
    res.status(404).json({ success: false, message: 'Không tìm thấy chuyến bay.' });
    return;
  }

  const oldStatus = flight.status;
  flight.status = status as FlightStatus;
  if (delayReason !== undefined) flight.delayReason = delayReason;
  if (gate !== undefined) flight.gate = gate;
  flight.updatedAt = new Date().toISOString();

  store.recordAuditLog(
    req.user?.id,
    req.user?.fullName || 'Admin',
    'UPDATE_STATUS',
    'flights',
    flight.flightNumber,
    `Chuyển trạng thái từ ${oldStatus} sang ${flight.status}`,
    { status: oldStatus },
    { status: flight.status, gate: flight.gate }
  );

  // Broadcast WebSocket notification to all active clients
  const io = req.app.get('socketio');
  if (io) {
    io.emit('flight_status_updated', {
      flightId: flight.id,
      flightNumber: flight.flightNumber,
      newStatus: flight.status,
      gate: flight.gate,
      updatedAt: flight.updatedAt,
    });
  }

  res.json({
    success: true,
    message: `Đã cập nhật trạng thái chuyến bay ${flight.flightNumber} sang ${flight.status}.`,
    data: flight,
  });
});

export const flightRoutes = router;
