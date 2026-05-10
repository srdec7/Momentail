import React, { useState, useEffect, useMemo, Component, ErrorInfo, ReactNode, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, Activity as ActivityIcon, Moon, Utensils, AlertTriangle, CheckCircle2, TrendingUp, Lightbulb, Zap, RefreshCw, Printer } from 'lucide-react';
import { useApp, ActivityType } from '../App';
import { SparklineChart } from './Charts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// ─── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: ReactNode }, { hasError: boolean; errorMsg: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, errorMsg: error.message };
  }
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-red-50 text-red-600 rounded-xl m-4 border border-red-200">
          <h2 className="font-bold text-lg mb-2">React Render Error</h2>
          <p className="text-sm font-mono whitespace-pre-wrap">{this.state.errorMsg}</p>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── DogEngine (Local AI) ─────────────────────────────────────────────────────
interface DogEngineResult {
  summary: string;
  description: string;
  metrics: {
    sleep:    { status: 'poor' | 'good' | 'excellent'; label: React.ReactNode; color: string; value: number };
    diet:     { status: 'emergency' | 'low' | 'good' | 'high'; label: React.ReactNode; color: string; value: number };
    activity: { status: 'zero' | 'low' | 'good' | 'high'; label: React.ReactNode; color: string; value: number };
  };
  coaching: Array<{ title: string; desc: string; color: string; icon: string; type: 'warning' | 'good' | 'info' }>;
  wellnessScore: number;
  weeklyTrend: Array<{ day: string; score: number }>;
}

