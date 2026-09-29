import React, { useState } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Filter,
  Eye,
  Trash2,
  DollarSign,
  CheckCircle,
  Clock,
  AlertCircle,
  FileSpreadsheet,
  Download,
  Calendar,
} from 'lucide-react';
import {
  Invoice,
  Room,
  Tenant,
  ElectricityReading,
  WaterReading,
} from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { houseConfig } from '../../data/mockData';
import { Modal } from '../common/Modal';
import { InvoiceDetailModal } from './InvoiceDetailModal';

interface InvoiceManagementProps {
  invoices: Invoice[];
  rooms: Room[];
  tenants: Tenant[];
  electricityReadings: ElectricityReading[];
  waterReadings: WaterReading[];
  onSaveInvoice: (invoice: Partial<Invoice>) => Promise<void>;
  onDeleteInvoice: (id: string) => Promise<void>;
  onOpenPaymentModal: (invoice: Invoice) => void;
}

export const InvoiceManagement: React.FC<InvoiceManagementProps> = ({
  invoices,
  rooms,
  tenants,
  electricityReadings,
  waterReadings,
  onSaveInvoice,
  onDeleteInvoice,
  onOpenPaymentModal,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('09/2026');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedInvoiceForDetail, setSelectedInvoiceForDetail] = useState<Invoice | null>(null);

  // Form states
  const [roomId, setRoomId] = useState(rooms[0]?._id || '');
  const [invoiceMonth, setInvoiceMonth] = useState('09/2026');
  const [roomFee, setRoomFee] = useState<number>(3200000);
  const [elecUsage, setElecUsage] = useState<number>(100);
  const [elecOld, setElecOld] = useState<number>(1000);
  const [elecNew, setElecNew] = useState<number>(1100);
  const [elecFee, setElecFee] = useState<number>(350000);
  const [waterUsage, setWaterUsage] = useState<number>(7);
  const [waterOld, setWaterOld] = useState<number>(140);
  const [waterNew, setWaterNew] = useState<number>(147);
  const [waterFee, setWaterFee] = useState<number>(140000);
  const [internetFee, setInternetFee] = useState<number>(houseConfig.defaultInternetPrice);
  const [garbageFee, setGarbageFee] = useState<number>(houseConfig.defaultGarbagePrice);
  const [parkingFee, setParkingFee] = useState<number>(houseConfig.defaultParkingPrice);
  const [discount, setDiscount] = useState<number>(0);
  const [dueDate, setDueDate] = useState('2026-10-05');
  const [notes, setNotes] = useState('');

  const months = ['09/2026', '08/2026', '07/2026'];

  const handleOpenCreate = () => {
    const targetRoom = rooms[0];
    if (targetRoom) {
      applyRoomData(targetRoom._id, selectedMonth);
    }
    setIsCreateOpen(true);
  };

  const applyRoomData = (rId: string, month: string) => {
    setRoomId(rId);
    const room = rooms.find(r => r._id === rId);
    if (room) {
      setRoomFee(room.price);

      // Check electricity reading for this room & month
      const elec = electricityReadings.find(e => e.roomId === rId && e.month === month);
      if (elec) {
        setElecOld(elec.oldIndex);
        setElecNew(elec.newIndex);
        setElecUsage(elec.consumption);
        setElecFee(elec.totalPrice);
      } else {
        setElecOld(1000);
        setElecNew(1110);
        setElecUsage(110);
        setElecFee(110 * houseConfig.defaultElectricityPrice);
      }

      // Check water reading for this room & month
      const wat = waterReadings.find(w => w.roomId === rId && w.month === month);
      if (wat) {
        setWaterOld(wat.oldIndex);
        setWaterNew(wat.newIndex);
        setWaterUsage(wat.consumption);
        setWaterFee(wat.totalPrice);
      } else {
        setWaterOld(200);
        setWaterNew(208);
        setWaterUsage(8);
        setWaterFee(8 * houseConfig.defaultWaterPrice);
      }
    }
  };

  const handleRoomChange = (rId: string) => {
    applyRoomData(rId, invoiceMonth);
  };

  const handleMonthChangeInForm = (m: string) => {
    setInvoiceMonth(m);
    applyRoomData(roomId, m);
  };

  const calculatedTotal =
    Number(roomFee) +
    Number(elecFee) +
    Number(waterFee) +
    Number(internetFee) +
    Number(garbageFee) +
    Number(parkingFee) -
    Number(discount);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const room = rooms.find(r => r._id === roomId);
    const tenant = tenants.find(t => t.roomId === roomId && t.isRepresentative) || tenants.find(t => t.roomId === roomId);

    await onSaveInvoice({
      month: invoiceMonth,
      roomId,
      roomCode: room ? room.roomCode : 'P.---',
      tenantName: tenant ? tenant.fullName : 'Chưa có tên',
      tenantPhone: tenant ? tenant.phone : '',
      roomFee: Number(roomFee),
      electricityFee: Number(elecFee),
      electricityUsage: Number(elecUsage),
      electricityOld: Number(elecOld),
      electricityNew: Number(elecNew),
      waterFee: Number(waterFee),
      waterUsage: Number(waterUsage),
      waterOld: Number(waterOld),
      waterNew: Number(waterNew),
      internetFee: Number(internetFee),
      garbageFee: Number(garbageFee),
      parkingFee: Number(parkingFee),
      otherFee: 0,
      discount: Number(discount),
      totalAmount: calculatedTotal,
      paidAmount: 0,
      remainingAmount: calculatedTotal,
      dueDate,
      status: 'unpaid',
      notes,
    });

    setIsCreateOpen(false);
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchMonth = inv.month === selectedMonth;
    const matchStatus = statusFilter === 'all' || inv.status === statusFilter;
    const q = searchTerm.trim().toLowerCase();
    const matchSearch = !q || (
      (inv.invoiceCode || '').toLowerCase().includes(q) ||
      (inv.roomCode || '').toLowerCase().includes(q) ||
      (inv.tenantName || '').toLowerCase().includes(q)
    );
    return matchMonth && matchStatus && matchSearch;
  });

  // Month stats
  const totalBilled = filteredInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalPaid = filteredInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalRemaining = filteredInvoices.reduce((sum, i) => sum + i.remainingAmount, 0);
  const unpaidCount = filteredInvoices.filter(i => i.status !== 'paid').length;

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Hóa đơn tiền phòng & Thu phí
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Lập phiếu thu tổng hợp tiền phòng, điện nước, mạng internet và quản lý thanh toán
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1.5 rounded-xl shadow-xs text-xs">
            <span className="text-slate-400 font-semibold px-2">Kỳ hóa đơn:</span>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="font-bold text-blue-700 bg-transparent focus:outline-hidden cursor-pointer"
            >
              {months.map(m => (
                <option key={m} value={m}>
                  Tháng {m}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleOpenCreate}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Lập hóa đơn mới</span>
          </button>
        </div>
      </div>

      {/* KPI Cards for Month Billing */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Tổng tiền phát hành</span>
          <div className="text-xl font-black text-slate-900 mt-1">
            {formatCurrency(totalBilled)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{filteredInvoices.length} phòng tháng {selectedMonth}</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Đã thu về</span>
          <div className="text-xl font-black text-emerald-600 mt-1">
            {formatCurrency(totalPaid)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            Đạt {totalBilled > 0 ? Math.round((totalPaid / totalBilled) * 100) : 0}% tổng tiền
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Còn nợ / Chưa nộp</span>
          <div className="text-xl font-black text-rose-600 mt-1">
            {formatCurrency(totalRemaining)}
          </div>
          <div className="text-[11px] text-rose-500 font-medium mt-0.5">
            {unpaidCount} hóa đơn chưa tất toán
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Hạn nộp quy định</span>
          <div className="text-base font-black text-blue-700 mt-1">
            Ngày 05 / 10 / 2026
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Từ ngày 1 đến ngày 5 hàng tháng</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã HĐ, mã phòng (P.101), tên người thuê..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="unpaid">Chưa thanh toán</option>
            <option value="paid">Đã thanh toán đủ</option>
            <option value="partially_paid">Thanh toán một phần</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3.5 px-4">Mã Hóa đơn</th>
                <th className="py-3.5 px-4">Phòng</th>
                <th className="py-3.5 px-4">Người nộp</th>
                <th className="py-3.5 px-4">Tiền phòng</th>
                <th className="py-3.5 px-4">Điện + Nước</th>
                <th className="py-3.5 px-4 font-bold text-slate-900">Tổng cộng</th>
                <th className="py-3.5 px-4">Còn nợ</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Không có hóa đơn nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map(inv => (
                  <tr key={inv._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {inv.invoiceCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {inv.roomCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{inv.tenantName}</div>
                      <div className="text-[11px] text-slate-400">{inv.tenantPhone}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {formatCurrency(inv.roomFee)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-600">
                      {formatCurrency(inv.electricityFee + inv.waterFee)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-xs">
                      {formatCurrency(inv.totalAmount)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold">
                      {inv.remainingAmount > 0 ? (
                        <span className="text-rose-600">{formatCurrency(inv.remainingAmount)}</span>
                      ) : (
                        <span className="text-emerald-600">0 ₫</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {inv.status === 'paid' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> Đã nộp
                        </span>
                      ) : inv.status === 'partially_paid' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Clock className="w-3 h-3 text-amber-600" /> Nộp một phần
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                          <AlertCircle className="w-3 h-3 text-rose-600" /> Chưa nộp
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setSelectedInvoiceForDetail(inv)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Xem chi tiết & In phiếu"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {inv.remainingAmount > 0 && (
                          <button
                            onClick={() => onOpenPaymentModal(inv)}
                            className="px-2.5 py-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                            title="Ghi nhận thanh toán"
                          >
                            <DollarSign className="w-3 h-3" />
                            <span>Thu tiền</span>
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (window.confirm(`Xác nhận xóa hóa đơn ${inv.invoiceCode}?`)) {
                              onDeleteInvoice(inv._id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Xóa hóa đơn"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invoice Detail Modal */}
      <InvoiceDetailModal
        invoice={selectedInvoiceForDetail}
        isOpen={Boolean(selectedInvoiceForDetail)}
        onClose={() => setSelectedInvoiceForDetail(null)}
        onQuickPay={inv => {
          setSelectedInvoiceForDetail(null);
          onOpenPaymentModal(inv);
        }}
        isAdmin={true}
      />

      {/* Create New Invoice Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Lập hóa đơn tiền phòng"
        maxWidth="3xl"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chọn phòng *
              </label>
              <select
                required
                value={roomId}
                onChange={e => handleRoomChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
              >
                {rooms.map(room => (
                  <option key={room._id} value={room._id}>
                    {room.roomCode} - {room.roomName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kỳ hóa đơn *
              </label>
              <select
                required
                value={invoiceMonth}
                onChange={e => handleMonthChangeInForm(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-blue-700 focus:ring-1 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
              >
                {months.map(m => (
                  <option key={m} value={m}>
                    Tháng {m}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Tiền phòng (VNĐ)
              </label>
              <input
                type="number"
                step="50000"
                required
                value={roomFee}
                onChange={e => setRoomFee(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-blue-700 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Tiền điện ({elecUsage} kWh)
              </label>
              <input
                type="number"
                step="1000"
                required
                value={elecFee}
                onChange={e => setElecFee(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-amber-700 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Tiền nước ({waterUsage} m³)
              </label>
              <input
                type="number"
                step="1000"
                required
                value={waterFee}
                onChange={e => setWaterFee(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-blue-600 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Internet / Wifi
              </label>
              <input
                type="number"
                step="10000"
                value={internetFee}
                onChange={e => setInternetFee(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Vệ sinh & Rác
              </label>
              <input
                type="number"
                step="10000"
                value={garbageFee}
                onChange={e => setGarbageFee(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-600 mb-1">
                Phí gửi xe máy
              </label>
              <input
                type="number"
                step="10000"
                value={parkingFee}
                onChange={e => setParkingFee(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block font-semibold text-emerald-600 mb-1">
                Giảm trừ / Khuyến mãi
              </label>
              <input
                type="number"
                step="10000"
                value={discount}
                onChange={e => setDiscount(Number(e.target.value))}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl text-emerald-700 font-bold focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Hạn chót thanh toán
              </label>
              <input
                type="date"
                required
                value={dueDate}
                onChange={e => setDueDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú trên hóa đơn
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="VD: Nhắc nhở nộp trước ngày 05..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:outline-hidden"
              />
            </div>
          </div>

          {/* Total summary */}
          <div className="p-4 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">TỔNG CỘNG HÓA ĐƠN:</span>
            <span className="text-xl font-black text-blue-900 font-mono">
              {formatCurrency(calculatedTotal)}
            </span>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsCreateOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              Phát hành hóa đơn
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
