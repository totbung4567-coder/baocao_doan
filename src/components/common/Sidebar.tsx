import React from 'react';
import {
  LayoutDashboard,
  Home,
  Users,
  FileText,
  Zap,
  Receipt,
  CreditCard,
  BarChart3,
  Bell,
  LogOut,
  ShieldCheck,
  UserCheck,
  Building2,
  Wrench,
  HelpCircle,
} from 'lucide-react';
import { User } from '../../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  currentUser: User;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  currentUser,
  onLogout,
  isOpen,
  onClose,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const adminNavItems = [
    { id: 'dashboard', label: 'Bảng điều khiển', icon: LayoutDashboard },
    { id: 'rooms', label: 'Quản lý phòng', icon: Home },
    { id: 'tenants', label: 'Người thuê', icon: Users },
    { id: 'contracts', label: 'Hợp đồng thuê', icon: FileText },
    { id: 'utilities', label: 'Chỉ số điện nước', icon: Zap },
    { id: 'invoices', label: 'Hóa đơn tiền phòng', icon: Receipt },
    { id: 'payments', label: 'Lịch sử thanh toán', icon: CreditCard },
    { id: 'stats', label: 'Báo cáo & Thống kê', icon: BarChart3 },
    { id: 'notifications', label: 'Thông báo & Sửa chữa', icon: Bell },
  ];

  const tenantNavItems = [
    { id: 'tenant_overview', label: 'Phòng của tôi', icon: Home },
    { id: 'tenant_invoices', label: 'Hóa đơn & Thanh toán', icon: Receipt },
    { id: 'tenant_utilities', label: 'Chỉ số điện nước', icon: Zap },
    { id: 'tenant_contract', label: 'Hợp đồng thuê phòng', icon: FileText },
    { id: 'tenant_requests', label: 'Báo hỏng & Sửa chữa', icon: Wrench },
    { id: 'tenant_notifications', label: 'Thông báo từ chủ nhà', icon: Bell },
  ];

  const navItems = isAdmin ? adminNavItems : tenantNavItems;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden backdrop-blur-xs"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 text-slate-200 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-800 bg-slate-950/60">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-extrabold text-base tracking-tight text-white leading-tight">
              TroManage
            </h1>
            <p className="text-[11px] text-blue-400 font-medium">
              Đồ án Quản lý phòng trọ
            </p>
          </div>
        </div>

        {/* User preview card */}
        <div className="p-4 mx-3 my-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center gap-3">
          <div className="relative">
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
              alt={currentUser.fullName}
              className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/40"
            />
            <span
              className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-slate-900 ${
                isAdmin ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
            />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">
              {currentUser.fullName}
            </p>
            <div className="flex items-center gap-1 mt-0.5">
              {isAdmin ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-300 bg-amber-400/10 px-1.5 py-0.5 rounded">
                  <ShieldCheck className="w-3 h-3" /> Chủ trọ / Admin
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-300 bg-emerald-400/10 px-1.5 py-0.5 rounded">
                  <UserCheck className="w-3 h-3" /> {currentUser.roomCode || 'Người thuê'}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {isAdmin ? 'Quản lý khu trọ' : 'Cổng thông tin người thuê'}
          </div>

          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelectTab(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Footer info & Logout */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-950/40">
          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-rose-300 hover:text-rose-100 hover:bg-rose-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Đăng xuất tài khoản</span>
          </button>
          <div className="mt-2 text-center text-[10px] text-slate-400">
            Phiên bản đồ án v1.0.0
          </div>
        </div>
      </aside>
    </>
  );
};
