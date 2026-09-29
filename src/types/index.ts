export type UserRole = 'admin' | 'tenant';

export interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  phone: string;
  role: UserRole;
  roomId?: string;
  roomCode?: string;
  tenantId?: string;
  avatar?: string;
}

export type RoomStatus = 'available' | 'rented' | 'maintenance';

export interface Room {
  _id: string;
  roomCode: string;
  roomName: string;
  floor: number;
  area: number; // m2
  price: number; // VNĐ
  deposit: number; // Tiền cọc mặc định
  maxTenants: number;
  currentTenantsCount: number;
  status: RoomStatus;
  amenities: string[];
  description: string;
  images?: string[];
}

export type TenantStatus = 'active' | 'temporary_registered' | 'moved_out';

export interface Tenant {
  _id: string;
  fullName: string;
  phone: string;
  idCard: string; // CCCD
  email: string;
  birthYear: number;
  gender: 'Nam' | 'Nữ' | 'Khác';
  hometown: string;
  roomId: string;
  roomCode: string;
  startDate: string;
  emergencyContact: string;
  isRepresentative: boolean;
  status: TenantStatus;
  notes?: string;
}

export type ContractStatus = 'active' | 'expiring' | 'expired' | 'terminated';

export interface ContractFeeItem {
  id: string;
  name: string;
  amount: number;
  unit: string;
  cycle: string;
  note?: string;
}

export interface ContractAssetItem {
  id: string;
  name: string;
  quantity: number;
  condition: string;
  note?: string;
}

export interface ContractTermsGroup {
  rentalTerm: string;          // Thời hạn thuê
  rentalPriceAndFees: string;  // Giá thuê và chi phí
  utilities: string;           // Điện, nước và dịch vụ
  deposit: string;             // Tiền đặt cọc
  landlordObligations: string; // Quyền và nghĩa vụ bên cho thuê
  tenantObligations: string;   // Quyền và nghĩa vụ bên thuê
  roomUsageRules: string;      // Quy định sử dụng phòng
  guestsRules: string;         // Quy định về khách và người ở cùng
  assetMaintenance: string;    // Bảo quản tài sản
  earlyTermination: string;    // Chấm dứt hợp đồng trước hạn
  depositRefund: string;       // Hoàn trả tiền đặt cọc
  generalTerms: string;        // Điều khoản chung
}

export interface Contract {
  _id: string;
  contractCode: string;
  signingDate: string; // Ngày lập hợp đồng (YYYY-MM-DD)
  startDate: string;   // Ngày bắt đầu
  endDate: string;     // Ngày kết thúc
  rentalTermMonths: number; // Thời hạn thuê (tháng)
  
  // Thông tin phòng
  roomId: string;
  roomCode: string;
  roomName?: string;
  roomArea?: number;
  
  // Thông tin bên thuê (Bên B)
  representativeTenantId: string;
  representativeTenantName: string;
  tenantPhone: string;
  tenantIdCard?: string;
  tenantAddress?: string;
  tenantEmail?: string;
  tenantBirthYear?: number;
  
  // Thông tin bên cho thuê (Bên A)
  landlordName: string;
  landlordPhone: string;
  landlordIdCard?: string;
  landlordAddress?: string;
  
  // Giá thuê và tiền đặt cọc
  rentalPrice: number;
  depositAmount: number;
  billingCycleDays: number;
  paymentDay: number; // Ngày thanh toán hàng tháng
  paymentMethod: string; // Phương thức thanh toán
  paymentDueDays: number; // Hạn thanh toán
  latePaymentNote?: string;
  
  // Điện & Nước
  electricityType: 'per_kwh' | 'fixed';
  electricityUnitPrice: number; // VNĐ/kWh
  electricityInitialIndex?: number;
  electricityNote?: string;
  
  waterType: 'per_m3' | 'per_person' | 'fixed';
  waterUnitPrice: number; // VNĐ/m3 hoặc VNĐ/người
  waterInitialIndex?: number;
  waterNote?: string;
  
  // Các khoản phí dịch vụ khác
  extraFees: ContractFeeItem[];
  
  // Danh mục tài sản bàn giao
  handedOverAssets: ContractAssetItem[];
  
  // Các nhóm điều khoản chi tiết
  termsGroup?: ContractTermsGroup;
  
  // Text điều khoản tổng hợp (tương thích ngược)
  terms: string;
  
  status: ContractStatus;
  createdAt: string;
  terminatedAt?: string;
  terminationReason?: string;
}

export interface ElectricityReading {
  _id: string;
  month: string; // MM/YYYY
  roomId: string;
  roomCode: string;
  oldIndex: number;
  newIndex: number;
  consumption: number;
  unitPrice: number; // VNĐ/kWh
  totalPrice: number;
  recordedDate: string;
  status: 'draft' | 'finalized';
}

export interface WaterReading {
  _id: string;
  month: string; // MM/YYYY
  roomId: string;
  roomCode: string;
  calculationType: 'per_m3' | 'per_person';
  oldIndex: number;
  newIndex: number;
  consumption: number;
  unitPrice: number; // VNĐ/m3 hoặc VNĐ/người
  peopleCount?: number;
  totalPrice: number;
  recordedDate: string;
  status: 'draft' | 'finalized';
}

export type InvoiceStatus = 'unpaid' | 'paid' | 'partially_paid' | 'overdue';

export interface Invoice {
  _id: string;
  invoiceCode: string;
  month: string; // MM/YYYY
  roomId: string;
  roomCode: string;
  tenantName: string;
  tenantPhone: string;
  roomFee: number;
  electricityFee: number;
  electricityUsage: number;
  electricityOld: number;
  electricityNew: number;
  waterFee: number;
  waterUsage: number;
  waterOld: number;
  waterNew: number;
  internetFee: number;
  garbageFee: number;
  parkingFee: number;
  otherFee: number;
  discount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: InvoiceStatus;
  notes?: string;
  createdAt: string;
  paidDate?: string;
}

export type PaymentMethod = 'cash' | 'bank_transfer' | 'momo';

export interface Payment {
  _id: string;
  paymentCode: string;
  invoiceId: string;
  invoiceCode: string;
  roomId: string;
  roomCode: string;
  tenantName: string;
  amount: number;
  paymentMethod: PaymentMethod;
  transactionRef?: string;
  paymentDate: string;
  recordedBy: string;
  notes?: string;
}

export type NotificationType = 'general' | 'fee_reminder' | 'maintenance' | 'urgent';

export interface Notification {
  _id: string;
  title: string;
  content: string;
  type: NotificationType;
  target: 'all' | 'specific_room';
  targetRoomId?: string;
  targetRoomCode?: string;
  createdAt: string;
  authorName: string;
  isRead?: boolean;
}

export type MaintenancePriority = 'low' | 'medium' | 'high';
export type MaintenanceStatus = 'pending' | 'in_progress' | 'completed';

export interface MaintenanceRequest {
  _id: string;
  roomId: string;
  roomCode: string;
  tenantName: string;
  tenantPhone: string;
  title: string;
  description: string;
  priority: MaintenancePriority;
  status: MaintenanceStatus;
  createdAt: string;
  resolvedAt?: string;
  adminNote?: string;
}

export interface DashboardStats {
  totalRooms: number;
  rentedRooms: number;
  availableRooms: number;
  maintenanceRooms: number;
  occupancyRate: number;
  totalTenants: number;
  unpaidInvoicesCount: number;
  unpaidInvoicesAmount: number;
  monthlyRevenue: number;
  monthlyElectricityKwh: number;
  monthlyWaterM3: number;
  pendingMaintenanceCount: number;
}
