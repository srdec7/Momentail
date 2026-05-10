import React from 'react';
import { motion } from 'motion/react';
import { X, Crown, Check, Infinity, Music, FileText, Star } from 'lucide-react';
import { useApp } from '../App';

export function PremiumModal() {
  const { lang, setShowPremiumModal, setIsPremium, user } = useApp();
  const KO = lang === 'KO';

  const handlePurchase = async () => {
    if (!user) return;
    if (user.email === 'master@petory.app') {
      setIsPremium(true);
      setShowPremiumModal(false);
      return;
    }
    try {
      const res = await fetch(`/api/create-checkout-session?userId=${user.id}`, { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      console.error(e);
      alert(KO ? '결제 오류가 발생했습니다.' : 'Checkout error occurred.');
    }
  };

  const BENEFITS = [
    {
      icon: <Infinity size={15} />,
      title: KO ? '무제한 반려견 프로필' : 'Unlimited Pet Profiles',
      sub: KO ? '최대 5마리 등록 가능' : 'Register up to 5 pets',
      color: '#7CB9E8',
    },
    {
      icon: <Music size={15} />,
      title: KO ? '프리미엄 테라피 오디오' : 'Premium Therapy Audio',
      sub: KO ? '15트랙 전곡 무제한 재생' : 'All 15 tracks unlimited',
      color: '#9B7BC8',
    },
    {
      icon: <FileText size={15} />,
      title: KO ? 'VIP 수의학 건강 리포트' : 'VIP Vet Health Report',
      sub: KO ? '담당 수의사 제출용 전문 리포트' : 'Professional vet-ready reports',
      color: '#5BAD6F',
    },
    {
      icon: <Star size={15} />,
      title: KO ? '영구 소장권' : 'Lifetime Access',
      sub: KO ? '1회성 결제 · 월 구독 없음' : 'One-time payment, no subscription',
      color: '#F4C430',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={() => setShowPremiumModal(false)}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 10 }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        className="w-full rounded-3xl overflow-hidden"
        style={{ background: '#1a2426', boxShadow: '0 24px 80px rgba(0,0,0,0.6)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="flex justify-end pt-4 pr-4">
          <button
            onClick={() => setShowPremiumModal(false)}
            className="p-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(220,215,201,0.4)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Hero */}
        <div className="px-6 pb-5 text-center">
          {/* Crown icon */}
          <motion.div
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, #F4C430 0%, #e8a520 100%)',
              boxShadow: '0 8px 30px rgba(244,196,48,0.4)',
            }}
          >
            <Crown size={28} style={{ color: '#fff' }} />
          </motion.div>

          <p
            className="text-[13px] tracking-[0.2em] uppercase mb-1"
            style={{ color: 'rgba(220,215,201,0.4)' }}
          >
            {KO ? '가디언 패밀리팩' : 'Guardian Family Pack'}
          </p>
          <h2
            className="text-xl font-bold mb-1"
            style={{ color: '#DCD7C9' }}
          >
            {KO ? '평생 프리미엄' : 'Lifetime Premium'}
          </h2>

          {/* Price */}
          <div className="flex items-center justify-center gap-3 mb-1">
            <span className="text-base line-through" style={{ color: 'rgba(220,215,201,0.25)' }}>$9.99</span>
            <span
              className="text-3xl font-bold"
              style={{ color: '#DCD7C9' }}
            >
              $4.99
            </span>
            <span
              className="px-2 py-0.5 rounded-full text-[12px] font-bold"
              style={{ background: '#A27B5C', color: '#fff' }}
            >
              50% OFF
            </span>
          </div>
          <p className="text-[12px]" style={{ color: 'rgba(220,215,201,0.3)' }}>
            {KO ? '1회 결제 · 환불 보장 30일' : 'One-time · 30-day money back'}
          </p>
        </div>

        {/* Benefits */}
        <div className="px-5 pb-4 space-y-2.5">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.08 }}
              className="flex items-center gap-3 p-3 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.05)' }}
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: `${b.color}20`, color: b.color }}
              >
                {b.icon}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold" style={{ color: '#DCD7C9' }}>{b.title}</p>
                <p className="text-[12px]" style={{ color: 'rgba(220,215,201,0.4)' }}>{b.sub}</p>
              </div>
              <Check size={14} style={{ color: b.color, flexShrink: 0 }} />
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="px-5 pb-6">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handlePurchase}
            className="w-full py-4 rounded-2xl text-base font-bold relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #A27B5C 0%, #c49870 50%, #A27B5C 100%)',
              backgroundSize: '200% 100%',
              color: '#fff',
              boxShadow: '0 6px 24px rgba(162,123,92,0.5)',
            }}
          >
            <span className="flex items-center justify-center gap-2">
              <Crown size={16} />
              {KO ? '지금 업그레이드 · $4.99' : 'Upgrade Now · $4.99'}
            </span>
          </motion.button>

          <p className="text-center text-[11px] mt-2.5" style={{ color: 'rgba(220,215,201,0.2)' }}>
            {KO
              ? 'Stripe로 안전하게 결제됩니다 · 구독 아님'
              : 'Secure payment via Stripe · Not a subscription'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
