import React, { useState, useMemo } from 'react';
import {
  FileText,
  Plus,
  Search,
  Printer,
  Edit2,
  Trash2,
  Eye,
  CheckCircle,
  AlertTriangle,
  Calendar,
  Building,
  DollarSign,
  User,
  ShieldAlert,
  Clock,
  FileCheck,
  Zap,
  Droplets,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Contract, Room, Tenant } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ContractFormModal } from './ContractFormModal';
import { ContractPrintView } from './ContractPrintView';
import { ContractTerminateModal } from './ContractTerminateModal';

interface ContractManagementProps {
  contracts: Contract[];
  rooms: Room[];
  tenants: Tenant[];
  onSaveContract: (contract: Partial<Contract>) => Promise<void>;
  onDeleteContract: (id: string) => Promise<void>;
}

// Helper to calculate days remaining until contract ends
export function getDaysRemaining(endDateStr: string): number {
  if (!endDateStr) return 999;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const end = new Date(endDateStr);
  end.setHours(0, 0, 0, 0);
  const diffTime = end.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export const ContractManagement: React.FC<ContractManagementProps> = ({
  contracts,
  rooms,
  tenants,
  onSaveContract,
  onDeleteContract,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roomFilter, setRoomFilter] = useState<string>('all');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<Partial<Contract> | null>(null);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewContract, setPreviewContract] = useState<Contract | null>(null);

  const [isTerminateOpen, setIsTerminateOpen] = useState(false);
  const [terminatingContract, setTerminatingContract] = useState<Contract | null>(null);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = contracts.length;
    let active = 0;
    let expiring = 0;
    let expired = 0;
    let terminated = 0;

    contracts.forEach(c => {
      if (c.status === 'terminated') {
        terminated++;
      } else {
        const days = getDaysRemaining(c.endDate);
        if (days < 0) {
          expired++;
        } else if (days <= 30 || c.status === 'expiring') {
          expiring++;
        } else {
          active++;
        }
      }
    });

    return { total, active, expiring, expired, terminated };
  }, [contracts]);

  // Open Add modal
  const handleOpenAdd = () => {
    setEditingContract(null);
    setIsFormOpen(true);
  };

  // Open Edit modal
  const handleOpenEdit = (contract: Contract) => {
    setEditingContract(contract);
    setIsFormOpen(true);
  };

  // Open Preview / Print modal
  const handleOpenPreview = (contract: Contract) => {
    setPreviewContract(contract);
    setIsPreviewOpen(true);
  };

  // Open Terminate modal
  const handleOpenTerminate = (contract: Contract) => {
    setTerminatingContract(contract);
    setIsTerminateOpen(true);
  };

  // Confirm Terminate
  const handleConfirmTerminate = async (contractId: string, reason: string) => {
    await onSaveContract({
      _id: contractId,
      status: 'terminated',
      terminatedAt: new Date().toISOString().split('T')[0],
      terminationReason: reason,
    });
  };

  // Filtered contracts
  const filteredContracts = useMemo(() => {
    return contracts.filter(c => {
      const days = getDaysRemaining(c.endDate);
      const computedStatus =
        c.status === 'terminated'
          ? 'terminated'
          : days < 0
          ? 'expired'
          : days <= 30 || c.status === 'expiring'
          ? 'expiring'
          : 'active';

      // Status filter
      if (statusFilter !== 'all') {
        if (statusFilter === 'active' && computedStatus !== 'active') return false;
        if (statusFilter === 'expiring' && computedStatus !== 'expiring') return false;
        if (statusFilter === 'expired' && computedStatus !== 'expired') return false;
        if (statusFilter === 'terminated' && computedStatus !== 'terminated') return false;
      }

      // Room filter
      if (roomFilter !== 'all' && c.roomId !== roomFilter) {
        return false;
      }

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchCode = c.contractCode?.toLowerCase().includes(query);
        const matchRoom = c.roomCode?.toLowerCase().includes(query);
        const matchTenant = c.representativeTenantName?.toLowerCase().includes(query);
        const matchPhone = c.tenantPhone?.toLowerCase().includes(query);
        const matchIdCard = c.tenantIdCard?.toLowerCase().includes(query);
        return matchCode || matchRoom || matchTenant || matchPhone || matchIdCard;
      }

      return true;
    });
  }, [contracts, statusFilter, roomFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
              Quản lý hợp đồng thuê phòng trọ
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700">
              Chuẩn nghiệp vụ VN
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quản lý thời hạn thuê, tiền đặt cọc, đơn giá điện nước thực tế, danh mục tài sản bàn giao và điều khoản pháp lý
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-600/25 hover:shadow-blue-600/35 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo hợp đồng mới</span>
        </button>
      </div>

      {/* Quick Statistics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Tổng số HĐ</span>
            <span className="text-xl font-black text-slate-800">{stats.total}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-100 shadow-xs flex items-center justify-between bg-emerald-50/20">
          <div>
            <span className="text-[11px] font-semibold text-emerald-700 block">Đang hiệu lực</span>
            <span className="text-xl font-black text-emerald-700">{stats.active}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <CheckCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-100 shadow-xs flex items-center justify-between bg-amber-50/20">
          <div>
            <span className="text-[11px] font-semibold text-amber-700 block">Sắp hết hạn</span>
            <span className="text-xl font-black text-amber-700">{stats.expiring}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-rose-100 shadow-xs flex items-center justify-between bg-rose-50/20">
          <div>
            <span className="text-[11px] font-semibold text-rose-700 block">Đã hết hạn</span>
            <span className="text-xl font-black text-rose-700">{stats.expired}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-slate-500 block">Đã kết thúc</span>
            <span className="text-xl font-black text-slate-600">{stats.terminated}</span>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <FileCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã HĐ, số phòng, họ tên người thuê, SĐT, CCCD..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Room filter */}
          <select
            value={roomFilter}
            onChange={e => setRoomFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Tất cả các phòng</option>
            {rooms.map(r => (
              <option key={r._id} value={r._id}>
                Phòng {r.roomCode}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer font-semibold"
          >
            <option value="all">Tất cả trạng thái ({contracts.length})</option>
            <option value="active">Đang hiệu lực ({stats.active})</option>
            <option value="expiring">Sắp hết hạn ≤ 30 ngày ({stats.expiring})</option>
            <option value="expired">Đã hết hạn ({stats.expired})</option>
            <option value="terminated">Đã kết thúc / thanh lý ({stats.terminated})</option>
          </select>
        </div>
      </div>

      {/* Contracts Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3.5 px-4">Mã Hợp đồng</th>
                <th className="py-3.5 px-4">Phòng</th>
                <th className="py-3.5 px-4">Người đại diện (Bên B)</th>
                <th className="py-3.5 px-4">Thời hạn thuê</th>
                <th className="py-3.5 px-4">Giá thuê / tháng</th>
                <th className="py-3.5 px-4">Tiền đặt cọc</th>
                <th className="py-3.5 px-4">Biểu giá Điện & Nước</th>
                <th className="py-3.5 px-4">Trạng thái</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredContracts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    Không tìm thấy hợp đồng nào phù hợp với bộ lọc tìm kiếm.
                  </td>
                </tr>
              ) : (
                filteredContracts.map(c => {
                  const daysRemaining = getDaysRemaining(c.endDate);
                  const isTerminated = c.status === 'terminated';
                  const isExpired = !isTerminated && daysRemaining < 0;
                  const isExpiring = !isTerminated && !isExpired && (daysRemaining <= 30 || c.status === 'expiring');

                  return (
                    <tr
                      key={c._id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isExpiring ? 'bg-amber-50/30' : isExpired ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Mã HĐ */}
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(c)}
                          className="hover:underline cursor-pointer flex items-center gap-1.5"
                          title="Bấm để xem bản in hợp đồng"
                        >
                          <span>{c.contractCode}</span>
                        </button>
                      </td>

                      {/* Phòng */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {c.roomCode}
                        </span>
                      </td>

                      {/* Người đại diện */}
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{c.representativeTenantName}</div>
                        <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1.5">
                          <span>{c.tenantPhone}</span>
                          {c.tenantIdCard && <span>• CCCD: {c.tenantIdCard}</span>}
                        </div>
                      </td>

                      {/* Thời hạn thuê */}
                      <td className="py-3.5 px-4">
                        <div className="text-slate-800 font-medium">
                          {formatDate(c.startDate)} → {formatDate(c.endDate)}
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{c.rentalTermMonths || 12} tháng</span>
                        </div>
                      </td>

                      {/* Giá thuê */}
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {formatCurrency(c.rentalPrice)}
                      </td>

                      {/* Tiền cọc */}
                      <td className="py-3.5 px-4 font-semibold text-emerald-600">
                        {formatCurrency(c.depositAmount)}
                      </td>

                      {/* Điện nước */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex items-center gap-1 text-amber-700">
                            <Zap className="w-3 h-3 text-amber-500" />
                            <span>{formatCurrency(c.electricityUnitPrice || 3500)}/kWh</span>
                          </div>
                          <div className="flex items-center gap-1 text-cyan-700">
                            <Droplets className="w-3 h-3 text-cyan-500" />
                            <span>{formatCurrency(c.waterUnitPrice || 25000)}/{c.waterType === 'per_person' ? 'người' : 'm³'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Trạng thái */}
                      <td className="py-3.5 px-4">
                        {isTerminated ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                            <FileCheck className="w-3.5 h-3.5 text-slate-400" /> Đã kết thúc
                          </span>
                        ) : isExpired ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Đã hết hạn
                          </span>
                        ) : isExpiring ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-300 shadow-xs animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            <span>Sắp hết hạn ({daysRemaining > 0 ? `Còn ${daysRemaining} ngày` : 'Hôm nay'})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Đang hiệu lực
                          </span>
                        )}
                      </td>

                      {/* Thao tác */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1 justify-end">
                          {/* Xem & In Hợp đồng */}
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(c)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
                            title="Xem bản in / Tải PDF hợp đồng"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Chỉnh sửa */}
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(c)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title="Chỉnh sửa điều khoản & biểu phí"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Kết thúc / Thanh lý hợp đồng */}
                          {!isTerminated && (
                            <button
                              type="button"
                              onClick={() => handleOpenTerminate(c)}
                              className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="Kết thúc & thanh lý hợp đồng (Cập nhật phòng về Trống)"
                            >
                              <FileCheck className="w-4 h-4" />
                            </button>
                          )}

                          {/* Xóa hợp đồng */}
                          <button
                            type="button"
                            onClick={() => {
                              if (
                                window.confirm(
                                  `CẢNH BÁO: Bạn có chắc chắn muốn XÓA vĩnh viễn hợp đồng ${c.contractCode} khỏi cơ sở dữ liệu?\n\n(Khuyến nghị: Thay vì xóa, bạn nên dùng nút "Kết thúc hợp đồng" màu đỏ bên cạnh để giữ lại lịch sử thuê phòng!)`
                                )
                              ) {
                                onDeleteContract(c._id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Xóa vĩnh viễn"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal (Create & Edit) */}
      <ContractFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        editingContract={editingContract}
        rooms={rooms}
        tenants={tenants}
        contracts={contracts}
        onSave={onSaveContract}
        onPreview={c => {
          setPreviewContract(c);
          setIsPreviewOpen(true);
        }}
      />

      {/* Preview & Print Modal */}
      {previewContract && (
        <ContractPrintView
          contract={previewContract}
          isOpen={isPreviewOpen}
          onClose={() => setIsPreviewOpen(false)}
        />
      )}

      {/* Terminate Modal */}
      <ContractTerminateModal
        contract={terminatingContract}
        isOpen={isTerminateOpen}
        onClose={() => setIsTerminateOpen(false)}
        onConfirmTerminate={handleConfirmTerminate}
      />
    </div>
  );
};