function runDogEngine(
  name: string,
  ageMonths: number,
  entries: { type: ActivityType }[],
  lang: 'KO' | 'EN'
): DogEngineResult {
  const KO = lang === 'KO';
  const counts: Record<ActivityType, number> = {
    meal: 0, walk: 0, sleep: 0, toilet: 0, vet: 0, bath: 0, other: 0,
  };
  entries.forEach(e => counts[e.type]++);

  const isAdult = ageMonths >= 12 && ageMonths < 84;
  const isPuppy = ageMonths < 12;
  const isSenior = ageMonths >= 84;

  // Sleep
  const sleepStatus = counts.sleep === 0 ? 'poor' : counts.sleep === 1 ? 'good' : 'excellent';
  const sleepLabel = { 
    poor: <span className="flex items-center justify-center gap-1"><AlertTriangle size={12}/> {KO ? '부족' : 'Poor'}</span>, 
    good: <span className="flex items-center justify-center gap-1"><CheckCircle2 size={12}/> {KO ? '양호' : 'Good'}</span>, 
    excellent: <span className="flex items-center justify-center gap-1"><Heart size={12}/> {KO ? '최상' : 'Excellent'}</span> 
  }[sleepStatus];
  const sleepColor = { poor: '#EF4444', good: '#0EA5E9', excellent: '#7C3AED' }[sleepStatus];

  // Diet
  const dietStatus = counts.meal === 0 ? 'emergency' : counts.meal === 1 ? 'low' : counts.meal === 2 ? 'good' : 'high';
  const dietLabel = { 
    emergency: <span className="flex items-center justify-center gap-1"><AlertTriangle size={12}/> {KO ? '긴급' : 'Emergency'}</span>, 
    low: <span className="flex items-center justify-center gap-1"><AlertTriangle size={12}/> {KO ? '부족' : 'Low'}</span>, 
    good: <span className="flex items-center justify-center gap-1"><CheckCircle2 size={12}/> {KO ? '양호' : 'Good'}</span>, 
    high: <span className="flex items-center justify-center gap-1"><Heart size={12}/> {KO ? '충분' : 'High'}</span> 
  }[dietStatus];
  const dietColor = { emergency: '#EF4444', low: '#F59E0B', good: '#10B981', high: '#7C3AED' }[dietStatus];

  // Activity
  const actStatus = counts.walk === 0 ? 'zero' : counts.walk === 1 ? 'low' : counts.walk === 2 ? 'good' : 'high';
  const actLabel = { 
    zero: <span className="flex items-center justify-center gap-1"><AlertTriangle size={12}/> {KO ? '없음' : 'None'}</span>, 
    low: <span className="flex items-center justify-center gap-1"><AlertTriangle size={12}/> {KO ? '부족' : 'Low'}</span>, 
    good: <span className="flex items-center justify-center gap-1"><CheckCircle2 size={12}/> {KO ? '양호' : 'Good'}</span>, 
    high: <span className="flex items-center justify-center gap-1"><Heart size={12}/> {KO ? '활발' : 'Active'}</span> 
  }[actStatus];
  const actColor = { zero: '#EF4444', low: '#F59E0B', good: '#10B981', high: '#0EA5E9' }[actStatus];

  // Wellness score
  const sleepScore = { poor: 25, good: 50, excellent: 100 }[sleepStatus];
  const dietScore  = { emergency: 0, low: 30, good: 70, high: 90 }[dietStatus];
  const actScore   = { zero: 0, low: 40, good: 80, high: 95 }[actStatus];
  const wellnessScore = Math.round((sleepScore + dietScore + actScore) / 3);

  // Coaching cards
  const coaching: DogEngineResult['coaching'] = [];

  if (counts.meal >= 2 && counts.walk >= 1 && counts.sleep >= 1) {
    coaching.push({
      title: KO ? `Perfect Day!` : `Perfect Day!`,
      desc: KO
        ? `${name}가 균형 잡힌 하루를 보냈어요. 식사, 산책, 수면 모두 완벽합니다!`
        : `${name} had a perfectly balanced day. Meals, walks, and sleep — all excellent!`,
      color: '#5BAD6F', icon: '', type: 'good',
    });
  }

  if (isPuppy && counts.walk >= 3) {
    coaching.push({
      title: KO ? '퍼피 관절 주의보' : 'Puppy Joint Alert',
      desc: KO
        ? `성장 중인 퍼피의 관절은 아직 약해요. 하루 산책은 2회 이내가 이상적입니다.`
        : `Puppy joints are still developing. Limit walks to 2 times per day.`,
      color: '#E88B5B', icon: '', type: 'warning',
    });
  }

  if (isSenior && counts.walk >= 3) {
    coaching.push({
      title: KO ? '노령견 과활동 경고' : 'Senior Dog Overactivity',
      desc: KO
        ? `노령견에게는 짧고 여유로운 산책이 좋아요. 관절 건강을 위해 쉬는 시간을 늘려주세요.`
        : `Shoter, leisurely walks are better for senior dogs. Allow more rest time.`,
      color: '#E87B7B', icon: '', type: 'warning',
    });
  }

  if (counts.walk === 0) {
    coaching.push({
      title: KO ? '활동량 부족 경고' : 'No Activity Warning',
      desc: KO
        ? `오늘은 산책 기록이 없어요. 짧더라도 바깥 공기를 마시게 해주세요.`
        : `No walks recorded today. Even a short outdoor time makes a big difference.`,
      color: '#E87B7B', icon: '', type: 'warning',
    });
  }

  if (counts.vet > 0) {
    coaching.push({
      title: KO ? '병원 스트레스 케어' : 'Post-Vet Stress Care',
      desc: KO
        ? `병원 방문 후 ${name}가 스트레스를 받았을 수 있어요. 조용하고 편안한 환경을 만들어주세요.`
        : `${name} may be stressed after the vet visit. Create a calm, comfortable environment.`,
      color: '#9B7BC8', icon: '', type: 'info',
    });
  }

  if (coaching.length === 0) {
    coaching.push({
      title: KO ? '분석 데이터 부족' : 'More Data Needed',
      desc: KO
        ? '더 많은 활동을 기록하면 맞춤 코칭을 받을 수 있어요!'
        : 'Record more activities to get personalized coaching!',
      color: '#8a897e', icon: '', type: 'info',
    });
  }

  const summaries = KO
    ? [
        `${name}의 오늘 하루, DogEngine이 분석했어요 ✨`,
        `${name}의 건강 패턴을 AI가 살펴봤어요 🔍`,
        `오늘 ${name}는 어떤 하루를 보냈을까요? 🐕`,
      ]
    : [
        `DogEngine analyzed ${name}'s day ✨`,
        `AI checked ${name}'s health patterns 🔍`,
        `How was ${name}'s day today? 🐕`,
      ];

  // Generate Mock 7-Day Trend
  const weeklyTrend = [];
  const dayNames = KO ? ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', '어제', '오늘'] : ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'Yest.', 'Today'];
  let simScore = wellnessScore;
  for (let i = 6; i >= 0; i--) {
    if (i === 6) {
      weeklyTrend.push({ day: dayNames[i], score: wellnessScore });
    } else {
      let mockScore = simScore + (Math.floor(Math.random() * 20) - 10);
      mockScore = Math.max(50, Math.min(100, mockScore));
      weeklyTrend.unshift({ day: dayNames[i], score: mockScore });
      simScore = mockScore;
    }
  }
 
  return {
    summary: summaries[Math.floor(Math.random() * summaries.length)],
    description: KO
      ? `수면 ${counts.sleep}회 · 식사 ${counts.meal}회 · 산책 ${counts.walk}회`
      : `Sleep ${counts.sleep}x · Meals ${counts.meal}x · Walks ${counts.walk}x`,
    metrics: {
      sleep:    { status: sleepStatus,    label: sleepLabel, color: sleepColor, value: sleepScore },
      diet:     { status: dietStatus,     label: dietLabel,  color: dietColor,  value: dietScore  },
      activity: { status: actStatus,      label: actLabel,   color: actColor,   value: actScore   },
    },
    coaching,
    wellnessScore,
    weeklyTrend,
  };
}

