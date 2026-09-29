import React from 'react';
import {
  Receipt,
  Printer,
  CheckCircle,
  Clock,
  QrCode,
  Copy,
  DollarSign,
  AlertCircle,
  Building,
} from 'lucide-react';
import { Invoice } from '../../types';
import { formatCurrency, formatDate, generateVietQrUrl } from '../../utils/formatters';
import { houseConfig } from '../../data/mockData';
import { Modal } from '../common/Modal';

interface InvoiceDetailModalProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onQuickPay?: (invoice: Invoice) => void;
  isAdmin?: boolean;
}

export const InvoiceDetailModal: React.FC<InvoiceDetailModalProps> = ({
  invoice,
  isOpen,
  onClose,
  onQuickPay,
  isAdmin = true,
}) => {
  if (!invoice) return null;

  const qrUrl = generateVietQrUrl({
    bankCode: 'MB',
    accountNumber: houseConfig.bankAccount,
    accountName: houseConfig.bankAccountName,
    amount: invoice.remainingAmount > 0 ? invoice.remainingAmount : invoice.totalAmount,
    description: `TIEN PHONG ${invoice.roomCode} T${invoice.month.replace('/', '')}`,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Hóa đơn tiền phòng: ${invoice.invoiceCode} - ${invoice.roomCode}`}
      maxWidth="3xl"
    >
      <div className="space-y-4">
        {/* Printable Invoice Container */}
        <div id="printable-invoice" className="p-6 bg-slate-50/70 border border-slate-200 rounded-2xl text-slate-800 space-y-4">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-200 pb-4 gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                <h3 className="font-black text-base text-slate-900">
                  {houseConfig.houseName}
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{houseConfig.address}</p>
              <p className="text-xs text-slate-500">Hotline: {houseConfig.landlordPhone}</p>
            </div>
            <div className="sm:text-right">
              <span className="text-xs font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                MÃ: {invoice.invoiceCode}
              </span>
              <div className="text-xs text-slate-500 mt-1">
                Kỳ thu: <strong>Tháng {invoice.month}</strong>
              </div>
              <div className="text-[11px] text-slate-400">
                Hạn đóng: {formatDate(invoice.dueDate)}
              </div>
            </div>
          </div>

          {/* Tenant info bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400">Phòng thuê:</span>
              <p className="font-bold text-slate-800 text-sm">{invoice.roomCode}</p>
            </div>
            <div>
              <span className="text-slate-400">Người đại diện:</span>
              <p className="font-bold text-slate-800 text-sm">{invoice.tenantName}</p>
            </div>
            <div>
              <span className="text-slate-400">Số điện thoại:</span>
              <p className="font-mono text-slate-700">{invoice.tenantPhone}</p>
            </div>
          </div>

          {/* Cost items breakdown */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 font-bold text-slate-600 text-[11px]">
                  <th className="py-2.5 px-3">Khoản mục</th>
                  <th className="py-2.5 px-3">Chi tiết / Số lượng</th>
                  <th className="py-2.5 px-3">Đơn giá</th>
                  <th className="py-2.5 px-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-900">1. Tiền phòng</td>
                  <td className="py-2.5 px-3 text-slate-500">1 tháng</td>
                  <td className="py-2.5 px-3 font-mono">{formatCurrency(invoice.roomFee)}</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                    {formatCurrency(invoice.roomFee)}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-900">2. Tiền điện</td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono">
                    {invoice.electricityOld} → {invoice.electricityNew} ({invoice.electricityUsage} kWh)
                  </td>
                  <td className="py-2.5 px-3 font-mono">{formatCurrency(3500)}/kWh</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                    {formatCurrency(invoice.electricityFee)}
                  </td>
                </tr>

                <tr>
                  <td className="py-2.5 px-3 font-bold text-slate-900">3. Tiền nước sinh hoạt</td>
                  <td className="py-2.5 px-3 text-slate-500 font-mono">
                    {invoice.waterOld} → {invoice.waterNew} ({invoice.waterUsage} m³)
                  </td>
                  <td className="py-2.5 px-3 font-mono">{formatCurrency(20000)}/m³</td>
                  <td className="py-2.5 px-3 text-right font-bold text-slate-900 font-mono">
                    {formatCurrency(invoice.waterFee)}
                  </td>
                </tr>

                {invoice.internetFee > 0 && (
                  <tr>
                    <td className="py-2 px-3">4. Internet & Wifi</td>
                    <td className="py-2 px-3 text-slate-400">Trọn gói</td>
                    <td className="py-2 px-3 font-mono">{formatCurrency(invoice.internetFee)}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatCurrency(invoice.internetFee)}</td>
                  </tr>
                )}

                {invoice.garbageFee > 0 && (
                  <tr>
                    <td className="py-2 px-3">5. Vệ sinh & Thu gom rác</td>
                    <td className="py-2 px-3 text-slate-400">Trọn gói</td>
                    <td className="py-2 px-3 font-mono">{formatCurrency(invoice.garbageFee)}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatCurrency(invoice.garbageFee)}</td>
                  </tr>
                )}

                {invoice.parkingFee > 0 && (
                  <tr>
                    <td className="py-2 px-3">6. Phí gửi xe máy</td>
                    <td className="py-2 px-3 text-slate-400">Bảo vệ & Nhà xe</td>
                    <td className="py-2 px-3 font-mono">{formatCurrency(invoice.parkingFee)}</td>
                    <td className="py-2 px-3 text-right font-mono">{formatCurrency(invoice.parkingFee)}</td>
                  </tr>
                )}

                {invoice.discount > 0 && (
                  <tr className="bg-emerald-50/50 text-emerald-800">
                    <td className="py-2 px-3 font-semibold">Ưu đãi / Giảm trừ</td>
                    <td className="py-2 px-3 text-emerald-600">Khuyến mãi</td>
                    <td className="py-2 px-3 font-mono">-</td>
                    <td className="py-2 px-3 text-right font-mono font-bold">
                      -{formatCurrency(invoice.discount)}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Totals & QR payment block */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center bg-white p-4 rounded-xl border border-slate-200">
            {/* VietQR Bank Info */}
            <div className="flex items-center gap-3">
              <div className="w-24 h-24 bg-white p-1 rounded-xl border border-slate-200 flex items-center justify-center shrink-0 shadow-xs">
                <img
                  src={qrUrl}
                  alt="Mã QR thanh toán VietQR"
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="text-[11px] space-y-0.5">
                <div className="font-bold text-slate-800 flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-blue-600" />
                  <span>Quét mã VietQR chuyển khoản</span>
                </div>
                <p className="text-slate-500">Ngân hàng: <strong>MB Bank</strong></p>
                <p className="text-slate-500">STK: <strong className="font-mono text-blue-700">{houseConfig.bankAccount}</strong></p>
                <p className="text-slate-500">Chủ TK: <strong>{houseConfig.bankAccountName}</strong></p>
                <p className="text-slate-400 text-[10px]">Cú pháp: <span className="font-mono font-bold text-slate-700">TIEN PHONG {invoice.roomCode}</span></p>
              </div>
            </div>

            {/* Calculations summary */}
            <div className="text-right space-y-1.5 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Tổng cộng phát sinh:</span>
                <span className="font-bold text-slate-800 font-mono">
                  {formatCurrency(invoice.totalAmount)}
                </span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>Đã thanh toán:</span>
                <span className="font-bold text-emerald-600 font-mono">
                  {formatCurrency(invoice.paidAmount)}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-sm">
                <span className="font-black text-slate-900">CÒN PHẢI NỘP:</span>
                <span className="font-black text-rose-600 text-base font-mono">
                  {formatCurrency(invoice.remainingAmount)}
                </span>
              </div>

              <div className="pt-1">
                {invoice.status === 'paid' ? (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                    <CheckCircle className="w-3.5 h-3.5" /> ĐÃ THANH TOÁN ĐẦY ĐỦ
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-100 px-3 py-1 rounded-full">
                    <Clock className="w-3.5 h-3.5" /> CHƯA THANH TOÁN
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Modal footer actions */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>In phiếu thu / hóa đơn</span>
          </button>

          <div className="flex items-center gap-2">
            {invoice.remainingAmount > 0 && onQuickPay && (
              <button
                onClick={() => onQuickPay(invoice)}
                className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                <DollarSign className="w-4 h-4" />
                <span>Ghi nhận đã nộp tiền</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
