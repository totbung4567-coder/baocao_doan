import { db } from '../db/database';
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
  DashboardStats,
} from '../../src/types';

// AUTH SERVICE
export const authService = {
  login: (username: string, password: string): { user: User; token: string } | null => {
    // For student project demo: check password '123456' or matching username
    const user = db.users.find(u => u.username === username);
    if (!user) return null;
    if (password !== '123456' && password !== 'admin' && password !== user.username) {
      return null;
    }
    return {
      user,
      token: `jwt_token_demo_${user._id}_${Date.now()}`,
    };
  },
  getUsers: () => db.users,
};

// ROOM SERVICE
export const roomService = {
  getAll: (floor?: number, status?: string) => {
    return db.rooms.filter(room => {
      if (floor && room.floor !== floor) return false;
      if (status && status !== 'all' && room.status !== status) return false;
      return true;
    });
  },
  getById: (id: string) => db.rooms.find(r => r._id === id),
  create: (roomData: Omit<Room, '_id'>) => {
    const newRoom: Room = {
      _id: `room_${Date.now()}`,
      ...roomData,
      currentTenantsCount: 0,
    };
    db.rooms.unshift(newRoom);
    return newRoom;
  },
  update: (id: string, updateData: Partial<Room>) => {
    const index = db.rooms.findIndex(r => r._id === id);
    if (index === -1) return null;
    db.rooms[index] = { ...db.rooms[index], ...updateData };
    return db.rooms[index];
  },
  delete: (id: string) => {
    const index = db.rooms.findIndex(r => r._id === id);
    if (index === -1) return false;
    db.rooms.splice(index, 1);
    return true;
  },
};

// TENANT SERVICE
export const tenantService = {
  getAll: (roomId?: string) => {
    if (roomId) {
      return db.tenants.filter(t => t.roomId === roomId);
    }
    return db.tenants;
  },
  getById: (id: string) => db.tenants.find(t => t._id === id),
  create: (tenantData: Omit<Tenant, '_id'>) => {
    const newTenant: Tenant = {
      _id: `tnt_${Date.now()}`,
      ...tenantData,
    };
    db.tenants.unshift(newTenant);

    // Update room occupancy
    const room = db.rooms.find(r => r._id === tenantData.roomId);
    if (room) {
      room.currentTenantsCount = (room.currentTenantsCount || 0) + 1;
      if (room.status === 'available') {
        room.status = 'rented';
      }
    }
    return newTenant;
  },
  update: (id: string, updateData: Partial<Tenant>) => {
    const index = db.tenants.findIndex(t => t._id === id);
    if (index === -1) return null;
    db.tenants[index] = { ...db.tenants[index], ...updateData };
    return db.tenants[index];
  },
  delete: (id: string) => {
    const index = db.tenants.findIndex(t => t._id === id);
    if (index === -1) return false;
    const tenant = db.tenants[index];
    const room = db.rooms.find(r => r._id === tenant.roomId);
    if (room && room.currentTenantsCount > 0) {
      room.currentTenantsCount -= 1;
      if (room.currentTenantsCount === 0) {
        room.status = 'available';
      }
    }
    db.tenants.splice(index, 1);
    return true;
  },
};

// CONTRACT SERVICE
export const contractService = {
  getAll: () => db.contracts,
  getById: (id: string) => db.contracts.find(c => c._id === id),
  create: (contractData: Omit<Contract, '_id' | 'createdAt'>) => {
    const newContract: Contract = {
      _id: `ct_${Date.now()}`,
      ...contractData,
      createdAt: new Date().toISOString().split('T')[0],
    };
    db.contracts.unshift(newContract);

    // Update room status to 'rented'
    const room = db.rooms.find(r => r._id === contractData.roomId);
    if (room) {
      room.status = 'rented';
    }
    return newContract;
  },
  update: (id: string, updateData: Partial<Contract>) => {
    const index = db.contracts.findIndex(c => c._id === id);
    if (index === -1) return null;
    db.contracts[index] = { ...db.contracts[index], ...updateData };

    const contract = db.contracts[index];
    if (contract.status === 'terminated') {
      const hasOtherActive = db.contracts.some(
        c => c._id !== id && c.roomId === contract.roomId && (c.status === 'active' || c.status === 'expiring')
      );
      if (!hasOtherActive) {
        const room = db.rooms.find(r => r._id === contract.roomId);
        if (room) {
          room.status = 'available';
        }
      }
    }
    return db.contracts[index];
  },
  delete: (id: string) => {
    const index = db.contracts.findIndex(c => c._id === id);
    if (index === -1) return false;
    db.contracts.splice(index, 1);
    return true;
  },
};

