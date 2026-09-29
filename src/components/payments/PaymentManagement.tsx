import React, { useState } from 'react';
import {
  CreditCard,
  Plus,
  Search,
  DollarSign,
  CheckCircle,
  Building,
  Smartphone,
  Banknote,
  Receipt,
  FileText,
} from 'lucide-react';
import { Payment, Invoice, PaymentMethod } from '../../types';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { Modal } from '../common/Modal';

interface PaymentManagementProps {
  payments: Payment[];
  invoices: Invoice[];
  onRecordPayment: (payment: Omit<Payment, '_id'>) => Promise<void>;
  preselectedInvoice?: Invoice | null;
  onClearPreselectedInvoice?: () => void;
}

export const PaymentManagement: React.FC<PaymentManagementProps> = ({
  payments,
  invoices,
  onRecordPayment,
  preselectedInvoice,
  onClearPreselectedInvoice,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(Boolean(preselectedInvoice));

  // Form state
  const [invoiceId, setInvoiceId] = useState(preselectedInvoice?._id || '');
  const [amount, setAmount] = useState<number>(preselectedInvoice?.remainingAmount || 0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');

  const unpaidInvoices = invoices.filter(i => i.remainingAmount > 0);

  const handleOpenAdd = () => {
    const firstUnpaid = unpaidInvoices[0];
    if (firstUnpaid) {
      setInvoiceId(firstUnpaid._id);
      setAmount(firstUnpaid.remainingAmount);
      setTransactionRef(`MBB-${Math.floor(100000 + Math.random() * 900000)}`);
    } else {
      setInvoiceId('');
      setAmount(0);
      setTransactionRef('');
    }
    setPaymentMethod('bank_transfer');
    setNotes('Thanh toán tiền phòng');
    setIsModalOpen(true);
  };

  const handleInvoiceSelectInModal = (invId: string) => {
    setInvoiceId(invId);
    const inv = invoices.find(i => i._id === invId);
    if (inv) {
      setAmount(inv.remainingAmount);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const inv = invoices.find(i => i._id === invoiceId);
    if (!inv) return;

    await onRecordPayment({
      paymentCode: `TT-${Date.now().toString().slice(-6)}`,
      invoiceId: inv._id,
      invoiceCode: inv.invoiceCode,
      roomId: inv.roomId,
      roomCode: inv.roomCode,
      tenantName: inv.tenantName,
      amount: Number(amount),
      paymentMethod,
      transactionRef: transactionRef.trim() || undefined,
      paymentDate: new Date().toLocaleString('vi-VN'),
      recordedBy: 'Nguyễn Văn Hưng (Chủ trọ)',
      notes: notes.trim(),
    });

    setIsModalOpen(false);
    if (onClearPreselectedInvoice) onClearPreselectedInvoice();
  };

  const filteredPayments = payments.filter(p => {
    const q = searchTerm.trim().toLowerCase();
    const matchSearch = !q || (
      (p.paymentCode || '').toLowerCase().includes(q) ||
      (p.roomCode || '').toLowerCase().includes(q) ||
      (p.tenantName || '').toLowerCase().includes(q) ||
      (p.invoiceCode || '').toLowerCase().includes(q)
    );
    const matchMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;
    return matchSearch && matchMethod;
  });

  const totalCollected = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

  const getMethodBadge = (m: PaymentMethod) => {
    switch (m) {
      case 'bank_transfer':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full">
            <Building className="w-3 h-3 text-blue-600" /> Chuyển khoản VietQR
          </span>
        );
      case 'cash':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
            <Banknote className="w-3 h-3 text-emerald-600" /> Tiền mặt
          </span>
        );
      case 'momo':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
            <Smartphone className="w-3 h-3 text-rose-600" /> Ví MoMo
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Lịch sử giao dịch & Thanh toán
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Ghi nhận và tra cứu các khoản tiền phòng đã thu qua chuyển khoản hoặc tiền mặt
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Ghi nhận thu tiền mới</span>
        </button>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Tổng tiền đã thu nhận</span>
          <div className="text-xl font-black text-emerald-600 mt-1">
            {formatCurrency(totalCollected)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">{filteredPayments.length} giao dịch thành công</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Thu qua Ngân hàng / VietQR</span>
          <div className="text-xl font-black text-blue-700 mt-1">
            {formatCurrency(
              filteredPayments
                .filter(p => p.paymentMethod === 'bank_transfer')
                .reduce((sum, p) => sum + p.amount, 0)
            )}
          </div>
          <div className="text-[11px] text-blue-600 font-medium mt-0.5">Phương thức chủ yếu</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Thu tiền mặt trực tiếp</span>
          <div className="text-xl font-black text-slate-800 mt-1">
            {formatCurrency(
              filteredPayments
                .filter(p => p.paymentMethod === 'cash')
                .reduce((sum, p) => sum + p.amount, 0)
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Nhận tại phòng quản lý</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã thanh toán, mã HĐ, phòng, người nộp..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={methodFilter}
            onChange={e => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Tất cả phương thức</option>
            <option value="bank_transfer">Chuyển khoản VietQR</option>
            <option value="cash">Tiền mặt</option>
            <option value="momo">Ví MoMo</option>
          </select>
        </div>
      </div>

      {/* Payments Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3.5 px-4">Mã Giao dịch</th>
                <th className="py-3.5 px-4">Hóa đơn</th>
                <th className="py-3.5 px-4">Phòng</th>
                <th className="py-3.5 px-4">Người nộp</th>
                <th className="py-3.5 px-4 font-bold text-slate-900">Số tiền đã trả</th>
                <th className="py-3.5 px-4">Phương thức</th>
                <th className="py-3.5 px-4">Mã tham chiếu / Ngân hàng</th>
                <th className="py-3.5 px-4">Thời gian</th>
                <th className="py-3.5 px-4">Người thu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    Chưa có giao dịch thanh toán nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                filteredPayments.map(p => (
                  <tr key={p._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900">
                      {p.paymentCode}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-blue-700 font-bold">
                      {p.invoiceCode}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                        {p.roomCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-900 font-bold">
                      {p.tenantName}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-black text-emerald-600 text-xs">
                      {formatCurrency(p.amount)}
                    </td>
                    <td className="py-3.5 px-4">
                      {getMethodBadge(p.paymentMethod)}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-500">
                      {p.transactionRef || '---'}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {p.paymentDate}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {p.recordedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Payment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          if (onClearPreselectedInvoice) onClearPreselectedInvoice();
        }}
        title="Ghi nhận thanh toán tiền phòng"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Chọn hóa đơn cần thu *
            </label>
            <select
              required
              value={invoiceId}
              onChange={e => handleInvoiceSelectInModal(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
            >
              <option value="">-- Chọn hóa đơn --</option>
              {unpaidInvoices.map(inv => (
                <option key={inv._id} value={inv._id}>
                  {inv.invoiceCode} - Phòng {inv.roomCode} ({inv.tenantName}) - Còn nợ: {formatCurrency(inv.remainingAmount)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Số tiền thu (VNĐ) *
            </label>
            <input
              type="number"
              step="1000"
              required
              value={amount}
              onChange={e => setAmount(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-base font-black text-emerald-700 focus:ring-1 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phương thức thanh toán
              </label>
              <select
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
              >
                <option value="bank_transfer">Chuyển khoản (VietQR / Ngân hàng)</option>
                <option value="cash">Tiền mặt trực tiếp</option>
                <option value="momo">Ví điện tử MoMo</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã tham chiếu / Mã giao dịch
              </label>
              <input
                type="text"
                value={transactionRef}
                onChange={e => setTransactionRef(e.target.value)}
                placeholder="VD: MBB123847, FT26..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú
            </label>
            <input
              type="text"
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="VD: Người nộp qua app ngân hàng lúc 14h..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => {
                setIsModalOpen(false);
                if (onClearPreselectedInvoice) onClearPreselectedInvoice();
              }}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              Lưu phiếu thu
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
