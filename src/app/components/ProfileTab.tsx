import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { Edit2, Scale, Syringe, Stethoscope, Baby, RefreshCw, Crown, ChevronRight, Camera, Sparkles } from 'lucide-react';
import { useApp } from '../App';
import { saveProfile } from '../../lib/api';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function calcAgeMonths(birthdate: string): number {
  const [y, m] = birthdate.split('-').map(Number);
  const now = new Date();
  return (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
}

function getGrowthStage(months: number, lang: 'KO' | 'EN') {
  if (months < 12) return { label: lang === 'KO' ? '퍼피' : 'Puppy', color: '#0EA5E9', bg: '#EFF6FF', emoji: '🐣' };
  if (months < 84) return { label: lang === 'KO' ? '성견' : 'Adult', color: '#3E6D52', bg: '#ECFDF5', emoji: '🐕' };
  return { label: lang === 'KO' ? '노령견' : 'Senior', color: '#A27B5C', bg: '#FDF6EE', emoji: '🐾' };
}

function formatDate(d: string) {
  if (!d) return '-';
  const [y, m, day] = d.split('-');
  return `${y}.${m}.${day}`;
}

// ─── Bento Tile ───────────────────────────────────────────────────────────────
interface TileProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  sub?: string;
  color: string;
  bg: string;
  delay?: number;
}
function BentoTile({ icon, label, value, sub, color, bg, delay = 0 }: TileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="rounded-2xl p-4 flex flex-col gap-1.5"
      style={{
        background: '#FFFFFF',
        boxShadow: '0 1px 4px rgba(26,36,33,0.08), 0 4px 16px rgba(26,36,33,0.04)',
        border: '1px solid rgba(62,109,82,0.1)',
      }}
    >
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: bg }}>
          <span style={{ color, display: 'flex' }}>{icon}</span>
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#8A9E96' }}>
          {label}
        </span>
      </div>
      <div className="text-[16px] font-bold" style={{ color: '#1A2421', lineHeight: 1.3 }}>
        {value}
      </div>
      {sub && (
        <div className="text-[12px] font-medium" style={{ color }}>
          {sub}
        </div>
      )}
    </motion.div>
  );
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
export function ProfileTab() {
  const { lang, pets, selectedPetIdx, setPets, setShowPetFormModal, setEditingPet, setActiveTab, setShowAudioModal, isPremium, setShowPremiumModal } = useApp();
  const KO = lang === 'KO';

  const pet = pets[selectedPetIdx] || pets[0];
  const ageMonths = useMemo(() => calcAgeMonths(pet?.birthdate || '2024-01'), [pet]);
  const stage = useMemo(() => getGrowthStage(ageMonths, lang), [ageMonths, lang]);

  const [weightUnit, setWeightUnit] = React.useState<'kg' | 'lbs'>(pet.weightUnit);

  const displayWeight = weightUnit === 'kg'
    ? `${pet.weight} kg`
    : `${(pet.weight * 2.205).toFixed(1)} lbs`;

  const ageDisplay = ageMonths < 12
    ? (KO ? `${ageMonths}개월` : `${ageMonths}mo`)
    : (KO ? `${Math.floor(ageMonths / 12)}세 ${ageMonths % 12}개월` : `${Math.floor(ageMonths / 12)}y ${ageMonths % 12}m`);

  const handleEditPet = () => {
    setEditingPet(pet);
    setShowPetFormModal(true);
  };

  const toggleUnit = async () => {
    const next: 'kg' | 'lbs' = weightUnit === 'kg' ? 'lbs' : 'kg';
    setWeightUnit(next);
    const updated = pets.map((p, i) => i === selectedPetIdx ? { ...p, weightUnit: next } : p);
    setPets(updated);
    try { await saveProfile({ id: pet.id, weightUnit: next } as any); } catch(e) { console.error(e); }
  };

  return (
    <div className="px-4 pb-8 pt-4">

      {/* ── Hero Card (Forest Green gradient — same family as main screen) ── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="rounded-3xl overflow-hidden mb-4"
        style={{
          background: 'linear-gradient(135deg, #2C3E35 0%, #3E6D52 100%)',
          boxShadow: '0 8px 32px rgba(44,62,53,0.3)',
        }}
      >
        <div className="p-5">
          <div className="flex items-start gap-4">
            <div className="relative">
              <button
                onClick={handleEditPet}
                className="w-20 h-20 rounded-2xl overflow-hidden flex-shrink-0 block"
                style={{ border: '3px solid rgba(255,255,255,0.25)', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}
              >
                <img src={pet.photo} alt={pet.name} className="w-full h-full object-cover" />
              </button>
              <div
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full flex items-center justify-center shadow-lg"
                style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', color: '#fff' }}
              >
                <Camera size={13} />
              </div>
            </div>

            <div className="flex-1 pt-0.5">
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-white">{pet?.name}</h2>
                  <button onClick={handleEditPet} style={{ color: 'rgba(255,255,255,0.5)' }}><Edit2 size={13} /></button>
                </div>
                {/* PRO badge / upgrade button */}
                {isPremium ? (
                  <div
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold"
                    style={{ background: 'linear-gradient(135deg, #3B82F6, #2563EB)', color: '#fff', boxShadow: '0 4px 10px rgba(37,99,235,0.25)' }}
                  >
                    <Crown size={12} style={{ color: '#fff' }} />
                    {KO ? 'PRO 사용자' : 'PRO User'}
                  </div>
                ) : (
                  <button
                    onClick={() => setShowPremiumModal(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-transform active:scale-95"
                    style={{ background: 'linear-gradient(135deg, #FCD34D, #F59E0B)', color: '#78350F', boxShadow: '0 4px 10px rgba(245,158,11,0.25)' }}
                  >
                    <Crown size={12} style={{ color: '#78350F' }} />
                    {KO ? 'Pro 업그레이드' : 'Pro Upgrade'}
                  </button>
                )}
              </div>
              <p className="text-sm mb-2.5" style={{ color: 'rgba(255,255,255,0.6)' }}>
                {pet?.breed || (lang === 'KO' ? '견종 미입력' : 'No breed set')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                <span className="px-2.5 py-1 rounded-full text-[12px] font-semibold" style={{ background: 'rgba(255,255,255,0.18)', color: '#fff' }}>
                  {stage.emoji} {stage.label}
                </span>
                <span className="px-2.5 py-1 rounded-full text-[12px] font-medium" style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.75)' }}>
                  {ageDisplay}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* ── Bento Health Grid ── */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <BentoTile icon={<Baby size={14} />} label={KO ? '성장 단계' : 'Life Stage'} value={stage.label} sub={ageDisplay} color={stage.color} bg={stage.bg} delay={0.1} />
        <BentoTile
          icon={<Scale size={14} />} label={KO ? '체중' : 'Weight'}
          value={
            <div className="flex items-center gap-2">
              <span>{displayWeight}</span>
              <button onClick={toggleUnit} className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-semibold" style={{ background: '#EDF5F0', color: '#3E6D52' }}>
                <RefreshCw size={8} />{weightUnit === 'kg' ? 'lbs' : 'kg'}
              </button>
            </div>
          }
          sub={KO ? '정상 범위' : 'Normal range'} color="#3E6D52" bg="#EDF5F0" delay={0.15}
        />
        <BentoTile icon={<Syringe size={14} />} label={KO ? '마지막 접종' : 'Last Vaccine'} value={formatDate(pet.lastVaccine)} color="#A27B5C" bg="#FDF6EE" delay={0.2} />
        <BentoTile icon={<Stethoscope size={14} />} label={KO ? '다음 진료일' : 'Next Vet'} value={formatDate(pet.nextVet)} sub={KO ? '예약됨' : 'Scheduled'} color="#3E6D52" bg="#EDF5F0" delay={0.25} />
      </div>

      {/* ── Health Overview Bar ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="rounded-2xl p-4 mb-4"
        style={{ background: '#FFFFFF', boxShadow: '0 1px 4px rgba(26,36,33,0.07)', border: '1px solid rgba(62,109,82,0.1)' }}
      >
        <p className="text-sm font-semibold mb-3" style={{ color: '#1A2421' }}>
          {KO ? '오늘의 건강 현황' : "Today's Health Overview"}
        </p>
        <div className="space-y-3">
          {[
            { label: KO ? '수분 섭취' : 'Hydration', value: 70, color: '#0EA5E9', track: '#E0F2FE' },
            { label: KO ? '활동량' : 'Activity',    value: 85, color: '#3E6D52', track: '#EDF5F0' },
            { label: KO ? '수면 품질' : 'Sleep Quality', value: 92, color: '#A27B5C', track: '#FDF6EE' },
          ].map(({ label, value, color, track }) => (
            <div key={label}>
              <div className="flex justify-between text-[12px] mb-1.5">
                <span className="font-medium" style={{ color: '#4A5E58' }}>{label}</span>
                <span className="font-bold" style={{ color }}>{value}%</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: track }}>
                <motion.div
                  initial={{ width: 0 }} animate={{ width: `${value}%` }}
                  transition={{ delay: 0.5, duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full" style={{ background: color }}
                />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Premium Upsell / Active Banner ── */}
      {isPremium ? (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="rounded-2xl p-4"
          style={{ background: 'linear-gradient(135deg, #3E6D52 0%, #5a9970 100%)' }}
        >
          <div className="flex items-center gap-2">
            <Crown size={16} style={{ color: '#F4C430' }} />
            <div>
              <p className="text-sm font-bold text-white">{KO ? '가디언 프리미엄 활성 중' : 'Guardian Premium Active'}</p>
              <p className="text-[12px] text-white/70">{KO ? '모든 프리미엄 기능을 이용 중입니다' : 'All premium features are unlocked'}</p>
            </div>
          </div>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
          className="rounded-2xl p-4"
          style={{ background: 'linear-gradient(135deg, #1A2421 0%, #2C3E35 100%)', boxShadow: '0 4px 20px rgba(26,36,33,0.2)' }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <Crown size={14} style={{ color: '#F4C430' }} />
                <span className="text-sm font-bold" style={{ color: '#F4C430' }}>{KO ? '가디언 패밀리팩' : 'Guardian Family Pack'}</span>
              </div>
              <p className="text-[12px]" style={{ color: 'rgba(255,255,255,0.5)' }}>{KO ? '무제한 프로필 · 프리미엄 오디오 · VIP 리포트' : 'Unlimited profiles · Premium audio · VIP reports'}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-base font-black text-white">$3.99</span>
                <span className="text-[11px] px-1.5 py-0.5 rounded-md font-bold" style={{ background: '#A27B5C', color: '#fff' }}>One-Time</span>
              </div>
            </div>
            <button
              onClick={() => setShowPremiumModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-sm font-semibold"
              style={{ background: 'linear-gradient(135deg, #3E6D52, #5a9970)', color: '#fff' }}
            >
              {KO ? '보기' : 'View'}<ChevronRight size={12} />
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
}