// UTILITIES SERVICE (ELECTRICITY & WATER)
export const utilityService = {
  getElectricity: (month?: string) => {
    if (month) return db.electricityReadings.filter(e => e.month === month);
    return db.electricityReadings;
  },
  getWater: (month?: string) => {
    if (month) return db.waterReadings.filter(w => w.month === month);
    return db.waterReadings;
  },
  recordElectricity: (data: Omit<ElectricityReading, '_id'>) => {
    const existingIndex = db.electricityReadings.findIndex(
      e => e.roomId === data.roomId && e.month === data.month
    );
    const consumption = Math.max(0, data.newIndex - data.oldIndex);
    const totalPrice = consumption * data.unitPrice;
    const reading: ElectricityReading = {
      _id: existingIndex >= 0 ? db.electricityReadings[existingIndex]._id : `elec_${Date.now()}`,
      ...data,
      consumption,
      totalPrice,
    };

    if (existingIndex >= 0) {
      db.electricityReadings[existingIndex] = reading;
    } else {
      db.electricityReadings.unshift(reading);
    }
    return reading;
  },
  recordWater: (data: Omit<WaterReading, '_id'>) => {
    const existingIndex = db.waterReadings.findIndex(
      w => w.roomId === data.roomId && w.month === data.month
    );
    const consumption = Math.max(0, data.newIndex - data.oldIndex);
    const totalPrice = data.calculationType === 'per_person' 
      ? (data.peopleCount || 1) * data.unitPrice
      : consumption * data.unitPrice;

    const reading: WaterReading = {
      _id: existingIndex >= 0 ? db.waterReadings[existingIndex]._id : `wat_${Date.now()}`,
      ...data,
      consumption,
      totalPrice,
    };

    if (existingIndex >= 0) {
      db.waterReadings[existingIndex] = reading;
    } else {
      db.waterReadings.unshift(reading);
    }
    return reading;
  },
};

