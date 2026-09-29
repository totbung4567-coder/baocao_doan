import React, { useState, useEffect, useMemo } from 'react';
import {
  FileText,
  User,
  Building,
  DollarSign,
  Zap,
  Droplets,
  Plus,
  Trash2,
  AlertTriangle,
  Eye,
  CheckCircle,
  HelpCircle,
  Shield,
  Layers,
  Calendar,
  Sparkles,
  Info,
  Clock,
  X,
  CreditCard,
  Package,
  FileCheck2,
} from 'lucide-react';
import {
  Contract,
  Room,
  Tenant,
  ContractFeeItem,
  ContractAssetItem,
  ContractTermsGroup,
} from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { houseConfig, defaultContractTermsGroup } from '../../data/mockData';

interface ContractFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingContract: Partial<Contract> | null;
  rooms: Room[];
  tenants: Tenant[];
  contracts: Contract[];
  onSave: (contractData: Partial<Contract>) => Promise<void>;
  onPreview: (contractData: Contract) => void;
}

export const ContractFormModal: React.FC<ContractFormModalProps> = ({
  isOpen,
  onClose,
  editingContract,
  rooms,
  tenants,
  contracts,
  onSave,
  onPreview,
}) => {
  // Navigation tabs between sections for easy jumping
  const [activeSection, setActiveSection] = useState<string>('sec-contract');

  // Section 1: Thông tin hợp đồng
  const [contractCode, setContractCode] = useState('');
  const [signingDate, setSigningDate] = useState(new Date().toISOString().split('T')[0]);
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [rentalTermMonths, setRentalTermMonths] = useState(12);

  // Section 2: Bên cho thuê (Bên A)
  const [landlordName, setLandlordName] = useState(houseConfig.landlordName);
  const [landlordPhone, setLandlordPhone] = useState(houseConfig.landlordPhone);
  const [landlordIdCard, setLandlordIdCard] = useState('001085012345');
  const [landlordAddress, setLandlordAddress] = useState(houseConfig.address);

  // Section 3: Bên thuê (Bên B)
  const [representativeTenantId, setRepresentativeTenantId] = useState('');
  const [representativeTenantName, setRepresentativeTenantName] = useState('');
  const [tenantPhone, setTenantPhone] = useState('');
  const [tenantIdCard, setTenantIdCard] = useState('');
  const [tenantAddress, setTenantAddress] = useState('');
  const [tenantEmail, setTenantEmail] = useState('');
  const [tenantBirthYear, setTenantBirthYear] = useState<number | undefined>(undefined);

  // Section 4: Phòng thuê
  const [roomId, setRoomId] = useState('');

  // Section 5: Giá thuê & Đặt cọc
  const [rentalPrice, setRentalPrice] = useState<number>(3200000);
  const [depositAmount, setDepositAmount] = useState<number>(3200000);

  // Section 6: Điện
  const [electricityType, setElectricityType] = useState<'per_kwh' | 'fixed'>('per_kwh');
  const [electricityUnitPrice, setElectricityUnitPrice] = useState<number>(houseConfig.defaultElectricityPrice);
  const [electricityInitialIndex, setElectricityInitialIndex] = useState<number>(0);
  const [electricityNote, setElectricityNote] = useState('Tính theo chỉ số kWh công tơ riêng của phòng hàng tháng.');

  // Section 7: Nước
  const [waterType, setWaterType] = useState<'per_m3' | 'per_person' | 'fixed'>('per_m3');
  const [waterUnitPrice, setWaterUnitPrice] = useState<number>(houseConfig.defaultWaterPrice);
  const [waterInitialIndex, setWaterInitialIndex] = useState<number>(0);
  const [waterNote, setWaterNote] = useState('Tính theo chỉ số đồng hồ nước thực tế.');

  // Section 8: Các khoản phí khác
  const [extraFees, setExtraFees] = useState<ContractFeeItem[]>([
    { id: 'fee_1', name: 'Internet / Wifi tốc độ cao', amount: 80000, unit: 'phòng/tháng', cycle: 'Hàng tháng', note: 'Cáp quang 150Mbps' },
    { id: 'fee_2', name: 'Vệ sinh & Thu gom rác sinh hoạt', amount: 30000, unit: 'phòng/tháng', cycle: 'Hàng tháng', note: 'Đổ rác mỗi ngày' },
    { id: 'fee_3', name: 'Phí gửi xe máy', amount: 50000, unit: 'xe/tháng', cycle: 'Hàng tháng', note: 'Giữ xe có camera an ninh' },
  ]);

  // Section 9: Quy định thanh toán
  const [paymentDay, setPaymentDay] = useState<number>(5);
  const [paymentMethod, setPaymentMethod] = useState<string>('Chuyển khoản / Quét VietQR');
  const [paymentDueDays, setPaymentDueDays] = useState<number>(5);
  const [latePaymentNote, setLatePaymentNote] = useState('Thanh toán từ ngày 1 đến ngày 5 hàng tháng. Chậm quá 5 ngày vui lòng báo trước.');

  // Section 10: Tài sản bàn giao
  const [handedOverAssets, setHandedOverAssets] = useState<ContractAssetItem[]>([
    { id: 'ast_1', name: 'Máy điều hòa 9000BTU Inverter', quantity: 1, condition: 'Hoạt động tốt 95%', note: 'Kèm remote và giá treo' },
    { id: 'ast_2', name: 'Bình nóng lạnh 20L', quantity: 1, condition: 'Mới 100%', note: 'Có chống giật ELCB' },
    { id: 'ast_3', name: 'Giường ngủ gỗ 1m6 x 2m', quantity: 1, condition: 'Tốt, không mối mọt', note: 'Kèm dát giường gỗ' },
    { id: 'ast_4', name: 'Kệ bếp nấu ăn mặt đá & chậu rửa inox', quantity: 1, condition: 'Sạch sẽ', note: 'Vòi không rò rỉ' },
    { id: 'ast_5', name: 'Tủ quần áo 2 cánh', quantity: 1, condition: 'Tốt 90%', note: 'Có gương soi và khóa' },
  ]);

  // Section 11: 12 nhóm điều khoản hợp đồng chi tiết
  const [termsGroup, setTermsGroup] = useState<ContractTermsGroup>(defaultContractTermsGroup);

  // Section 12: Trạng thái & ngày tạo
  const [status, setStatus] = useState<Contract['status']>('active');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form values
  useEffect(() => {
    if (editingContract) {
      setContractCode(editingContract.contractCode || '');
      setSigningDate(editingContract.signingDate || editingContract.createdAt || new Date().toISOString().split('T')[0]);
      setStartDate(editingContract.startDate || new Date().toISOString().split('T')[0]);
      setEndDate(editingContract.endDate || '');
      setRentalTermMonths(editingContract.rentalTermMonths || 12);

      setLandlordName(editingContract.landlordName || houseConfig.landlordName);
      setLandlordPhone(editingContract.landlordPhone || houseConfig.landlordPhone);
      setLandlordIdCard(editingContract.landlordIdCard || '001085012345');
      setLandlordAddress(editingContract.landlordAddress || houseConfig.address);

      setRepresentativeTenantId(editingContract.representativeTenantId || '');
      setRepresentativeTenantName(editingContract.representativeTenantName || '');
      setTenantPhone(editingContract.tenantPhone || '');
      setTenantIdCard(editingContract.tenantIdCard || '');
      setTenantAddress(editingContract.tenantAddress || '');
      setTenantEmail(editingContract.tenantEmail || '');
      setTenantBirthYear(editingContract.tenantBirthYear);

      setRoomId(editingContract.roomId || '');
      setRentalPrice(editingContract.rentalPrice || 3000000);
      setDepositAmount(editingContract.depositAmount || 3000000);

      setElectricityType(editingContract.electricityType || 'per_kwh');
      setElectricityUnitPrice(editingContract.electricityUnitPrice || houseConfig.defaultElectricityPrice);
      setElectricityInitialIndex(editingContract.electricityInitialIndex || 0);
      setElectricityNote(editingContract.electricityNote || 'Tính theo chỉ số kWh công tơ riêng của phòng hàng tháng.');

      setWaterType(editingContract.waterType || 'per_m3');
      setWaterUnitPrice(editingContract.waterUnitPrice || houseConfig.defaultWaterPrice);
      setWaterInitialIndex(editingContract.waterInitialIndex || 0);
      setWaterNote(editingContract.waterNote || 'Tính theo chỉ số đồng hồ nước thực tế.');

      setExtraFees(editingContract.extraFees && editingContract.extraFees.length > 0 ? editingContract.extraFees : [
        { id: 'fee_1', name: 'Internet / Wifi tốc độ cao', amount: 80000, unit: 'phòng/tháng', cycle: 'Hàng tháng', note: 'Cáp quang 150Mbps' },
        { id: 'fee_2', name: 'Vệ sinh & Thu gom rác sinh hoạt', amount: 30000, unit: 'phòng/tháng', cycle: 'Hàng tháng', note: 'Đổ rác mỗi ngày' },
        { id: 'fee_3', name: 'Phí gửi xe máy', amount: 50000, unit: 'xe/tháng', cycle: 'Hàng tháng', note: 'Giữ xe có camera an ninh' },
      ]);

      setPaymentDay(editingContract.paymentDay || 5);
      setPaymentMethod(editingContract.paymentMethod || 'Chuyển khoản / Quét VietQR');
      setPaymentDueDays(editingContract.paymentDueDays || 5);
      setLatePaymentNote(editingContract.latePaymentNote || 'Thanh toán từ ngày 1 đến ngày 5 hàng tháng. Chậm quá 5 ngày vui lòng báo trước.');

      setHandedOverAssets(editingContract.handedOverAssets && editingContract.handedOverAssets.length > 0 ? editingContract.handedOverAssets : [
        { id: 'ast_1', name: 'Máy điều hòa 9000BTU Inverter', quantity: 1, condition: 'Hoạt động tốt 95%', note: 'Kèm remote và giá treo' },
        { id: 'ast_2', name: 'Bình nóng lạnh 20L', quantity: 1, condition: 'Mới 100%', note: 'Có chống giật ELCB' },
        { id: 'ast_3', name: 'Giường ngủ gỗ 1m6 x 2m', quantity: 1, condition: 'Tốt, không mối mọt', note: 'Kèm dát giường gỗ' },
        { id: 'ast_4', name: 'Kệ bếp nấu ăn mặt đá & chậu rửa inox', quantity: 1, condition: 'Sạch sẽ', note: 'Vòi không rò rỉ' },
        { id: 'ast_5', name: 'Tủ quần áo 2 cánh', quantity: 1, condition: 'Tốt 90%', note: 'Có gương soi và khóa' },
      ]);

      setTermsGroup(editingContract.termsGroup || defaultContractTermsGroup);
      setStatus(editingContract.status || 'active');
    } else {
      // New contract mode
      const newCode = `HD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
      setContractCode(newCode);
      const today = new Date().toISOString().split('T')[0];
      setSigningDate(today);
      setStartDate(today);

      // Default 12 months
      const startD = new Date();
      const endD = new Date(startD);
      endD.setFullYear(endD.getFullYear() + 1);
      setEndDate(endD.toISOString().split('T')[0]);
      setRentalTermMonths(12);

      setLandlordName(houseConfig.landlordName);
      setLandlordPhone(houseConfig.landlordPhone);
      setLandlordIdCard('001085012345');
      setLandlordAddress(houseConfig.address);

      // Default room (prefer available room)
      const availRoom = rooms.find(r => r.status === 'available') || rooms[0];
      if (availRoom) {
        setRoomId(availRoom._id);
        setRentalPrice(availRoom.price);
        setDepositAmount(availRoom.deposit || availRoom.price);
      }

      // Default tenant
      if (tenants.length > 0) {
        const t = tenants[0];
        setRepresentativeTenantId(t._id);
        setRepresentativeTenantName(t.fullName);
        setTenantPhone(t.phone);
        setTenantIdCard(t.idCard);
        setTenantAddress(t.hometown);
        setTenantEmail(t.email);
        setTenantBirthYear(t.birthYear);
      }

      setElectricityType('per_kwh');
      setElectricityUnitPrice(houseConfig.defaultElectricityPrice);
      setElectricityInitialIndex(0);
      setElectricityNote('Tính theo chỉ số kWh công tơ riêng của phòng hàng tháng.');

      setWaterType('per_m3');
      setWaterUnitPrice(houseConfig.defaultWaterPrice);
      setWaterInitialIndex(0);
      setWaterNote('Tính theo chỉ số đồng hồ nước thực tế.');

      setExtraFees([
        { id: 'fee_1', name: 'Internet / Wifi tốc độ cao', amount: 80000, unit: 'phòng/tháng', cycle: 'Hàng tháng', note: 'Cáp quang 150Mbps' },
        { id: 'fee_2', name: 'Vệ sinh & Thu gom rác sinh hoạt', amount: 30000, unit: 'phòng/tháng', cycle: 'Hàng tháng', note: 'Đổ rác mỗi ngày' },
        { id: 'fee_3', name: 'Phí gửi xe máy', amount: 50000, unit: 'xe/tháng', cycle: 'Hàng tháng', note: 'Giữ xe có camera an ninh' },
      ]);

      setPaymentDay(5);
      setPaymentMethod('Chuyển khoản / Quét VietQR');
      setPaymentDueDays(5);
      setLatePaymentNote('Thanh toán từ ngày 1 đến ngày 5 hàng tháng. Chậm quá 5 ngày vui lòng báo trước.');

      setHandedOverAssets([
        { id: 'ast_1', name: 'Máy điều hòa 9000BTU Inverter', quantity: 1, condition: 'Hoạt động tốt 95%', note: 'Kèm remote và giá treo' },
        { id: 'ast_2', name: 'Bình nóng lạnh 20L', quantity: 1, condition: 'Mới 100%', note: 'Có chống giật ELCB' },
        { id: 'ast_3', name: 'Giường ngủ gỗ 1m6 x 2m', quantity: 1, condition: 'Tốt, không mối mọt', note: 'Kèm dát giường gỗ' },
        { id: 'ast_4', name: 'Kệ bếp nấu ăn mặt đá & chậu rửa inox', quantity: 1, condition: 'Sạch sẽ', note: 'Vòi không rò rỉ' },
        { id: 'ast_5', name: 'Tủ quần áo 2 cánh', quantity: 1, condition: 'Tốt 90%', note: 'Có gương soi và khóa' },
      ]);

      setTermsGroup(defaultContractTermsGroup);
      setStatus('active');
    }
  }, [editingContract, isOpen, rooms, tenants]);

  // Auto calculate rental term when start or end date changes
  const calculateMonths = (start: string, end: string) => {
    if (!start || !end) return;
    const s = new Date(start);
    const e = new Date(end);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) return;
    const diffMonths = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
    const exactDays = Math.round((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24));
    if (diffMonths > 0) {
      setRentalTermMonths(diffMonths);
    } else if (exactDays > 0) {
      setRentalTermMonths(Math.max(1, Math.round(exactDays / 30)));
    }
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    calculateMonths(val, endDate);
  };

  const handleEndDateChange = (val: string) => {
    setEndDate(val);
    calculateMonths(startDate, val);
  };

  const setTermDurationQuick = (months: number) => {
    setRentalTermMonths(months);
    const s = new Date(startDate || new Date().toISOString().split('T')[0]);
    const e = new Date(s);
    e.setMonth(e.getMonth() + months);
    setEndDate(e.toISOString().split('T')[0]);
  };

  // Handle select tenant
  const handleSelectTenant = (tenantId: string) => {
    setRepresentativeTenantId(tenantId);
    const t = tenants.find(item => item._id === tenantId);
    if (t) {
      setRepresentativeTenantName(t.fullName);
      setTenantPhone(t.phone);
      setTenantIdCard(t.idCard || '');
      setTenantAddress(t.hometown || '');
      setTenantEmail(t.email || '');
      setTenantBirthYear(t.birthYear);
    }
  };

  // Handle select room
  const handleSelectRoom = (rId: string) => {
    setRoomId(rId);
    const r = rooms.find(item => item._id === rId);
    if (r) {
      setRentalPrice(r.price);
      setDepositAmount(r.deposit || r.price);
    }
  };

  // Check if chosen room has an active contract
  const selectedRoom = rooms.find(r => r._id === roomId);
  const conflictingContract = useMemo(() => {
    if (!roomId) return null;
    return contracts.find(
      c =>
        c.roomId === roomId &&
        c._id !== editingContract?._id &&
        (c.status === 'active' || c.status === 'expiring')
    );
  }, [roomId, contracts, editingContract]);

  // Fee item handlers
  const handleAddFee = () => {
    setExtraFees(prev => [
      ...prev,
      {
        id: `fee_${Date.now()}`,
        name: 'Khoản phí mới',
        amount: 50000,
        unit: 'phòng/tháng',
        cycle: 'Hàng tháng',
        note: '',
      },
    ]);
  };

  const handleUpdateFee = (id: string, field: keyof ContractFeeItem, value: any) => {
    setExtraFees(prev =>
      prev.map(f => (f.id === id ? { ...f, [field]: value } : f))
    );
  };

  const handleRemoveFee = (id: string) => {
    setExtraFees(prev => prev.filter(f => f.id !== id));
  };

  // Asset item handlers
  const handleAddAsset = () => {
    setHandedOverAssets(prev => [
      ...prev,
      {
        id: `ast_${Date.now()}`,
        name: 'Trang thiết bị mới',
        quantity: 1,
        condition: 'Hoạt động tốt 100%',
        note: '',
      },
    ]);
  };

  const handleUpdateAsset = (id: string, field: keyof ContractAssetItem, value: any) => {
    setHandedOverAssets(prev =>
      prev.map(a => (a.id === id ? { ...a, [field]: value } : a))
    );
  };

  const handleRemoveAsset = (id: string) => {
    setHandedOverAssets(prev => prev.filter(a => a.id !== id));
  };

  // Build complete contract object
  const buildContractObject = (): Contract => {
    return {
      _id: editingContract?._id || `ct_${Date.now()}`,
      contractCode: contractCode.trim() || `HD-${new Date().getFullYear()}-001`,
      signingDate,
      startDate,
      endDate,
      rentalTermMonths: Number(rentalTermMonths) || 12,
      roomId,
      roomCode: selectedRoom?.roomCode || 'P.---',
      roomName: selectedRoom?.roomName,
      roomArea: selectedRoom?.area,
      representativeTenantId,
      representativeTenantName,
      tenantPhone,
      tenantIdCard,
      tenantAddress,
      tenantEmail,
      tenantBirthYear,
      landlordName,
      landlordPhone,
      landlordIdCard,
      landlordAddress,
      rentalPrice: Number(rentalPrice) || 0,
      depositAmount: Number(depositAmount) || 0,
      billingCycleDays: 30,
      paymentDay: Number(paymentDay) || 5,
      paymentMethod,
      paymentDueDays: Number(paymentDueDays) || 5,
      latePaymentNote,
      electricityType,
      electricityUnitPrice: Number(electricityUnitPrice) || 3500,
      electricityInitialIndex: Number(electricityInitialIndex) || 0,
      electricityNote,
      waterType,
      waterUnitPrice: Number(waterUnitPrice) || 25000,
      waterInitialIndex: Number(waterInitialIndex) || 0,
      waterNote,
      extraFees,
      handedOverAssets,
      termsGroup,
      terms: `Thời hạn thuê: ${rentalTermMonths} tháng (${formatDate(startDate)} - ${formatDate(endDate)}). Tiền cọc: ${formatCurrency(depositAmount)}. Giá thuê: ${formatCurrency(rentalPrice)}/tháng. Điện: ${formatCurrency(electricityUnitPrice)}/kWh. Nước: ${formatCurrency(waterUnitPrice)}/${waterType === 'per_person' ? 'người' : 'm3'}.`,
      status,
      createdAt: editingContract?.createdAt || new Date().toISOString().split('T')[0],
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (conflictingContract) {
      alert(
        `Phòng ${selectedRoom?.roomCode} hiện đang có hợp đồng ${conflictingContract.contractCode} còn hiệu lực với người thuê ${conflictingContract.representativeTenantName}. Vui lòng thanh lý hợp đồng cũ trước!`
      );
      return;
    }
    setIsSubmitting(true);
    try {
      const fullContract = buildContractObject();
      await onSave(fullContract);
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenPreview = () => {
    const fullContract = buildContractObject();
    onPreview(fullContract);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-blue-600/30 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-white">
                {editingContract ? `Chỉnh sửa hợp đồng: ${editingContract.contractCode}` : 'Tạo hợp đồng thuê phòng trọ mới'}
              </h2>
              <p className="text-xs text-slate-400">
                Thiết lập đầy đủ thông tin pháp lý, biểu giá điện nước thực tế, danh mục tài sản và các điều khoản
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Quick Jump Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-2 overflow-x-auto flex items-center gap-2 shrink-0 text-xs no-scrollbar">
          {[
            { id: 'sec-contract', label: '1. Hợp đồng' },
            { id: 'sec-landlord', label: '2. Bên A (Chủ trọ)' },
            { id: 'sec-tenant', label: '3. Bên B (Khách thuê)' },
            { id: 'sec-room', label: '4. Phòng thuê' },
            { id: 'sec-price', label: '5. Giá & Cọc' },
            { id: 'sec-electricity', label: '6. Điện' },
            { id: 'sec-water', label: '7. Nước' },
            { id: 'sec-fees', label: '8. Phí khác' },
            { id: 'sec-payment', label: '9. Thanh toán' },
            { id: 'sec-assets', label: '10. Tài sản bàn giao' },
            { id: 'sec-terms', label: '11. Điều khoản' },
            { id: 'sec-summary', label: '12. Tóm tắt & Lưu' },
          ].map(sec => (
            <button
              key={sec.id}
              type="button"
              onClick={() => {
                setActiveSection(sec.id);
                document.getElementById(sec.id)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition-all cursor-pointer ${
                activeSection === sec.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-8 flex-1">
          {/* Conflicting Room Warning Alert */}
          {conflictingContract && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold text-rose-900 block text-sm">
                  Cảnh báo: Phòng {selectedRoom?.roomCode} hiện đang có hợp đồng còn hiệu lực!
                </strong>
                <p className="mt-1">
                  Hợp đồng <strong>{conflictingContract.contractCode}</strong> (Người thuê: <strong>{conflictingContract.representativeTenantName}</strong>, SĐT: {conflictingContract.tenantPhone}) đang ở trạng thái “{conflictingContract.status === 'active' ? 'Đang hiệu lực' : 'Sắp hết hạn'}”.
                </p>
                <p className="mt-1 text-rose-700 italic">
                  Hệ thống không cho phép tạo hợp đồng mới đè lên phòng đang có người ở. Quý quản lý vui lòng thanh lý hợp đồng cũ hoặc chọn phòng khác!
                </p>
              </div>
            </div>
          )}

          {/* SECTION 1: THÔNG TIN HỢP ĐỒNG */}
          <div id="sec-contract" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                  1
                </span>
                <h3 className="font-bold text-sm text-slate-800">Thông tin chung hợp đồng</h3>
              </div>
              <span className="text-[11px] text-slate-500">Mã tự sinh & tính thời hạn tự động</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mã hợp đồng *
                </label>
                <input
                  type="text"
                  required
                  value={contractCode}
                  onChange={e => setContractCode(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold text-blue-700 focus:outline-hidden focus:border-blue-500 focus:bg-white"
                  placeholder="HD-2026-xxx"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày lập hợp đồng *
                </label>
                <input
                  type="date"
                  required
                  value={signingDate}
                  onChange={e => setSigningDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày bắt đầu thuê *
                </label>
                <input
                  type="date"
                  required
                  value={startDate}
                  onChange={e => handleStartDateChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày kết thúc thuê *
                </label>
                <input
                  type="date"
                  required
                  value={endDate}
                  onChange={e => handleEndDateChange(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>

            {/* Quick buttons for rental term */}
            <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
              <span className="text-slate-500 font-medium">Thời hạn thuê tính toán:</span>
              <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-bold">
                {rentalTermMonths} tháng
              </span>
              <span className="text-slate-400">| Đặt nhanh:</span>
              {[
                { months: 6, label: '6 tháng' },
                { months: 12, label: '12 tháng (1 năm)' },
                { months: 24, label: '24 tháng (2 năm)' },
              ].map(opt => (
                <button
                  key={opt.months}
                  type="button"
                  onClick={() => setTermDurationQuick(opt.months)}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  +{opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION 2: BÊN CHO THUÊ (BÊN A) */}
          <div id="sec-landlord" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  2
                </span>
                <h3 className="font-bold text-sm text-slate-800">Thông tin Bên cho thuê (Bên A)</h3>
              </div>
              <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-full">
                ✓ Tự động lấy từ hệ thống
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên chủ nhà / Quản lý *
                </label>
                <input
                  type="text"
                  required
                  value={landlordName}
                  onChange={e => setLandlordName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại Bên A *
                </label>
                <input
                  type="text"
                  required
                  value={landlordPhone}
                  onChange={e => setLandlordPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-semibold focus:outline-hidden focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số CCCD / CMND Bên A
                </label>
                <input
                  type="text"
                  value={landlordIdCard}
                  onChange={e => setLandlordIdCard(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-hidden focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div className="sm:col-span-2 md:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ khu nhà trọ *
                </label>
                <input
                  type="text"
                  required
                  value={landlordAddress}
                  onChange={e => setLandlordAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: BÊN THUÊ (BÊN B) */}
          <div id="sec-tenant" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  3
                </span>
                <h3 className="font-bold text-sm text-slate-800">Thông tin Bên thuê phòng (Bên B)</h3>
              </div>
              <span className="text-[11px] text-slate-500">
                Chọn người thuê từ hệ thống để tự động điền CCCD & SĐT
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="sm:col-span-2 md:col-span-3">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Chọn người thuê đại diện từ danh sách khách hiện có *
                </label>
                <select
                  required
                  value={representativeTenantId}
                  onChange={e => handleSelectTenant(e.target.value)}
                  className="w-full px-3 py-2.5 bg-blue-50/60 border border-blue-200 rounded-xl text-xs font-semibold text-blue-900 focus:outline-hidden focus:border-blue-500 focus:bg-white cursor-pointer"
                >
                  <option value="">-- Chọn khách thuê đại diện ký hợp đồng --</option>
                  {tenants.map(t => (
                    <option key={t._id} value={t._id}>
                      {t.fullName} • SĐT: {t.phone} • CCCD: {t.idCard} (Phòng hiện tại: {t.roomCode})
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400 mt-1">
                  * Hệ thống tái sử dụng hồ sơ người thuê đã lưu, tránh trùng lặp dữ liệu khách hàng.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên người đại diện *
                </label>
                <input
                  type="text"
                  required
                  value={representativeTenantName}
                  onChange={e => setRepresentativeTenantName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại liên hệ *
                </label>
                <input
                  type="text"
                  required
                  value={tenantPhone}
                  onChange={e => setTenantPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-semibold focus:outline-hidden focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số CCCD / CMND *
                </label>
                <input
                  type="text"
                  required
                  value={tenantIdCard}
                  onChange={e => setTenantIdCard(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-semibold focus:outline-hidden focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quê quán / Hộ khẩu thường trú
                </label>
                <input
                  type="text"
                  value={tenantAddress}
                  onChange={e => setTenantAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Email liên hệ
                </label>
                <input
                  type="email"
                  value={tenantEmail}
                  onChange={e => setTenantEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono focus:outline-hidden focus:border-blue-500 focus:bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Năm sinh
                </label>
                <input
                  type="number"
                  value={tenantBirthYear || ''}
                  onChange={e => setTenantBirthYear(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: THÔNG TIN PHÒNG THUÊ */}
          <div id="sec-room" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  4
                </span>
                <h3 className="font-bold text-sm text-slate-800">Thông tin phòng thuê</h3>
              </div>
              <span className="text-[11px] text-slate-500">Chặn tạo hợp đồng trùng cho phòng đang thuê</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Chọn phòng thuê trong danh sách *
                </label>
                <select
                  required
                  value={roomId}
                  onChange={e => handleSelectRoom(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold focus:outline-hidden focus:border-blue-500 focus:bg-white cursor-pointer"
                >
                  <option value="">-- Chọn phòng thuê --</option>
                  {rooms.map(room => (
                    <option key={room._id} value={room._id}>
                      {room.roomCode} - {room.roomName} (Giá: {formatCurrency(room.price)}/tháng, Trạng thái: {room.status === 'available' ? 'Trống' : room.status === 'rented' ? 'Đang thuê' : 'Bảo trì'})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trạng thái phòng hiện tại
                </label>
                <div className="px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold flex items-center gap-2">
                  {selectedRoom?.status === 'available' ? (
                    <span className="text-emerald-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> Phòng Trống (Sẵn sàng thuê)
                    </span>
                  ) : selectedRoom?.status === 'rented' ? (
                    <span className="text-blue-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-500" /> Đang thuê
                    </span>
                  ) : (
                    <span className="text-amber-700 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500" /> Đang sửa chữa / Bảo trì
                    </span>
                  )}
                </div>
              </div>
            </div>

            {selectedRoom && (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-wrap gap-4 text-slate-600">
                <span>Mã phòng: <strong className="text-slate-900">{selectedRoom.roomCode}</strong></span>
                <span>Tầng: <strong>{selectedRoom.floor}</strong></span>
                <span>Diện tích: <strong>{selectedRoom.area} m²</strong></span>
                <span>Sức chứa tối đa: <strong>{selectedRoom.maxTenants} người</strong></span>
                <span>Giá niêm yết: <strong className="text-blue-700 font-bold">{formatCurrency(selectedRoom.price)}/tháng</strong></span>
              </div>
            )}
          </div>

          {/* SECTION 5: GIÁ THUÊ & TIỀN ĐẶT CỌC */}
          <div id="sec-price" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                  5
                </span>
                <h3 className="font-bold text-sm text-slate-800">Giá thuê & Tiền đặt cọc (VNĐ)</h3>
              </div>
              <span className="text-[11px] text-slate-500">Định dạng tiền tệ chuẩn Việt Nam</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 space-y-2">
                <label className="block text-xs font-bold text-blue-900">
                  Giá thuê phòng mỗi tháng (VNĐ) *
                </label>
                <input
                  type="number"
                  step="50000"
                  required
                  value={rentalPrice}
                  onChange={e => setRentalPrice(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border border-blue-300 rounded-xl text-base font-black text-blue-700 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs font-bold text-blue-600">
                  Hiển thị: {formatCurrency(rentalPrice)} / tháng
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-emerald-900">
                    Tiền đặt cọc (VNĐ) *
                  </label>
                  <button
                    type="button"
                    onClick={() => setDepositAmount(rentalPrice)}
                    className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                  >
                    Bằng 1 tháng tiền phòng
                  </button>
                </div>
                <input
                  type="number"
                  step="50000"
                  required
                  value={depositAmount}
                  onChange={e => setDepositAmount(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-white border border-emerald-300 rounded-xl text-base font-black text-emerald-700 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-xs font-bold text-emerald-600">
                  Hiển thị: {formatCurrency(depositAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* SECTION 6: ĐIỆN SINH HOẠT */}
          <div id="sec-electricity" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                  6
                </span>
                <h3 className="font-bold text-sm text-slate-800">Quy định tính tiền điện</h3>
              </div>
              <span className="text-[11px] text-amber-700 font-semibold bg-amber-50 px-2.5 py-0.5 rounded-full">
                ⚡ Tính theo chỉ số kWh thực tế (Không tính cố định)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phương thức tính điện *
                </label>
                <select
                  value={electricityType}
                  onChange={e => setElectricityType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-amber-500 focus:bg-white cursor-pointer"
                >
                  <option value="per_kwh">Theo số kWh (Công tơ riêng)</option>
                  <option value="fixed">Khoán mức cố định</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đơn giá điện (VNĐ/kWh) *
                </label>
                <input
                  type="number"
                  step="100"
                  required
                  value={electricityUnitPrice}
                  onChange={e => setElectricityUnitPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-amber-700 focus:outline-hidden focus:border-amber-500 focus:bg-white"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Hiển thị: {formatCurrency(electricityUnitPrice)} / kWh
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chỉ số công tơ ban đầu (kWh)
                </label>
                <input
                  type="number"
                  value={electricityInitialIndex}
                  onChange={e => setElectricityInitialIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-hidden focus:border-amber-500 focus:bg-white"
                  placeholder="Ví dụ: 1240"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú điều khoản tiền điện
                </label>
                <input
                  type="text"
                  value={electricityNote}
                  onChange={e => setElectricityNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-amber-500 focus:bg-white"
                  placeholder="Ghi chú về công tơ, chốt số cuối tháng..."
                />
              </div>
            </div>
          </div>

          {/* SECTION 7: NƯỚC SINH HOẠT */}
          <div id="sec-water" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold text-xs">
                  7
                </span>
                <h3 className="font-bold text-sm text-slate-800">Quy định tính tiền nước</h3>
              </div>
              <span className="text-[11px] text-cyan-700 font-semibold bg-cyan-50 px-2.5 py-0.5 rounded-full">
                💧 Tính theo m3 / đầu người (Không tính cố định)
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phương thức tính nước *
                </label>
                <select
                  value={waterType}
                  onChange={e => setWaterType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-hidden focus:border-cyan-500 focus:bg-white cursor-pointer"
                >
                  <option value="per_m3">Theo khối lượng m³ (Đồng hồ nước)</option>
                  <option value="per_person">Theo đầu người (người/tháng)</option>
                  <option value="fixed">Mức khoán cố định / tháng</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Đơn giá nước (VNĐ/{waterType === 'per_person' ? 'người' : 'm³'}) *
                </label>
                <input
                  type="number"
                  step="1000"
                  required
                  value={waterUnitPrice}
                  onChange={e => setWaterUnitPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-cyan-700 focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Hiển thị: {formatCurrency(waterUnitPrice)} / {waterType === 'per_person' ? 'người' : 'm³'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Chỉ số đồng hồ ban đầu (m³)
                </label>
                <input
                  type="number"
                  value={waterInitialIndex}
                  onChange={e => setWaterInitialIndex(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono font-bold focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                  placeholder="Ví dụ: 85"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú điều khoản tiền nước
                </label>
                <input
                  type="text"
                  value={waterNote}
                  onChange={e => setWaterNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-cyan-500 focus:bg-white"
                  placeholder="Ghi chú về kiểm tra đồng hồ, số người ở..."
                />
              </div>
            </div>
          </div>

          {/* SECTION 8: CÁC KHOẢN PHÍ DỊCH VỤ KHÁC */}
          <div id="sec-fees" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-xs">
                  8
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Các khoản phí dịch vụ khác</h3>
                  <p className="text-[11px] text-slate-400">Không giới hạn cố định; thêm, sửa, xóa linh hoạt theo phòng</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddFee}
                className="flex items-center gap-1 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm khoản phí</span>
              </button>
            </div>

            <div className="space-y-3">
              {extraFees.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Chưa có khoản phí phụ nào. Nhấn &quot;Thêm khoản phí&quot; để thiết lập Internet, vệ sinh, giữ xe...
                </div>
              ) : (
                extraFees.map(fee => (
                  <div
                    key={fee.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 items-center"
                  >
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-semibold text-slate-500">Tên khoản phí</label>
                      <input
                        type="text"
                        value={fee.name}
                        onChange={e => handleUpdateFee(fee.id, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                        placeholder="Internet, Vệ sinh..."
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-semibold text-slate-500">Số tiền (VNĐ)</label>
                      <input
                        type="number"
                        step="10000"
                        value={fee.amount}
                        onChange={e => handleUpdateFee(fee.id, 'amount', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-500">Chu kỳ thu</label>
                      <input
                        type="text"
                        value={fee.cycle}
                        onChange={e => handleUpdateFee(fee.id, 'cycle', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        placeholder="Hàng tháng"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-500">Ghi chú</label>
                      <input
                        type="text"
                        value={fee.note || ''}
                        onChange={e => handleUpdateFee(fee.id, 'note', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        placeholder="Ghi chú thêm"
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveFee(fee.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa khoản phí này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECTION 9: QUY ĐỊNH THANH TOÁN */}
          <div id="sec-payment" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                  9
                </span>
                <h3 className="font-bold text-sm text-slate-800">Quy định thanh toán tiền phòng</h3>
              </div>
              <span className="text-[11px] text-slate-500">Kỳ thanh toán, hạn nộp & ghi chú</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ngày thanh toán hàng tháng *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Mùng</span>
                  <input
                    type="number"
                    min="1"
                    max="28"
                    required
                    value={paymentDay}
                    onChange={e => setPaymentDay(Number(e.target.value))}
                    className="w-20 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-center"
                  />
                  <span className="text-xs text-slate-500">hàng tháng</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Thời hạn thanh toán *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-500">Trong vòng</span>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    required
                    value={paymentDueDays}
                    onChange={e => setPaymentDueDays(Number(e.target.value))}
                    className="w-20 px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold text-center"
                  />
                  <span className="text-xs text-slate-500">ngày kể từ khi có hóa đơn</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phương thức thanh toán *
                </label>
                <input
                  type="text"
                  required
                  value={paymentMethod}
                  onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                  placeholder="Chuyển khoản VietQR / Tiền mặt"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú về thanh toán trễ
                </label>
                <input
                  type="text"
                  value={latePaymentNote}
                  onChange={e => setLatePaymentNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:border-blue-500 focus:bg-white"
                  placeholder="Nhắc nhở nhẹ nhàng, không tự ý phạt nếu chưa thỏa thuận"
                />
              </div>
            </div>
          </div>

          {/* SECTION 10: TÀI SẢN BÀN GIAO */}
          <div id="sec-assets" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                  10
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Danh mục tài sản & trang thiết bị bàn giao</h3>
                  <p className="text-[11px] text-slate-400">Biên bản bàn giao hiện trạng trang thiết bị trong phòng</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleAddAsset}
                className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Thêm tài sản</span>
              </button>
            </div>

            <div className="space-y-3">
              {handedOverAssets.length === 0 ? (
                <div className="p-4 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  Chưa có trang thiết bị nào được ghi nhận. Bấm &quot;Thêm tài sản&quot; để thêm điều hòa, nóng lạnh, giường tủ...
                </div>
              ) : (
                handedOverAssets.map(asset => (
                  <div
                    key={asset.id}
                    className="grid grid-cols-1 sm:grid-cols-12 gap-2 p-3 bg-slate-50 rounded-xl border border-slate-200 items-center"
                  >
                    <div className="sm:col-span-4">
                      <label className="block text-[10px] font-semibold text-slate-500">Tên tài sản / Thiết bị</label>
                      <input
                        type="text"
                        value={asset.name}
                        onChange={e => handleUpdateAsset(asset.id, 'name', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-semibold"
                        placeholder="Máy điều hòa, Tủ lạnh..."
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-500">Số lượng</label>
                      <input
                        type="number"
                        min="1"
                        value={asset.quantity}
                        onChange={e => handleUpdateAsset(asset.id, 'quantity', Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[10px] font-semibold text-slate-500">Tình trạng hiện tại</label>
                      <input
                        type="text"
                        value={asset.condition}
                        onChange={e => handleUpdateAsset(asset.id, 'condition', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        placeholder="Mới 100%, Hoạt động tốt..."
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-500">Ghi chú</label>
                      <input
                        type="text"
                        value={asset.note || ''}
                        onChange={e => handleUpdateAsset(asset.id, 'note', e.target.value)}
                        className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs"
                        placeholder="Thương hiệu, remote..."
                      />
                    </div>
                    <div className="sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveAsset(asset.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Xóa tài sản này"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SECTION 11: 12 NHÓM ĐIỀU KHOẢN HỢP ĐỒNG CHI TIẾT */}
          <div id="sec-terms" className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-xs">
                  11
                </span>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">Điều khoản hợp đồng thuê phòng trọ</h3>
                  <p className="text-[11px] text-slate-400">12 nhóm điều khoản thực tế chuẩn Luật Nhà ở Việt Nam (cho phép tùy chỉnh từng điều khoản)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setTermsGroup(defaultContractTermsGroup)}
                className="text-xs text-blue-600 hover:underline font-bold cursor-pointer"
              >
                Khôi phục mẫu chuẩn
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  1. Thời hạn thuê
                </label>
                <textarea
                  rows={2}
                  value={termsGroup.rentalTerm}
                  onChange={e => setTermsGroup({ ...termsGroup, rentalTerm: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  2. Giá thuê và chi phí
                </label>
                <textarea
                  rows={2}
                  value={termsGroup.rentalPriceAndFees}
                  onChange={e => setTermsGroup({ ...termsGroup, rentalPriceAndFees: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  3. Điện, nước và dịch vụ
                </label>
                <textarea
                  rows={2}
                  value={termsGroup.utilities}
                  onChange={e => setTermsGroup({ ...termsGroup, utilities: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  4. Tiền đặt cọc
                </label>
                <textarea
                  rows={2}
                  value={termsGroup.deposit}
                  onChange={e => setTermsGroup({ ...termsGroup, deposit: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  5. Quyền và nghĩa vụ Bên cho thuê (Bên A)
                </label>
                <textarea
                  rows={2}
                  value={termsGroup.landlordObligations}
                  onChange={e => setTermsGroup({ ...termsGroup, landlordObligations: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  6. Quyền và nghĩa vụ Bên thuê (Bên B)
                </label>
                <textarea
                  rows={2}
                  value={termsGroup.tenantObligations}
                  onChange={e => setTermsGroup({ ...termsGroup, tenantObligations: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  7. Quy định sử dụng phòng & PCCC
                </label>
                <textarea
                  rows={2}
                  value={termsGroup.roomUsageRules}
                  onChange={e => setTermsGroup({ ...termsGroup, roomUsageRules: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  8. Quy định về khách và người ở cùng
                </label>
                <textarea
                  rows={2}
                  value={termsGroup.guestsRules}
                  onChange={e => setTermsGroup({ ...termsGroup, guestsRules: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  9. Bảo quản tài sản & bồi thường
                </label>
                <textarea
                  rows={2}
                  value={termsGroup.assetMaintenance}
                  onChange={e => setTermsGroup({ ...termsGroup, assetMaintenance: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  10. Chấm dứt hợp đồng trước hạn
                </label>
                <textarea
                  rows={2}
                  value={termsGroup.earlyTermination}
                  onChange={e => setTermsGroup({ ...termsGroup, earlyTermination: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  11. Hoàn trả tiền đặt cọc
                </label>
                <textarea
                  rows={2}
                  value={termsGroup.depositRefund}
                  onChange={e => setTermsGroup({ ...termsGroup, depositRefund: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 text-xs leading-relaxed"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  12. Điều khoản chung & giải quyết tranh chấp
                </label>
                <textarea
                  rows={2}
                  value={termsGroup.generalTerms}
                  onChange={e => setTermsGroup({ ...termsGroup, generalTerms: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-blue-500 text-xs leading-relaxed"
                />
              </div>
            </div>
          </div>

          {/* SECTION 12: CAM KẾT & XÁC NHẬN */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold text-sm block">Cam kết và xác nhận của Ban Quản Lý:</strong>
              <p className="mt-0.5 leading-relaxed text-blue-800">
                Hai bên đã đọc kỹ, hiểu rõ quyền và nghĩa vụ tương ứng, tự nguyện cam kết thực hiện đúng hợp đồng. Khi bấm &quot;Lưu hợp đồng&quot;, hệ thống sẽ tự động cập nhật trạng thái phòng {selectedRoom?.roomCode} thành “Đang thuê”.
              </p>
            </div>
          </div>

          {/* SECTION 13: TÓM TẮT HỢP ĐỒNG TRƯỚC KHI LƯU (CONTRACT SUMMARY) */}
          <div id="sec-summary" className="bg-gradient-to-br from-slate-900 to-blue-950 text-white rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/80">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="font-black text-base tracking-tight text-white uppercase">
                  Tóm tắt hợp đồng trước khi lưu
                </h3>
              </div>
              <span className="text-xs text-amber-300 font-mono font-bold bg-amber-400/20 px-3 py-1 rounded-full border border-amber-400/30">
                {contractCode}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
              <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-xs">
                <span className="text-slate-400 block text-[11px]">Phòng thuê:</span>
                <strong className="text-white text-base block font-mono">
                  {selectedRoom?.roomCode || 'P.---'}
                </strong>
                <span className="text-slate-300 text-[11px] truncate block">{selectedRoom?.roomName}</span>
              </div>

              <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-xs">
                <span className="text-slate-400 block text-[11px]">Khách đại diện (Bên B):</span>
                <strong className="text-white text-sm block truncate">
                  {representativeTenantName || 'Chưa chọn'}
                </strong>
                <span className="text-slate-300 text-[11px] font-mono">{tenantPhone || '---'}</span>
              </div>

              <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-xs">
                <span className="text-slate-400 block text-[11px]">Thời hạn thuê:</span>
                <strong className="text-white text-sm block">
                  {rentalTermMonths} tháng
                </strong>
                <span className="text-slate-300 text-[11px]">
                  {formatDate(startDate)} → {formatDate(endDate)}
                </span>
              </div>

              <div className="bg-white/10 p-3.5 rounded-2xl backdrop-blur-xs">
                <span className="text-slate-400 block text-[11px]">Tiền phòng / Cọc:</span>
                <strong className="text-emerald-400 text-sm block">
                  {formatCurrency(rentalPrice)} / tháng
                </strong>
                <span className="text-slate-300 text-[11px]">
                  Cọc: {formatCurrency(depositAmount)}
                </span>
              </div>
            </div>

            {/* Note: Do not sum electricity and water into monthly fixed amount */}
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs space-y-2">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Info className="w-4 h-4" />
                <span>Quy tắc tính điện, nước và dịch vụ (Không cộng dồn cố định):</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-slate-200">
                <div className="p-2.5 rounded-xl bg-white/5">
                  <span className="text-amber-400 font-bold block text-[11px]">⚡ Điện sinh hoạt:</span>
                  <p className="font-semibold text-white">{formatCurrency(electricityUnitPrice)} / kWh</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {electricityType === 'per_kwh' ? 'Chốt chỉ số công tơ thực tế hàng tháng' : 'Khoán cố định'}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5">
                  <span className="text-cyan-400 font-bold block text-[11px]">💧 Nước sinh hoạt:</span>
                  <p className="font-semibold text-white">{formatCurrency(waterUnitPrice)} / {waterType === 'per_person' ? 'người' : 'm³'}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {waterType === 'per_m3' ? 'Theo chỉ số đồng hồ nước' : waterType === 'per_person' ? 'Theo đầu người' : 'Khoán cố định'}
                  </p>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5">
                  <span className="text-rose-400 font-bold block text-[11px]">🛡️ Phí dịch vụ định kỳ:</span>
                  <p className="font-semibold text-white">
                    {extraFees.length} khoản phí (Internet, Rác, Gửi xe...)
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Tổng phí cố định: {formatCurrency(extraFees.reduce((sum, f) => sum + f.amount, 0))} / tháng
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Actions inside Form */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={handleOpenPreview}
                className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition-all border border-white/20 cursor-pointer"
              >
                <Eye className="w-4 h-4 text-blue-400" />
                <span>Xem trước bản in hợp đồng (Preview)</span>
              </button>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !!conflictingContract}
                  className={`px-7 py-2.5 text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer ${
                    conflictingContract
                      ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                  }`}
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>{isSubmitting ? 'Đang lưu...' : 'Lưu hợp đồng thuê phòng'}</span>
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
