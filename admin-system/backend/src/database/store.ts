import {
  AdminUser,
  Airline,
  Airport,
  Aircraft,
  Flight,
  FlightSeat,
  FareClass,
  Booking,
  Customer,
  PromoCode,
  DynamicPricingRule,
  PaymentTransaction,
  RefundRequest,
  CMSContent,
  AuditLog,
} from '../types/index.js';
import {
  INITIAL_ADMINS,
  INITIAL_AIRLINES,
  INITIAL_AIRPORTS,
  INITIAL_AIRCRAFTS,
  INITIAL_PRICING_RULES,
  INITIAL_PROMO_CODES,
  INITIAL_CUSTOMERS,
  INITIAL_CMS,
} from './seed-data.js';
import { SeatHoldManager } from '../utils/seat-hold-manager.js';

function generateSeatsForFlight(flightId: number, rows = 30): FlightSeat[] {
  const seats: FlightSeat[] = [];
  const cols = ['A', 'B', 'C', 'D', 'E', 'F'];

  for (let r = 1; r <= rows; r++) {
    const rowStr = r < 10 ? `0${r}` : `${r}`;
    const isBusiness = r <= 3;
    const isExitRow = r === 12 || r === 13;

    for (const c of cols) {
      let seatType: FlightSeat['seatType'] = 'STANDARD';
      let extraCharge = 0;

      if (c === 'A' || c === 'F') {
        seatType = 'WINDOW';
        extraCharge = isBusiness ? 200000 : 50000;
      } else if (c === 'C' || c === 'D') {
        seatType = 'AISLE';
        extraCharge = isBusiness ? 150000 : 40000;
      } else {
        seatType = 'MIDDLE';
        extraCharge = 0;
      }

      if (isExitRow) {
        seatType = 'EXIT_ROW';
        extraCharge = 120000;
      }

      // Pre-seed some booked seats randomly for realism
      const randomSeed = (flightId * 37 + r * 13 + c.charCodeAt(0)) % 100;
      const status: FlightSeat['status'] = randomSeed < 35 ? 'BOOKED' : 'AVAILABLE';

      seats.push({
        flightId,
        seatNumber: `${rowStr}${c}`,
        seatClass: isBusiness ? 'BUSINESS' : 'ECONOMY',
        seatType,
        extraCharge,
        status,
      });
    }
  }

  return seats;
}

export class AppDataStore {
  public adminUsers: AdminUser[] = [...INITIAL_ADMINS];
  public airlines: Airline[] = [...INITIAL_AIRLINES];
  public airports: Airport[] = [...INITIAL_AIRPORTS];
  public aircrafts: Aircraft[] = [...INITIAL_AIRCRAFTS];
  public pricingRules: DynamicPricingRule[] = [...INITIAL_PRICING_RULES];
  public promoCodes: PromoCode[] = [...INITIAL_PROMO_CODES];
  public customers: Customer[] = [...INITIAL_CUSTOMERS];
  public cmsContents: CMSContent[] = [...INITIAL_CMS];
  public flights: Flight[] = [];
  public bookings: Booking[] = [];
  public payments: PaymentTransaction[] = [];
  public refunds: RefundRequest[] = [];
  public auditLogs: AuditLog[] = [];
  public seatHoldManager = new SeatHoldManager(15);

  constructor() {
    this.initFlightsAndBookings();
  }

