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
} from '../types';
import {
  initialUsers,
  initialRooms,
  initialTenants,
  initialContracts,
  initialElectricityReadings,
  initialWaterReadings,
  initialInvoices,
  initialPayments,
  initialNotifications,
  initialMaintenanceRequests,
  houseConfig,
} from '../data/mockData';

// Storage keys
const STORAGE_KEYS = {
  USER: 'tromange_current_user',
  ROOMS: 'tromange_rooms',
  TENANTS: 'tromange_tenants',
  CONTRACTS: 'tromange_contracts',
  ELECTRICITY: 'tromange_electricity',
  WATER: 'tromange_water',
  INVOICES: 'tromange_invoices',
  PAYMENTS: 'tromange_payments',
  NOTIFICATIONS: 'tromange_notifications',
  MAINTENANCE: 'tromange_maintenance',
};

function getLocal<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function setLocal<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('Storage save failed', e);
  }
}

// Client API that synchronizes with `/api` when available and uses localStorage for instant persistence
export const apiClient = {
  // Auth
  getCurrentUser: (): User => {
    return getLocal<User>(STORAGE_KEYS.USER, initialUsers[0]);
  },

  setCurrentUser: (user: User) => {
    setLocal(STORAGE_KEYS.USER, user);
  },

  login: async (username: string, password: string): Promise<{ success: boolean; user?: User; message?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data?.user) {
          apiClient.setCurrentUser(json.data.user);
          return { success: true, user: json.data.user };
        }
      }
    } catch {
      // Fallback
    }

    const localUsers = initialUsers;
    const found = localUsers.find(u => u.username === username);
    if (found && (password === '123456' || password === 'admin' || password === username)) {
      apiClient.setCurrentUser(found);
      return { success: true, user: found };
    }
    return { success: false, message: 'Sai tên đăng nhập hoặc mật khẩu (Mặc định: 123456)' };
  },

  logout: () => {
    apiClient.setCurrentUser(initialUsers[0]);
  },

  // Rooms
  getRooms: async (): Promise<Room[]> => {
    try {
      const res = await fetch('/api/rooms');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setLocal(STORAGE_KEYS.ROOMS, json.data);
          return json.data;
        }
      }
    } catch {}
    return getLocal<Room[]>(STORAGE_KEYS.ROOMS, initialRooms);
  },

  saveRoom: async (roomData: Partial<Room>): Promise<Room> => {
    const isEdit = Boolean(roomData._id);
    let result: Room;

    try {
      const url = isEdit ? `/api/rooms/${roomData._id}` : '/api/rooms';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(roomData),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          result = json.data;
        }
      }
    } catch {}

    const rooms = getLocal<Room[]>(STORAGE_KEYS.ROOMS, initialRooms);
    if (isEdit) {
      const idx = rooms.findIndex(r => r._id === roomData._id);
      if (idx !== -1) {
        rooms[idx] = { ...rooms[idx], ...roomData } as Room;
        result = rooms[idx];
      } else {
        result = roomData as Room;
      }
    } else {
      result = {
        _id: `room_${Date.now()}`,
        roomCode: roomData.roomCode || 'P.NEW',
        roomName: roomData.roomName || 'Phòng mới',
        floor: Number(roomData.floor) || 1,
        area: Number(roomData.area) || 20,
        price: Number(roomData.price) || 3000000,
        deposit: Number(roomData.deposit) || 3000000,
        maxTenants: Number(roomData.maxTenants) || 2,
        currentTenantsCount: 0,
        status: (roomData.status as any) || 'available',
        amenities: roomData.amenities || ['Máy lạnh', 'Nóng lạnh'],
        description: roomData.description || '',
      };
      rooms.unshift(result);
    }
    setLocal(STORAGE_KEYS.ROOMS, rooms);
    return result;
  },

  deleteRoom: async (roomId: string): Promise<boolean> => {
    try {
      await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' });
    } catch {}
    const rooms = getLocal<Room[]>(STORAGE_KEYS.ROOMS, initialRooms);
    const filtered = rooms.filter(r => r._id !== roomId);
    setLocal(STORAGE_KEYS.ROOMS, filtered);
    return true;
  },

  // Tenants
  getTenants: async (roomId?: string): Promise<Tenant[]> => {
    try {
      const url = roomId ? `/api/tenants?roomId=${roomId}` : '/api/tenants';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setLocal(STORAGE_KEYS.TENANTS, json.data);
          return json.data;
        }
      }
    } catch {}
    const list = getLocal<Tenant[]>(STORAGE_KEYS.TENANTS, initialTenants);
    return roomId ? list.filter(t => t.roomId === roomId) : list;
  },

  saveTenant: async (data: Partial<Tenant>): Promise<Tenant> => {
    const isEdit = Boolean(data._id);
    let result: Tenant;
    try {
      const url = isEdit ? `/api/tenants/${data._id}` : '/api/tenants';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) result = json.data;
      }
    } catch {}

    const tenants = getLocal<Tenant[]>(STORAGE_KEYS.TENANTS, initialTenants);
    if (isEdit) {
      const idx = tenants.findIndex(t => t._id === data._id);
      if (idx !== -1) {
        tenants[idx] = { ...tenants[idx], ...data } as Tenant;
        result = tenants[idx];
      } else {
        result = data as Tenant;
      }
    } else {
      result = {
        _id: `tnt_${Date.now()}`,
        fullName: data.fullName || '',
        phone: data.phone || '',
        idCard: data.idCard || '',
        email: data.email || '',
        birthYear: Number(data.birthYear) || 2000,
        gender: data.gender || 'Nam',
        hometown: data.hometown || '',
        roomId: data.roomId || '',
        roomCode: data.roomCode || '',
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        emergencyContact: data.emergencyContact || '',
        isRepresentative: Boolean(data.isRepresentative),
        status: data.status || 'active',
        notes: data.notes || '',
      };
      tenants.unshift(result);

      // Update room occupancy
      const rooms = getLocal<Room[]>(STORAGE_KEYS.ROOMS, initialRooms);
      const targetRoom = rooms.find(r => r._id === result.roomId);
      if (targetRoom) {
        targetRoom.currentTenantsCount += 1;
        if (targetRoom.status === 'available') targetRoom.status = 'rented';
        setLocal(STORAGE_KEYS.ROOMS, rooms);
      }
    }
    setLocal(STORAGE_KEYS.TENANTS, tenants);
    return result;
  },

  deleteTenant: async (tenantId: string): Promise<boolean> => {
    try {
      await fetch(`/api/tenants/${tenantId}`, { method: 'DELETE' });
    } catch {}
    const tenants = getLocal<Tenant[]>(STORAGE_KEYS.TENANTS, initialTenants);
    const target = tenants.find(t => t._id === tenantId);
    if (target) {
      const rooms = getLocal<Room[]>(STORAGE_KEYS.ROOMS, initialRooms);
      const room = rooms.find(r => r._id === target.roomId);
      if (room && room.currentTenantsCount > 0) {
        room.currentTenantsCount -= 1;
        if (room.currentTenantsCount === 0) room.status = 'available';
        setLocal(STORAGE_KEYS.ROOMS, rooms);
      }
    }
    const filtered = tenants.filter(t => t._id !== tenantId);
    setLocal(STORAGE_KEYS.TENANTS, filtered);
    return true;
  },

  // Contracts
  getContracts: async (): Promise<Contract[]> => {
    try {
      const res = await fetch('/api/contracts');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setLocal(STORAGE_KEYS.CONTRACTS, json.data);
          return json.data;
        }
      }
    } catch {}
    return getLocal<Contract[]>(STORAGE_KEYS.CONTRACTS, initialContracts);
  },

  saveContract: async (data: Partial<Contract>): Promise<Contract> => {
    const isEdit = Boolean(data._id);
    let result: Contract;
    try {
      const url = isEdit ? `/api/contracts/${data._id}` : '/api/contracts';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) result = json.data;
      }
    } catch {}

    const contracts = getLocal<Contract[]>(STORAGE_KEYS.CONTRACTS, initialContracts);
    if (isEdit) {
      const idx = contracts.findIndex(c => c._id === data._id);
      if (idx !== -1) {
        contracts[idx] = { ...contracts[idx], ...data } as Contract;
        result = contracts[idx];
      } else {
        result = data as Contract;
      }
    } else {
      result = {
        _id: `ct_${Date.now()}`,
        contractCode: data.contractCode || `HD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
        signingDate: data.signingDate || new Date().toISOString().split('T')[0],
        roomId: data.roomId || '',
        roomCode: data.roomCode || '',
        roomName: data.roomName || '',
        roomArea: data.roomArea || 25,
        representativeTenantId: data.representativeTenantId || '',
        representativeTenantName: data.representativeTenantName || '',
        tenantPhone: data.tenantPhone || '',
        tenantIdCard: data.tenantIdCard || '',
        tenantAddress: data.tenantAddress || '',
        tenantEmail: data.tenantEmail || '',
        tenantBirthYear: data.tenantBirthYear,
        landlordName: data.landlordName || houseConfig.landlordName,
        landlordPhone: data.landlordPhone || houseConfig.landlordPhone,
        landlordIdCard: data.landlordIdCard || '001085012345',
        landlordAddress: data.landlordAddress || houseConfig.address,
        startDate: data.startDate || new Date().toISOString().split('T')[0],
        endDate: data.endDate || '',
        rentalTermMonths: data.rentalTermMonths || 12,
        depositAmount: Number(data.depositAmount) || 0,
        rentalPrice: Number(data.rentalPrice) || 0,
        billingCycleDays: 30,
        paymentDay: data.paymentDay || 5,
        paymentMethod: data.paymentMethod || 'Chuyển khoản / Tiền mặt',
        paymentDueDays: data.paymentDueDays || 5,
        latePaymentNote: data.latePaymentNote || 'Thanh toán chậm quá 5 ngày sẽ bị tính phí nhắc nhở hoặc tạm ngừng dịch vụ.',
        electricityType: data.electricityType || 'per_kwh',
        electricityUnitPrice: Number(data.electricityUnitPrice) || houseConfig.defaultElectricityPrice,
        electricityInitialIndex: data.electricityInitialIndex !== undefined ? Number(data.electricityInitialIndex) : 0,
        electricityNote: data.electricityNote || 'Tính theo chỉ số kWh công tơ thực tế hàng tháng.',
        waterType: data.waterType || 'per_m3',
        waterUnitPrice: Number(data.waterUnitPrice) || houseConfig.defaultWaterPrice,
        waterInitialIndex: data.waterInitialIndex !== undefined ? Number(data.waterInitialIndex) : 0,
        waterNote: data.waterNote || 'Tính theo khối lượng m3 tiêu thụ thực tế.',
        extraFees: data.extraFees || [],
        handedOverAssets: data.handedOverAssets || [],
        termsGroup: data.termsGroup,
        terms: data.terms || 'Thanh toán tiền phòng đầu mỗi tháng từ ngày 1-5.',
        status: data.status || 'active',
        createdAt: new Date().toISOString().split('T')[0],
        terminatedAt: data.terminatedAt,
        terminationReason: data.terminationReason,
      };
      contracts.unshift(result);
    }
    setLocal(STORAGE_KEYS.CONTRACTS, contracts);

    // Sync room status in localStorage
    const rooms = getLocal<Room[]>(STORAGE_KEYS.ROOMS, initialRooms);
    const targetRoom = rooms.find(r => r._id === result.roomId);
    if (targetRoom) {
      if (!isEdit && result.status === 'active') {
        targetRoom.status = 'rented';
      } else if (result.status === 'terminated') {
        const hasOtherActive = contracts.some(
          c => c._id !== result._id && c.roomId === result.roomId && (c.status === 'active' || c.status === 'expiring')
        );
        if (!hasOtherActive) {
          targetRoom.status = 'available';
        }
      }
      setLocal(STORAGE_KEYS.ROOMS, rooms);
    }

    return result;
  },

  terminateContract: async (contractId: string, reason?: string): Promise<Contract | null> => {
    const contracts = getLocal<Contract[]>(STORAGE_KEYS.CONTRACTS, initialContracts);
    const contract = contracts.find(c => c._id === contractId);
    if (!contract) return null;

    const updatedData: Partial<Contract> = {
      _id: contractId,
      status: 'terminated',
      terminatedAt: new Date().toISOString().split('T')[0],
      terminationReason: reason || 'Thanh lý hợp đồng theo thỏa thuận',
    };

    return await apiClient.saveContract(updatedData);
  },

  deleteContract: async (contractId: string): Promise<boolean> => {
    try {
      await fetch(`/api/contracts/${contractId}`, { method: 'DELETE' });
    } catch {}
    const contracts = getLocal<Contract[]>(STORAGE_KEYS.CONTRACTS, initialContracts);
    setLocal(STORAGE_KEYS.CONTRACTS, contracts.filter(c => c._id !== contractId));
    return true;
  },

  // Utilities
  getElectricityReadings: async (month?: string): Promise<ElectricityReading[]> => {
    try {
      const url = month ? `/api/utilities/electricity?month=${month}` : '/api/utilities/electricity';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch {}
    const readings = getLocal<ElectricityReading[]>(STORAGE_KEYS.ELECTRICITY, initialElectricityReadings);
    return month ? readings.filter(r => r.month === month) : readings;
  },

  saveElectricityReading: async (data: Omit<ElectricityReading, '_id' | 'consumption' | 'totalPrice'>): Promise<ElectricityReading> => {
    const consumption = Math.max(0, data.newIndex - data.oldIndex);
    const totalPrice = consumption * data.unitPrice;
    const readings = getLocal<ElectricityReading[]>(STORAGE_KEYS.ELECTRICITY, initialElectricityReadings);
    const existingIndex = readings.findIndex(r => r.roomId === data.roomId && r.month === data.month);

    const record: ElectricityReading = {
      _id: existingIndex >= 0 ? readings[existingIndex]._id : `elec_${Date.now()}`,
      ...data,
      consumption,
      totalPrice,
    };

    if (existingIndex >= 0) {
      readings[existingIndex] = record;
    } else {
      readings.unshift(record);
    }
    setLocal(STORAGE_KEYS.ELECTRICITY, readings);

    try {
      await fetch('/api/utilities/electricity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
    } catch {}

    return record;
  },

  getWaterReadings: async (month?: string): Promise<WaterReading[]> => {
    try {
      const url = month ? `/api/utilities/water?month=${month}` : '/api/utilities/water';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch {}
    const readings = getLocal<WaterReading[]>(STORAGE_KEYS.WATER, initialWaterReadings);
    return month ? readings.filter(r => r.month === month) : readings;
  },

  saveWaterReading: async (data: Omit<WaterReading, '_id' | 'consumption' | 'totalPrice'>): Promise<WaterReading> => {
    const consumption = Math.max(0, data.newIndex - data.oldIndex);
    const totalPrice = data.calculationType === 'per_person' 
      ? (data.peopleCount || 1) * data.unitPrice
      : consumption * data.unitPrice;

    const readings = getLocal<WaterReading[]>(STORAGE_KEYS.WATER, initialWaterReadings);
    const existingIndex = readings.findIndex(r => r.roomId === data.roomId && r.month === data.month);

    const record: WaterReading = {
      _id: existingIndex >= 0 ? readings[existingIndex]._id : `wat_${Date.now()}`,
      ...data,
      consumption,
      totalPrice,
    };

    if (existingIndex >= 0) {
      readings[existingIndex] = record;
    } else {
      readings.unshift(record);
    }
    setLocal(STORAGE_KEYS.WATER, readings);

    try {
      await fetch('/api/utilities/water', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(record),
      });
    } catch {}

    return record;
  },

  // Invoices
  getInvoices: async (month?: string, roomId?: string): Promise<Invoice[]> => {
    try {
      let url = '/api/invoices';
      const params = new URLSearchParams();
      if (month) params.append('month', month);
      if (roomId) params.append('roomId', roomId);
      if (params.toString()) url += `?${params.toString()}`;

      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setLocal(STORAGE_KEYS.INVOICES, json.data);
          return json.data;
        }
      }
    } catch {}

    const invoices = getLocal<Invoice[]>(STORAGE_KEYS.INVOICES, initialInvoices);
    return invoices.filter(inv => {
      if (month && inv.month !== month) return false;
      if (roomId && inv.roomId !== roomId) return false;
      return true;
    });
  },

  saveInvoice: async (data: Partial<Invoice>): Promise<Invoice> => {
    const isEdit = Boolean(data._id);
    let result: Invoice;
    try {
      const url = isEdit ? `/api/invoices/${data._id}` : '/api/invoices';
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) result = json.data;
      }
    } catch {}

    const invoices = getLocal<Invoice[]>(STORAGE_KEYS.INVOICES, initialInvoices);
    const roomFee = Number(data.roomFee) || 0;
    const electricityFee = Number(data.electricityFee) || 0;
    const waterFee = Number(data.waterFee) || 0;
    const internetFee = Number(data.internetFee) || 0;
    const garbageFee = Number(data.garbageFee) || 0;
    const parkingFee = Number(data.parkingFee) || 0;
    const otherFee = Number(data.otherFee) || 0;
    const discount = Number(data.discount) || 0;
    const totalAmount = roomFee + electricityFee + waterFee + internetFee + garbageFee + parkingFee + otherFee - discount;
    const paidAmount = Number(data.paidAmount) || 0;
    const remainingAmount = Math.max(0, totalAmount - paidAmount);

    let status = data.status || 'unpaid';
    if (remainingAmount <= 0) status = 'paid';
    else if (paidAmount > 0) status = 'partially_paid';

    if (isEdit) {
      const idx = invoices.findIndex(i => i._id === data._id);
      if (idx !== -1) {
        invoices[idx] = {
          ...invoices[idx],
          ...data,
          totalAmount,
          remainingAmount,
          status,
        } as Invoice;
        result = invoices[idx];
      } else {
        result = data as Invoice;
      }
    } else {
      result = {
        _id: `inv_${Date.now()}`,
        invoiceCode: data.invoiceCode || `HD${data.month?.replace('/', '') || '0926'}-${data.roomCode?.replace('P.', '') || '101'}`,
        month: data.month || '09/2026',
        roomId: data.roomId || '',
        roomCode: data.roomCode || '',
        tenantName: data.tenantName || '',
        tenantPhone: data.tenantPhone || '',
        roomFee,
        electricityFee,
        electricityUsage: Number(data.electricityUsage) || 0,
        electricityOld: Number(data.electricityOld) || 0,
        electricityNew: Number(data.electricityNew) || 0,
        waterFee,
        waterUsage: Number(data.waterUsage) || 0,
        waterOld: Number(data.waterOld) || 0,
        waterNew: Number(data.waterNew) || 0,
        internetFee,
        garbageFee,
        parkingFee,
        otherFee,
        discount,
        totalAmount,
        paidAmount,
        remainingAmount,
        dueDate: data.dueDate || '2026-10-05',
        status,
        notes: data.notes || '',
        createdAt: new Date().toISOString().split('T')[0],
      };
      invoices.unshift(result);
    }
    setLocal(STORAGE_KEYS.INVOICES, invoices);
    return result;
  },

  deleteInvoice: async (id: string): Promise<boolean> => {
    try {
      await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
    } catch {}
    const invoices = getLocal<Invoice[]>(STORAGE_KEYS.INVOICES, initialInvoices);
    setLocal(STORAGE_KEYS.INVOICES, invoices.filter(i => i._id !== id));
    return true;
  },

  // Payments
  getPayments: async (invoiceId?: string): Promise<Payment[]> => {
    try {
      const url = invoiceId ? `/api/payments?invoiceId=${invoiceId}` : '/api/payments';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setLocal(STORAGE_KEYS.PAYMENTS, json.data);
          return json.data;
        }
      }
    } catch {}
    const payments = getLocal<Payment[]>(STORAGE_KEYS.PAYMENTS, initialPayments);
    return invoiceId ? payments.filter(p => p.invoiceId === invoiceId) : payments;
  },

  recordPayment: async (data: Omit<Payment, '_id'>): Promise<Payment> => {
    const payment: Payment = {
      _id: `pay_${Date.now()}`,
      ...data,
      paymentDate: data.paymentDate || new Date().toLocaleString('vi-VN'),
    };

    const payments = getLocal<Payment[]>(STORAGE_KEYS.PAYMENTS, initialPayments);
    payments.unshift(payment);
    setLocal(STORAGE_KEYS.PAYMENTS, payments);

    // Update invoice
    const invoices = getLocal<Invoice[]>(STORAGE_KEYS.INVOICES, initialInvoices);
    const invoice = invoices.find(inv => inv._id === data.invoiceId);
    if (invoice) {
      invoice.paidAmount = invoice.paidAmount + data.amount;
      invoice.remainingAmount = Math.max(0, invoice.totalAmount - invoice.paidAmount);
      if (invoice.remainingAmount <= 0) {
        invoice.status = 'paid';
        invoice.paidDate = new Date().toISOString().split('T')[0];
      } else {
        invoice.status = 'partially_paid';
      }
      setLocal(STORAGE_KEYS.INVOICES, invoices);
    }

    try {
      await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payment),
      });
    } catch {}

    return payment;
  },

  // Notifications
  getNotifications: async (roomId?: string): Promise<Notification[]> => {
    try {
      const url = roomId ? `/api/notifications?roomId=${roomId}` : '/api/notifications';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setLocal(STORAGE_KEYS.NOTIFICATIONS, json.data);
          return json.data;
        }
      }
    } catch {}
    const notifs = getLocal<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    return roomId ? notifs.filter(n => n.target === 'all' || n.targetRoomId === roomId) : notifs;
  },

  createNotification: async (data: Omit<Notification, '_id' | 'createdAt'>): Promise<Notification> => {
    const notif: Notification = {
      _id: `notif_${Date.now()}`,
      ...data,
      createdAt: new Date().toLocaleString('vi-VN'),
      isRead: false,
    };
    const list = getLocal<Notification[]>(STORAGE_KEYS.NOTIFICATIONS, initialNotifications);
    list.unshift(notif);
    setLocal(STORAGE_KEYS.NOTIFICATIONS, list);

    try {
      await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(notif),
      });
    } catch {}

    return notif;
  },

  // Maintenance Requests
  getMaintenanceRequests: async (roomId?: string): Promise<MaintenanceRequest[]> => {
    try {
      const url = roomId ? `/api/maintenance?roomId=${roomId}` : '/api/maintenance';
      const res = await fetch(url);
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setLocal(STORAGE_KEYS.MAINTENANCE, json.data);
          return json.data;
        }
      }
    } catch {}
    const list = getLocal<MaintenanceRequest[]>(STORAGE_KEYS.MAINTENANCE, initialMaintenanceRequests);
    return roomId ? list.filter(m => m.roomId === roomId) : list;
  },

  createMaintenanceRequest: async (data: Omit<MaintenanceRequest, '_id' | 'createdAt'>): Promise<MaintenanceRequest> => {
    const item: MaintenanceRequest = {
      _id: `mnt_${Date.now()}`,
      ...data,
      createdAt: new Date().toLocaleString('vi-VN'),
    };
    const list = getLocal<MaintenanceRequest[]>(STORAGE_KEYS.MAINTENANCE, initialMaintenanceRequests);
    list.unshift(item);
    setLocal(STORAGE_KEYS.MAINTENANCE, list);

    try {
      await fetch('/api/maintenance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
    } catch {}

    return item;
  },

  updateMaintenanceStatus: async (id: string, status: MaintenanceRequest['status'], adminNote?: string): Promise<MaintenanceRequest | null> => {
    const list = getLocal<MaintenanceRequest[]>(STORAGE_KEYS.MAINTENANCE, initialMaintenanceRequests);
    const item = list.find(m => m._id === id);
    if (!item) return null;
    item.status = status;
    if (adminNote !== undefined) item.adminNote = adminNote;
    if (status === 'completed') item.resolvedAt = new Date().toLocaleString('vi-VN');
    setLocal(STORAGE_KEYS.MAINTENANCE, list);

    try {
      await fetch(`/api/maintenance/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, adminNote }),
      });
    } catch {}

    return item;
  },

  // Dashboard Stats
  getDashboardStats: async (): Promise<DashboardStats> => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) return json.data;
      }
    } catch {}

    const rooms = getLocal<Room[]>(STORAGE_KEYS.ROOMS, initialRooms);
    const tenants = getLocal<Tenant[]>(STORAGE_KEYS.TENANTS, initialTenants);
    const invoices = getLocal<Invoice[]>(STORAGE_KEYS.INVOICES, initialInvoices);
    const electricity = getLocal<ElectricityReading[]>(STORAGE_KEYS.ELECTRICITY, initialElectricityReadings);
    const water = getLocal<WaterReading[]>(STORAGE_KEYS.WATER, initialWaterReadings);
    const maintenance = getLocal<MaintenanceRequest[]>(STORAGE_KEYS.MAINTENANCE, initialMaintenanceRequests);

    const totalRooms = rooms.length;
    const rentedRooms = rooms.filter(r => r.status === 'rented').length;
    const availableRooms = rooms.filter(r => r.status === 'available').length;
    const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
    const occupancyRate = totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0;
    const totalTenants = tenants.filter(t => t.status === 'active').length;

    const unpaidInvoices = invoices.filter(i => i.status === 'unpaid' || i.status === 'overdue' || i.status === 'partially_paid');
    const unpaidInvoicesCount = unpaidInvoices.length;
    const unpaidInvoicesAmount = unpaidInvoices.reduce((sum, i) => sum + i.remainingAmount, 0);

    const monthlyRevenue = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
    const monthlyElectricityKwh = electricity.reduce((sum, e) => sum + e.consumption, 0);
    const monthlyWaterM3 = water.reduce((sum, w) => sum + w.consumption, 0);
    const pendingMaintenanceCount = maintenance.filter(m => m.status === 'pending').length;

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

  // Reset to sample initial state
  resetAllData: () => {
    localStorage.removeItem(STORAGE_KEYS.ROOMS);
    localStorage.removeItem(STORAGE_KEYS.TENANTS);
    localStorage.removeItem(STORAGE_KEYS.CONTRACTS);
    localStorage.removeItem(STORAGE_KEYS.ELECTRICITY);
    localStorage.removeItem(STORAGE_KEYS.WATER);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.PAYMENTS);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.MAINTENANCE);
    localStorage.removeItem(STORAGE_KEYS.USER);
    window.location.reload();
  },

  houseConfig,
};
