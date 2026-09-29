import React, { useState } from 'react';
import {
  Menu,
  Bell,
  RefreshCw,
  Building,
  UserCheck,
  ShieldCheck,
  ChevronDown,
  RotateCcw,
} from 'lucide-react';
import { User } from '../../types';
import { initialUsers, houseConfig } from '../../data/mockData';

interface NavbarProps {
  onToggleSidebar: () => void;
  currentUser: User;
  onSwitchUser: (user: User) => void;
  onResetData: () => void;
  onNavigateToNotifications?: () => void;
  unreadCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onToggleSidebar,
  currentUser,
  onSwitchUser,
  onResetData,
  onNavigateToNotifications,
  unreadCount = 2,
}) => {
  const [showRoleMenu, setShowRoleMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between">
      {/* Left side */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 lg:hidden"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100/90 text-slate-700 text-xs font-semibold">
          <Building className="w-3.5 h-3.5 text-blue-600" />
          <span>{houseConfig.houseName}</span>
          <span className="text-slate-400">|</span>
          <span className="text-slate-500 font-normal truncate max-w-[200px] xl:max-w-xs">
            {houseConfig.address.split(',')[1] || houseConfig.address}
          </span>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Role Switcher dropdown - Perfect for course project demo! */}
        <div className="relative">
          <button
            onClick={() => setShowRoleMenu(!showRoleMenu)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-xl bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors shadow-xs"
            title="Đổi nhanh quyền kiểm thử đồ án"
          >
            {currentUser.role === 'admin' ? (
              <ShieldCheck className="w-4 h-4 text-blue-600" />
            ) : (
              <UserCheck className="w-4 h-4 text-emerald-600" />
            )}
            <span className="hidden md:inline font-semibold">
              {currentUser.role === 'admin'
                ? 'Đang xem: Chủ nhà'
                : `Đang xem: Người thuê (${currentUser.roomCode})`}
            </span>
            <span className="md:hidden font-semibold">
              {currentUser.role === 'admin' ? 'Chủ nhà' : currentUser.roomCode}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-blue-600 opacity-70" />
          </button>

          {showRoleMenu && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setShowRoleMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-40 text-xs animate-in fade-in slide-in-from-top-2">
                <div className="px-3 py-2 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Chuyển nhanh tài khoản demo
                </div>
                {initialUsers.map(user => (
                  <button
                    key={user._id}
                    onClick={() => {
                      onSwitchUser(user);
                      setShowRoleMenu(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-colors ${
                      currentUser._id === user._id
                        ? 'bg-blue-50 font-bold text-blue-700'
                        : 'text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold">{user.fullName}</p>
                      <p className="text-[10px] text-slate-400">
                        {user.role === 'admin' ? 'Quyền Quản lý' : `Phòng ${user.roomCode}`}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Notifications button */}
        <button
          onClick={onNavigateToNotifications}
          className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
          title="Thông báo"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
          )}
        </button>

        {/* Reset mock data button */}
        <button
          onClick={onResetData}
          className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors hidden sm:block"
          title="Khôi phục dữ liệu mẫu ban đầu"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
