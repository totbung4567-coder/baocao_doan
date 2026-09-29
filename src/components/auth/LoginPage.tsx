import React, { useState } from 'react';
import {
  Building2,
  Lock,
  User,
  ShieldCheck,
  UserCheck,
  Eye,
  EyeOff,
  LogIn,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { initialUsers, houseConfig } from '../../data/mockData';
import { User as UserType } from '../../types';

interface LoginPageProps {
  onLogin: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  onDirectLogin: (user: UserType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onDirectLogin }) => {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);
    const res = await onLogin(username, password);
    setLoading(false);
    if (!res.success) {
      setErrorMessage(res.message || 'Tài khoản hoặc mật khẩu không chính xác.');
    }
  };

  const handleSelectDemo = (u: UserType) => {
    setUsername(u.username);
    setPassword('123456');
    onDirectLogin(u);
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Logo and header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 text-white shadow-xl shadow-blue-500/25 mb-3">
            <Building2 className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            TroManage
          </h1>
          <p className="text-slate-400 text-xs mt-1">
            Hệ thống Quản lý Phòng trọ & Người thuê
          </p>
          <div className="inline-block mt-2 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-[11px]">
            {houseConfig.houseName} • {houseConfig.landlordPhone}
          </div>
        </div>

        {/* Login card */}
        <div className="bg-slate-800/90 backdrop-blur-xl border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-black/40">
          <h2 className="text-lg font-bold text-white mb-1">
            Đăng nhập hệ thống
          </h2>
          <p className="text-xs text-slate-400 mb-6">
            Nhập tài khoản để truy cập chức năng theo phân quyền
          </p>

          {errorMessage && (
            <div className="mb-5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Tên đăng nhập
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="admin hoặc tenant1"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Mặc định: 123456"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-sm placeholder:text-slate-500 focus:outline-hidden focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-200"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Đang xác thực...' : 'Đăng nhập'}</span>
            </button>
          </form>

          {/* Demo account quick login box - Crucial for student project presentation */}
          <div className="mt-6 pt-5 border-t border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2.5 text-center">
              Tài khoản mẫu cho chấm đồ án
            </p>
            <div className="space-y-2">
              {initialUsers.map(u => (
                <button
                  key={u._id}
                  type="button"
                  onClick={() => handleSelectDemo(u)}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-700/70 border border-slate-700/50 transition-all group text-left cursor-pointer"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={u.avatar}
                      alt={u.fullName}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-600"
                    />
                    <div>
                      <p className="text-xs font-semibold text-slate-200 group-hover:text-blue-400">
                        {u.fullName}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        TK: <span className="font-mono text-slate-300">{u.username}</span> | MK: <span className="font-mono text-slate-300">123456</span>
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0">
                    {u.role === 'admin' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                        <ShieldCheck className="w-3 h-3" /> Chủ nhà
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                        <UserCheck className="w-3 h-3" /> {u.roomCode}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-400 mt-6">
          Đồ án môn học: Xây dựng Website Quản lý phòng trọ • ReactJS + Express + MongoDB
        </p>
      </div>
    </div>
  );
};
