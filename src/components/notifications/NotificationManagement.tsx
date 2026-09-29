import React, { useState } from 'react';
import {
  Bell,
  Plus,
  Send,
  AlertTriangle,
  Wrench,
  CheckCircle,
  Clock,
  Info,
  Building,
  User,
  MessageSquare,
} from 'lucide-react';
import { Notification, MaintenanceRequest, Room, NotificationType } from '../../types';
import { Modal } from '../common/Modal';

interface NotificationManagementProps {
  notifications: Notification[];
  maintenanceRequests: MaintenanceRequest[];
  rooms: Room[];
  onCreateNotification: (data: Omit<Notification, '_id' | 'createdAt'>) => Promise<void>;
  onUpdateMaintenanceStatus: (id: string, status: MaintenanceRequest['status'], adminNote?: string) => Promise<void>;
}

export const NotificationManagement: React.FC<NotificationManagementProps> = ({
  notifications,
  maintenanceRequests,
  rooms,
  onCreateNotification,
  onUpdateMaintenanceStatus,
}) => {
  const [activeTab, setActiveTab] = useState<'notifications' | 'maintenance'>('notifications');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states for Notification
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notifType, setNotifType] = useState<NotificationType>('fee_reminder');
  const [target, setTarget] = useState<'all' | 'specific_room'>('all');
  const [targetRoomId, setTargetRoomId] = useState(rooms[0]?._id || '');

  // Maintenance response modal
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [adminNote, setAdminNote] = useState('');
  const [newStatus, setNewStatus] = useState<MaintenanceRequest['status']>('in_progress');

  const handleOpenAdd = () => {
    setTitle('');
    setContent('');
    setNotifType('fee_reminder');
    setTarget('all');
    setIsModalOpen(true);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetRoom = rooms.find(r => r._id === targetRoomId);
    await onCreateNotification({
      title: title.trim(),
      content: content.trim(),
      type: notifType,
      target,
      targetRoomId: target === 'specific_room' ? targetRoomId : undefined,
      targetRoomCode: target === 'specific_room' && targetRoom ? targetRoom.roomCode : undefined,
      authorName: 'Nguyễn Văn Hưng (Chủ trọ)',
      isRead: false,
    });
    setIsModalOpen(false);
  };

  const handleOpenUpdateMaintenance = (req: MaintenanceRequest) => {
    setSelectedRequest(req);
    setNewStatus(req.status);
    setAdminNote(req.adminNote || '');
  };

  const handleSaveMaintenanceStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    await onUpdateMaintenanceStatus(selectedRequest._id, newStatus, adminNote);
    setSelectedRequest(null);
  };

  const getTypeBadge = (type: NotificationType) => {
    switch (type) {
      case 'fee_reminder':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
            <Clock className="w-3 h-3 text-amber-600" /> Nhắc nộp tiền
          </span>
        );
      case 'maintenance':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
            <Wrench className="w-3 h-3 text-blue-600" /> Bảo trì / Kỹ thuật
          </span>
        );
      case 'urgent':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md">
            <AlertTriangle className="w-3 h-3 text-rose-600" /> Khẩn cấp
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
            <Info className="w-3 h-3 text-slate-500" /> Thông báo chung
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
            Thông báo & Phản ánh sửa chữa
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Gửi bảng tin thông báo đến người thuê và tiếp nhận giải quyết yêu cầu bảo trì hỏng hóc
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tạo thông báo mới</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('notifications')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'notifications'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Bảng tin thông báo ({notifications.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('maintenance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'maintenance'
              ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Yêu cầu sửa chữa ({maintenanceRequests.length})</span>
        </button>
      </div>

      {/* Notifications Tab Content */}
      {activeTab === 'notifications' && (
        <div className="space-y-3">
          {notifications.map(n => (
            <div
              key={n._id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  {getTypeBadge(n.type)}
                  <h4 className="font-bold text-sm text-slate-800">{n.title}</h4>
                </div>
                <div className="text-[11px] text-slate-400">
                  {n.createdAt} • Người gửi: {n.authorName}
                </div>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                {n.content}
              </p>
              <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500">
                <span>
                  Đối tượng:{' '}
                  <strong>
                    {n.target === 'all'
                      ? 'Tất cả các phòng trong khu trọ'
                      : `Riêng phòng ${n.targetRoomCode}`}
                  </strong>
                </span>
                <span className="text-emerald-600 font-semibold">✓ Đã gửi thành công</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Maintenance Requests Tab Content */}
      {activeTab === 'maintenance' && (
        <div className="space-y-3">
          {maintenanceRequests.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center text-xs text-slate-400">
              Hiện tại không có yêu cầu báo hỏng hay sửa chữa nào từ người thuê.
            </div>
          ) : (
            maintenanceRequests.map(req => (
              <div
                key={req._id}
                className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-xs px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-800">
                      {req.roomCode}
                    </span>
                    <h4 className="font-bold text-sm text-slate-800">{req.title}</h4>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        req.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : req.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {req.status === 'completed'
                        ? 'Đã xử lý xong'
                        : req.status === 'in_progress'
                        ? 'Đang cho thợ xử lý'
                        : 'Chờ tiếp nhận'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600">{req.description}</p>
                  <p className="text-[11px] text-slate-400">
                    Báo bởi: <strong>{req.tenantName}</strong> ({req.tenantPhone}) • Gửi lúc: {req.createdAt}
                  </p>
                  {req.adminNote && (
                    <div className="text-xs text-blue-800 bg-blue-50/70 p-2 rounded-lg border border-blue-200">
                      <strong>Ghi chú của chủ nhà:</strong> {req.adminNote}
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <button
                    onClick={() => handleOpenUpdateMaintenance(req)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                  >
                    Cập nhật tiến độ
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* New Notification Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Tạo thông báo mới cho khu trọ"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tiêu đề thông báo *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="VD: Thông báo lịch chốt điện nước tháng..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phân loại thông báo
              </label>
              <select
                value={notifType}
                onChange={e => setNotifType(e.target.value as NotificationType)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
              >
                <option value="fee_reminder">Nhắc đóng tiền phòng / hóa đơn</option>
                <option value="maintenance">Bảo trì điều hòa, điện nước</option>
                <option value="general">Nội quy & Thông báo chung</option>
                <option value="urgent">Khẩn cấp (Cúp điện/nước tạm thời)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Gửi tới đối tượng
              </label>
              <select
                value={target}
                onChange={e => setTarget(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
              >
                <option value="all">Toàn bộ tất cả các phòng</option>
                <option value="specific_room">Chỉ một phòng cụ thể</option>
              </select>
            </div>
          </div>

          {target === 'specific_room' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chọn phòng nhận thông báo *
              </label>
              <select
                value={targetRoomId}
                onChange={e => setTargetRoomId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-blue-700 focus:ring-1 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
              >
                {rooms.map(room => (
                  <option key={room._id} value={room._id}>
                    {room.roomCode} - {room.roomName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nội dung chi tiết *
            </label>
            <textarea
              rows={4}
              required
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="Nhập nội dung đầy đủ để người thuê nắm bắt..."
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>

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
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Send className="w-4 h-4" />
              <span>Phát thông báo</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Update Maintenance Status Modal */}
      {selectedRequest && (
        <Modal
          isOpen={Boolean(selectedRequest)}
          onClose={() => setSelectedRequest(null)}
          title={`Xử lý báo hỏng: ${selectedRequest.roomCode} - ${selectedRequest.title}`}
        >
          <form onSubmit={handleSaveMaintenanceStatus} className="space-y-4">
            <div className="bg-slate-50 p-3 rounded-xl text-xs space-y-1">
              <p><strong>Người gửi:</strong> {selectedRequest.tenantName} ({selectedRequest.tenantPhone})</p>
              <p><strong>Mô tả:</strong> {selectedRequest.description}</p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trạng thái tiến độ
              </label>
              <select
                value={newStatus}
                onChange={e => setNewStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-1 focus:ring-blue-500 focus:outline-hidden cursor-pointer"
              >
                <option value="pending">Chờ xử lý</option>
                <option value="in_progress">Đang sửa chữa / Đã gọi thợ</option>
                <option value="completed">Đã sửa chữa xong hoàn tất</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú thông tin cho người thuê
              </label>
              <input
                type="text"
                value={adminNote}
                onChange={e => setAdminNote(e.target.value)}
                placeholder="VD: Đã hẹn thợ chiều nay 16h qua thay bóng..."
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs focus:ring-1 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
              >
                Đóng
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                Cập nhật
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