function calcAgeMonths(birthdate: string) {
  const [y, m] = birthdate.split('-').map(Number);
  return (2026 - y) * 12 + (5 - m);
}

// ─── Simple SVG Line Chart ───────────────────────────────────────────────────
function SparklineChart({ data, color }: { data: { day: string; score: number }[], color: string }) {
  if (!data || data.length < 2) return null;
 
  const width = 300;
  const height = 60;
  const padding = 10;
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - padding - ((d.score - 40) / 60) * (height - 2 * padding);
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className="w-full h-auto">
      <polyline
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

// ─── Loading Animation ─────────────────────────────────────────────────────────
function DogEngineLoader({ lang }: { lang: 'KO' | 'EN' }) {
  const KO = lang === 'KO';
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6">
      <div className="relative mb-8">
        <div
          className="w-20 h-20 rounded-2xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, #2C3639, #3F4E4F)',
            boxShadow: '0 8px 32px rgba(44,54,57,0.3)',
          }}
        >
          <Zap size={36} style={{ color: '#DCD7C9' }} />
        </div>
        {/* Scanning line */}
        <div className="absolute inset-0 overflow-hidden rounded-2xl">
          <div
            className="absolute top-0 left-0 w-full h-0.5 opacity-60"
            style={{
              background: 'linear-gradient(90deg, transparent, #A27B5C, transparent)',
              animation: 'dogEngineScan 1.5s ease-in-out infinite',
            }}
          />
        </div>
      </div>
      <p className="text-sm font-semibold mb-1.5" style={{ color: '#2C3639' }}>
        DogEngine
      </p>
      <p className="text-[13px] text-center" style={{ color: '#8a897e', maxWidth: 220 }}>
        {KO ? '데이터를 분석하고 있습니다...' : 'Processing your data...'}
      </p>
      <div className="flex gap-1.5 mt-5">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ repeat: Infinity, duration: 1.2, delay: i * 0.2 }}
            className="w-2 h-2 rounded-full"
            style={{ background: '#A27B5C' }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Insights Tab ─────────────────────────────────────────────────────────────
export function InsightsTab() {
  const { lang, pets, selectedPetIdx, timeline, isPremium, setShowPremiumModal } = useApp();
  const KO = lang === 'KO';
  const pet = pets[selectedPetIdx] || pets[0];
  const ageMonths = useMemo(() => calcAgeMonths(pet?.birthdate || '2024-01'), [pet]);

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DogEngineResult | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
 
  const todayEntries = timeline.filter(e => e.petId === pet.id && e.date === '2026-05-04');

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
 
  const runAnalysis = () => {
    setIsLoading(true);
    setResult(null);
    setErrorMsg(null);
    setTimeout(() => {
      try {
        const res = runDogEngine(pet.name, ageMonths, todayEntries, lang);
        setResult(res);
      } catch (err: any) {
        console.error(err);
        setErrorMsg(err.message || String(err));
      } finally {
        setIsLoading(false);
      }
    }, 1600);
  };
 
  useEffect(() => {
    if (showReport && result) {
      const generatePDF = async () => {
        try {
          const element = document.getElementById('vip-report-content');
          if (!element) return;
          
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: element.scrollWidth,
            windowHeight: element.scrollHeight,
            onclone: (clonedDoc) => {
              const clonedElement = clonedDoc.getElementById('vip-report-content');
              if (clonedElement) {
                clonedElement.style.height = 'auto';
                clonedElement.style.overflow = 'visible';
              }
            }
          });
          
          const imgData = canvas.toDataURL('image/jpeg', 0.95);
          const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
          pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
          const blob = pdf.output('blob');
          const file = new File([blob], 'Petory_VIP_Health_Report.pdf', { type: 'application/pdf' });
          setPdfFile(file);
        } catch (e) {
          console.error("Background PDF gen failed", e);
        }
      };
      
      // Delay slightly to ensure DOM is fully rendered
      setTimeout(generatePDF, 600);
    } else {
      setPdfFile(null);
    }
  }, [showReport, result]);

  const downloadFallback = (file: File) => {
    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  };

  const printReport = async () => {
    if (!pdfFile) return;

    // 100% synchronous call to bypass Safari's user-gesture block
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
      try {
        await navigator.share({
          title: KO ? 'VIP 건강 리포트' : 'VIP Health Report',
          files: [pdfFile]
        });
      } catch (err: any) {
        if (err.name !== 'AbortError') {
           downloadFallback(pdfFile);
        }
      }
    } else {
      downloadFallback(pdfFile);
    }
  };

  useEffect(() => { runAnalysis(); }, [pet.id, lang]);

  const METRIC_LABELS = {
    sleep:    { KO: '수면 (Sleep)', EN: 'Sleep',    icon: <Moon size={22} /> },
    diet:     { KO: '식사 (Diet)',  EN: 'Diet',     icon: <Utensils size={22} /> },
    activity: { KO: '활동 (Active)', EN: 'Activity', icon: <ActivityIcon size={22} /> },
  };

  return (
    <ErrorBoundary>
      <div className="px-4 pb-8 pt-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2
            className="text-base font-bold"
            style={{ color: '#2C3639' }}
          >
            {KO ? 'AI 인사이트' : 'AI Insights'}
          </h2>
          <p className="text-[12px]" style={{ color: '#8a897e' }}>
            {KO 
              ? `오늘 ${new Date().toISOString().split('T')[0].replace(/-/g, '.')} · DogEngine v2` 
              : `Today ${new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date())} · DogEngine v2`}
          </p>
        </div>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={runAnalysis}
          disabled={isLoading}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium"
          style={{ background: '#EDF5F0', color: '#3E6D52' }}
        >
          <RefreshCw size={12} style={{ animation: isLoading ? 'lpSpin 1s linear infinite' : 'none' }} />
          {KO ? '재분석' : 'Refresh'}
        </motion.button>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DogEngineLoader lang={lang} />
          </motion.div>
        ) : errorMsg ? (
          <motion.div key="error" className="p-4 bg-red-50 text-red-500 rounded-2xl">
            <h3 className="font-bold">DogEngine Error</h3>
            <p className="text-sm">{errorMsg}</p>
          </motion.div>
        ) : result ? (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >

            {/* ── Wellness Score Hero ── */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl overflow-hidden mb-4"
              style={{
                background: 'linear-gradient(145deg, #2C3E35 0%, #3E6D52 100%)',
                boxShadow: '0 12px 40px rgba(44,62,53,0.3)',
              }}
            >
              <div className="p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(255,255,255,0.15)' }}
                  >
                    <Zap size={22} style={{ color: '#F4C430' }} />
                  </div>
                  <div>
                    <p className="text-[12px] tracking-widest uppercase" style={{ color: '#6a6a66' }}>
                      {KO ? '종합 웰니스 점수' : 'Wellness Score'}
                    </p>
                    <div className="flex items-end gap-1.5">
                      <span
                        className="shimmer-text"
                        style={{
                          fontSize: '2.4rem',
                          lineHeight: 1,
                          fontWeight: 700,
                        }}
                      >
                        {result.wellnessScore}
                      </span>
                      <span className="text-sm pb-1" style={{ color: 'rgba(220,215,201,0.4)' }}>/100</span>
                    </div>
                  </div>
                </div>

                {/* Score bar */}
                <div className="h-1.5 rounded-full mb-3 overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${result.wellnessScore}%` }}
                    transition={{ delay: 0.4, duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: 'linear-gradient(90deg, #A27B5C, #c9a07a)' }}
                  />
                </div>

                {/* Summary */}
                <p
                  className="text-base"
                  style={{
                    color: '#DCD7C9',
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                  }}
                >
                  "{result.summary}"
                </p>
                <p className="text-[12px] mt-1.5" style={{ color: 'rgba(220,215,201,0.45)' }}>
                  {result.description}
                </p>
              </div>
            </motion.div>

            {/* ── Vitals Grid ── */}
            <div className="grid grid-cols-3 gap-2.5 mb-4">
              {(Object.keys(result.metrics) as Array<keyof typeof result.metrics>).map((key, i) => {
                const m = result.metrics[key];
                const cfg = METRIC_LABELS[key];
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="rounded-2xl p-4 flex flex-col items-center text-center shadow-md border border-[rgba(0,0,0,0.03)]"
                    style={{
                      background: '#FFFFFF',
                    }}
                  >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-2" style={{ background: `${m.color}15`, color: m.color }}>
                      {cfg.icon}
                    </div>
                    <p className="text-[13px] font-black mt-1 mb-1" style={{ color: '#1A2421' }}>
                      {KO ? cfg.KO : cfg.EN}
                    </p>
                    <div className="text-[13px] font-black" style={{ color: m.color }}>
                      {m.label}
                    </div>
                    {/* mini bar */}
                    <div className="w-full mt-3 h-1.5 rounded-full overflow-hidden" style={{ background: '#F0F2F1' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.value}%` }}
                        transition={{ delay: 0.5 + i * 0.1, duration: 0.7 }}
                        className="h-full rounded-full"
                        style={{ background: m.color }}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* ── Coaching Cards ── */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 mb-2 ml-1">
                <Lightbulb size={18} style={{ color: '#3E6D52' }} />
                <p className="text-[15px] font-semibold" style={{ color: '#1A2421' }}>
                  {KO ? '맞춤 코칭' : 'Personalized Coaching'}
                </p>
              </div>
              {result.coaching.map((card, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.35 + i * 0.1 }}
                  className="rounded-2xl overflow-hidden flex shadow-sm"
                  style={{
                    background: '#FFFFFF',
                    border: `1px solid ${card.color}25`,
                  }}
                >
                  {/* Color accent bar */}
                  <div
                    className="w-1 flex-shrink-0 rounded-l-2xl"
                    style={{ background: card.color }}
                  />
                  <div className="flex-1 p-3.5">
                    <div className="flex items-center gap-2 mb-1">
                      {card.type === 'warning' && <AlertTriangle size={13} style={{ color: card.color }} />}
                      {card.type === 'good'    && <CheckCircle2  size={13} style={{ color: card.color }} />}
                      {card.type === 'info'    && <TrendingUp    size={13} style={{ color: card.color }} />}
                      <p className="text-sm font-semibold" style={{ color: '#0F172A' }}>{card.title}</p>
                    </div>
                    <p className="text-[13px] leading-relaxed" style={{ color: '#475569' }}>
                      {card.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* ── VIP Report CTA ── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="mt-4 rounded-2xl p-4"
              style={{
                background: 'linear-gradient(135deg, #2C3639 0%, #3F4E4F 100%)',
                border: '1px solid rgba(220,215,201,0.08)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-bold mb-0.5" style={{ color: '#F4C430' }}>
                    📄 {KO ? 'VIP 건강 활동 요약' : 'VIP Health Activity Summary'}
                  </p>
                  <p className="text-[12px]" style={{ color: 'rgba(220,215,201,0.5)' }}>
                    {KO ? 'AI가 분석한 정밀 건강 활동 요약 데이터' : 'AI-powered precision activity summary'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (!isPremium) {
                      setShowPremiumModal(true);
                    } else {
                      setShowReport(true);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl text-sm font-semibold"
                  style={{ background: 'rgba(162,123,92,0.3)', color: '#c49870' }}
                >
                  {KO ? '보기' : 'View'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
 
      {/* ── VIP Report Modal ── */}
      <AnimatePresence>
        {showReport && result && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
            onClick={() => setShowReport(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col"
              style={{ maxHeight: '90vh' }}
              onClick={e => e.stopPropagation()}
            >
              {/* Report Content for PDF */}
              <div id="vip-report-content" className="flex-1 flex flex-col bg-white min-h-0 print-container">
                {/* Report Header */}
                <div className="bg-[#2C3639] p-6 text-white shrink-0">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1">ACTIVITY SUMMARY</h3>
                      <p className="text-[11px] opacity-60 tracking-widest uppercase">Petory DogEngine v2.4 System Record</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                      <Zap size={24} className="text-[#A27B5C]" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="opacity-50 text-[10px] uppercase font-bold">Patient</p>
                      <p className="font-semibold">{pet.name}</p>
                    </div>
                    <div>
                      <p className="opacity-50 text-[10px] uppercase font-bold">Date</p>
                      <p className="font-semibold">{new Date().toISOString().split('T')[0].replace(/-/g, '.')}</p>
                    </div>
                  </div>
                </div>
   
                {/* Report Body */}
                <div className="flex-1 overflow-y-auto p-6 petory-scroll">
                  <section className="mb-6">
                  <h4 className="text-[12px] font-bold text-[#8a897e] uppercase mb-3 pb-1 border-b border-[rgba(0,0,0,0.05)]">Summary Analysis</h4>
                  <p className="text-lg font-serif italic text-[#2C3639] leading-relaxed">
                    "{result.summary}"
                  </p>
                </section>
 
                {/* 7-Day Trend Chart */}
                <section className="mb-8">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-[12px] font-bold text-[#8a897e] uppercase">{KO ? '7일 웰니스 추이' : '7-Day Wellness Trend'}</h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A27B5C]/10 text-[#A27B5C]">
                      AVG {result.weeklyTrend?.length ? Math.round(result.weeklyTrend.reduce((a, b) => a + b.score, 0) / 7) : 0}
                    </span>
                  </div>
                  <div className="bg-gray-50 pt-6 pb-2 px-2 rounded-2xl border border-gray-100">
                    <SparklineChart data={result.weeklyTrend || []} color="#A27B5C" />
                  </div>
                </section>
 
                {/* Vital Signs Table */}
                <section className="mb-6">
                  <h4 className="text-[12px] font-bold text-[#8a897e] uppercase mb-3">{KO ? '상세 바이탈 징후' : 'Vital Signs Detail'}</h4>
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-gray-50 text-[10px] uppercase text-gray-500 font-bold border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-2">{KO ? '항목' : 'Metric'}</th>
                          <th className="px-4 py-2">{KO ? '상태' : 'Status'}</th>
                          <th className="px-4 py-2 text-right">{KO ? '점수' : 'Score'}</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 bg-white">
                        {Object.entries(result.metrics).map(([key, m]: [any, any]) => (
                          <tr key={key}>
                            <td className="px-4 py-3 font-semibold text-[#2C3639] capitalize">{key}</td>
                            <td className="px-4 py-3 font-medium" style={{ color: m.color }}>{m.label}</td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-[#2C3639]">{m.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
 
                <section className="mb-2">
                  <h4 className="text-[12px] font-bold text-[#8a897e] uppercase mb-3">{KO ? 'AI 웰니스 제안' : 'AI Wellness Suggestions'}</h4>
                  <ul className="space-y-3">
                    {result.coaching.map((c, i) => (
                      <li key={i} className="flex gap-3 text-sm text-[#3F4E4F] leading-relaxed">
                        <span className="flex-shrink-0 mt-1">•</span>
                        <span><strong>{c.title}:</strong> {c.desc}</span>
                      </li>
                    ))}
                  </ul>
                </section>
 
                <div className="mt-8 pt-6 border-t border-dashed border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-50 border flex items-center justify-center italic font-serif text-gray-300">Sig</div>
                    <div>
                      <p className="text-[10px] text-gray-400 font-bold uppercase">System Verified Record</p>
                      <p className="text-[11px] text-gray-500 font-mono">HASH: 8A2F-C39E-D422-B110</p>
                    </div>
                  </div>
                </div>
 
                {/* Medical Disclaimer */}
                <div className="mt-6 p-4 rounded-xl bg-gray-50 border border-gray-100 text-[10px] text-gray-400 leading-relaxed">
                  <p>
                    {KO 
                      ? "* 본 리포트는 Petory DogEngine AI가 사용자의 기록을 바탕으로 생성한 건강 참고 자료입니다. 수의사의 전문적인 진단, 처방 또는 치료를 대신할 수 없으며, 반려견의 건강 이상이 의심될 경우 즉시 동물병원을 방문하시기 바랍니다."
                      : "* This report is a health reference generated by Petory DogEngine AI based on user logs. It is not a substitute for professional veterinary diagnosis, prescription, or treatment. If you suspect your pet has health issues, please visit a veterinary clinic immediately."}
                  </p>
                </div>
              </div>
              </div>
 
              {/* Footer Actions */}
              <div className="p-4 bg-gray-50 flex gap-2 shrink-0">
                <button 
                  onClick={() => setShowReport(false)}
                  className="flex-1 py-3 text-sm font-bold text-gray-400"
                >
                  CLOSE
                </button>
                <button 
                  onClick={printReport}
                  disabled={!pdfFile}
                  className="flex-1 py-3 bg-[#A27B5C] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#A27B5C]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                >
                  {!pdfFile ? <RefreshCw size={16} className="animate-spin" /> : <Printer size={16} />}
                  {KO ? (!pdfFile ? '준비중...' : '인쇄/PDF저장') : (!pdfFile ? 'PREPARING...' : 'PRINT / SAVE PDF')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
    </ErrorBoundary>
  );
}