// INVOICE SERVICE
export const invoiceService = {
  getAll: (month?: string, roomId?: string) => {
    return db.invoices.filter(inv => {
      if (month && inv.month !== month) return false;
      if (roomId && inv.roomId !== roomId) return false;
      return true;
    });
  },
  getById: (id: string) => db.invoices.find(i => i._id === id),
  create: (invoiceData: Omit<Invoice, '_id' | 'createdAt'>) => {
    const monthTag = (invoiceData.month || '').replace('/', '');
    const roomTag = (invoiceData.roomCode || '').replace('P.', '') || String(Date.now()).slice(-4);
    const newInvoice: Invoice = {
      _id: `inv_${Date.now()}`,
      ...invoiceData,
      invoiceCode: invoiceData.invoiceCode || `HD${monthTag}-${roomTag}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    db.invoices.unshift(newInvoice);
    return newInvoice;
  },
  update: (id: string, updateData: Partial<Invoice>) => {
    const index = db.invoices.findIndex(i => i._id === id);
    if (index === -1) return null;
    db.invoices[index] = { ...db.invoices[index], ...updateData };
    return db.invoices[index];
  },
  delete: (id: string) => {
    const index = db.invoices.findIndex(i => i._id === id);
    if (index === -1) return false;
    db.invoices.splice(index, 1);
    return true;
  },
};

// PAYMENT SERVICE
export const paymentService = {
  getAll: (invoiceId?: string) => {
    if (invoiceId) return db.payments.filter(p => p.invoiceId === invoiceId);
    return db.payments;
  },
  recordPayment: (paymentData: Omit<Payment, '_id'>) => {
    const newPayment: Payment = {
      _id: `pay_${Date.now()}`,
      ...paymentData,
    };
    db.payments.unshift(newPayment);

    // Update related invoice status
    const invoice = db.invoices.find(inv => inv._id === paymentData.invoiceId);
    if (invoice) {
      const newPaid = invoice.paidAmount + paymentData.amount;
      const newRemaining = Math.max(0, invoice.totalAmount - newPaid);
      invoice.paidAmount = newPaid;
      invoice.remainingAmount = newRemaining;
      if (newRemaining <= 0) {
        invoice.status = 'paid';
        invoice.paidDate = paymentData.paymentDate;
      } else {
        invoice.status = 'partially_paid';
      }
    }

    return newPayment;
  },
};

// NOTIFICATION SERVICE
export const notificationService = {
  getAll: (roomId?: string) => {
    if (roomId) {
      return db.notifications.filter(n => n.target === 'all' || n.targetRoomId === roomId);
    }
    return db.notifications;
  },
  create: (data: Omit<Notification, '_id' | 'createdAt'>) => {
    const newNotif: Notification = {
      _id: `notif_${Date.now()}`,
      ...data,
      createdAt: new Date().toLocaleString('vi-VN'),
    };
    db.notifications.unshift(newNotif);
    return newNotif;
  },
};

// MAINTENANCE SERVICE
export const maintenanceService = {
  getAll: (roomId?: string) => {
    if (roomId) return db.maintenanceRequests.filter(m => m.roomId === roomId);
    return db.maintenanceRequests;
  },
  create: (data: Omit<MaintenanceRequest, '_id' | 'createdAt'>) => {
    const newRequest: MaintenanceRequest = {
      _id: `mnt_${Date.now()}`,
      ...data,
      createdAt: new Date().toLocaleString('vi-VN'),
    };
    db.maintenanceRequests.unshift(newRequest);
    return newRequest;
  },
  updateStatus: (id: string, status: MaintenanceRequest['status'], adminNote?: string) => {
    const item = db.maintenanceRequests.find(m => m._id === id);
    if (!item) return null;
    item.status = status;
    if (adminNote) item.adminNote = adminNote;
    if (status === 'completed') {
      item.resolvedAt = new Date().toLocaleString('vi-VN');
    }
    return item;
  },
};

// STATS SERVICE
export const statsService = {
  getDashboardStats: (): DashboardStats => {
    const totalRooms = db.rooms.length;
    const rentedRooms = db.rooms.filter(r => r.status === 'rented').length;
    const availableRooms = db.rooms.filter(r => r.status === 'available').length;
    const maintenanceRooms = db.rooms.filter(r => r.status === 'maintenance').length;
    const occupancyRate = totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0;
    const totalTenants = db.tenants.filter(t => t.status === 'active').length;

    const unpaidInvoices = db.invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue' || i.status === 'partially_paid');
    const unpaidInvoicesCount = unpaidInvoices.length;
    const unpaidInvoicesAmount = unpaidInvoices.reduce((sum, i) => sum + i.remainingAmount, 0);

    const monthlyRevenue = db.invoices.reduce((sum, i) => sum + i.paidAmount, 0);
    const monthlyElectricityKwh = db.electricityReadings.reduce((sum, e) => sum + e.consumption, 0);
    const monthlyWaterM3 = db.waterReadings.reduce((sum, w) => sum + w.consumption, 0);
    const pendingMaintenanceCount = db.maintenanceRequests.filter(m => m.status === 'pending').length;

    return {
      totalRooms,
      rentedRooms,
      availableRooms,
      maintenanceRooms,
      occupancyRate,
      totalTenants,
      unpaidInvoicesCount,
      unpaidInvoicesAmount,
      monthlyRevenue,
      monthlyElectricityKwh,
      monthlyWaterM3,
      pendingMaintenanceCount,
    };
  },
};
