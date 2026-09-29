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
} from '../../src/data/mockData';
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

class Database {
  users: User[] = [...initialUsers];
  rooms: Room[] = [...initialRooms];
  tenants: Tenant[] = [...initialTenants];
  contracts: Contract[] = [...initialContracts];
  electricityReadings: ElectricityReading[] = [...initialElectricityReadings];
  waterReadings: WaterReading[] = [...initialWaterReadings];
  invoices: Invoice[] = [...initialInvoices];
  payments: Payment[] = [...initialPayments];
  notifications: Notification[] = [...initialNotifications];
  maintenanceRequests: MaintenanceRequest[] = [...initialMaintenanceRequests];

  resetToDefault() {
    this.users = [...initialUsers];
    this.rooms = [...initialRooms];
    this.tenants = [...initialTenants];
    this.contracts = [...initialContracts];
    this.electricityReadings = [...initialElectricityReadings];
    this.waterReadings = [...initialWaterReadings];
    this.invoices = [...initialInvoices];
    this.payments = [...initialPayments];
    this.notifications = [...initialNotifications];
    this.maintenanceRequests = [...initialMaintenanceRequests];
  }
}

export const db = new Database();
