import React from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Check, Infinity, Music, FileText, Star } from 'lucide-react';
import { useApp } from '../App';

export function PremiumModal() {
  const { lang, setShowPremiumModal } = useApp();
  const KO = lang === 'KO';

  const handleClose = () => {
    setShowPremiumModal(false);
  };

  const BENEFITS = [
    {
      icon: <FileText size={15} />,
      title: KO ? '스마트 활동 기록' : 'Smart Activity Logs',
      sub: KO ? '수치 기반의 체계적인 기록' : 'Quantitative daily tracking',
      color: '#7CB9E8',
    },
    {
      icon: <Star size={15} />,
      title: KO ? 'DogEngine™ 인사이트' : 'DogEngine™ Insights',
      sub: KO ? 'AI 기반 맞춤형 건강 코칭' : 'AI-powered health coaching',
      color: '#F4C430',
    },
    {
      icon: <Music size={15} />,
      title: KO ? '테라피 오디오 플레이어' : 'Therapy Audio Player',
      sub: KO ? '반려견의 안정을 위한 힐링 음악' : 'Healing music for dog anxiety',
      color: '#9B7BC8',
    },
    {
      icon: <Infinity size={15} />,
      title: KO ? '다중 프로필 관리' : 'Multi-Profile Management',
      sub: KO ? '여러 반려견을 한 번에 관리' : 'Manage multiple pets easily',
      color: '#5BAD6F',
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
      onClick={handleClose}
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
            onClick={handleClose}
            className="p-1.5 rounded-full"
            style={{ background: 'rgba(255,255,255,0.08)', color: 'rgba(220,215,201,0.4)' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Hero */}
        <div className="px-6 pb-5 text-center">
          {/* Sparkles icon */}
          <motion.div
            animate={{ rotate: [-5, 5, -5] }}
            transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
            style={{
              background: 'linear-gradient(135deg, #3E6D52 0%, #5BAD6F 100%)',
              boxShadow: '0 8px 30px rgba(62,109,82,0.4)',
            }}
          >
            <Sparkles size={28} style={{ color: '#fff' }} />
          </motion.div>

          <p
            className="text-[13px] tracking-[0.2em] uppercase mb-1"
            style={{ color: 'rgba(220,215,201,0.4)' }}
          >
            {KO ? '모멘테일 소개' : 'About Momentail'}
          </p>
          <h2
            className="text-xl font-bold mb-1"
            style={{ color: '#DCD7C9' }}
          >
            {KO ? '앱 주요 기능 안내' : 'App Features'}
          </h2>
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
            onClick={handleClose}
            className="w-full py-4 rounded-2xl text-base font-bold relative overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, #3E6D52 0%, #5a9970 50%, #3E6D52 100%)',
              backgroundSize: '200% 100%',
              color: '#fff',
              boxShadow: '0 6px 24px rgba(62,109,82,0.3)',
            }}
          >
            <span className="flex items-center justify-center gap-2">
              {KO ? '확인' : 'Got it'}
            </span>
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
