export type RoleType = 'SUPER_ADMIN' | 'CSKH' | 'ACCOUNTANT' | 'MARKETING' | 'AGENT';

export interface AdminUser {
  id: number;
  uuid: string;
  username: string;
  email: string;
  password?: string;
  passwordHash?: string;
  fullName: string;
  phone: string;
  avatarUrl?: string;
  role: RoleType;
  status: 'ACTIVE' | 'SUSPENDED' | 'LOCKED';
  lastLoginAt?: string;
  lastLoginIp?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface Airline {
  id: number;
  code: string;
  name: string;
  country: string;
  logoUrl: string;
  supportHotline: string;
  isActive: boolean;
}

export interface Airport {
  id: number;
  iataCode: string;
  name: string;
  city: string;
  country: string;
  timezone: string;
  terminalDomestic: string;
  terminalInternational: string;
  isActive: boolean;
}

export interface Aircraft {
  id: number;
  airlineId: number;
  model: string;
  registrationCode: string;
  seatCapacity: number;
  seatLayout: string;
  isActive: boolean;
}

export type FlightStatus = 'SCHEDULED' | 'DELAYED' | 'BOARDING' | 'DEPARTED' | 'LANDED' | 'CANCELLED';

export interface FareClass {
  id: number;
  flightId: number;
  cabinClass: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
  name: string;
  basePrice: number;
  taxAndFees: number;
  baggageCabinKg: number;
  baggageCheckedKg: number;
  isRefundable: boolean;
  refundFee: number;
  isChangeable: boolean;
  changeFee: number;
  seatCapacity: number;
  seatsBooked: number;
}

export interface FlightSeat {
  flightId: number;
  seatNumber: string;
  seatClass: 'ECONOMY' | 'BUSINESS';
  seatType: 'STANDARD' | 'WINDOW' | 'AISLE' | 'MIDDLE' | 'EXTRA_LEGROOM' | 'EXIT_ROW';
  extraCharge: number;
  status: 'AVAILABLE' | 'HELD' | 'BOOKED' | 'BLOCKED';
  heldUntil?: string | null;
  heldBySession?: string | null;
}

export interface Flight {
  id: number;
  uuid: string;
  flightNumber: string;
  airlineId: number;
  airline?: Airline;
  aircraftId: number;
  aircraft?: Aircraft;
  departureAirportId: number;
  departureAirport?: Airport;
  arrivalAirportId: number;
  arrivalAirport?: Airport;
  departureTime: string;
  arrivalTime: string;
  flightDurationMinutes: number;
  status: FlightStatus;
  gate?: string;
  delayReason?: string;
  lowSeatThreshold: number;
  isRecurring: boolean;
  recurrenceRule?: string;
  isMultiLeg: boolean;
  fareClasses: FareClass[];
  seats?: FlightSeat[];
  createdAt: string;
  updatedAt: string;
  createdBy?: number;
  deletedAt?: string | null;
}

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'REFUND_REQUESTED' | 'REFUNDED';
export type PaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'REFUNDED';

export interface BookingPassenger {
  id: number;
  bookingId: number;
  flightId: number;
  fareClassId: number;
  passengerType: 'ADULT' | 'CHILD' | 'INFANT';
  title: 'Mr' | 'Mrs' | 'Ms' | 'Mstr';
  firstName: string;
  lastName: string;
  fullName: string;
  dateOfBirth?: string;
  idCardNumber?: string;
  nationality: string;
  seatNumber?: string;
  ticketNumber: string;
  services: BookingService[];
}

export interface BookingService {
  id: number;
  bookingPassengerId: number;
  serviceType: 'BAGGAGE' | 'MEAL' | 'SEAT_SELECTION' | 'TRAVEL_INSURANCE' | 'LOUNGE';
  serviceCode: string;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Booking {
  id: number;
  uuid: string;
  pnrCode: string;
  customerId?: number;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  totalPassengers: number;
  subtotalAmount: number;
  discountAmount: number;
  ancillaryAmount: number;
  vatTaxAmount: number;
  totalAmount: number;
  bookingStatus: BookingStatus;
  paymentStatus: PaymentStatus;
  seatHoldExpiresAt?: string | null;
  specialNotes?: string;
  passengers: BookingPassenger[];
  flight?: Flight;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface PaymentTransaction {
  id: number;
  uuid: string;
  bookingId: number;
  paymentMethod: 'VNPAY' | 'MOMO' | 'CREDIT_CARD' | 'BANK_TRANSFER';
  transactionCode: string;
  amount: number;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface RefundRequest {
  id: number;
  uuid: string;
  bookingId: number;
  pnrCode: string;
  requestedAmount: number;
  cancellationFee: number;
  actualRefundAmount: number;
  reason: string;
  status: 'REQUESTED' | 'APPROVED' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  approvedBy?: string;
  approvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Customer {
  id: number;
  uuid: string;
  fullName: string;
  email: string;
  phone: string;
  loyaltyTier: 'SILVER' | 'GOLD' | 'PLATINUM' | 'DIAMOND';
  currentPoints: number;
  totalSpend: number;
  totalFlightsFlown: number;
  isBlacklisted: boolean;
  blacklistReason?: string;
  dietaryPreference?: string;
  specialAssistanceNotes?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
}

export interface PromoCode {
  id: number;
  code: string;
  title: string;
  discountType: 'PERCENT' | 'FIXED_AMOUNT';
  discountValue: number;
  minOrderAmount: number;
  maxDiscountAmount?: number;
  applicableCabinClass?: string;
  usageLimitTotal: number;
  usageLimitPerUser: number;
  usedCount: number;
  validFrom: string;
  validTo: string;
  isActive: boolean;
  createdAt: string;
}

export interface DynamicPricingRule {
  id: number;
  name: string;
  departureAirportId?: number;
  arrivalAirportId?: number;
  daysBeforeDeparture?: number;
  occupancyRateThreshold?: number;
  priceAdjustmentPercent: number;
  isActive: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: number;
  adminUserId?: number;
  adminName: string;
  action: string;
  entityName: string;
  entityId: string;
  ipAddress?: string;
  oldValues?: Record<string, unknown>;
  newValues?: Record<string, unknown>;
  description: string;
  createdAt: string;
}

export interface CMSContent {
  id: number;
  slug: string;
  contentType: 'BANNER' | 'NEWS' | 'FAQ' | 'POLICY';
  title: string;
  summary?: string;
  body?: string;
  featuredImageUrl?: string;
  locale: 'vi' | 'en';
  positionOrder: number;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
}
