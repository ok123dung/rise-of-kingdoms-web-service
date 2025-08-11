// Database model type definitions based on Prisma schema

export interface User {
  id: string;
  email: string;
  password: string;
  fullName: string;
  phone?: string | null;
  discordUsername?: string | null;
  rokPlayerId?: string | null;
  rokKingdom?: string | null;
  rokPower?: bigint | null;
  status: string;
  emailVerified?: Date | null;
  lastLogin?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  shortDescription?: string | null;
  basePrice: number | { toNumber: () => number };
  currency: string;
}

export interface ServiceTier {
  id: string;
  serviceId: string;
  name: string;
  slug: string;
  price: number | { toNumber: () => number };
  originalPrice?: number | { toNumber: () => number } | null;
  features: string[] | any;
  limitations?: string[] | any | null;
  service: Service;
}

export interface Booking {
  id: string;
  bookingNumber: string;
  userId: string;
  serviceTierId: string;
  status: string;
  paymentStatus: string;
  totalAmount: number | { toNumber: () => number };
  discountAmount: number | { toNumber: () => number };
  finalAmount: number | { toNumber: () => number };
  currency: string;
  bookingDetails?: any | null;
  customerRequirements?: string | null;
  startDate?: Date | null;
  endDate?: Date | null;
  assignedStaffId?: string | null;
  completionPercentage: number;
  customerRating?: number | null;
  customerFeedback?: string | null;
  internalNotes?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: User;
  serviceTier: ServiceTier;
}

export interface Payment {
  id: string;
  bookingId: string;
  paymentNumber: string;
  amount: number | { toNumber: () => number };
  currency: string;
  paymentMethod: string;
  paymentGateway: string;
  gatewayTransactionId?: string | null;
  gatewayOrderId?: string | null;
  status: string;
  failureReason?: string | null;
  gatewayResponse?: any | null;
  paidAt?: Date | null;
  refundedAt?: Date | null;
  refundAmount: number | { toNumber: () => number };
  refundReason?: string | null;
  createdAt: Date;
  updatedAt: Date;
  booking?: Booking;
}

export interface ServiceTask {
  id: string;
  bookingId: string;
  type: string;
  title: string;
  description?: string | null;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: string;
  assignedTo?: string | null;
  dueDate?: Date | null;
  completedAt?: Date | null;
  metadata?: any | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface BookingWithRelations extends Booking {
  payment?: Payment[];
  serviceTier: ServiceTier & {
    service: Service;
  };
}

export interface PaymentWithBooking extends Payment {
  booking: BookingWithRelations;
}