import React, { useState } from 'react';
import {
  Zap,
  Droplets,
  Plus,
  Save,
  CheckCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  Receipt,
  FileCheck,
} from 'lucide-react';
import { Room, ElectricityReading, WaterReading } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { houseConfig } from '../../data/mockData';
import { Modal } from '../common/Modal';

interface UtilityManagementProps {
  rooms: Room[];
  electricityReadings: ElectricityReading[];
  waterReadings: WaterReading[];
  onSaveElectricity: (data: Omit<ElectricityReading, '_id' | 'consumption' | 'totalPrice'>) => Promise<void>;
  onSaveWater: (data: Omit<WaterReading, '_id' | 'consumption' | 'totalPrice'>) => Promise<void>;
  onNavigateToInvoices: () => void;
}

export const UtilityManagement: React.FC<UtilityManagementProps> = ({
  rooms,
  electricityReadings,
  waterReadings,
  onSaveElectricity,
  onSaveWater,
  onNavigateToInvoices,
}) => {
  const [selectedMonth, setSelectedMonth] = useState('09/2026');
  const [activeTab, setActiveTab] = useState<'electricity' | 'water'>('electricity');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'electricity' | 'water'>('electricity');
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0]?._id || '');
  
  // Electricity form fields
  const [elecOld, setElecOld] = useState<number>(0);
  const [elecNew, setElecNew] = useState<number>(0);
  const [elecUnitPrice, setElecUnitPrice] = useState<number>(houseConfig.defaultElectricityPrice);

  // Water form fields
  const [waterCalcType, setWaterCalcType] = useState<'per_m3' | 'per_person'>('per_m3');
  const [waterOld, setWaterOld] = useState<number>(0);
  const [waterNew, setWaterNew] = useState<number>(0);
  const [waterPeopleCount, setWaterPeopleCount] = useState<number>(2);
  const [waterUnitPrice, setWaterUnitPrice] = useState<number>(houseConfig.defaultWaterPrice);

  const months = ['09/2026', '08/2026', '07/2026'];

  const filteredElectricity = electricityReadings.filter(e => e.month === selectedMonth);
  const filteredWater = waterReadings.filter(w => w.month === selectedMonth);

  const handleOpenRecordElectricity = (roomId?: string) => {
    setModalType('electricity');
    const targetRoomId = roomId || rooms[0]?._id;
    setSelectedRoomId(targetRoomId);

    // Find existing reading or estimate old index
    const existing = electricityReadings.find(e => e.roomId === targetRoomId && e.month === selectedMonth);
    if (existing) {
      setElecOld(existing.oldIndex);
      setElecNew(existing.newIndex);
      setElecUnitPrice(existing.unitPrice);
    } else {
      setElecOld(1000);
      setElecNew(1120);
      setElecUnitPrice(houseConfig.defaultElectricityPrice);
    }
    setIsModalOpen(true);
  };

  const handleOpenRecordWater = (roomId?: string) => {
    setModalType('water');
    const targetRoomId = roomId || rooms[0]?._id;
    setSelectedRoomId(targetRoomId);

    const existing = waterReadings.find(w => w.roomId === targetRoomId && w.month === selectedMonth);
    if (existing) {
      setWaterCalcType(existing.calculationType);
      setWaterOld(existing.oldIndex);
      setWaterNew(existing.newIndex);
      setWaterPeopleCount(existing.peopleCount || 2);
      setWaterUnitPrice(existing.unitPrice);
    } else {
      setWaterCalcType('per_m3');
      setWaterOld(150);
      setWaterNew(158);
      setWaterPeopleCount(2);
      setWaterUnitPrice(houseConfig.defaultWaterPrice);
    }
    setIsModalOpen(true);
  };

  const handleRoomChangeInModal = (rId: string) => {
    setSelectedRoomId(rId);
    if (modalType === 'electricity') {
      const existing = electricityReadings.find(e => e.roomId === rId && e.month === selectedMonth);
      if (existing) {
        setElecOld(existing.oldIndex);
        setElecNew(existing.newIndex);
      } else {
        setElecOld(1200);
        setElecNew(1300);
      }
    } else {
      const existing = waterReadings.find(w => w.roomId === rId && w.month === selectedMonth);
      if (existing) {
        setWaterOld(existing.oldIndex);
        setWaterNew(existing.newIndex);
      } else {
        setWaterOld(100);
        setWaterNew(108);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const room = rooms.find(r => r._id === selectedRoomId);
    const roomCode = room ? room.roomCode : 'P.---';

    if (modalType === 'electricity') {
      await onSaveElectricity({
        month: selectedMonth,
        roomId: selectedRoomId,
        roomCode,
        oldIndex: Number(elecOld),
        newIndex: Number(elecNew),
        unitPrice: Number(elecUnitPrice),
        recordedDate: new Date().toISOString().split('T')[0],
        status: 'finalized',
      });
    } else {
      await onSaveWater({
        month: selectedMonth,
        roomId: selectedRoomId,
        roomCode,
        calculationType: waterCalcType,
        oldIndex: Number(waterOld),
        newIndex: Number(waterNew),
        peopleCount: Number(waterPeopleCount),
        unitPrice: Number(waterUnitPrice),
        recordedDate: new Date().toISOString().split('T')[0],
        status: 'finalized',
      });
    }
    setIsModalOpen(false);
  };

  // Calculations for current inputs in modal
  const elecConsumption = Math.max(0, elecNew - elecOld);
  const elecTotal = elecConsumption * elecUnitPrice;

  const waterConsumption = Math.max(0, waterNew - waterOld);
  const waterTotal = waterCalcType === 'per_person' ? waterPeopleCount * waterUnitPrice : waterConsumption * waterUnitPrice;

  const totalElecCost = filteredElectricity.reduce((sum, e) => sum + e.totalPrice, 0);
  const totalWaterCost = filteredWater.reduce((sum, w) => sum + w.totalPrice, 0);

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Chỉ số Điện & Nước
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Nhập số công tơ cũ, mới và tự động tính lượng tiêu thụ cùng thành tiền
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Month selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 p-1.5 rounded-xl shadow-xs text-xs">
            <span className="text-slate-400 font-semibold px-2">Kỳ ghi:</span>
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
            onClick={onNavigateToInvoices}
            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Receipt className="w-4 h-4" />
            <span>Lập hóa đơn tiền phòng</span>
          </button>
        </div>
      </div>

      {/* KPI Cards for utilities */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500">
                Tổng tiền điện tháng {selectedMonth}
              </span>
              <div className="text-xl font-black text-slate-900">
                {formatCurrency(totalElecCost)}
              </div>
              <div className="text-[11px] text-amber-600 font-medium">
                Đơn giá: {formatCurrency(houseConfig.defaultElectricityPrice)}/kWh • {filteredElectricity.length} phòng đã chốt
              </div>
            </div>
          </div>
          <button
            onClick={() => handleOpenRecordElectricity()}
            className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            + Nhập điện
          </button>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Droplets className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-500">
                Tổng tiền nước tháng {selectedMonth}
              </span>
              <div className="text-xl font-black text-slate-900">
                {formatCurrency(totalWaterCost)}
              </div>
              <div className="text-[11px] text-blue-600 font-medium">
                Đơn giá: {formatCurrency(houseConfig.defaultWaterPrice)}/m³ • {filteredWater.length} phòng đã chốt
              </div>
            </div>
          </div>
          <button
            onClick={() => handleOpenRecordWater()}
            className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            + Nhập nước
          </button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('electricity')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'electricity'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Bảng chỉ số Điện ({filteredElectricity.length} phòng)</span>
        </button>
        <button
          onClick={() => setActiveTab('water')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'water'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Droplets className="w-4 h-4" />
          <span>Bảng chỉ số Nước ({filteredWater.length} phòng)</span>
        </button>
      </div>

      {/* Electricity Table */}
      {activeTab === 'electricity' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3.5 px-4">Phòng</th>
                  <th className="py-3.5 px-4">Kỳ ghi</th>
                  <th className="py-3.5 px-4">Chỉ số cũ (kWh)</th>
                  <th className="py-3.5 px-4">Chỉ số mới (kWh)</th>
                  <th className="py-3.5 px-4">Tiêu thụ (kWh)</th>
                  <th className="py-3.5 px-4">Đơn giá</th>
                  <th className="py-3.5 px-4 font-bold text-slate-900">Thành tiền</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {rooms.map(room => {
                  const record = filteredElectricity.find(e => e.roomId === room._id);

                  return (
                    <tr key={room._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs">
                          {room.roomCode}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {room.roomName}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {selectedMonth}
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {record ? record.oldIndex : '---'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {record ? record.newIndex : 'Chưa ghi'}
                      </td>
                      <td className="py-3.5 px-4">
                        {record ? (
                          <span className="font-extrabold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                            {record.consumption} kWh
                          </span>
                        ) : (
                          '---'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatCurrency(record ? record.unitPrice : houseConfig.defaultElectricityPrice)}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 text-xs">
                        {record ? formatCurrency(record.totalPrice) : '---'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenRecordElectricity(room._id)}
                          className="px-3 py-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        >
                          {record ? 'Cập nhật' : 'Ghi số'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Water Table */}
      {activeTab === 'water' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                  <th className="py-3.5 px-4">Phòng</th>
                  <th className="py-3.5 px-4">Hình thức tính</th>
                  <th className="py-3.5 px-4">Chỉ số cũ (m³)</th>
                  <th className="py-3.5 px-4">Chỉ số mới (m³)</th>
                  <th className="py-3.5 px-4">Tiêu thụ</th>
                  <th className="py-3.5 px-4">Đơn giá</th>
                  <th className="py-3.5 px-4 font-bold text-slate-900">Thành tiền</th>
                  <th className="py-3.5 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {rooms.map(room => {
                  const record = filteredWater.find(w => w.roomId === room._id);

                  return (
                    <tr key={room._id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900 text-xs">
                          {room.roomCode}
                        </div>
                        <div className="text-[11px] text-slate-400">
                          {room.roomName}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="text-[11px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                          {record?.calculationType === 'per_person' ? 'Theo người' : 'Theo m³'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono">
                        {record ? record.oldIndex : '---'}
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-blue-600">
                        {record ? record.newIndex : 'Chưa ghi'}
                      </td>
                      <td className="py-3.5 px-4">
                        {record ? (
                          <span className="font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            {record.consumption} m³
                          </span>
                        ) : (
                          '---'
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500">
                        {formatCurrency(record ? record.unitPrice : houseConfig.defaultWaterPrice)}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900 text-xs">
                        {record ? formatCurrency(record.totalPrice) : '---'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenRecordWater(room._id)}
                          className="px-3 py-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer"
                        >
                          {record ? 'Cập nhật' : 'Ghi số'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Record Utility Reading Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalType === 'electricity'
            ? `Nhập chỉ số điện tháng ${selectedMonth}`
            : `Nhập chỉ số nước tháng ${selectedMonth}`
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Phòng ghi chỉ số *
            </label>
            <select
              value={selectedRoomId}
              onChange={e => handleRoomChangeInModal(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
            >
              {rooms.map(room => (
                <option key={room._id} value={room._id}>
                  {room.roomCode} - {room.roomName}
                </option>
              ))}
            </select>
          </div>

          {modalType === 'electricity' ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chỉ số cũ (kWh)
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={elecOld}
                    onChange={e => setElecOld(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Chỉ số mới (kWh) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={elecNew}
                    onChange={e => setElecNew(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-blue-700 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đơn giá điện (VNĐ/kWh)
                </label>
                <input
                  type="number"
                  step="100"
                  required
                  value={elecUnitPrice}
                  onChange={e => setElecUnitPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Realtime calculation summary */}
              <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Lượng điện tiêu thụ (Mới - Cũ):</span>
                  <span className="font-extrabold text-amber-700 text-sm">
                    {elecConsumption} kWh
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1.5 border-t border-amber-200">
                  <span className="font-bold text-slate-800">Thành tiền điện tháng {selectedMonth}:</span>
                  <span className="font-black text-amber-900 text-base">
                    {formatCurrency(elecTotal)}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Hình thức tính tiền nước
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setWaterCalcType('per_m3')}
                    className={`p-2 rounded-xl text-xs font-semibold transition-all border ${
                      waterCalcType === 'per_m3'
                        ? 'bg-blue-50 border-blue-400 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Tính theo chỉ số đồng hồ (m³)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaterCalcType('per_person')}
                    className={`p-2 rounded-xl text-xs font-semibold transition-all border ${
                      waterCalcType === 'per_person'
                        ? 'bg-blue-50 border-blue-400 text-blue-700'
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    Tính theo đầu người (người/tháng)
                  </button>
                </div>
              </div>

              {waterCalcType === 'per_m3' ? (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Chỉ số cũ (m³)
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={waterOld}
                      onChange={e => setWaterOld(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Chỉ số mới (m³) *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={waterNew}
                      onChange={e => setWaterNew(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-blue-700 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Số người ở trong phòng
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={waterPeopleCount}
                    onChange={e => setWaterPeopleCount(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đơn giá nước ({waterCalcType === 'per_m3' ? 'VNĐ/m³' : 'VNĐ/người'})
                </label>
                <input
                  type="number"
                  step="1000"
                  required
                  value={waterUnitPrice}
                  onChange={e => setWaterUnitPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Realtime calculation summary */}
              <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>
                    {waterCalcType === 'per_m3'
                      ? 'Lượng nước tiêu thụ (Mới - Cũ):'
                      : 'Định mức theo số người:'}
                  </span>
                  <span className="font-extrabold text-blue-700 text-sm">
                    {waterCalcType === 'per_m3' ? `${waterConsumption} m³` : `${waterPeopleCount} người`}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600 pt-1.5 border-t border-blue-200">
                  <span className="font-bold text-slate-800">Thành tiền nước tháng {selectedMonth}:</span>
                  <span className="font-black text-blue-900 text-base">
                    {formatCurrency(waterTotal)}
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              Lưu chỉ số
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
