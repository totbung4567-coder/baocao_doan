import React from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  DollarSign,
  Home,
  CheckCircle,
  Clock,
  AlertCircle,
  Zap,
  Droplets,
  Calendar,
} from 'lucide-react';
import { Room, Invoice, ElectricityReading, WaterReading } from '../../types';
import { formatCurrency } from '../../utils/formatters';

interface StatsPageProps {
  rooms: Room[];
  invoices: Invoice[];
  electricityReadings: ElectricityReading[];
  waterReadings: WaterReading[];
}

export const StatsPage: React.FC<StatsPageProps> = ({
  rooms,
  invoices,
  electricityReadings,
  waterReadings,
}) => {
  // Occupancy metrics
  const totalRooms = rooms.length;
  const rentedRooms = rooms.filter(r => r.status === 'rented').length;
  const availableRooms = rooms.filter(r => r.status === 'available').length;
  const maintenanceRooms = rooms.filter(r => r.status === 'maintenance').length;
  const occupancyRate = totalRooms > 0 ? Math.round((rentedRooms / totalRooms) * 100) : 0;

  // Revenue breakdown for month 09/2026
  const currentMonthInvoices = invoices.filter(i => i.month === '09/2026');
  const totalBilled = currentMonthInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalCollected = currentMonthInvoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalUnpaid = currentMonthInvoices.reduce((sum, i) => sum + i.remainingAmount, 0);

  const totalRoomFee = currentMonthInvoices.reduce((sum, i) => sum + i.roomFee, 0);
  const totalElecFee = currentMonthInvoices.reduce((sum, i) => sum + i.electricityFee, 0);
  const totalWaterFee = currentMonthInvoices.reduce((sum, i) => sum + i.waterFee, 0);
  const totalOtherFee = currentMonthInvoices.reduce(
    (sum, i) => sum + i.internetFee + i.garbageFee + i.parkingFee,
    0
  );

  // 6 months revenue history data
  const monthlyData = [
    { month: '04/2026', total: 19800000, collected: 19800000, uncollected: 0 },
    { month: '05/2026', total: 20100000, collected: 20100000, uncollected: 0 },
    { month: '06/2026', total: 20900000, collected: 20900000, uncollected: 0 },
    { month: '07/2026', total: 20500000, collected: 20500000, uncollected: 0 },
    { month: '08/2026', total: 21800000, collected: 21800000, uncollected: 0 },
    { month: '09/2026', total: totalBilled || 20810000, collected: totalCollected, uncollected: totalUnpaid },
  ];

  const maxVal = Math.max(...monthlyData.map(d => d.total));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
          Báo cáo & Thống kê tài chính
        </h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Biểu đồ phân tích doanh thu nhà trọ, hiệu quả sử dụng phòng và tỷ lệ thu hồi công nợ
        </p>
      </div>

      {/* KPI 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Tỷ lệ lấp đầy hiện tại</span>
          <div className="text-2xl font-black text-emerald-600 mt-1">{occupancyRate}%</div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {rentedRooms}/{totalRooms} phòng đang hoạt động
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Doanh thu T09/2026</span>
          <div className="text-xl font-black text-slate-900 mt-1">
            {formatCurrency(totalBilled)}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">Bao gồm cả tiền phòng & dịch vụ</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Đã thu về</span>
          <div className="text-xl font-black text-blue-700 mt-1">
            {formatCurrency(totalCollected)}
          </div>
          <div className="text-[11px] text-emerald-600 font-medium mt-0.5">
            {totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0}% dòng tiền về
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-semibold text-slate-500">Công nợ cần thu hồi</span>
          <div className="text-xl font-black text-rose-600 mt-1">
            {formatCurrency(totalUnpaid)}
          </div>
          <div className="text-[11px] text-rose-500 font-medium mt-0.5">
            {currentMonthInvoices.filter(i => i.remainingAmount > 0).length} phòng chưa nộp
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar chart: 6 months revenue */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-slate-800 text-sm">
                Biểu đồ biến động doanh thu 6 tháng
              </h3>
              <p className="text-xs text-slate-400">Số tiền thực thu so với công nợ chưa thu</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded bg-blue-600" /> Đã thu
              </span>
              <span className="flex items-center gap-1 text-slate-700 font-medium">
                <span className="w-2.5 h-2.5 rounded bg-rose-400" /> Chưa thu
              </span>
            </div>
          </div>

          <div className="h-56 w-full flex items-end justify-between gap-4 pt-6 pb-2 px-2">
            {monthlyData.map(col => {
              const collectedPct = (col.collected / maxVal) * 100;
              const uncollectedPct = (col.uncollected / maxVal) * 100;

              return (
                <div key={col.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-bold text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    {(col.total / 1000000).toFixed(1)}Tr
                  </div>
                  <div className="w-full max-w-[46px] bg-slate-100 rounded-t-xl h-40 flex flex-col justify-end overflow-hidden">
                    {col.uncollected > 0 && (
                      <div
                        className="w-full bg-rose-400 transition-all duration-500"
                        style={{ height: `${uncollectedPct}%` }}
                        title={`Chưa thu: ${formatCurrency(col.uncollected)}`}
                      />
                    )}
                    <div
                      className="w-full bg-blue-600 rounded-t-lg transition-all duration-500 group-hover:bg-blue-700"
                      style={{ height: `${collectedPct}%` }}
                      title={`Đã thu: ${formatCurrency(col.collected)}`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-600">{col.month}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between">
            <span>Tổng tích lũy 6 tháng: ~124.000.000 ₫</span>
            <span className="text-emerald-600 font-bold">Tăng trưởng ổn định</span>
          </div>
        </div>

        {/* Revenue structure pie/breakdown */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-800 text-sm mb-1">
              Cơ cấu nguồn thu (Tháng 09)
            </h3>
            <p className="text-xs text-slate-400 mb-6">Tỷ trọng các thành phần cấu thành doanh thu</p>

            <div className="space-y-4 text-xs">
              {/* Tiền phòng */}
              <div>
                <div className="flex justify-between mb-1 font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
                    <span>Tiền phòng</span>
                  </span>
                  <span>{formatCurrency(totalRoomFee)} ({totalBilled > 0 ? Math.round((totalRoomFee / totalBilled) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full"
                    style={{ width: `${totalBilled > 0 ? (totalRoomFee / totalBilled) * 100 : 75}%` }}
                  />
                </div>
              </div>

              {/* Tiền điện */}
              <div>
                <div className="flex justify-between mb-1 font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                    <span>Tiền điện</span>
                  </span>
                  <span>{formatCurrency(totalElecFee)} ({totalBilled > 0 ? Math.round((totalElecFee / totalBilled) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full"
                    style={{ width: `${totalBilled > 0 ? (totalElecFee / totalBilled) * 100 : 12}%` }}
                  />
                </div>
              </div>

              {/* Tiền nước */}
              <div>
                <div className="flex justify-between mb-1 font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-400" />
                    <span>Tiền nước</span>
                  </span>
                  <span>{formatCurrency(totalWaterFee)} ({totalBilled > 0 ? Math.round((totalWaterFee / totalBilled) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-400 h-full rounded-full"
                    style={{ width: `${totalBilled > 0 ? (totalWaterFee / totalBilled) * 100 : 5}%` }}
                  />
                </div>
              </div>

              {/* Phí dịch vụ */}
              <div>
                <div className="flex justify-between mb-1 font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                    <span>Internet & Rác & Xe</span>
                  </span>
                  <span>{formatCurrency(totalOtherFee)} ({totalBilled > 0 ? Math.round((totalOtherFee / totalBilled) * 100) : 0}%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full"
                    style={{ width: `${totalBilled > 0 ? (totalOtherFee / totalBilled) * 100 : 8}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500 text-center">
            Nguồn thu chính đến từ tiền thuê phòng nguyên căn (~75-80%)
          </div>
        </div>
      </div>

      {/* Debt tracking table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs">
        <h3 className="font-bold text-slate-800 text-sm mb-1">
          Theo dõi công nợ tiền phòng tháng 09/2026
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Danh sách các phòng chưa hoàn tất thanh toán hóa đơn
        </p>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3 px-4">Phòng</th>
                <th className="py-3 px-4">Người đại diện</th>
                <th className="py-3 px-4">Số điện thoại</th>
                <th className="py-3 px-4">Tổng tiền hóa đơn</th>
                <th className="py-3 px-4">Đã thanh toán</th>
                <th className="py-3 px-4 font-bold text-rose-600">Số tiền còn nợ</th>
                <th className="py-3 px-4">Hạn nộp</th>
                <th className="py-3 px-4">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {currentMonthInvoices.map(inv => (
                <tr key={inv._id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{inv.roomCode}</td>
                  <td className="py-3 px-4">{inv.tenantName}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{inv.tenantPhone}</td>
                  <td className="py-3 px-4 font-mono">{formatCurrency(inv.totalAmount)}</td>
                  <td className="py-3 px-4 font-mono text-emerald-600">{formatCurrency(inv.paidAmount)}</td>
                  <td className="py-3 px-4 font-mono font-bold text-rose-600">
                    {formatCurrency(inv.remainingAmount)}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{inv.dueDate}</td>
                  <td className="py-3 px-4">
                    {inv.status === 'paid' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        <CheckCircle className="w-3 h-3 text-emerald-600" /> Đã trả đủ
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                        <AlertCircle className="w-3 h-3 text-rose-600" /> Chưa hoàn thành
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