  private initFlightsAndBookings() {
    const rawFlights = [
      { id: 1, number: 'VN 214', airlineId: 1, aircraftId: 1, depId: 1, arrId: 2, dep: '2026-09-14T07:00:00Z', arr: '2026-09-14T09:15:00Z', dur: 135, eco: 1850000, bus: 4200000, status: 'BOARDING' as const, gate: '12' },
      { id: 2, number: 'VJ 132', airlineId: 2, aircraftId: 3, depId: 1, arrId: 2, dep: '2026-09-14T08:30:00Z', arr: '2026-09-14T10:45:00Z', dur: 135, eco: 1190000, bus: 2800000, status: 'SCHEDULED' as const, gate: '05' },
      { id: 3, number: 'QH 202', airlineId: 3, aircraftId: 4, depId: 1, arrId: 2, dep: '2026-09-14T14:00:00Z', arr: '2026-09-14T16:15:00Z', dur: 135, eco: 1450000, bus: 3500000, status: 'SCHEDULED' as const, gate: '08' },
      { id: 4, number: 'VN 116', airlineId: 1, aircraftId: 1, depId: 1, arrId: 3, dep: '2026-09-14T09:00:00Z', arr: '2026-09-14T10:20:00Z', dur: 80, eco: 1250000, bus: 2950000, status: 'DEPARTED' as const, gate: '14' },
      { id: 5, number: 'VJ 628', airlineId: 2, aircraftId: 3, depId: 1, arrId: 3, dep: '2026-09-14T11:15:00Z', arr: '2026-09-14T12:35:00Z', dur: 80, eco: 890000, bus: 2100000, status: 'SCHEDULED' as const, gate: '03' },
      { id: 6, number: 'VN 182', airlineId: 1, aircraftId: 2, depId: 1, arrId: 4, dep: '2026-09-14T15:30:00Z', arr: '2026-09-14T16:35:00Z', dur: 65, eco: 1350000, bus: 3100000, status: 'SCHEDULED' as const, gate: '16' },
      { id: 7, number: 'VU 301', airlineId: 4, aircraftId: 4, depId: 2, arrId: 5, dep: '2026-09-15T06:45:00Z', arr: '2026-09-15T08:35:00Z', dur: 110, eco: 1050000, bus: 2400000, status: 'SCHEDULED' as const, gate: '02' },
      { id: 8, number: 'VN 250', airlineId: 1, aircraftId: 1, depId: 2, arrId: 1, dep: '2026-09-15T10:00:00Z', arr: '2026-09-15T12:15:00Z', dur: 135, eco: 1750000, bus: 4100000, status: 'SCHEDULED' as const, gate: '10' },
    ];

    this.flights = rawFlights.map((rf) => {
      const seats = generateSeatsForFlight(rf.id, 25);
      const bookedSeatsCount = seats.filter((s) => s.status === 'BOOKED').length;

      const fareClasses: FareClass[] = [
        {
          id: rf.id * 10 + 1,
          flightId: rf.id,
          cabinClass: 'ECONOMY',
          name: 'Phổ thông Tiêu chuẩn',
          basePrice: rf.eco,
          taxAndFees: 120000,
          baggageCabinKg: 7,
          baggageCheckedKg: 20,
          isRefundable: true,
          refundFee: 350000,
          isChangeable: true,
          changeFee: 250000,
          seatCapacity: 132,
          seatsBooked: Math.floor(bookedSeatsCount * 0.85),
        },
        {
          id: rf.id * 10 + 2,
          flightId: rf.id,
          cabinClass: 'BUSINESS',
          name: 'Thương gia Linh hoạt',
          basePrice: rf.bus,
          taxAndFees: 250000,
          baggageCabinKg: 14,
          baggageCheckedKg: 30,
          isRefundable: true,
          refundFee: 150000,
          isChangeable: true,
          changeFee: 0,
          seatCapacity: 18,
          seatsBooked: Math.floor(bookedSeatsCount * 0.15),
        },
      ];

      return {
        id: rf.id,
        uuid: `flt-${rf.id.toString().padStart(4, '0')}`,
        flightNumber: rf.number,
        airlineId: rf.airlineId,
        airline: this.airlines.find((a) => a.id === rf.airlineId),
        aircraftId: rf.aircraftId,
        aircraft: this.aircrafts.find((ac) => ac.id === rf.aircraftId),
        departureAirportId: rf.depId,
        departureAirport: this.airports.find((ap) => ap.id === rf.depId),
        arrivalAirportId: rf.arrId,
        arrivalAirport: this.airports.find((ap) => ap.id === rf.arrId),
        departureTime: rf.dep,
        arrivalTime: rf.arr,
        flightDurationMinutes: rf.dur,
        status: rf.status,
        gate: rf.gate,
        lowSeatThreshold: 15,
        isRecurring: true,
        recurrenceRule: 'DAILY',
        isMultiLeg: false,
        fareClasses,
        seats,
        createdAt: '2026-08-01T00:00:00.000Z',
        updatedAt: '2026-09-14T08:00:00.000Z',
        createdBy: 1,
        deletedAt: null,
      };
    });

    // Seed Bookings
    const sampleBookings: Booking[] = [
      {
        id: 1,
        uuid: 'bkg-0001',
        pnrCode: 'SW882P',
        customerId: 1,
        contactName: 'Trần Minh Quang',
        contactEmail: 'minhquang.tran@gmail.com',
        contactPhone: '0912345678',
        totalPassengers: 1,
        subtotalAmount: 1850000,
        discountAmount: 0,
        ancillaryAmount: 270000, // Baggage + Seat
        vatTaxAmount: 148000,
        totalAmount: 2268000,
        bookingStatus: 'CONFIRMED',
        paymentStatus: 'PAID',
        passengers: [
          {
            id: 1,
            bookingId: 1,
            flightId: 1,
            fareClassId: 11,
            passengerType: 'ADULT',
            title: 'Mr',
            firstName: 'Minh Quang',
            lastName: 'Trần',
            fullName: 'Trần Minh Quang',
            idCardNumber: '079095012849',
            nationality: 'Việt Nam',
            seatNumber: '10F',
            ticketNumber: '738-2490192831',
            services: [
              { id: 1, bookingPassengerId: 1, serviceType: 'BAGGAGE', serviceCode: 'BAG20', serviceName: 'Hành lý ký gửi 20kg', quantity: 1, unitPrice: 220000, totalPrice: 220000 },
              { id: 2, bookingPassengerId: 1, serviceType: 'SEAT_SELECTION', serviceCode: 'SEAT_WIN', serviceName: 'Ghế cửa sổ', quantity: 1, unitPrice: 50000, totalPrice: 50000 },
            ],
          },
        ],
        flight: this.flights[0],
        createdAt: '2026-09-14T06:15:00.000Z',
        updatedAt: '2026-09-14T06:20:00.000Z',
      },
      {
        id: 2,
        uuid: 'bkg-0002',
        pnrCode: 'VJ188K',
        customerId: 2,
        contactName: 'Nguyễn Thị Hương Mai',
        contactEmail: 'huongmai.nguyen@yahoo.com',
        contactPhone: '0987654321',
        totalPassengers: 1,
        subtotalAmount: 1190000,
        discountAmount: 50000,
        ancillaryAmount: 180000,
        vatTaxAmount: 95200,
        totalAmount: 1415200,
        bookingStatus: 'CONFIRMED',
        paymentStatus: 'PAID',
        passengers: [
          {
            id: 2,
            bookingId: 2,
            flightId: 2,
            fareClassId: 21,
            passengerType: 'ADULT',
            title: 'Ms',
            firstName: 'Hương Mai',
            lastName: 'Nguyễn Thị',
            fullName: 'Nguyễn Thị Hương Mai',
            idCardNumber: '001198034512',
            nationality: 'Việt Nam',
            seatNumber: '14C',
            ticketNumber: '978-4820194821',
            services: [
              { id: 3, bookingPassengerId: 2, serviceType: 'BAGGAGE', serviceCode: 'BAG15', serviceName: 'Hành lý thêm 15kg', quantity: 1, unitPrice: 180000, totalPrice: 180000 },
            ],
          },
        ],
        flight: this.flights[1],
        createdAt: '2026-09-14T07:40:00.000Z',
        updatedAt: '2026-09-14T07:45:00.000Z',
      },
      {
        id: 3,
        uuid: 'bkg-0003',
        pnrCode: 'VN214P',
        contactName: 'Michael H. Peter',
        contactEmail: 'peter.m@globex.com',
        contactPhone: '+84909876543',
        totalPassengers: 1,
        subtotalAmount: 4200000,
        discountAmount: 0,
        ancillaryAmount: 0,
        vatTaxAmount: 336000,
        totalAmount: 4536000,
        bookingStatus: 'CONFIRMED',
        paymentStatus: 'PAID',
        passengers: [
          {
            id: 3,
            bookingId: 3,
            flightId: 1,
            fareClassId: 12,
            passengerType: 'ADULT',
            title: 'Mr',
            firstName: 'Michael',
            lastName: 'Peter',
            fullName: 'Michael H. Peter',
            idCardNumber: 'P09481920',
            nationality: 'Hoa Kỳ',
            seatNumber: '02B',
            ticketNumber: '738-9920184711',
            services: [],
          },
        ],
        flight: this.flights[0],
        createdAt: '2026-09-14T08:10:00.000Z',
        updatedAt: '2026-09-14T08:12:00.000Z',
      },
      {
        id: 4,
        uuid: 'bkg-0004',
        pnrCode: 'QH88T',
        contactName: 'Victoria Sterling',
        contactEmail: 'victoria.s@skywings.vn',
        contactPhone: '0933221144',
        totalPassengers: 1,
        subtotalAmount: 1450000,
        discountAmount: 0,
        ancillaryAmount: 120000,
        vatTaxAmount: 116000,
        totalAmount: 1686000,
        bookingStatus: 'REFUND_REQUESTED',
        paymentStatus: 'PAID',
        passengers: [
          {
            id: 4,
            bookingId: 4,
            flightId: 3,
            fareClassId: 31,
            passengerType: 'ADULT',
            title: 'Mrs',
            firstName: 'Victoria',
            lastName: 'Sterling',
            fullName: 'Victoria Sterling',
            idCardNumber: 'GB9482103',
            nationality: 'Vương quốc Anh',
            seatNumber: '16D',
            ticketNumber: '788-3920194820',
            services: [],
          },
        ],
        flight: this.flights[2],
        createdAt: '2026-09-14T08:25:00.000Z',
        updatedAt: '2026-09-14T08:30:00.000Z',
      },
      {
        id: 5,
        uuid: 'bkg-0005',
        pnrCode: 'FZ808D',
        contactName: 'David Henderson',
        contactEmail: 'henderson.d@airline.com',
        contactPhone: '0977665544',
        totalPassengers: 1,
        subtotalAmount: 1250000,
        discountAmount: 0,
        ancillaryAmount: 50000,
        vatTaxAmount: 100000,
        totalAmount: 1400000,
        bookingStatus: 'PENDING',
        paymentStatus: 'UNPAID',
        seatHoldExpiresAt: new Date(Date.now() + 12 * 60 * 1000).toISOString(),
        passengers: [
          {
            id: 5,
            bookingId: 5,
            flightId: 4,
            fareClassId: 41,
            passengerType: 'ADULT',
            title: 'Mr',
            firstName: 'David',
            lastName: 'Henderson',
            fullName: 'David Henderson',
            idCardNumber: 'AUS849201',
            nationality: 'Úc',
            seatNumber: '19F',
            ticketNumber: '738-1192847293',
            services: [],
          },
        ],
        flight: this.flights[3],
        createdAt: '2026-09-14T08:50:00.000Z',
        updatedAt: '2026-09-14T08:50:00.000Z',
      },
    ];

    this.bookings = sampleBookings;

    // Seed Payments
    this.payments = [
      { id: 1, uuid: 'pay-0001', bookingId: 1, paymentMethod: 'VNPAY', transactionCode: 'VNP_20260914_882910', amount: 2268000, currency: 'VND', status: 'SUCCESS', paidAt: '2026-09-14T06:20:00Z', createdAt: '2026-09-14T06:18:00Z', updatedAt: '2026-09-14T06:20:00Z' },
      { id: 2, uuid: 'pay-0002', bookingId: 2, paymentMethod: 'MOMO', transactionCode: 'MOMO_94820194821', amount: 1415200, currency: 'VND', status: 'SUCCESS', paidAt: '2026-09-14T07:45:00Z', createdAt: '2026-09-14T07:42:00Z', updatedAt: '2026-09-14T07:45:00Z' },
      { id: 3, uuid: 'pay-0003', bookingId: 3, paymentMethod: 'CREDIT_CARD', transactionCode: 'VISA_AUTH_948192', amount: 4536000, currency: 'VND', status: 'SUCCESS', paidAt: '2026-09-14T08:12:00Z', createdAt: '2026-09-14T08:10:00Z', updatedAt: '2026-09-14T08:12:00Z' },
      { id: 4, uuid: 'pay-0004', bookingId: 4, paymentMethod: 'VNPAY', transactionCode: 'VNP_20260914_748291', amount: 1686000, currency: 'VND', status: 'SUCCESS', paidAt: '2026-09-14T08:28:00Z', createdAt: '2026-09-14T08:26:00Z', updatedAt: '2026-09-14T08:28:00Z' },
    ];

    // Seed Refunds
    this.refunds = [
      {
        id: 1,
        uuid: 'ref-0001',
        bookingId: 4,
        pnrCode: 'QH88T',
        requestedAmount: 1686000,
        cancellationFee: 350000,
        actualRefundAmount: 1336000,
        reason: 'Hành khách thay đổi lịch công tác đột xuất cần hủy vé.',
        status: 'REQUESTED',
        createdAt: '2026-09-14T08:35:00.000Z',
        updatedAt: '2026-09-14T08:35:00.000Z',
      },
    ];

    // Seed initial audit log
    this.auditLogs = [
      {
        id: 1,
        adminUserId: 1,
        adminName: 'Quản Trị Viên Trưởng',
        action: 'UPDATE_STATUS',
        entityName: 'flights',
        entityId: 'VN 214',
        ipAddress: '127.0.0.1',
        oldValues: { status: 'SCHEDULED' },
        newValues: { status: 'BOARDING' },
        description: 'Chuyển trạng thái chuyến bay sang Đang Lên Máy Bay (Boarding - Cửa 12).',
        createdAt: '2026-09-14T06:30:00.000Z',
      },
      {
        id: 2,
        adminUserId: 2,
        adminName: 'Nguyễn Thùy Linh (CSKH)',
        action: 'SEAT_ASSIGN',
        entityName: 'bookings',
        entityId: 'SW882P',
        ipAddress: '127.0.0.1',
        oldValues: { seatNumber: null },
        newValues: { seatNumber: '10F' },
        description: 'Hỗ trợ khách xếp chỗ ngồi cửa sổ 10F.',
        createdAt: '2026-09-14T06:40:00.000Z',
      },
    ];
  }

  public recordAuditLog(
    adminUserId: number | undefined,
    adminName: string,
    action: string,
    entityName: string,
    entityId: string,
    description: string,
    oldValues?: Record<string, unknown>,
    newValues?: Record<string, unknown>
  ): AuditLog {
    const log: AuditLog = {
      id: this.auditLogs.length + 1,
      adminUserId,
      adminName,
      action,
      entityName,
      entityId,
      description,
      oldValues,
      newValues,
      createdAt: new Date().toISOString(),
    };
    this.auditLogs.unshift(log);
    return log;
  }
}

export const store = new AppDataStore();
