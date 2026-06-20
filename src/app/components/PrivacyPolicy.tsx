import React from 'react';
import { motion } from 'motion/react';
import { X, Shield } from 'lucide-react';
import { useApp } from '../App';

export function PrivacyPolicy({ onClose }: { onClose: () => void }) {
  const { lang } = useApp();
  const KO = lang === 'KO';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[100] flex flex-col bg-[#F5F3EE]"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#2C3639]/10 bg-white">
        <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: '#2C3639' }}>
          <Shield size={20} color="#A27B5C" />
          {KO ? '개인정보처리방침 및 면책조항' : 'Privacy Policy & Disclaimer'}
        </h3>
        <button
          onClick={onClose}
          className="p-2 rounded-full"
          style={{ background: 'rgba(44,54,57,0.05)', color: '#2C3639' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-5 text-sm leading-relaxed" style={{ color: '#5C6B64' }}>
        {KO ? (
          <>
            <h4 className="font-bold text-[#2C3639] mb-2 text-base">1. 수집하는 개인정보의 항목</h4>
            <p className="mb-4">
              Momentail(이하 "앱")은 원활한 서비스 제공을 위해 아래와 같은 정보를 수집합니다.<br/>
              - 필수항목: 반려견 이름, 품종, 생년월일, 성별, 체중, 예방접종 기록, 식사/수면/산책 기록<br/>
              - 선택항목: 반려견 사진 (로컬 기기에 저장)
            </p>

            <h4 className="font-bold text-[#2C3639] mb-2 text-base">2. 개인정보의 수집 및 이용 목적</h4>
            <p className="mb-4">
              수집된 정보는 다음 목적을 위해서만 이용됩니다.<br/>
              - 반려견 맞춤형 건강 요약 (DogEngine™ AI 분석) 제공<br/>
              - 사용자의 반려견 타임라인 기록 유지
            </p>

            <h4 className="font-bold text-[#2C3639] mb-2 text-base">3. 개인정보의 보관 및 파기</h4>
            <p className="mb-4">
              사용자가 오프라인 모드(로컬 기기)를 사용하는 경우, 모든 정보는 사용자의 기기에만 저장되며 서버로 전송되지 않습니다. 앱 삭제 시 로컬 데이터는 자동 파기됩니다.
            </p>

            <h4 className="font-bold text-[#2C3639] mb-2 text-base">4. 의학적 책임 한계 (면책조항)</h4>
            <p className="mb-4">
              본 앱이 제공하는 AI 인사이트 및 건강 관련 정보는 반려동물 건강 관리를 위한 일반적인 참고용이며, 전문 수의사의 진단이나 치료를 대신할 수 없습니다. 이상 징후가 있을 시 반드시 동물병원에 방문하시기 바랍니다.
            </p>

            <h4 className="font-bold text-[#2C3639] mb-2 text-base">5. 문의처</h4>
            <p className="mb-4">
              개인정보처리방침에 대한 문의는 <a href="mailto:srdec7@gmail.com" className="underline font-semibold text-[#A27B5C]">srdec7@gmail.com</a> 으로 연락주시기 바랍니다.
            </p>
          </>
        ) : (
          <>
            <h4 className="font-bold text-[#2C3639] mb-2 text-base">1. Information We Collect</h4>
            <p className="mb-4">
              Momentail (the "App") collects the following information to provide a seamless service:<br/>
              - Required: Pet name, breed, birthdate, weight, vaccination records, and activity logs (meal, sleep, walk).<br/>
              - Optional: Pet photos (stored locally).
            </p>

            <h4 className="font-bold text-[#2C3639] mb-2 text-base">2. How We Use Information</h4>
            <p className="mb-4">
              The information collected is used solely for:<br/>
              - Providing customized health summaries powered by DogEngine™ AI.<br/>
              - Maintaining the pet's timeline records.
            </p>

            <h4 className="font-bold text-[#2C3639] mb-2 text-base">3. Data Storage & Deletion</h4>
            <p className="mb-4">
              If using offline mode, all data is stored exclusively on your device. Deleting the App will permanently remove this local data.
            </p>

            <h4 className="font-bold text-[#2C3639] mb-2 text-base">4. Medical Disclaimer</h4>
            <p className="mb-4">
              The AI insights and health information provided by this App are for general informational purposes only and are not a substitute for professional veterinary diagnosis or treatment. Always consult a qualified veterinarian if you have concerns about your pet's health.
            </p>

            <h4 className="font-bold text-[#2C3639] mb-2 text-base">5. Contact Us</h4>
            <p className="mb-4">
              If you have any questions about this policy, please contact <a href="mailto:srdec7@gmail.com" className="underline font-semibold text-[#A27B5C]">srdec7@gmail.com</a>.
            </p>
          </>
        )}
      </div>
    </motion.div>
  );
}
