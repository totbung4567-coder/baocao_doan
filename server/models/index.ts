/**
 * MongoDB Model Schemas & In-Memory Document Definitions
 * Phục vụ đồ án môn học: Cấu trúc các Collection trong MongoDB
 */

import {
  User,
  Room,
  Tenant,
  Contract,
  ElectricityReading,
  WaterReading,
  Invoice,
  Payment,
  Notification,
  MaintenanceRequest,
} from '../../src/types';

export interface DatabaseSchema {
  users: User[];
  rooms: Room[];
  tenants: Tenant[];
  contracts: Contract[];
  electricityReadings: ElectricityReading[];
  waterReadings: WaterReading[];
  invoices: Invoice[];
  payments: Payment[];
  notifications: Notification[];
  maintenanceRequests: MaintenanceRequest[];
}

/**
 * MongoDB Collection Schemas documentation for Report / Presentation:
 * 
 * 1. Users Collection:
 *    _id: ObjectId
 *    username: String (unique)
 *    password: String (hashed)
 *    fullName: String
 *    email: String
 *    phone: String
 *    role: 'admin' | 'tenant'
 *    roomId: ObjectId (ref: Rooms, optional)
 *    tenantId: ObjectId (ref: Tenants, optional)
 * 
 * 2. Rooms Collection:
 *    _id: ObjectId
 *    roomCode: String (unique, index)
 *    roomName: String
 *    floor: Number
 *    area: Number (m2)
 *    price: Number (VNĐ)
 *    deposit: Number (VNĐ)
 *    maxTenants: Number
 *    currentTenantsCount: Number
 *    status: 'available' | 'rented' | 'maintenance'
 *    amenities: [String]
 *    description: String
 * 
 * 3. Tenants Collection:
 *    _id: ObjectId
 *    fullName: String
 *    phone: String (index)
 *    idCard: String (CCCD/CMND)
 *    email: String
 *    birthYear: Number
 *    gender: 'Nam' | 'Nữ' | 'Khác'
 *    hometown: String
 *    roomId: ObjectId (ref: Rooms)
 *    roomCode: String
 *    startDate: Date
 *    emergencyContact: String
 *    isRepresentative: Boolean
 *    status: 'active' | 'temporary_registered' | 'moved_out'
 * 
 * 4. Contracts Collection:
 *    _id: ObjectId
 *    contractCode: String (unique)
 *    signingDate: Date (Ngày lập hợp đồng)
 *    startDate: Date (Ngày bắt đầu thuê)
 *    endDate: Date (Ngày kết thúc thuê)
 *    rentalTermMonths: Number (Thời hạn thuê tính theo tháng)
 *    roomId: ObjectId (ref: Rooms)
 *    roomCode: String
 *    representativeTenantId: ObjectId (ref: Tenants)
 *    representativeTenantName: String
 *    tenantPhone: String
 *    tenantIdCard: String (CCCD/CMND)
 *    tenantAddress: String (Quê quán/địa chỉ thường trú)
 *    landlordName: String
 *    landlordPhone: String
 *    landlordAddress: String
 *    rentalPrice: Number (VNĐ/tháng)
 *    depositAmount: Number (VNĐ)
 *    billingCycleDays: Number
 *    paymentDay: Number (Ngày đóng tiền hàng tháng)
 *    paymentMethod: String
 *    paymentDueDays: Number
 *    electricityType: 'per_kwh' | 'fixed'
 *    electricityUnitPrice: Number (VNĐ/kWh)
 *    waterType: 'per_m3' | 'per_person' | 'fixed'
 *    waterUnitPrice: Number (VNĐ/m3 hoặc VNĐ/người)
 *    extraFees: Array [{ name, amount, unit, cycle, note }]
 *    handedOverAssets: Array [{ name, quantity, condition, note }]
 *    termsGroup: Object (12 nhóm điều khoản thuê phòng trọ chi tiết)
 *    terms: String (Nội dung điều khoản tổng hợp)
 *    status: 'active' | 'expiring' | 'expired' | 'terminated'
 *    createdAt: Date
 *    terminatedAt: Date (optional)
 *    terminationReason: String (optional)
 * 
 * 5. ElectricityReadings Collection:
 *    _id: ObjectId
 *    month: String (MM/YYYY)
 *    roomId: ObjectId (ref: Rooms)
 *    roomCode: String
 *    oldIndex: Number
 *    newIndex: Number
 *    consumption: Number
 *    unitPrice: Number
 *    totalPrice: Number
 *    recordedDate: Date
 *    status: 'draft' | 'finalized'
 * 
 * 6. WaterReadings Collection:
 *    _id: ObjectId
 *    month: String (MM/YYYY)
 *    roomId: ObjectId (ref: Rooms)
 *    roomCode: String
 *    oldIndex: Number
 *    newIndex: Number
 *    consumption: Number
 *    unitPrice: Number
 *    totalPrice: Number
 *    recordedDate: Date
 *    status: 'draft' | 'finalized'
 * 
 * 7. Invoices Collection:
 *    _id: ObjectId
 *    invoiceCode: String (unique)
 *    month: String (MM/YYYY)
 *    roomId: ObjectId (ref: Rooms)
 *    tenantName: String
 *    roomFee: Number
 *    electricityFee: Number
 *    waterFee: Number
 *    internetFee: Number
 *    garbageFee: Number
 *    parkingFee: Number
 *    discount: Number
 *    totalAmount: Number
 *    paidAmount: Number
 *    remainingAmount: Number
 *    dueDate: Date
 *    status: 'unpaid' | 'paid' | 'overdue' | 'partially_paid'
 * 
 * 8. Payments Collection:
 *    _id: ObjectId
 *    paymentCode: String (unique)
 *    invoiceId: ObjectId (ref: Invoices)
 *    amount: Number
 *    paymentMethod: 'cash' | 'bank_transfer' | 'momo'
 *    paymentDate: Date
 *    recordedBy: String
 * 
 * 9. Notifications Collection:
 *    _id: ObjectId
 *    title: String
 *    content: String
 *    type: 'general' | 'fee_reminder' | 'maintenance' | 'urgent'
 *    target: 'all' | 'specific_room'
 *    targetRoomId: ObjectId (optional)
 *    createdAt: Date
 */
