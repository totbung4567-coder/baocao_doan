import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, FileCheck, X, Building, User, Calendar, ShieldAlert } from 'lucide-react';
import { Contract } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ContractTerminateModalProps {
  contract: Contract | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmTerminate: (contractId: string, reason: string) => Promise<void>;
}

export const ContractTerminateModal: React.FC<ContractTerminateModalProps> = ({
  contract,
  isOpen,
  onClose,
  onConfirmTerminate,
}) => {
  const [terminationDate, setTerminationDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('Hết hạn hợp đồng và hai bên thống nhất thanh lý.');
  const [depositRefundNote, setDepositRefundNote] = useState('Đã nghiệm thu hiện trạng phòng, hoàn trả đầy đủ tiền cọc sau khi trừ tiền điện nước.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !contract) return null;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const fullReason = `${reason.trim()} (Ngày thanh lý: ${formatDate(terminationDate)}. Ghi chú hoàn cọc: ${depositRefundNote.trim()})`;
      await onConfirmTerminate(contract._id, fullReason);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-rose-50/70 border-b border-rose-100 flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/20">
            <FileCheck className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-black text-rose-900">
              Xác nhận kết thúc & thanh lý hợp đồng
            </h3>
            <p className="text-xs text-rose-700 mt-0.5">
              Hợp đồng số: <strong className="font-mono">{contract.contractCode}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleConfirm} className="p-6 space-y-4">
          {/* Important Notice */}
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">Nghiệp vụ thực hiện khi thanh lý:</p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px] text-amber-800">
                <li>Cập nhật trạng thái hợp đồng thành <strong>“Đã kết thúc”</strong>.</li>
                <li>Cập nhật trạng thái phòng <strong>{contract.roomCode}</strong> về <strong>“Trống” (Sẵn sàng cho thuê mới)</strong>.</li>
                <li><strong>Không xóa hợp đồng:</strong> Toàn bộ dữ liệu hợp đồng vẫn được lưu trữ để tra cứu lịch sử và báo cáo thống kê.</li>
              </ul>
            </div>
          </div>

          {/* Quick Summary Card */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Phòng thuê:</span>
              <strong className="text-slate-800 font-mono text-sm">{contract.roomCode}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Người đại diện thuê:</span>
              <strong className="text-slate-800">{contract.representativeTenantName}</strong>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Thời hạn hợp đồng:</span>
              <span className="text-slate-700">{formatDate(contract.startDate)} → {formatDate(contract.endDate)}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Tiền cọc cần hoàn trả:</span>
              <strong className="text-emerald-700">{formatCurrency(contract.depositAmount)}</strong>
            </div>
          </div>

          {/* Inputs */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ngày kết thúc / thanh lý thực tế *
              </label>
              <input
                type="date"
                required
                value={terminationDate}
                onChange={e => setTerminationDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-rose-500 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Lý do kết thúc hợp đồng *
              </label>
              <textarea
                required
                rows={2}
                value={reason}
                onChange={e => setReason(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-rose-500 focus:bg-white"
                placeholder="Ví dụ: Hết hạn hợp đồng, Khách trả phòng sớm, Chuyển nơi làm việc..."
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Ghi chú nghiệm thu tài sản & hoàn trả tiền đặt cọc
              </label>
              <textarea
                rows={2}
                value={depositRefundNote}
                onChange={e => setDepositRefundNote(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-rose-500 focus:bg-white"
                placeholder="Ghi chú về kiểm tra trang thiết bị và hoàn cọc..."
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Đang xử lý...' : 'Xác nhận kết thúc hợp đồng'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
