import React, { useState } from 'react';
import {
  Home,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  Users,
  Eye,
  CheckCircle,
  Clock,
  AlertCircle,
  Square,
  Sparkles,
  Tag,
} from 'lucide-react';
import { Room, Tenant, RoomStatus } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { Modal } from '../common/Modal';

interface RoomManagementProps {
  rooms: Room[];
  tenants: Tenant[];
  onSaveRoom: (room: Partial<Room>) => Promise<void>;
  onDeleteRoom: (roomId: string) => Promise<void>;
  onNavigateToTenant?: (roomId: string) => void;
}

export const RoomManagement: React.FC<RoomManagementProps> = ({
  rooms,
  tenants,
  onSaveRoom,
  onDeleteRoom,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFloor, setSelectedFloor] = useState<number | 'all'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Partial<Room> | null>(null);
  const [viewingRoom, setViewingRoom] = useState<Room | null>(null);

  // Form field state
  const [formRoomCode, setFormRoomCode] = useState('');
  const [formRoomName, setFormRoomName] = useState('');
  const [formFloor, setFormFloor] = useState<number>(1);
  const [formArea, setFormArea] = useState<number>(25);
  const [formPrice, setFormPrice] = useState<number>(3200000);
  const [formDeposit, setFormDeposit] = useState<number>(3200000);
  const [formMaxTenants, setFormMaxTenants] = useState<number>(2);
  const [formStatus, setFormStatus] = useState<RoomStatus>('available');
  const [formAmenities, setFormAmenities] = useState<string[]>(['Máy lạnh', 'Nóng lạnh']);
  const [formDescription, setFormDescription] = useState('');

  const commonAmenities = [
    'Máy lạnh',
    'Nóng lạnh',
    'Tủ lạnh',
    'Máy giặt',
    'Gác lửng',
    'Kệ bếp',
    'Ban công',
    'Tủ quần áo',
    'Bàn học',
    'Wifi tốc độ cao',
  ];

  const handleOpenAdd = () => {
    setEditingRoom(null);
    setFormRoomCode(`P.${(rooms.length + 1) * 10}`);
    setFormRoomName(`Phòng ${100 + rooms.length + 1}`);
    setFormFloor(1);
    setFormArea(25);
    setFormPrice(3200000);
    setFormDeposit(3200000);
    setFormMaxTenants(2);
    setFormStatus('available');
    setFormAmenities(['Máy lạnh', 'Nóng lạnh', 'Gác lửng']);
    setFormDescription('');
    setIsFormOpen(true);
  };

  const handleOpenEdit = (room: Room) => {
    setEditingRoom(room);
    setFormRoomCode(room.roomCode);
    setFormRoomName(room.roomName);
    setFormFloor(room.floor);
    setFormArea(room.area);
    setFormPrice(room.price);
    setFormDeposit(room.deposit || room.price);
    setFormMaxTenants(room.maxTenants);
    setFormStatus(room.status);
    setFormAmenities(room.amenities || []);
    setFormDescription(room.description || '');
    setIsFormOpen(true);
  };

  const handleToggleAmenity = (item: string) => {
    if (formAmenities.includes(item)) {
      setFormAmenities(formAmenities.filter(a => a !== item));
    } else {
      setFormAmenities([...formAmenities, item]);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSaveRoom({
      _id: editingRoom?._id,
      roomCode: formRoomCode.trim(),
      roomName: formRoomName.trim(),
      floor: Number(formFloor),
      area: Number(formArea),
      price: Number(formPrice),
      deposit: Number(formDeposit),
      maxTenants: Number(formMaxTenants),
      status: formStatus,
      amenities: formAmenities,
      description: formDescription.trim(),
    });
    setIsFormOpen(false);
  };

  const filteredRooms = rooms.filter(room => {
    const matchSearch =
      room.roomCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.roomName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchFloor = selectedFloor === 'all' || room.floor === selectedFloor;
    const matchStatus = selectedStatus === 'all' || room.status === selectedStatus;
    return matchSearch && matchFloor && matchStatus;
  });

  const getStatusBadge = (status: RoomStatus) => {
    switch (status) {
      case 'rented':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700">
            <CheckCircle className="w-3 h-3" /> Đang thuê
          </span>
        );
      case 'available':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
            <Clock className="w-3 h-3" /> Còn trống
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
            <AlertCircle className="w-3 h-3" /> Đang sửa chữa
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
            Quản lý phòng trọ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Danh sách tất cả các phòng, trạng thái sử dụng và thông số kỹ thuật
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm phòng mới</span>
        </button>
      </div>

      {/* Filter and search bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm theo mã phòng (P.101) hoặc tên..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Floor filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
            <button
              onClick={() => setSelectedFloor('all')}
              className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                selectedFloor === 'all' ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600'
              }`}
            >
              Tất cả tầng
            </button>
            {[1, 2, 3].map(floor => (
              <button
                key={floor}
                onClick={() => setSelectedFloor(floor)}
                className={`px-3 py-1 rounded-lg font-medium transition-colors ${
                  selectedFloor === floor ? 'bg-white shadow-xs text-blue-600 font-bold' : 'text-slate-600'
                }`}
              >
                Tầng {floor}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:outline-hidden focus:border-blue-500 cursor-pointer"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="available">Còn trống</option>
            <option value="rented">Đang thuê</option>
            <option value="maintenance">Đang sửa chữa</option>
          </select>
        </div>
      </div>

      {/* Rooms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
        {filteredRooms.map(room => {
          const roomTenants = tenants.filter(t => t.roomId === room._id);

          return (
            <div
              key={room._id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden"
            >
              {/* Room card top */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-lg text-slate-800">
                        {room.roomCode}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium px-2 py-0.5 rounded-md bg-slate-100">
                        Tầng {room.floor}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 font-medium mt-0.5">
                      {room.roomName}
                    </p>
                  </div>
                  {getStatusBadge(room.status)}
                </div>

                {/* Price and Area */}
                <div className="bg-slate-50 rounded-xl p-3 mb-4 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Giá thuê / tháng
                    </div>
                    <div className="text-base font-black text-blue-700">
                      {formatCurrency(room.price)}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                      Diện tích
                    </div>
                    <div className="text-sm font-bold text-slate-700">
                      {room.area} m²
                    </div>
                  </div>
                </div>

                {/* Tenant occupancy indicator */}
                <div className="flex items-center justify-between text-xs mb-3 text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>
                      Đang ở: <strong className="text-slate-800">{roomTenants.length}</strong> / {room.maxTenants} người
                    </span>
                  </div>
                </div>

                {/* Amenities pills */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {room.amenities?.slice(0, 3).map((am, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600"
                    >
                      {am}
                    </span>
                  ))}
                  {room.amenities && room.amenities.length > 3 && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400">
                      +{room.amenities.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons footer */}
              <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
                <button
                  onClick={() => {
                    setViewingRoom(room);
                    setIsDetailOpen(true);
                  }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Chi tiết</span>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(room)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                    title="Chỉnh sửa thông tin phòng"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Bạn có chắc muốn xóa phòng ${room.roomCode}?`)) {
                        onDeleteRoom(room._id);
                      }
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                    title="Xóa phòng"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Room Modal */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingRoom ? `Chỉnh sửa phòng: ${editingRoom.roomCode}` : 'Thêm phòng trọ mới'}
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mã phòng * (VD: P.101)
              </label>
              <input
                type="text"
                required
                value={formRoomCode}
                onChange={e => setFormRoomCode(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tên / Mô tả ngắn gọn *
              </label>
              <input
                type="text"
                required
                value={formRoomName}
                onChange={e => setFormRoomName(e.target.value)}
                placeholder="Phòng 101 - Ban công"
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tầng
              </label>
              <select
                value={formFloor}
                onChange={e => setFormFloor(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
              >
                <option value={1}>Tầng 1</option>
                <option value={2}>Tầng 2</option>
                <option value={3}>Tầng 3</option>
                <option value={4}>Tầng 4</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Diện tích (m²)
              </label>
              <input
                type="number"
                min="10"
                max="100"
                required
                value={formArea}
                onChange={e => setFormArea(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Số người tối đa
              </label>
              <input
                type="number"
                min="1"
                max="6"
                required
                value={formMaxTenants}
                onChange={e => setFormMaxTenants(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Giá thuê tháng (VNĐ) *
              </label>
              <input
                type="number"
                step="50000"
                required
                value={formPrice}
                onChange={e => setFormPrice(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden font-bold text-blue-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tiền cọc (VNĐ)
              </label>
              <input
                type="number"
                step="50000"
                value={formDeposit}
                onChange={e => setFormDeposit(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Trạng thái phòng
            </label>
            <select
              value={formStatus}
              onChange={e => setFormStatus(e.target.value as RoomStatus)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
            >
              <option value="available">Còn trống</option>
              <option value="rented">Đang cho thuê</option>
              <option value="maintenance">Đang bảo trì / Nâng cấp</option>
            </select>
          </div>

          {/* Amenities selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tiện nghi & Trang thiết bị phòng
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {commonAmenities.map(item => {
                const checked = formAmenities.includes(item);
                return (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleToggleAmenity(item)}
                    className={`flex items-center gap-2 p-2 rounded-xl text-xs text-left transition-all border ${
                      checked
                        ? 'bg-blue-50 border-blue-300 text-blue-700 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[10px] ${
                        checked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300 bg-white'
                      }`}
                    >
                      {checked && '✓'}
                    </span>
                    <span>{item}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả chi tiết / Ghi chú
            </label>
            <textarea
              rows={2}
              value={formDescription}
              onChange={e => setFormDescription(e.target.value)}
              placeholder="VD: Cửa sổ hướng đông, có quạt trần, sẵn bàn ghế..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              {editingRoom ? 'Lưu thay đổi' : 'Thêm phòng mới'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Room Details Modal */}
      {viewingRoom && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Chi tiết phòng: ${viewingRoom.roomCode}`}
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-bold text-slate-800">
                  {viewingRoom.roomName}
                </h4>
                <p className="text-xs text-slate-500">Tầng {viewingRoom.floor} • Diện tích {viewingRoom.area} m²</p>
              </div>
              {getStatusBadge(viewingRoom.status)}
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl text-xs">
              <div>
                <span className="text-slate-400">Giá thuê niêm yết:</span>
                <p className="font-extrabold text-blue-700 text-sm">
                  {formatCurrency(viewingRoom.price)}/tháng
                </p>
              </div>
              <div>
                <span className="text-slate-400">Tiền cọc yêu cầu:</span>
                <p className="font-bold text-slate-700 text-sm">
                  {formatCurrency(viewingRoom.deposit || viewingRoom.price)}
                </p>
              </div>
            </div>

            <div>
              <h5 className="text-xs font-bold text-slate-700 mb-2">
                Trang thiết bị & Tiện nghi:
              </h5>
              <div className="flex flex-wrap gap-1.5">
                {viewingRoom.amenities?.map((am, i) => (
                  <span
                    key={i}
                    className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-medium"
                  >
                    {am}
                  </span>
                ))}
              </div>
            </div>

            {viewingRoom.description && (
              <div>
                <h5 className="text-xs font-bold text-slate-700 mb-1">Mô tả:</h5>
                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
                  {viewingRoom.description}
                </p>
              </div>
            )}

            {/* List of current tenants in this room */}
            <div>
              <h5 className="text-xs font-bold text-slate-700 mb-2">
                Người thuê đang ở ({tenants.filter(t => t.roomId === viewingRoom._id).length} người):
              </h5>
              {tenants.filter(t => t.roomId === viewingRoom._id).length === 0 ? (
                <div className="text-xs text-slate-400 py-3 text-center bg-slate-50 rounded-xl">
                  Hiện chưa có người thuê nào ở phòng này.
                </div>
              ) : (
                <div className="space-y-2">
                  {tenants
                    .filter(t => t.roomId === viewingRoom._id)
                    .map(tenant => (
                      <div
                        key={tenant._id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-800">
                              {tenant.fullName}
                            </span>
                            {tenant.isRepresentative && (
                              <span className="text-[10px] font-semibold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                                Đại diện HĐ
                              </span>
                            )}
                          </div>
                          <p className="text-slate-500 text-[11px]">
                            SĐT: {tenant.phone} • CCCD: {tenant.idCard}
                          </p>
                        </div>
                        <span className="text-[11px] text-slate-400">
                          Vào ở: {tenant.startDate}
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setIsDetailOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Đóng
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
