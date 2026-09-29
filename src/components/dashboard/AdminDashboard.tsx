import React from 'react';
import {
  Building2,
  Home,
  Users,
  Receipt,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Zap,
  Droplets,
  Wrench,
  CheckCircle,
  Clock,
  PlusCircle,
  FileText,
} from 'lucide-react';
import {
  DashboardStats,
  Room,
  Invoice,
  MaintenanceRequest,
} from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface AdminDashboardProps {
  stats: DashboardStats;
  rooms: Room[];
  invoices: Invoice[];
  maintenanceRequests: MaintenanceRequest[];
  onNavigate: (tab: string) => void;
  onOpenInvoiceModal: (inv: Invoice) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  stats,
  rooms,
  invoices,
  maintenanceRequests,
  onNavigate,
  onOpenInvoiceModal,
}) => {
  const unpaidInvoices = invoices.filter(
    i => i.status === 'unpaid' || i.status === 'overdue' || i.status === 'partially_paid'
  );

  const pendingRequests = maintenanceRequests.filter(m => m.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 rounded-3xl p-6 text-white shadow-xl shadow-blue-900/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-blue-100 text-xs font-medium mb-2 backdrop-blur-xs">
            <Building2 className="w-3.5 h-3.5" />
            <span>Khu trọ: Nhà Trọ Sinh Viên Xanh</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Chào mừng trở lại, Chủ trọ!
          </h2>
          <p className="text-xs sm:text-sm text-blue-100/80 mt-1 max-w-xl">
            Hôm nay bạn có {stats.availableRooms} phòng trống sẵn sàng cho thuê và {stats.unpaidInvoicesCount} hóa đơn cần theo dõi thu tiền.
          </p>
        </div>

        {/* Quick action shortcuts */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('utilities')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white text-blue-900 font-bold text-xs hover:bg-blue-50 transition-all shadow-sm cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-500" />
            <span>Ghi điện nước</span>
          </button>
          <button
            onClick={() => onNavigate('invoices')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/80 border border-blue-400/40 text-white font-bold text-xs hover:bg-blue-600 transition-all cursor-pointer"
          >
            <Receipt className="w-4 h-4 text-blue-200" />
            <span>Lập hóa đơn</span>
          </button>
          <button
            onClick={() => onNavigate('rooms')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600/80 border border-blue-400/40 text-white font-bold text-xs hover:bg-blue-600 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4 text-emerald-300" />
            <span>Thêm phòng</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (6 core metrics requested in prompt) */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {/* Metric 1: Tổng số phòng */}
        <div 
          onClick={() => onNavigate('rooms')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tổng số phòng</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{stats.totalRooms}</div>
          <div className="text-[11px] text-slate-400 mt-1">Cả 3 tầng nhà trọ</div>
        </div>

        {/* Metric 2: Đang thuê */}
        <div 
          onClick={() => onNavigate('rooms')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Đang cho thuê</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">{stats.rentedRooms}</div>
          <div className="text-[11px] text-emerald-600/80 font-medium mt-1">
            Đạt {stats.occupancyRate}% tỷ lệ lấp đầy
          </div>
        </div>

        {/* Metric 3: Còn trống */}
        <div 
          onClick={() => onNavigate('rooms')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Phòng còn trống</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">{stats.availableRooms}</div>
          <div className="text-[11px] text-slate-400 mt-1">Sẵn sàng dọn vào ở</div>
        </div>

        {/* Metric 4: Tổng số người thuê */}
        <div 
          onClick={() => onNavigate('tenants')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Tổng người thuê</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-800">{stats.totalTenants}</div>
          <div className="text-[11px] text-slate-400 mt-1">Đang đăng ký cư trú</div>
        </div>

        {/* Metric 5: Hóa đơn chưa thanh toán */}
        <div 
          onClick={() => onNavigate('invoices')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-rose-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Hóa đơn chưa thu</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-600">{stats.unpaidInvoicesCount}</div>
          <div className="text-[11px] text-rose-500 font-medium truncate mt-1">
            Nợ: {formatCurrency(stats.unpaidInvoicesAmount)}
          </div>
        </div>

        {/* Metric 6: Tổng doanh thu đã thu */}
        <div 
          onClick={() => onNavigate('invoices')}
          className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold">Doanh thu đã thu</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-black text-blue-700 truncate">
            {formatCurrency(stats.monthlyRevenue)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Tháng 09/2026</div>
        </div>
      </div>

      {/* Middle row: Visual statistics & Occupancy */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Occupancy card & Room Breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm">
                Tỷ lệ lấp đầy phòng trọ
              </h3>
              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                {stats.occupancyRate}%
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 rounded-full h-3.5 overflow-hidden flex mb-4">
              <div 
                className="bg-emerald-500 transition-all duration-500" 
                style={{ width: `${(stats.rentedRooms / stats.totalRooms) * 100}%` }}
                title="Đang thuê"
              />
              <div 
                className="bg-amber-400 transition-all duration-500" 
                style={{ width: `${(stats.availableRooms / stats.totalRooms) * 100}%` }}
                title="Còn trống"
              />
              <div 
                className="bg-slate-400 transition-all duration-500" 
                style={{ width: `${(stats.maintenanceRooms / stats.totalRooms) * 100}%` }}
                title="Đang sửa chữa"
              />
            </div>

            {/* Legend */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-slate-600 font-medium">Đang có người thuê</span>
                </div>
                <span className="font-bold text-slate-800">{stats.rentedRooms} phòng</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-400" />
                  <span className="text-slate-600 font-medium">Phòng còn trống</span>
                </div>
                <span className="font-bold text-slate-800">{stats.availableRooms} phòng</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-slate-400" />
                  <span className="text-slate-600 font-medium">Đang bảo trì / Nâng cấp</span>
                </div>
                <span className="font-bold text-slate-800">{stats.maintenanceRooms} phòng</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50">
              <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                <span>Điện tiêu thụ</span>
              </div>
              <span className="font-bold text-slate-800">{stats.monthlyElectricityKwh} kWh</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50">
              <div className="flex items-center justify-center gap-1 text-slate-500 mb-1">
                <Droplets className="w-3.5 h-3.5 text-blue-500" />
                <span>Nước tiêu thụ</span>
              </div>
              <span className="font-bold text-slate-800">{stats.monthlyWaterM3} m³</span>
            </div>
          </div>
        </div>

        {/* Revenue chart mockup - Clean SVG graph */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Biểu đồ doanh thu 6 tháng gần nhất
              </h3>
              <p className="text-xs text-slate-400">Doanh thu tổng hợp tiền phòng và tiện ích</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-blue-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded bg-blue-600" /> Đã thu
              </span>
              <span className="flex items-center gap-1 text-slate-400 font-semibold">
                <span className="w-2.5 h-2.5 rounded bg-slate-200" /> Dự kiến
              </span>
            </div>
          </div>

          {/* SVG Bar Chart */}
          <div className="h-44 w-full flex items-end justify-between gap-3 pt-6 pb-2 px-2">
            {[
              { month: 'T04', rev: 17200000, max: 22000000 },
              { month: 'T05', rev: 18400000, max: 22000000 },
              { month: 'T06', rev: 19100000, max: 22000000 },
              { month: 'T07', rev: 18800000, max: 22000000 },
              { month: 'T08', rev: 20500000, max: 22000000 },
              { month: 'T09', rev: 20700000, max: 22000000 },
            ].map(col => {
              const heightPct = Math.round((col.rev / col.max) * 100);
              return (
                <div key={col.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(col.rev / 1000000).toFixed(1)}Tr
                  </div>
                  <div className="w-full max-w-[42px] bg-slate-100 rounded-t-xl h-32 flex items-end overflow-hidden">
                    <div
                      className="w-full bg-gradient-to-t from-blue-700 to-blue-500 rounded-t-xl transition-all duration-500 group-hover:from-blue-600 group-hover:to-indigo-500"
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">{col.month}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Trung bình mỗi tháng: ~19.100.000 ₫</span>
            <button
              onClick={() => onNavigate('stats')}
              className="text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
            >
              <span>Xem chi tiết báo cáo</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom row: Actionable lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Unpaid invoices table preview */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <Receipt className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">
                Hóa đơn cần thu ({unpaidInvoices.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigate('invoices')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Xem tất cả
            </button>
          </div>

          {unpaidInvoices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Tất cả các phòng đã thanh toán đầy đủ hóa đơn tháng này!
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {unpaidInvoices.slice(0, 4).map(inv => (
                <div
                  key={inv._id}
                  onClick={() => onOpenInvoiceModal(inv)}
                  className="py-3 flex items-center justify-between hover:bg-slate-50 px-2 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        {inv.roomCode}
                      </span>
                      <span className="text-[11px] text-slate-500 truncate">
                        {inv.tenantName}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      Hạn nộp: {formatDate(inv.dueDate)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-xs text-rose-600">
                      {formatCurrency(inv.remainingAmount)}
                    </div>
                    <span className="inline-block text-[10px] font-semibold text-rose-500 bg-rose-50 px-1.5 py-0.5 rounded">
                      Chưa nộp
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Maintenance requests and tasks */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Wrench className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-800 text-sm">
                Yêu cầu sửa chữa & Bảo trì ({pendingRequests.length} chờ xử lý)
              </h3>
            </div>
            <button
              onClick={() => onNavigate('notifications')}
              className="text-xs font-bold text-blue-600 hover:underline"
            >
              Quản lý
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {maintenanceRequests.slice(0, 3).map(req => (
              <div key={req._id} className="py-3 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                      {req.roomCode}
                    </span>
                    <span className="font-semibold text-xs text-slate-800 truncate">
                      {req.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    {req.description}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Bởi: {req.tenantName} • {req.createdAt}
                  </p>
                </div>
                <span
                  className={`shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    req.status === 'completed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : req.status === 'in_progress'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {req.status === 'completed'
                    ? 'Đã xong'
                    : req.status === 'in_progress'
                    ? 'Đang xử lý'
                    : 'Chờ xử lý'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
