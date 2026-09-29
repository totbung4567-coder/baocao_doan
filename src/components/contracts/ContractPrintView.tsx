import React from 'react';
import { Printer, X, Download, ShieldCheck, FileText, CheckCircle2 } from 'lucide-react';
import { Contract } from '../../types';
import { formatCurrency, formatDate } from '../../utils/formatters';

interface ContractPrintViewProps {
  contract: Contract;
  isOpen: boolean;
  onClose: () => void;
}

export const ContractPrintView: React.FC<ContractPrintViewProps> = ({ contract, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white">
      {/* Container */}
      <div className="relative bg-white w-full max-w-4xl rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:h-auto print:shadow-none print:border-none print:rounded-none">
        {/* Top Action Bar (hidden when printing) */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800 print:hidden">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-bold text-sm text-slate-100">Bản in hợp đồng thuê phòng trọ</h3>
              <p className="text-xs text-slate-400 font-mono">Mã hợp đồng: {contract.contractCode}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-600/30 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>In hợp đồng (A4)</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              title="Đóng xem trước"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Content */}
        <div className="overflow-y-auto p-6 sm:p-10 text-slate-800 text-xs sm:text-[13px] leading-relaxed font-serif bg-white selection:bg-blue-100 print:p-8 print:overflow-visible">
          {/* Quốc hiệu Tiêu ngữ */}
          <div className="text-center pb-4 border-b-2 border-slate-900">
            <h3 className="font-bold uppercase tracking-wider text-sm sm:text-base text-slate-900">
              CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
            </h3>
            <p className="font-semibold text-xs sm:text-sm text-slate-800 mt-0.5">
              Độc lập - Tự do - Hạnh phúc
            </p>
            <div className="text-xs text-slate-500 mt-1">***o0o***</div>
            
            <h1 className="text-lg sm:text-2xl font-black uppercase text-slate-900 tracking-tight mt-4">
              HỢP ĐỒNG THUÊ PHÒNG TRỌ
            </h1>
            <p className="text-xs font-mono text-slate-600 italic mt-1">
              Số: {contract.contractCode} • Lập ngày: {formatDate(contract.signingDate || contract.createdAt)}
            </p>
            <p className="text-[11px] text-slate-500 italic mt-1 max-w-xl mx-auto">
              (Căn cứ theo Bộ luật Dân sự số 91/2015/QH13 và Luật Nhà ở số 27/2023/QH15 cùng các quy định pháp luật hiện hành)
            </p>
          </div>

          <div className="mt-5 space-y-4">
            <p className="italic text-slate-600">
              Hôm nay, ngày {formatDate(contract.signingDate || contract.createdAt)}, tại địa chỉ {contract.landlordAddress || 'khu nhà trọ'}, hai bên chúng tôi gồm có:
            </p>

            {/* Bên A */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 print:bg-transparent print:p-2 print:border-slate-300">
              <h4 className="font-bold uppercase text-slate-900 text-xs sm:text-sm mb-2 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-sans font-bold">A</span>
                BÊN CHO THUÊ (BÊN A):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 pl-6">
                <p>• Họ và tên: <strong className="uppercase font-sans">{contract.landlordName}</strong></p>
                <p>• Số điện thoại: <strong className="font-mono">{contract.landlordPhone}</strong></p>
                <p>• Số CCCD/CMND: <span className="font-mono">{contract.landlordIdCard || '001085012345'}</span></p>
                <p>• Địa chỉ: <span>{contract.landlordAddress}</span></p>
              </div>
            </div>

            {/* Bên B */}
            <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200 print:bg-transparent print:p-2 print:border-slate-300">
              <h4 className="font-bold uppercase text-slate-900 text-xs sm:text-sm mb-2 flex items-center gap-1.5">
                <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px] font-sans font-bold">B</span>
                BÊN THUÊ (BÊN B):
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 pl-6">
                <p>• Họ và tên đại diện: <strong className="uppercase font-sans">{contract.representativeTenantName}</strong></p>
                <p>• Số điện thoại liên lạc: <strong className="font-mono">{contract.tenantPhone}</strong></p>
                <p>• Số CCCD/CMND: <span className="font-mono">{contract.tenantIdCard || 'Đang cập nhật'}</span></p>
                <p>• Quê quán / Thường trú: <span>{contract.tenantAddress || 'Việt Nam'}</span></p>
                {contract.tenantEmail && <p>• Email: <span className="font-mono">{contract.tenantEmail}</span></p>}
                {contract.tenantBirthYear && <p>• Năm sinh: <span>{contract.tenantBirthYear}</span></p>}
              </div>
            </div>

            <p className="italic text-slate-700">
              Hai bên cùng tự nguyện thỏa thuận và thống nhất ký kết Hợp đồng thuê phòng trọ với các điều khoản chi tiết như sau:
            </p>

            {/* Điều 1 */}
            <div className="space-y-1 pt-1">
              <h4 className="font-bold uppercase text-slate-900">
                ĐIỀU 1. ĐỐI TƯỢNG VÀ THỜI HẠN THUÊ
              </h4>
              <p>
                1.1. Bên A đồng ý cho Bên B thuê phòng số: <strong className="font-sans text-blue-900 font-bold">{contract.roomCode}</strong>
                {contract.roomName ? ` (${contract.roomName})` : ''} thuộc khu nhà trọ tại địa chỉ: {contract.landlordAddress}. Diện tích phòng khoảng {contract.roomArea || 25} m².
              </p>
              <p>
                1.2. Mục đích thuê: Dùng để ở và sinh hoạt cá nhân hợp pháp, không sử dụng vào mục đích kinh doanh trái phép hoặc hành vi vi phạm pháp luật.
              </p>
              <p>
                1.3. Thời hạn thuê là <strong>{contract.rentalTermMonths || 12} tháng</strong>, bắt đầu từ ngày <strong>{formatDate(contract.startDate)}</strong> đến hết ngày <strong>{formatDate(contract.endDate)}</strong>.
              </p>
              <p>
                1.4. {contract.termsGroup?.rentalTerm || 'Khi hết hạn hợp đồng, nếu Bên B có nhu cầu tiếp tục thuê phải thông báo trước 30 ngày cho Bên A.'}
              </p>
            </div>

            {/* Điều 2 */}
            <div className="space-y-1 pt-1">
              <h4 className="font-bold uppercase text-slate-900">
                ĐIỀU 2. GIÁ THUÊ, TIỀN ĐẶT CỌC VÀ PHƯƠNG THỨC THANH TOÁN
              </h4>
              <p>
                2.1. <strong>Giá thuê phòng:</strong> <strong className="text-blue-900 font-sans">{formatCurrency(contract.rentalPrice)} / tháng</strong> (Bằng chữ: Giá cố định trong suốt thời gian hợp đồng).
              </p>
              <p>
                2.2. <strong>Tiền đặt cọc:</strong> Bên B đặt cọc cho Bên A số tiền <strong className="text-emerald-800 font-sans">{formatCurrency(contract.depositAmount)}</strong> ngay khi ký hợp đồng.
              </p>
              <p>
                2.3. Tiền đặt cọc dùng để bảo đảm thực hiện nghĩa vụ hợp đồng, không dùng để cấn trừ tiền phòng hàng tháng. {contract.termsGroup?.deposit || 'Bên A sẽ hoàn trả tiền cọc cho Bên B sau khi kết thúc hợp đồng và thanh toán hết các chi phí.'}
              </p>
              <p>
                2.4. <strong>Kỳ thanh toán:</strong> Định kỳ hàng tháng, từ ngày <strong>{contract.paymentDay || 1} đến ngày {(contract.paymentDay || 1) + (contract.paymentDueDays || 5) - 1}</strong> hàng tháng.
              </p>
              <p>
                2.5. <strong>Phương thức thanh toán:</strong> {contract.paymentMethod || 'Chuyển khoản ngân hàng hoặc tiền mặt'}. {contract.latePaymentNote ? `(${contract.latePaymentNote})` : ''}
              </p>
            </div>

            {/* Điều 3 */}
            <div className="space-y-1 pt-1">
              <h4 className="font-bold uppercase text-slate-900">
                ĐIỀU 3. QUY ĐỊNH VỀ TIỀN ĐIỆN, NƯỚC VÀ CÁC DỊCH VỤ PHÁT SINH
              </h4>
              <p className="text-slate-700">
                Tiền điện và nước không tính cố định hàng tháng mà được tính căn cứ theo mức độ sử dụng thực tế và đơn giá niêm yết:
              </p>
              <div className="overflow-x-auto my-2">
                <table className="w-full border-collapse border border-slate-300 text-xs font-sans">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800">
                      <th className="border border-slate-300 px-3 py-1.5 text-left">Hạng mục</th>
                      <th className="border border-slate-300 px-3 py-1.5 text-left">Phương thức tính</th>
                      <th className="border border-slate-300 px-3 py-1.5 text-right">Đơn giá quy định</th>
                      <th className="border border-slate-300 px-3 py-1.5 text-left">Ghi chú / Chỉ số đầu</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-slate-300 px-3 py-1.5 font-bold">Tiền điện sinh hoạt</td>
                      <td className="border border-slate-300 px-3 py-1.5">
                        {contract.electricityType === 'per_kwh' ? 'Theo chỉ số công tơ riêng (kWh)' : 'Khoán cố định'}
                      </td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-bold text-blue-700">
                        {formatCurrency(contract.electricityUnitPrice)} / kWh
                      </td>
                      <td className="border border-slate-300 px-3 py-1.5 text-slate-600">
                        {contract.electricityInitialIndex !== undefined ? `Chỉ số lúc bàn giao: ${contract.electricityInitialIndex} kWh. ` : ''}
                        {contract.electricityNote || 'Chốt số cuối tháng theo ElectricityReading'}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-slate-300 px-3 py-1.5 font-bold">Tiền nước sinh hoạt</td>
                      <td className="border border-slate-300 px-3 py-1.5">
                        {contract.waterType === 'per_m3'
                          ? 'Theo chỉ số đồng hồ nước (m³)'
                          : contract.waterType === 'per_person'
                          ? 'Tính theo đầu người ở'
                          : 'Khoán cố định'}
                      </td>
                      <td className="border border-slate-300 px-3 py-1.5 text-right font-bold text-blue-700">
                        {formatCurrency(contract.waterUnitPrice)} / {contract.waterType === 'per_person' ? 'người' : 'm³'}
                      </td>
                      <td className="border border-slate-300 px-3 py-1.5 text-slate-600">
                        {contract.waterInitialIndex !== undefined && contract.waterType === 'per_m3' ? `Chỉ số lúc bàn giao: ${contract.waterInitialIndex} m³. ` : ''}
                        {contract.waterNote || 'Chốt số cuối tháng theo WaterReading'}
                      </td>
                    </tr>
                    {contract.extraFees && contract.extraFees.length > 0 && contract.extraFees.map((fee, idx) => (
                      <tr key={idx}>
                        <td className="border border-slate-300 px-3 py-1.5 font-semibold">{fee.name}</td>
                        <td className="border border-slate-300 px-3 py-1.5">{fee.cycle} ({fee.unit})</td>
                        <td className="border border-slate-300 px-3 py-1.5 text-right font-medium">{formatCurrency(fee.amount)}</td>
                        <td className="border border-slate-300 px-3 py-1.5 text-slate-600">{fee.note || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Điều 4 */}
            {contract.handedOverAssets && contract.handedOverAssets.length > 0 && (
              <div className="space-y-1 pt-1">
                <h4 className="font-bold uppercase text-slate-900">
                  ĐIỀU 4. DANH MỤC TRANG THIẾT BỊ BÀN GIAO KÈM THEO PHÒNG
                </h4>
                <p>
                  Bên A bàn giao cho Bên B hiện trạng trang thiết bị đầy đủ, hoạt động bình thường như sau:
                </p>
                <div className="overflow-x-auto my-2">
                  <table className="w-full border-collapse border border-slate-300 text-xs font-sans">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800">
                        <th className="border border-slate-300 px-2 py-1 text-center w-10">STT</th>
                        <th className="border border-slate-300 px-3 py-1 text-left">Tên tài sản / Thiết bị</th>
                        <th className="border border-slate-300 px-2 py-1 text-center w-16">Số lượng</th>
                        <th className="border border-slate-300 px-3 py-1 text-left">Hiện trạng bàn giao</th>
                        <th className="border border-slate-300 px-3 py-1 text-left">Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contract.handedOverAssets.map((asset, i) => (
                        <tr key={i}>
                          <td className="border border-slate-300 px-2 py-1 text-center">{i + 1}</td>
                          <td className="border border-slate-300 px-3 py-1 font-semibold">{asset.name}</td>
                          <td className="border border-slate-300 px-2 py-1 text-center font-bold">{asset.quantity}</td>
                          <td className="border border-slate-300 px-3 py-1">{asset.condition}</td>
                          <td className="border border-slate-300 px-3 py-1 text-slate-500">{asset.note || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Điều 5, 6, 7, 8, 9 */}
            <div className="space-y-3 pt-1">
              <div>
                <h4 className="font-bold uppercase text-slate-900">ĐIỀU 5. QUYỀN VÀ NGHĨA VỤ CỦA BÊN CHO THUÊ (BÊN A)</h4>
                <p className="mt-0.5 text-slate-700">
                  {contract.termsGroup?.landlordObligations || 'Bàn giao phòng và trang thiết bị đúng hạn; hỗ trợ thủ tục đăng ký tạm trú theo quy định; bảo đảm quyền sử dụng phòng riêng biệt cho Bên B; sửa chữa kịp thời các hư hỏng kết cấu chung do thời gian.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold uppercase text-slate-900">ĐIỀU 6. QUYỀN VÀ NGHĨA VỤ CỦA BÊN THUÊ (BÊN B)</h4>
                <p className="mt-0.5 text-slate-700">
                  {contract.termsGroup?.tenantObligations || 'Thanh toán tiền phòng và các khoản chi phí điện, nước đúng hạn; cung cấp CCCD để đăng ký tạm trú; sử dụng phòng đúng mục đích; giữ gìn vệ sinh và an ninh trật tự chung.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold uppercase text-slate-900">ĐIỀU 7. QUY ĐỊNH AN NINH TRẬT TỰ VÀ BẢO QUẢN TÀI SẢN</h4>
                <p className="mt-0.5 text-slate-700">
                  {contract.termsGroup?.roomUsageRules || 'Nghiêm cấm tàng trữ chất cấm, vũ khí, chất cháy nổ; đóng cổng sau 23h00; không làm ồn sau 22h00.'} {contract.termsGroup?.guestsRules || 'Khách ở lại qua đêm phải báo trước với Bên A.'} {contract.termsGroup?.assetMaintenance || 'Tự bảo quản tài sản cá nhân và giữ gìn trang thiết bị trong phòng.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold uppercase text-slate-900">ĐIỀU 8. CHẤM DỨT HỢP ĐỒNG VÀ HOÀN TRẢ TIỀN ĐẶT CỌC</h4>
                <p className="mt-0.5 text-slate-700">
                  {contract.termsGroup?.earlyTermination || 'Nếu chấm dứt hợp đồng trước hạn, Bên B phải báo trước ít nhất 30 ngày.'} {contract.termsGroup?.depositRefund || 'Khi kết thúc hợp đồng, hai bên cùng nghiệm thu bàn giao phòng và tài sản. Bên A hoàn trả tiền cọc cho Bên B sau khi trừ các chi phí phát sinh nếu có.'}
                </p>
              </div>

              <div>
                <h4 className="font-bold uppercase text-slate-900">ĐIỀU 9. CAM KẾT CHUNG VÀ ĐIỀU KHOẢN THI HÀNH</h4>
                <p className="mt-0.5 text-slate-700">
                  {contract.termsGroup?.generalTerms || 'Hai bên cam kết thực hiện đúng và đầy đủ các điều khoản trong hợp đồng này. Mọi tranh chấp nếu có sẽ giải quyết trên tinh thần hòa giải, thiện chí.'} Hợp đồng được lập thành 02 (hai) bản có giá trị pháp lý như nhau, mỗi bên giữ 01 bản để thực hiện.
                </p>
              </div>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 pt-8 pb-4 text-center font-sans">
              <div className="space-y-1">
                <p className="font-bold uppercase text-xs sm:text-sm text-slate-900">ĐẠI DIỆN BÊN CHO THUÊ (BÊN A)</p>
                <p className="text-[11px] text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
                <div className="h-20 flex items-center justify-center">
                  <span className="font-serif italic text-blue-900 text-lg font-bold">
                    {contract.landlordName}
                  </span>
                </div>
                <p className="font-bold text-xs uppercase text-slate-900">{contract.landlordName}</p>
              </div>

              <div className="space-y-1">
                <p className="font-bold uppercase text-xs sm:text-sm text-slate-900">ĐẠI DIỆN BÊN THUÊ (BÊN B)</p>
                <p className="text-[11px] text-slate-400 italic">(Ký và ghi rõ họ tên)</p>
                <div className="h-20 flex items-center justify-center">
                  <span className="font-serif italic text-slate-800 text-lg font-bold">
                    {contract.representativeTenantName}
                  </span>
                </div>
                <p className="font-bold text-xs uppercase text-slate-900">{contract.representativeTenantName}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="px-6 py-3.5 bg-slate-100 border-t border-slate-200 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500 font-sans">
            Mẹo: Bấm <strong>In hợp đồng</strong> hoặc nhấn <strong>Ctrl + P</strong> để lưu PDF hoặc in máy in
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
