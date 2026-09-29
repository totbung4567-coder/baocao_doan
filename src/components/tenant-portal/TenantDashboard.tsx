import React, { useState } from 'react';
import {
  Home,
  Receipt,
  Zap,
  FileText,
  Bell,
  Wrench,
  CreditCard,
  QrCode,
  CheckCircle,
  Clock,
  Send,
  AlertCircle,
  Copy,
  Building,
  User,
  Users,
  Calendar,
  Phone,
  Droplets,
} from 'lucide-react';
import {
  User as UserType,
  Room,
  Tenant,
  Contract,
  Invoice,
  Payment,
  ElectricityReading,
  WaterReading,
  Notification,
  MaintenanceRequest,
} from '../../types';
import { formatCurrency, formatDate, generateVietQrUrl } from '../../utils/formatters';
import { houseConfig } from '../../data/mockData';
import { Modal } from '../common/Modal';
import { InvoiceDetailModal } from '../invoices/InvoiceDetailModal';
import { ContractPrintView } from '../contracts/ContractPrintView';

interface TenantDashboardProps {
  currentUser: UserType;
  rooms: Room[];
  tenants: Tenant[];
  contracts: Contract[];
  invoices: Invoice[];
  payments: Payment[];
  electricityReadings: ElectricityReading[];
  waterReadings: WaterReading[];
  notifications: Notification[];
  maintenanceRequests: MaintenanceRequest[];
  currentTab: string;
  onNavigateTab: (tab: string) => void;
  onCreateMaintenanceRequest: (data: Omit<MaintenanceRequest, '_id' | 'createdAt'>) => Promise<void>;
  onTenantConfirmPaid: (invoiceId: string, amount: number) => Promise<void>;
}

