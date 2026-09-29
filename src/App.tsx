/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  User as UserType,
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
} from './types';
import { apiClient } from './services/apiClient';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';
import { ToastContainer, ToastMessage } from './components/common/Toast';
import { LoginPage } from './components/auth/LoginPage';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { RoomManagement } from './components/rooms/RoomManagement';
import { TenantManagement } from './components/tenants/TenantManagement';
import { ContractManagement } from './components/contracts/ContractManagement';
import { UtilityManagement } from './components/utilities/UtilityManagement';
import { InvoiceManagement } from './components/invoices/InvoiceManagement';
import { PaymentManagement } from './components/payments/PaymentManagement';
import { StatsPage } from './components/stats/StatsPage';
import { NotificationManagement } from './components/notifications/NotificationManagement';
import { TenantDashboard } from './components/tenant-portal/TenantDashboard';
import { InvoiceDetailModal } from './components/invoices/InvoiceDetailModal';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(() => apiClient.getCurrentUser());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Domain data collections
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [electricityReadings, setElectricityReadings] = useState<ElectricityReading[]>([]);
  const [waterReadings, setWaterReadings] = useState<WaterReading[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [maintenanceRequests, setMaintenanceRequests] = useState<MaintenanceRequest[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalRooms: 0,
    rentedRooms: 0,
    availableRooms: 0,
    maintenanceRooms: 0,
    occupancyRate: 0,
    totalTenants: 0,
    unpaidInvoicesCount: 0,
    unpaidInvoicesAmount: 0,
    monthlyRevenue: 0,
    monthlyElectricityKwh: 0,
    monthlyWaterM3: 0,
    pendingMaintenanceCount: 0,
  });

  // Selected invoice for detail modal or payment modal
  const [selectedInvoiceForModal, setSelectedInvoiceForModal] = useState<Invoice | null>(null);
  const [preselectedInvoiceForPayment, setPreselectedInvoiceForPayment] = useState<Invoice | null>(null);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString() + Math.random();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Load all initial data
  const loadData = async () => {
    try {
      const [
        roomsData,
        tenantsData,
        contractsData,
        elecData,
        watData,
        invData,
        payData,
        notifData,
        mntData,
        statsData,
      ] = await Promise.all([
        apiClient.getRooms(),
        apiClient.getTenants(),
        apiClient.getContracts(),
        apiClient.getElectricityReadings(),
        apiClient.getWaterReadings(),
        apiClient.getInvoices(),
        apiClient.getPayments(),
        apiClient.getNotifications(),
        apiClient.getMaintenanceRequests(),
        apiClient.getDashboardStats(),
      ]);

      setRooms(roomsData);
      setTenants(tenantsData);
      setContracts(contractsData);
      setElectricityReadings(elecData);
      setWaterReadings(watData);
      setInvoices(invData);
      setPayments(payData);
      setNotifications(notifData);
      setMaintenanceRequests(mntData);
      setStats(statsData);
    } catch {
      console.warn('Data sync with server completed with local fallback.');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update default tab when role changes
  useEffect(() => {
    if (currentUser?.role === 'tenant') {
      setCurrentTab('tenant_overview');
    } else {
      setCurrentTab('dashboard');
    }
  }, [currentUser?.role]);

  // Auth actions
  const handleLogin = async (username: string, pass: string) => {
    const res = await apiClient.login(username, pass);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      addToast('success', `Đăng nhập thành công với tài khoản: ${res.user.fullName}`);
      return { success: true };
    }
    return { success: false, message: res.message };
  };

  const handleDirectLogin = (user: UserType) => {
    apiClient.setCurrentUser(user);
    setCurrentUser(user);
    addToast('success', `Đã chuyển sang tài khoản: ${user.fullName}`);
  };

  const handleLogout = () => {
    apiClient.logout();
    setCurrentUser(null);
    addToast('info', 'Bạn đã đăng xuất.');
  };

  const handleSwitchUser = (user: UserType) => {
    apiClient.setCurrentUser(user);
    setCurrentUser(user);
    addToast('info', `Đang kiểm thử giao diện: ${user.fullName}`);
  };

  // Reset sample data
  const handleResetData = () => {
    if (window.confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu của đồ án?')) {
      apiClient.resetAllData();
      addToast('info', 'Đã tải lại dữ liệu mẫu.');
    }
  };

  // Rooms CRUD
  const handleSaveRoom = async (roomData: Partial<Room>) => {
    try {
      await apiClient.saveRoom(roomData);
      await loadData();
      addToast('success', roomData._id ? 'Đã cập nhật thông tin phòng.' : 'Đã thêm phòng mới thành công.');
    } catch {
      addToast('error', 'Có lỗi khi lưu thông tin phòng.');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    try {
      await apiClient.deleteRoom(roomId);
      await loadData();
      addToast('success', 'Đã xóa phòng thành công.');
    } catch {
      addToast('error', 'Không thể xóa phòng này.');
    }
  };

  // Tenants CRUD
  const handleSaveTenant = async (tenantData: Partial<Tenant>) => {
    try {
      await apiClient.saveTenant(tenantData);
      await loadData();
      addToast('success', tenantData._id ? 'Cập nhật người thuê thành công.' : 'Đã thêm khách thuê mới.');
    } catch {
      addToast('error', 'Lỗi khi lưu thông tin người thuê.');
    }
  };

  const handleDeleteTenant = async (tenantId: string) => {
    try {
      await apiClient.deleteTenant(tenantId);
      await loadData();
      addToast('success', 'Đã xóa người thuê.');
    } catch {
      addToast('error', 'Không thể xóa người thuê này.');
    }
  };

  // Contracts CRUD
  const handleSaveContract = async (contractData: Partial<Contract>) => {
    try {
      await apiClient.saveContract(contractData);
      await loadData();
      addToast('success', contractData._id ? 'Đã cập nhật hợp đồng.' : 'Đã tạo hợp đồng mới.');
    } catch {
      addToast('error', 'Lỗi khi lưu hợp đồng.');
    }
  };

  const handleDeleteContract = async (id: string) => {
    try {
      await apiClient.deleteContract(id);
      await loadData();
      addToast('success', 'Đã xóa hợp đồng.');
    } catch {
      addToast('error', 'Không thể xóa hợp đồng này.');
    }
  };

  // Utilities CRUD
  const handleSaveElectricity = async (data: Omit<ElectricityReading, '_id' | 'consumption' | 'totalPrice'>) => {
    try {
      await apiClient.saveElectricityReading(data);
      await loadData();
      addToast('success', `Đã chốt chỉ số điện phòng ${data.roomCode}.`);
    } catch {
      addToast('error', 'Lỗi khi lưu chỉ số điện.');
    }
  };

  const handleSaveWater = async (data: Omit<WaterReading, '_id' | 'consumption' | 'totalPrice'>) => {
    try {
      await apiClient.saveWaterReading(data);
      await loadData();
      addToast('success', `Đã chốt chỉ số nước phòng ${data.roomCode}.`);
    } catch {
      addToast('error', 'Lỗi khi lưu chỉ số nước.');
    }
  };

  // Invoices CRUD
  const handleSaveInvoice = async (invoiceData: Partial<Invoice>) => {
    try {
      await apiClient.saveInvoice(invoiceData);
      await loadData();
      addToast('success', invoiceData._id ? 'Đã cập nhật hóa đơn.' : 'Đã phát hành hóa đơn mới thành công.');
    } catch {
      addToast('error', 'Lỗi khi lưu hóa đơn.');
    }
  };

  const handleDeleteInvoice = async (id: string) => {
    try {
      await apiClient.deleteInvoice(id);
      await loadData();
      addToast('success', 'Đã xóa hóa đơn.');
    } catch {
      addToast('error', 'Không thể xóa hóa đơn.');
    }
  };

  // Payments
  const handleRecordPayment = async (paymentData: Omit<Payment, '_id'>) => {
    try {
      await apiClient.recordPayment(paymentData);
      await loadData();
      addToast('success', `Đã ghi nhận thanh toán ${paymentData.amount.toLocaleString()} ₫ thành công!`);
    } catch {
      addToast('error', 'Lỗi khi ghi nhận thanh toán.');
    }
  };

  // Tenant confirms payment transfer via VietQR
  const handleTenantConfirmPaid = async (invoiceId: string, amount: number) => {
    const inv = invoices.find(i => i._id === invoiceId);
    if (!inv || !currentUser) return;

    await apiClient.recordPayment({
      paymentCode: `TT-QR-${Date.now().toString().slice(-4)}`,
      invoiceId: inv._id,
      invoiceCode: inv.invoiceCode,
      roomId: inv.roomId,
      roomCode: inv.roomCode,
      tenantName: currentUser.fullName,
      amount,
      paymentMethod: 'bank_transfer',
      transactionRef: `VIETQR-${Math.floor(100000 + Math.random() * 900000)}`,
      paymentDate: new Date().toLocaleString('vi-VN'),
      recordedBy: 'Người thuê tự xác nhận (VietQR)',
      notes: 'Khách thuê đã quét mã VietQR và gửi thông báo xác nhận đã chuyển khoản.',
    });

    // Also send notification to landlord
    await apiClient.createNotification({
      title: `Thanh toán mới: Phòng ${inv.roomCode} đã chuyển khoản`,
      content: `${currentUser.fullName} đã thanh toán ${amount.toLocaleString()} ₫ cho hóa đơn ${inv.invoiceCode}.`,
      type: 'fee_reminder',
      target: 'all',
      authorName: currentUser.fullName,
    });

    await loadData();
    addToast('success', 'Đã gửi xác nhận chuyển khoản thành công đến Ban Quản Lý!');
  };

  // Notifications
  const handleCreateNotification = async (data: Omit<Notification, '_id' | 'createdAt'>) => {
    try {
      await apiClient.createNotification(data);
      await loadData();
      addToast('success', 'Đã gửi thông báo đến các phòng.');
    } catch {
      addToast('error', 'Lỗi khi gửi thông báo.');
    }
  };

  // Maintenance
  const handleCreateMaintenanceRequest = async (data: Omit<MaintenanceRequest, '_id' | 'createdAt'>) => {
    try {
      await apiClient.createMaintenanceRequest(data);
      await loadData();
      addToast('success', 'Đã gửi yêu cầu sửa chữa đến chủ trọ.');
    } catch {
      addToast('error', 'Lỗi khi gửi yêu cầu báo hỏng.');
    }
  };

  const handleUpdateMaintenanceStatus = async (
    id: string,
    status: MaintenanceRequest['status'],
    adminNote?: string
  ) => {
    try {
      await apiClient.updateMaintenanceStatus(id, status, adminNote);
      await loadData();
      addToast('success', 'Đã cập nhật tiến độ xử lý sửa chữa.');
    } catch {
      addToast('error', 'Lỗi khi cập nhật trạng thái.');
    }
  };

  // If user is not logged in, show LoginPage
  if (!currentUser) {
    return (
      <div className="font-['Plus_Jakarta_Sans',sans-serif]">
        <LoginPage onLogin={handleLogin} onDirectLogin={handleDirectLogin} />
        <ToastContainer toasts={toasts} onDismiss={removeToast} />
      </div>
    );
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-['Plus_Jakarta_Sans',sans-serif] flex">
      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        {/* Header Navbar */}
        <Navbar
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          currentUser={currentUser}
          onSwitchUser={handleSwitchUser}
          onResetData={handleResetData}
          onNavigateToNotifications={() =>
            setCurrentTab(isAdmin ? 'notifications' : 'tenant_notifications')
          }
          unreadCount={notifications.length}
        />

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {isAdmin ? (
            /* ADMIN / LANDLORD VIEWS */
            <>
              {currentTab === 'dashboard' && (
                <AdminDashboard
                  stats={stats}
                  rooms={rooms}
                  invoices={invoices}
                  maintenanceRequests={maintenanceRequests}
                  onNavigate={setCurrentTab}
                  onOpenInvoiceModal={inv => setSelectedInvoiceForModal(inv)}
                />
              )}

              {currentTab === 'rooms' && (
                <RoomManagement
                  rooms={rooms}
                  tenants={tenants}
                  onSaveRoom={handleSaveRoom}
                  onDeleteRoom={handleDeleteRoom}
                />
              )}

              {currentTab === 'tenants' && (
                <TenantManagement
                  tenants={tenants}
                  rooms={rooms}
                  onSaveTenant={handleSaveTenant}
                  onDeleteTenant={handleDeleteTenant}
                />
              )}

              {currentTab === 'contracts' && (
                <ContractManagement
                  contracts={contracts}
                  rooms={rooms}
                  tenants={tenants}
                  onSaveContract={handleSaveContract}
                  onDeleteContract={handleDeleteContract}
                />
              )}

              {currentTab === 'utilities' && (
                <UtilityManagement
                  rooms={rooms}
                  electricityReadings={electricityReadings}
                  waterReadings={waterReadings}
                  onSaveElectricity={handleSaveElectricity}
                  onSaveWater={handleSaveWater}
                  onNavigateToInvoices={() => setCurrentTab('invoices')}
                />
              )}

              {currentTab === 'invoices' && (
                <InvoiceManagement
                  invoices={invoices}
                  rooms={rooms}
                  tenants={tenants}
                  electricityReadings={electricityReadings}
                  waterReadings={waterReadings}
                  onSaveInvoice={handleSaveInvoice}
                  onDeleteInvoice={handleDeleteInvoice}
                  onOpenPaymentModal={inv => {
                    setPreselectedInvoiceForPayment(inv);
                    setCurrentTab('payments');
                  }}
                />
              )}

              {currentTab === 'payments' && (
                <PaymentManagement
                  payments={payments}
                  invoices={invoices}
                  onRecordPayment={handleRecordPayment}
                  preselectedInvoice={preselectedInvoiceForPayment}
                  onClearPreselectedInvoice={() => setPreselectedInvoiceForPayment(null)}
                />
              )}

              {currentTab === 'stats' && (
                <StatsPage
                  rooms={rooms}
                  invoices={invoices}
                  electricityReadings={electricityReadings}
                  waterReadings={waterReadings}
                />
              )}

              {currentTab === 'notifications' && (
                <NotificationManagement
                  notifications={notifications}
                  maintenanceRequests={maintenanceRequests}
                  rooms={rooms}
                  onCreateNotification={handleCreateNotification}
                  onUpdateMaintenanceStatus={handleUpdateMaintenanceStatus}
                />
              )}
            </>
          ) : (
            /* TENANT VIEWS */
            <TenantDashboard
              currentUser={currentUser}
              rooms={rooms}
              tenants={tenants}
              contracts={contracts}
              invoices={invoices}
              payments={payments}
              electricityReadings={electricityReadings}
              waterReadings={waterReadings}
              notifications={notifications}
              maintenanceRequests={maintenanceRequests}
              currentTab={currentTab}
              onNavigateTab={setCurrentTab}
              onCreateMaintenanceRequest={handleCreateMaintenanceRequest}
              onTenantConfirmPaid={handleTenantConfirmPaid}
            />
          )}
        </main>
      </div>

      {/* Global Invoice Detail Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoiceForModal}
        isOpen={Boolean(selectedInvoiceForModal)}
        onClose={() => setSelectedInvoiceForModal(null)}
        onQuickPay={inv => {
          setSelectedInvoiceForModal(null);
          setPreselectedInvoiceForPayment(inv);
          setCurrentTab('payments');
        }}
        isAdmin={isAdmin}
      />
    </div>
  );
}
