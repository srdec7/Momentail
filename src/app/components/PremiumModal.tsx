import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, CheckCircle2, Infinity, Music, Star, Loader2, Crown } from 'lucide-react';
import { useApp } from '../App';

export function PremiumModal() {
  const { lang, setShowPremiumModal, setIsPremium } = useApp();
  const [isProcessing, setIsProcessing] = useState(false);
  const KO = lang === 'KO';

  const handleClose = () => {
    setShowPremiumModal(false);
  };

  const handleUpgrade = () => {
    setIsProcessing(true);
    // Simulate IAP processing delay
    setTimeout(() => {
      setIsPremium(true);
      localStorage.setItem('petory_premium', 'true');
      setIsProcessing(false);
      setShowPremiumModal(false);
      
      // Optional: Show a brief success message
      setTimeout(() => {
        alert(KO ? '가디언 패밀리팩 구매가 완료되었습니다! 🎉\n모든 프리미엄 기능이 잠금 해제되었습니다.' : 'Guardian Family Pack Unlocked! 🎉\nAll premium features are now available.');
      }, 300);
    }, 1500);
  };

  const BENEFITS = [
    {
      icon: <Infinity size={18} />,
      title: KO ? '무제한 반려견 프로필' : 'Unlimited Pet Profiles',
      sub: KO ? '다견 가정을 위한 완벽한 관리' : 'Perfect for multi-pet families',
      color: '#5BAD6F',
    },
    {
      icon: <Music size={18} />,
      title: KO ? '모든 테라피 오디오 잠금 해제' : 'Unlock All Therapy Audio',
      sub: KO ? '프리미엄 힐링 뮤직 무제한 감상' : 'Unlimited access to all healing tracks',
      color: '#9B7BC8',
    },
    {
      icon: <Star size={18} />,
      title: KO ? 'VIP 건강 리포트' : 'VIP Health Reports',
      sub: KO ? 'DogEngine™ 기반 심층 분석' : 'Deep analysis powered by DogEngine™',
      color: '#F4C430',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-[60] flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)' }}
      onClick={handleClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 10 }}
        transition={{ type: 'spring', damping: 28, stiffness: 380 }}
        className="w-full max-w-[400px] rounded-[32px] overflow-hidden relative"
        style={{ 
          background: 'linear-gradient(180deg, #1f2d2b 0%, #151e1c 100%)', 
          boxShadow: '0 24px 80px rgba(0,0,0,0.8), inset 0 1px 1px rgba(255,255,255,0.1)' 
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleClose}
            className="p-2 rounded-full transition-colors"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Hero Image Area */}
        <div className="relative pt-10 pb-6 px-6 text-center overflow-hidden">
          {/* Decorative background glow */}
          <div 
            className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 rounded-full blur-[60px]"
            style={{ background: 'radial-gradient(circle, rgba(244,196,48,0.15) 0%, rgba(62,109,82,0.1) 100%)', zIndex: 0 }}
          />
          
          <div className="relative z-10">
            <motion.div
              animate={{ y: [-4, 4, -4] }}
              transition={{ repeat: Infinity, duration: 4, ease: 'easeInOut' }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-[24px] mb-5"
              style={{
                background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
                boxShadow: '0 12px 30px rgba(245,158,11,0.3), inset 0 2px 4px rgba(255,255,255,0.5)',
              }}
            >
              <Crown size={40} style={{ color: '#78350F' }} />
            </motion.div>

            <h2 className="text-2xl font-black mb-2 tracking-tight" style={{ color: '#fff' }}>
              {KO ? '가디언 패밀리팩' : 'Guardian Family Pack'}
            </h2>
            <p className="text-[14px] font-medium leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
              {KO ? '단 한 번의 결제로 모든 프리미엄 기능을' : 'Unlock all premium features forever'}
              <br/>
              {KO ? '영구적으로 즐겨보세요.' : 'with a single one-time payment.'}
            </p>
          </div>
        </div>

        {/* Benefits List */}
        <div className="px-6 pb-6 space-y-3 relative z-10">
          {BENEFITS.map((b, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + i * 0.1 }}
              className="flex items-center gap-4 p-4 rounded-2xl"
              style={{ 
                background: 'rgba(255,255,255,0.03)', 
                border: '1px solid rgba(255,255,255,0.05)',
                boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)'
              }}
            >
              <div
                className="w-10 h-10 rounded-[14px] flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${b.color}22, ${b.color}11)`, color: b.color, border: `1px solid ${b.color}33` }}
              >
                {b.icon}
              </div>
              <div className="flex-1">
                <p className="text-[14px] font-bold" style={{ color: '#fff' }}>{b.title}</p>
                <p className="text-[12px] font-medium mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{b.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Pricing & CTA */}
        <div className="px-6 pb-8 pt-2 relative z-10">
          <div className="flex items-center justify-center gap-3 mb-5">
            <span className="text-lg font-medium line-through" style={{ color: 'rgba(255,255,255,0.3)' }}>
              $9.99
            </span>
            <span className="text-3xl font-black" style={{ color: '#FCD34D', textShadow: '0 2px 10px rgba(252,211,77,0.2)' }}>
              $3.99
            </span>
            <span className="text-[11px] font-bold px-2 py-1 rounded-md" style={{ background: 'rgba(252,211,77,0.15)', color: '#FCD34D' }}>
              One-Time
            </span>
          </div>

          <motion.button
            whileTap={{ scale: 0.96 }}
            disabled={isProcessing}
            onClick={handleUpgrade}
            className="w-full py-4 rounded-2xl text-[15px] font-bold relative overflow-hidden flex items-center justify-center gap-2"
            style={{
              background: 'linear-gradient(135deg, #FCD34D 0%, #F59E0B 100%)',
              color: '#78350F',
              boxShadow: '0 8px 20px rgba(245,158,11,0.25), inset 0 -2px 0 rgba(0,0,0,0.1)',
              opacity: isProcessing ? 0.8 : 1,
            }}
          >
            {isProcessing ? (
              <Loader2 size={20} className="animate-spin" style={{ color: '#78350F' }} />
            ) : (
              <>
                <Sparkles size={18} />
                <span>{KO ? '지금 업그레이드 하기' : 'Upgrade to Pro'}</span>
              </>
            )}
          </motion.button>
          
          <p className="text-center text-[11px] mt-4 font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
            {KO ? '단 한 번의 결제로 평생 사용하세요. 정기결제가 아닙니다.' : 'Lifetime access with a single payment. No subscriptions.'}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