export const TenantDashboard: React.FC<TenantDashboardProps> = ({
  currentUser,
  rooms,
  tenants,
  contracts,
  invoices,
  payments,
  electricityReadings,
  waterReadings,
  notifications,
  maintenanceRequests,
  currentTab,
  onNavigateTab,
  onCreateMaintenanceRequest,
  onTenantConfirmPaid,
}) => {
  // Identify tenant's room
  const userRoom = rooms.find(r => r._id === currentUser.roomId) || rooms[0];
  const userRoomId = userRoom?._id || '';

  // Filter tenant-specific data
  const roommates = tenants.filter(t => t.roomId === userRoomId);
  const myContract = contracts.find(c => c.roomId === userRoomId);
  const myInvoices = invoices.filter(i => i.roomId === userRoomId);
  const myPayments = payments.filter(p => p.roomId === userRoomId);
  const myElectricity = electricityReadings.filter(e => e.roomId === userRoomId);
  const myWater = waterReadings.filter(w => w.roomId === userRoomId);
  const myNotifications = notifications.filter(n => n.target === 'all' || n.targetRoomId === userRoomId);
  const myMaintenance = maintenanceRequests.filter(m => m.roomId === userRoomId);

  // Latest unpaid invoice
  const latestUnpaidInvoice = myInvoices.find(i => i.remainingAmount > 0);

  // Modals
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestTitle, setRequestTitle] = useState('');
  const [requestDesc, setRequestDesc] = useState('');
  const [requestPriority, setRequestPriority] = useState<MaintenanceRequest['priority']>('medium');
  const [copiedText, setCopiedText] = useState(false);
  const [isContractModalOpen, setIsContractModalOpen] = useState(false);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    await onCreateMaintenanceRequest({
      roomId: userRoomId,
      roomCode: userRoom.roomCode,
      tenantName: currentUser.fullName,
      tenantPhone: currentUser.phone,
      title: requestTitle.trim(),
      description: requestDesc.trim(),
      priority: requestPriority,
      status: 'pending',
    });
    setIsRequestModalOpen(false);
    setRequestTitle('');
    setRequestDesc('');
  };

  const qrUrl = latestUnpaidInvoice
    ? generateVietQrUrl({
        bankCode: 'MB',
        accountNumber: houseConfig.bankAccount,
        accountName: houseConfig.bankAccountName,
        amount: latestUnpaidInvoice.remainingAmount,
        description: `TIEN PHONG ${userRoom?.roomCode} T${latestUnpaidInvoice.month.replace('/', '')}`,
      })
    : '';

  const handleCopySyntax = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner for Tenant */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-100 text-xs font-medium mb-2 backdrop-blur-xs">
            <Home className="w-3.5 h-3.5" />
            <span>Phòng của bạn: {userRoom?.roomCode}</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Xin chào, {currentUser.fullName}!
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-xl">
            {latestUnpaidInvoice ? (
              <span>
                Bạn có 1 hóa đơn tháng {latestUnpaidInvoice.month} cần thanh toán trước {formatDate(latestUnpaidInvoice.dueDate)}.
              </span>
            ) : (
              <span>Tuyệt vời! Tất cả tiền phòng và dịch vụ của bạn đã được thanh toán đầy đủ.</span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setIsRequestModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition-all shadow-sm cursor-pointer"
          >
            <Wrench className="w-4 h-4 text-amber-500" />
            <span>Báo hỏng & Sửa chữa</span>
          </button>
          {latestUnpaidInvoice && (
            <button
              onClick={() => onNavigateTab('tenant_invoices')}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-bold text-xs hover:bg-emerald-600 transition-all cursor-pointer shadow-sm shadow-emerald-500/30"
            >
              <QrCode className="w-4 h-4" />
              <span>Thanh toán ngay</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab 1: Overview & Room Details */}
      {(currentTab === 'tenant_overview' || currentTab === 'dashboard') && (
        <div className="space-y-6">
          {/* Active Bill Alert Banner */}
          {latestUnpaidInvoice && (
            <div className="bg-amber-50 border border-amber-200 rounded-3xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0">
                  <Receipt className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-800">
                      Hóa đơn tiền phòng tháng {latestUnpaidInvoice.month}
                    </span>
                    <span className="text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                      Chưa nộp
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Hạn nộp: <strong>{formatDate(latestUnpaidInvoice.dueDate)}</strong>. Số tiền cần thanh toán:{' '}
                    <strong className="text-rose-600 font-mono text-sm">
                      {formatCurrency(latestUnpaidInvoice.remainingAmount)}
                    </strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedInvoice(latestUnpaidInvoice)}
                  className="px-4 py-2 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Xem chi tiết
                </button>
                <button
                  onClick={() => onNavigateTab('tenant_invoices')}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Quét QR Chuyển khoản</span>
                </button>
              </div>
            </div>
          )}

          {/* Room info card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs lg:col-span-2 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-800">
                    {userRoom?.roomName}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mã phòng: <strong className="text-blue-700">{userRoom?.roomCode}</strong> • Tầng {userRoom?.floor} • Diện tích {userRoom?.area} m²
                  </p>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full">
                  Đang thuê
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-2xl">
                <div>
                  <span className="text-slate-400">Giá thuê hàng tháng:</span>
                  <p className="text-base font-black text-blue-700">
                    {formatCurrency(userRoom?.price || 0)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Tiền cọc phòng:</span>
                  <p className="font-bold text-slate-700 text-sm">
                    {formatCurrency(userRoom?.deposit || userRoom?.price || 0)}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Số lượng người ở:</span>
                  <p className="font-bold text-slate-700 text-sm">
                    {roommates.length} / {userRoom?.maxTenants} người
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">
                  Tiện nghi phòng được trang bị:
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {userRoom?.amenities?.map((am, i) => (
                    <span
                      key={i}
                      className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-medium"
                    >
                      {am}
                    </span>
                  ))}
                </div>
              </div>

              {/* Roommates list */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2">
                  Bạn cùng phòng ({roommates.length} người):
                </h4>
                <div className="space-y-2">
                  {roommates.map(t => (
                    <div
                      key={t._id}
                      className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                          {t.fullName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800">
                            {t.fullName}{' '}
                            {t.isRepresentative && (
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                                Đại diện HĐ
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Quê quán: {t.hometown} • Năm sinh: {t.birthYear}
                          </p>
                        </div>
                      </div>
                      <span className="font-mono text-slate-500">{t.phone}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Landlord contact card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div>
                <h3 className="font-bold text-slate-800 text-sm mb-3">
                  Thông tin Ban Quản Lý / Chủ trọ
                </h3>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                      H
                    </div>
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{houseConfig.landlordName}</p>
                      <p className="text-slate-500 text-[11px]">Chủ nhà / Quản lý trực tiếp</p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-slate-600">
                    <p className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>Hotline: <strong className="text-slate-900">{houseConfig.landlordPhone}</strong></span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{houseConfig.address}</span>
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-700 block mb-1">Quy định chung:</span>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  • Đóng cửa chính sau 23h00.<br />
                  • Đóng tiền phòng từ ngày 1 đến ngày 5.<br />
                  • Báo hỏng hóc qua cổng thông tin để được sửa miễn phí.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Invoices & VietQR Payment */}
      {currentTab === 'tenant_invoices' && (
        <div className="space-y-6">
          {/* Active Bill with VietQR */}
          {latestUnpaidInvoice && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    Thanh toán hóa đơn tháng {latestUnpaidInvoice.month}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mã hóa đơn: <strong className="font-mono text-blue-700">{latestUnpaidInvoice.invoiceCode}</strong>
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Số tiền cần nộp:</span>
                  <div className="text-2xl font-black text-rose-600 font-mono">
                    {formatCurrency(latestUnpaidInvoice.remainingAmount)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* QR Code image */}
                <div className="flex flex-col items-center p-5 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <div className="w-56 h-56 bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center mb-3">
                    <img
                      src={qrUrl}
                      alt="VietQR Chuyển khoản"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-xs font-bold text-slate-800">
                    Mở app Ngân hàng (MB, Vietcombank, Techcombank...) quét mã để thanh toán ngay
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Hệ thống sẽ tự động điền đúng số tiền và nội dung chuyển khoản
                  </p>
                </div>

                {/* Transfer text details */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block text-[11px]">Ngân hàng thụ hưởng:</span>
                    <strong className="text-slate-800 text-sm">MB Bank (Ngân hàng Quân Đội)</strong>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Số tài khoản:</span>
                      <strong className="text-blue-700 text-base font-mono">{houseConfig.bankAccount}</strong>
                    </div>
                    <button
                      onClick={() => handleCopySyntax(houseConfig.bankAccount)}
                      className="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-semibold hover:bg-slate-100 transition-colors"
                    >
                      {copiedText ? 'Đã sao chép' : 'Sao chép'}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Chủ tài khoản:</span>
                      <strong className="text-slate-800 text-sm">{houseConfig.bankAccountName}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-blue-50/80 rounded-xl border border-blue-200 flex items-center justify-between">
                    <div>
                      <span className="text-blue-600 block text-[11px] font-semibold">Nội dung chuyển khoản chuẩn:</span>
                      <strong className="text-blue-900 font-mono text-sm">
                        TIEN PHONG {userRoom?.roomCode} T{latestUnpaidInvoice.month.replace('/', '')}
                      </strong>
                    </div>
                    <button
                      onClick={() =>
                        handleCopySyntax(`TIEN PHONG ${userRoom?.roomCode} T${latestUnpaidInvoice.month.replace('/', '')}`)
                      }
                      className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-colors"
                    >
                      Copy nội dung
                    </button>
                  </div>

                  {/* Confirm payment action */}
                  <div className="pt-2">
                    <button
                      onClick={() => {
                        onTenantConfirmPaid(latestUnpaidInvoice._id, latestUnpaidInvoice.remainingAmount);
                      }}
                      className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span>Tôi đã chuyển khoản thành công (Báo chủ trọ)</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoices History Table */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="font-bold text-slate-800 text-sm mb-4">
              Lịch sử các hóa đơn tiền phòng ({myInvoices.length})
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                    <th className="py-3 px-4">Kỳ hóa đơn</th>
                    <th className="py-3 px-4">Mã hóa đơn</th>
                    <th className="py-3 px-4">Tiền phòng</th>
                    <th className="py-3 px-4">Điện + Nước</th>
                    <th className="py-3 px-4">Tổng cộng</th>
                    <th className="py-3 px-4">Trạng thái</th>
                    <th className="py-3 px-4 text-right">Chi tiết</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                  {myInvoices.map(inv => (
                    <tr key={inv._id} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">
                        Tháng {inv.month}
                      </td>
                      <td className="py-3 px-4 font-mono text-blue-700">{inv.invoiceCode}</td>
                      <td className="py-3 px-4 font-mono">{formatCurrency(inv.roomFee)}</td>
                      <td className="py-3 px-4 font-mono">{formatCurrency(inv.electricityFee + inv.waterFee)}</td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="py-3 px-4">
                        {inv.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3 text-emerald-600" /> Đã thanh toán
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                            <Clock className="w-3 h-3 text-rose-600" /> Chưa nộp ({formatCurrency(inv.remainingAmount)})
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedInvoice(inv)}
                          className="px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        >
                          Xem phiếu
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Utilities */}
      {currentTab === 'tenant_utilities' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Electricity card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">Chỉ số Điện</h3>
                    <p className="text-xs text-slate-400">Đơn giá: {formatCurrency(houseConfig.defaultElectricityPrice)}/kWh</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {myElectricity.map(e => (
                  <div key={e._id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Tháng {e.month}</span>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {e.oldIndex} → {e.newIndex} ({e.consumption} kWh)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-amber-700 font-mono text-sm">
                        {formatCurrency(e.totalPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Water card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <Droplets className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-800">Chỉ số Nước sinh hoạt</h3>
                    <p className="text-xs text-slate-400">Đơn giá: {formatCurrency(houseConfig.defaultWaterPrice)}/m³</p>
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-100 text-xs">
                {myWater.map(w => (
                  <div key={w._id} className="py-3 flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-800">Tháng {w.month}</span>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {w.oldIndex} → {w.newIndex} ({w.consumption} m³)
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-blue-700 font-mono text-sm">
                        {formatCurrency(w.totalPrice)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Contract */}
      {currentTab === 'tenant_contract' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Hợp đồng thuê phòng của bạn
              </h3>
              <p className="text-xs text-slate-500">
                Mã HĐ: <strong className="font-mono text-blue-700">{myContract?.contractCode || 'HD-2025-101'}</strong> • Thời hạn {myContract?.rentalTermMonths || 12} tháng
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                {myContract?.status === 'active' ? 'Đang hiệu lực' : myContract?.status === 'expiring' ? 'Sắp hết hạn' : 'Đã ký kết'}
              </span>
              {myContract && (
                <button
                  type="button"
                  onClick={() => setIsContractModalOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Xem & In bản HĐ đầy đủ</span>
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs bg-slate-50 p-4 rounded-2xl">
            <div>
              <span className="text-slate-400">Ngày bắt đầu:</span>
              <p className="font-bold text-slate-800 text-sm">{formatDate(myContract?.startDate || '2025-10-01')}</p>
            </div>
            <div>
              <span className="text-slate-400">Ngày kết thúc:</span>
              <p className="font-bold text-slate-800 text-sm">{formatDate(myContract?.endDate || '2026-10-01')}</p>
            </div>
            <div>
              <span className="text-slate-400">Tiền đặt cọc:</span>
              <p className="font-bold text-emerald-700 text-sm font-mono">
                {formatCurrency(myContract?.depositAmount || 3200000)}
              </p>
            </div>
            <div>
              <span className="text-slate-400">Giá thuê hàng tháng:</span>
              <p className="font-bold text-blue-700 text-sm font-mono">
                {formatCurrency(myContract?.rentalPrice || 3200000)}/tháng
              </p>
            </div>
          </div>

          {/* Electricity & Water rate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200/80 text-xs">
              <span className="font-bold text-amber-900 block mb-1">⚡ Đơn giá tiền điện sinh hoạt:</span>
              <p className="text-amber-800 font-bold text-sm">
                {formatCurrency(myContract?.electricityUnitPrice || 3500)} / kWh
              </p>
              <p className="text-[11px] text-amber-700 mt-1">
                {myContract?.electricityNote || 'Tính theo chỉ số công tơ điện thực tế tiêu thụ mỗi tháng.'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-50/50 border border-cyan-200/80 text-xs">
              <span className="font-bold text-cyan-900 block mb-1">💧 Đơn giá tiền nước sinh hoạt:</span>
              <p className="text-cyan-800 font-bold text-sm">
                {formatCurrency(myContract?.waterUnitPrice || 25000)} / {myContract?.waterType === 'per_person' ? 'người' : 'm³'}
              </p>
              <p className="text-[11px] text-cyan-700 mt-1">
                {myContract?.waterNote || 'Tính theo khối lượng m³ đồng hồ nước thực tế.'}
              </p>
            </div>
          </div>

          {/* Extra fees list */}
          {myContract?.extraFees && myContract.extraFees.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2">Các khoản phí dịch vụ quy định:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {myContract.extraFees.map((fee, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                    <span className="font-bold text-slate-800 block">{fee.name}</span>
                    <span className="font-bold text-blue-700">{formatCurrency(fee.amount)}</span>
                    <span className="text-slate-400 text-[11px]"> ({fee.cycle})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Handed-over assets */}
          {myContract?.handedOverAssets && myContract.handedOverAssets.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-slate-700 mb-2">Danh mục tài sản bàn giao trong phòng:</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left border-collapse border border-slate-200 rounded-xl overflow-hidden">
                  <thead>
                    <tr className="bg-slate-100 text-slate-700 font-bold">
                      <th className="p-2 border border-slate-200">Tên trang thiết bị</th>
                      <th className="p-2 border border-slate-200 text-center">Số lượng</th>
                      <th className="p-2 border border-slate-200">Tình trạng bàn giao</th>
                    </tr>
                  </thead>
                  <tbody>
                    {myContract.handedOverAssets.map((asset, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2 border border-slate-200 font-semibold">{asset.name}</td>
                        <td className="p-2 border border-slate-200 text-center font-bold">{asset.quantity}</td>
                        <td className="p-2 border border-slate-200 text-slate-600">{asset.condition} {asset.note ? `(${asset.note})` : ''}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div>
            <h4 className="text-xs font-bold text-slate-700 mb-2">Điều khoản thỏa thuận:</h4>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed whitespace-pre-line">
              {myContract?.terms || 'Bên thuê có trách nhiệm bảo quản trang thiết bị và thanh toán tiền phòng đúng hạn.'}
            </div>
          </div>

          {/* Printable Modal */}
          {myContract && (
            <ContractPrintView
              contract={myContract}
              isOpen={isContractModalOpen}
              onClose={() => setIsContractModalOpen(false)}
            />
          )}
        </div>
      )}

      {/* Tab 5: Maintenance & Requests */}
      {currentTab === 'tenant_requests' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">
                Báo hỏng & Yêu cầu sửa chữa
              </h3>
              <p className="text-xs text-slate-500">
                Gửi phản ánh bóng đèn cháy, vòi nước hỏng, điều hòa không mát... để chủ nhà hỗ trợ ngay
              </p>
            </div>
            <button
              onClick={() => setIsRequestModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Wrench className="w-4 h-4" />
              <span>Gửi yêu cầu mới</span>
            </button>
          </div>

          <div className="space-y-3">
            {myMaintenance.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-xs text-slate-400 border border-slate-200/80">
                Bạn chưa gửi yêu cầu báo hỏng nào.
              </div>
            ) : (
              myMaintenance.map(req => (
                <div
                  key={req._id}
                  className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-800">{req.title}</h4>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          req.status === 'completed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : req.status === 'in_progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {req.status === 'completed'
                          ? 'Đã sửa xong'
                          : req.status === 'in_progress'
                          ? 'Đang xử lý'
                          : 'Chờ tiếp nhận'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{req.description}</p>
                    <p className="text-[11px] text-slate-400">Gửi lúc: {req.createdAt}</p>
                    {req.adminNote && (
                      <div className="text-xs text-blue-800 bg-blue-50 p-2 rounded-lg border border-blue-200 mt-2">
                        <strong>Phản hồi từ chủ trọ:</strong> {req.adminNote}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 6: Notifications from landlord */}
      {currentTab === 'tenant_notifications' && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900">
              Thông báo từ Ban quản lý khu trọ
            </h3>
            <p className="text-xs text-slate-500">Các thông báo nhắc nộp tiền phòng, lịch sửa chữa và nội quy</p>
          </div>

          <div className="space-y-3">
            {myNotifications.map(n => (
              <div
                key={n._id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-slate-800">{n.title}</h4>
                  <span className="text-[11px] text-slate-400">{n.createdAt}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl">
                  {n.content}
                </p>
                <div className="text-[11px] text-slate-400">Người gửi: {n.authorName}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Invoice Detail Modal for Tenant */}
      <InvoiceDetailModal
        invoice={selectedInvoice}
        isOpen={Boolean(selectedInvoice)}
        onClose={() => setSelectedInvoice(null)}
        isAdmin={false}
      />

      {/* Submit Maintenance Request Modal */}
      <Modal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
        title="Gửi yêu cầu báo hỏng & Sửa chữa"
      >
        <form onSubmit={handleCreateRequest} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Vấn đề gặp phải *
            </label>
            <input
              type="text"
              required
              value={requestTitle}
              onChange={e => setRequestTitle(e.target.value)}
              placeholder="VD: Bóng đèn gác lửng bị chập chờn, vòi nước rỉ..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mức độ ưu tiên
            </label>
            <select
              value={requestPriority}
              onChange={e => setRequestPriority(e.target.value as any)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
            >
              <option value="low">Thấp (Có thể sửa trong vài ngày tới)</option>
              <option value="medium">Bình thường (Cần sửa trong 1-2 ngày)</option>
              <option value="high">Khẩn cấp (Mất điện, vỡ ống nước...)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả chi tiết *
            </label>
            <textarea
              rows={3}
              required
              value={requestDesc}
              onChange={e => setRequestDesc(e.target.value)}
              placeholder="Chi tiết tình trạng và thời gian bạn có người ở phòng để thợ qua..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsRequestModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Gửi báo cáo</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
