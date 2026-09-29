import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Phone,
  CreditCard,
  MapPin,
  Calendar,
  CheckCircle,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { Tenant, Room } from '../../types';
import { Modal } from '../common/Modal';

interface TenantManagementProps {
  tenants: Tenant[];
  rooms: Room[];
  onSaveTenant: (tenant: Partial<Tenant>) => Promise<void>;
  onDeleteTenant: (tenantId: string) => Promise<void>;
}

export const TenantManagement: React.FC<TenantManagementProps> = ({
  tenants,
  rooms,
  onSaveTenant,
  onDeleteTenant,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoomFilter, setSelectedRoomFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTenant, setEditingTenant] = useState<Partial<Tenant> | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [idCard, setIdCard] = useState('');
  const [email, setEmail] = useState('');
  const [birthYear, setBirthYear] = useState<number>(2003);
  const [gender, setGender] = useState<'Nam' | 'Nữ' | 'Khác'>('Nam');
  const [hometown, setHometown] = useState('');
  const [roomId, setRoomId] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [emergencyContact, setEmergencyContact] = useState('');
  const [isRepresentative, setIsRepresentative] = useState(false);
  const [notes, setNotes] = useState('');

  const handleOpenAdd = () => {
    setEditingTenant(null);
    setFullName('');
    setPhone('');
    setIdCard('');
    setEmail('');
    setBirthYear(2003);
    setGender('Nam');
    setHometown('');
    setRoomId(rooms[0]?._id || '');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEmergencyContact('');
    setIsRepresentative(false);
    setNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (t: Tenant) => {
    setEditingTenant(t);
    setFullName(t.fullName);
    setPhone(t.phone);
    setIdCard(t.idCard);
    setEmail(t.email);
    setBirthYear(t.birthYear);
    setGender(t.gender);
    setHometown(t.hometown);
    setRoomId(t.roomId);
    setStartDate(t.startDate);
    setEmergencyContact(t.emergencyContact || '');
    setIsRepresentative(t.isRepresentative);
    setNotes(t.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetRoom = rooms.find(r => r._id === roomId);
    await onSaveTenant({
      _id: editingTenant?._id,
      fullName: fullName.trim(),
      phone: phone.trim(),
      idCard: idCard.trim(),
      email: email.trim(),
      birthYear: Number(birthYear),
      gender,
      hometown: hometown.trim(),
      roomId,
      roomCode: targetRoom ? targetRoom.roomCode : 'P.---',
      startDate,
      emergencyContact: emergencyContact.trim(),
      isRepresentative,
      status: 'active',
      notes: notes.trim(),
    });
    setIsModalOpen(false);
  };

  const filteredTenants = tenants.filter(t => {
    const matchSearch =
      t.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.phone.includes(searchTerm) ||
      t.idCard.includes(searchTerm) ||
      t.roomCode.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRoom = selectedRoomFilter === 'all' || t.roomId === selectedRoomFilter;
    return matchSearch && matchRoom;
  });

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-800 tracking-tight">
            Quản lý người thuê phòng
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh sách khách thuê hiện tại, thông tin CCCD đăng ký tạm trú và liên hệ
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm khách thuê mới</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo họ tên, SĐT, số CCCD hoặc mã phòng..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedRoomFilter}
            onChange={e => setSelectedRoomFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Tất cả các phòng</option>
            {rooms.map(room => (
              <option key={room._id} value={room._id}>
                {room.roomCode} - {room.roomName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <th className="py-3.5 px-4">Họ và tên</th>
                <th className="py-3.5 px-4">Phòng ở</th>
                <th className="py-3.5 px-4">Số điện thoại</th>
                <th className="py-3.5 px-4">CCCD / CMND</th>
                <th className="py-3.5 px-4">Quê quán</th>
                <th className="py-3.5 px-4">Ngày vào ở</th>
                <th className="py-3.5 px-4">Đại diện HĐ</th>
                <th className="py-3.5 px-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
              {filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Không tìm thấy người thuê nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredTenants.map(tenant => (
                  <tr key={tenant._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-slate-900 text-xs">
                          {tenant.fullName}
                        </span>
                        <div className="text-[11px] text-slate-400">
                          {tenant.gender}, sinh năm {tenant.birthYear}
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs">
                        {tenant.roomCode}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {tenant.phone}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {tenant.idCard}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {tenant.hometown}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {tenant.startDate}
                    </td>
                    <td className="py-3.5 px-4">
                      {tenant.isRepresentative ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Đại diện
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-normal">
                          Thành viên
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => handleOpenEdit(tenant)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="Sửa thông tin"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Bạn có chắc muốn xóa người thuê ${tenant.fullName}?`)) {
                              onDeleteTenant(tenant._id);
                            }
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Xóa người thuê"
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

      {/* Add / Edit Tenant Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingTenant ? `Cập nhật: ${editingTenant.fullName}` : 'Thêm người thuê phòng mới'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên *
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số điện thoại *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0912345678"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số CCCD / CMND *
              </label>
              <input
                type="text"
                required
                value={idCard}
                onChange={e => setIdCard(e.target.value)}
                placeholder="001201004567"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="nguoithue@gmail.com"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Năm sinh
              </label>
              <input
                type="number"
                min="1960"
                max="2010"
                required
                value={birthYear}
                onChange={e => setBirthYear(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giới tính
              </label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
              >
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Quê quán / Tỉnh thành
              </label>
              <input
                type="text"
                required
                value={hometown}
                onChange={e => setHometown(e.target.value)}
                placeholder="Hà Nội, Nam Định..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chọn phòng thuê *
              </label>
              <select
                required
                value={roomId}
                onChange={e => setRoomId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
              >
                {rooms.map(room => (
                  <option key={room._id} value={room._id}>
                    {room.roomCode} - {room.roomName} (Hiện có: {room.currentTenantsCount}/{room.maxTenants} người)
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày bắt đầu vào ở
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Liên hệ khẩn cấp (Người thân)
            </label>
            <input
              type="text"
              value={emergencyContact}
              onChange={e => setEmergencyContact(e.target.value)}
              placeholder="0987112233 (Bố - Nguyễn Văn B)"
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 p-3 bg-blue-50/70 border border-blue-200 rounded-xl">
            <input
              type="checkbox"
              id="isRep"
              checked={isRepresentative}
              onChange={e => setIsRepresentative(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500 cursor-pointer"
            />
            <label htmlFor="isRep" className="text-xs text-slate-700 font-medium cursor-pointer">
              Người này là người đại diện đứng tên ký hợp đồng thuê phòng
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ghi chú thêm
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="VD: Sinh viên ĐH X, gửi 1 xe máy..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              {editingTenant ? 'Cập nhật thông tin' : 'Thêm người thuê'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
