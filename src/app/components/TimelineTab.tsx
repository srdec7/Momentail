import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Check, X, Clock, Utensils, Footprints, Moon, Droplets, Stethoscope, Bath, Tag, Calendar } from 'lucide-react';
import { useApp, ActivityType, TimelineEntry } from '../App';
import { addTimelineEntry, updateTimelineEntry, deleteTimelineEntry } from '../../lib/api';

// ─── Activity Config ───────────────────────────────────────────────────────────
const ACTIVITY_CONFIG: Record<ActivityType, { icon: React.ReactNode; labelKO: string; labelEN: string; color: string; bg: string }> = {
  meal:    { icon: <Utensils size={20} />,      labelKO: '식사',   labelEN: 'Meal',    color: '#F59E0B', bg: '#FFFBEB'  },
  walk:    { icon: <Footprints size={20} />,    labelKO: '산책',   labelEN: 'Walk',    color: '#3E6D52', bg: '#EDF5F0'  },
  sleep:   { icon: <Moon size={20} />,          labelKO: '수면',   labelEN: 'Sleep',   color: '#6B7FBF', bg: '#EEF0F8' },
  toilet:  { icon: <Droplets size={20} />,      labelKO: '배변',   labelEN: 'Toilet',  color: '#0EA5E9', bg: '#F0F9FF' },
  vet:     { icon: <Stethoscope size={20} />,   labelKO: '병원',   labelEN: 'Vet',     color: '#EF4444', bg: '#FEF2F2' },
  bath:    { icon: <Bath size={20} />,          labelKO: '목욕',   labelEN: 'Bath',    color: '#06B6D4', bg: '#ECFEFF' },
  other:   { icon: <Tag size={20} />,           labelKO: '기타',   labelEN: 'Other',   color: '#A27B5C', bg: '#FDF6EE'  },
};

// ─── Add Activity Modal (inline bottom sheet) ─────────────────────────────────
interface AddModalProps { onClose: () => void; petId: string; }
function AddActivityModal({ onClose, petId }: AddModalProps) {
  const { lang, timeline, setTimeline } = useApp();
  const KO = lang === 'KO';
  const [type, setType] = useState<ActivityType>('meal');
  const [time, setTime] = useState(() => {
    const now = new Date();
    return `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
  });
  const [note, setNote] = useState('');
  const [amount, setAmount] = useState<string>('');

  const handleSave = async () => {
    const today = new Date();
    // Use local date string in YYYY-MM-DD to avoid timezone shifts
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    
    let unit = undefined;
    let numericValue = amount ? parseFloat(amount) : undefined;
    if (numericValue !== undefined && !isNaN(numericValue)) {
      if (type === 'meal') unit = 'g';
      if (type === 'walk') unit = 'mins';
      if (type === 'sleep') unit = 'hours';
    } else {
      numericValue = undefined;
    }

    const entry: TimelineEntry = {
      id: `t_${Date.now()}`,
      petId,
      type,
      time,
      date: todayStr,
      note,
      value: numericValue,
      unit
    };
    
    try {
      const res = await addTimelineEntry({
        profileId: petId,
        type,
        time: `${entry.date}T${time}:00`,
        note,
        value: numericValue,
        unit
      });
      if (res && res.id) entry.id = res.id;
    } catch(e) { console.error(e); }

    setTimeline(prev => [entry, ...prev].sort((a, b) => b.time.localeCompare(a.time)));
    onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 350 }}
        className="rounded-t-3xl p-5 overflow-y-auto petory-scroll flex flex-col w-full"
        style={{ background: '#FFFFFF', maxHeight: '90vh' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: '#E2E8F0' }} />

        <h3 className="text-sm font-semibold mb-4" style={{ color: '#0F172A' }}>
          {KO ? '활동 기록 추가' : 'Add Activity'}
        </h3>

        {/* Activity type selector */}
        <div className="grid grid-cols-4 gap-2 mb-4">
          {(Object.keys(ACTIVITY_CONFIG) as ActivityType[]).map(t => {
            const cfg = ACTIVITY_CONFIG[t];
            return (
              <button
                key={t}
                onClick={() => setType(t)}
                className="flex flex-col items-center gap-2 py-3.5 rounded-2xl transition-all"
                style={{
                  background: type === t ? cfg.bg : 'rgba(255,255,255,0.4)',
                  border: type === t ? `2px solid ${cfg.color}` : '2px solid transparent',
                  color: type === t ? cfg.color : '#5a5a52',
                  boxShadow: type === t ? `0 4px 12px ${cfg.color}20` : 'none',
                }}
              >
                <div style={{ opacity: type === t ? 1 : 0.6 }}>{cfg.icon}</div>
                <span className="text-[13px] font-bold tracking-tight">
                  {KO ? cfg.labelKO : cfg.labelEN}
                </span>
              </button>
            );
          })}
        </div>

        {/* Time input */}
        <div className="flex items-center gap-2 mb-3 p-3 rounded-xl" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
          <Clock size={14} style={{ color: '#94A3B8' }} />
          <span className="text-sm font-medium" style={{ color: '#64748B' }}>{KO ? '시간' : 'Time'}</span>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="ml-auto text-base font-semibold outline-none bg-transparent"
            style={{ color: '#0F172A' }}
          />
        </div>

        {/* Value input */}
        {(type === 'meal' || type === 'walk' || type === 'sleep') && (
          <div className="flex items-center gap-2 mb-3 p-3 rounded-xl" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0' }}>
            <Tag size={14} style={{ color: '#94A3B8' }} />
            <span className="text-sm font-medium" style={{ color: '#64748B' }}>
              {type === 'meal' ? (KO ? '식사량 (g)' : 'Amount (g)') :
               type === 'walk' ? (KO ? '시간 (분)' : 'Duration (mins)') :
               (KO ? '수면시간 (시간)' : 'Duration (hours)')}
            </span>
            <input
              type="number"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              placeholder="0"
              className="ml-auto text-base font-semibold outline-none bg-transparent text-right w-24"
              style={{ color: '#0F172A' }}
            />
          </div>
        )}

        {/* Note input */}
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={KO ? '메모 입력 (선택사항)' : 'Add a note (optional)'}
          rows={2}
          className="w-full px-3 py-2.5 rounded-xl text-base outline-none resize-none mb-4"
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            color: '#0F172A',
          }}
        />

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-base font-medium"
            style={{ background: '#F1F5F9', color: '#64748B' }}
          >
            {KO ? '취소' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl text-base font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #3E6D52, #5a9970)' }}
          >
            {KO ? '저장' : 'Save'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Timeline Entry ────────────────────────────────────────────────────────────
interface EntryProps { entry: TimelineEntry; index: number; }
function TimelineItem({ entry, index }: EntryProps) {
  const { lang, timeline, setTimeline } = useApp();
  const KO = lang === 'KO';
  const cfg = ACTIVITY_CONFIG[entry.type];
  const [isEditing, setIsEditing] = useState(false);
  const [editNote, setEditNote] = useState(entry.note);
  const [editValue, setEditValue] = useState(entry.value !== undefined ? String(entry.value) : '');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const saveEdit = async () => {
    const parsedValue = editValue !== '' ? Number(editValue) : undefined;
    setTimeline(prev => prev.map(e => e.id === entry.id ? { ...e, note: editNote, value: parsedValue } : e));
    setIsEditing(false);
    try { await updateTimelineEntry(entry.id, { note: editNote, value: parsedValue }); } catch(e) { console.error(e); }
  };

  const deleteEntry = async () => {
    setTimeline(prev => prev.filter(e => e.id !== entry.id));
    try { await deleteTimelineEntry(entry.id); } catch(e) { console.error(e); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -16 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35 }}
      className="flex gap-3 relative"
    >
      {/* Timeline left accent line */}
      <div 
        className="absolute left-[11px] top-0 bottom-0 w-[2px] z-0"
        style={{ background: 'rgba(44,54,57,0.1)' }}
      />

      {/* Timeline item body */}
      <div
        className="flex-1 flex items-center gap-4 relative z-10 mb-4"
      >
        {/* Category Icon (Solid Circle) - Now Centered with Card */}
        <div 
          className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 shadow-md transition-transform active:scale-95"
          style={{ 
            background: cfg.color, 
            color: '#fff',
            boxShadow: `0 4px 10px ${cfg.color}50`
          }}
        >
          {cfg.icon}
        </div>

        {/* Content card (Vivid Edge Style) */}
        <div
          className="flex-1 rounded-2xl p-4 shadow-md relative overflow-hidden flex items-center"
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(0,0,0,0.04)',
            minHeight: '76px'
          }}
        >
          {/* Left accent bar */}
          <div 
            className="absolute left-0 top-0 bottom-0 w-1.5"
            style={{ background: cfg.color }}
          />

          <div className="flex items-center justify-between w-full">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span
                  className="text-[15px] font-semibold flex items-center gap-2"
                  style={{ color: '#0F172A' }}
                >
                  {KO ? cfg.labelKO : cfg.labelEN}
                  {entry.value !== undefined && (
                    <span className="text-[13px] font-bold px-2 py-0.5 rounded-md" style={{ background: `${cfg.color}15`, color: cfg.color }}>
                      {entry.value} {entry.unit}
                    </span>
                  )}
                </span>
                <span className="text-[12px] font-medium" style={{ color: '#94A3B8' }}>
                  {entry.time}
                </span>
              </div>

              {isEditing ? (
                <div className="flex flex-col gap-2 mt-2">
                  {entry.value !== undefined && (
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-semibold" style={{ color: '#64748B' }}>{KO ? '수치 변경:' : 'Value:'}</span>
                      <input
                        type="number"
                        value={editValue}
                        onChange={e => setEditValue(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setIsEditing(false); }}
                        className="w-20 text-sm px-2 py-1 rounded-lg outline-none font-medium"
                        style={{ background: '#F5F7F6', color: '#1A2421', border: `1px solid ${cfg.color}` }}
                      />
                      <span className="text-[12px] font-medium" style={{ color: '#64748B' }}>{entry.unit}</span>
                    </div>
                  )}
                  <div className="flex gap-1.5">
                    <input
                      autoFocus
                      value={editNote}
                      onChange={e => setEditNote(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setIsEditing(false); }}
                      className="flex-1 text-sm px-3 py-1.5 rounded-xl outline-none font-medium"
                      style={{ background: '#F5F7F6', color: '#1A2421', border: `1.5px solid ${cfg.color}` }}
                      placeholder={KO ? "메모..." : "Note..."}
                    />
                    <button onClick={saveEdit} className="p-1.5"><Check size={18} style={{ color: '#45B649' }} /></button>
                  </div>
                </div>
              ) : (
                entry.note ? (
                  <p className="text-sm mt-0.5 leading-relaxed" style={{ color: '#475569' }}>{entry.note}</p>
                ) : (
                  <p className="text-[11px] mt-0.5 italic" style={{ color: '#CBD5E1' }}>
                    {KO ? '메모 없음' : 'No notes'}
                  </p>
                )
              )}

              {confirmDelete && (
                <div className="flex items-center gap-3 mt-2 pt-2 border-t border-dashed border-gray-100">
                  <span className="text-[11px] font-bold" style={{ color: '#E87B7B' }}>
                    {KO ? '삭제?' : 'Del?'}
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={deleteEntry}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-lg text-white"
                      style={{ background: '#E87B7B' }}
                    >
                      {KO ? '예' : 'Yes'}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="text-[11px] font-bold px-2 py-0.5 rounded-lg"
                      style={{ background: 'rgba(44,54,57,0.08)', color: '#8a897e' }}
                    >
                      {KO ? '아니오' : 'No'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons (Now High Contrast) */}
            {!isEditing && !confirmDelete && (
              <div className="flex items-center gap-1 ml-3">
                <button
                  onClick={() => { setEditNote(entry.note); setIsEditing(true); }}
                  className="p-2 rounded-xl transition-all hover:bg-gray-100 active:bg-gray-200"
                  style={{ color: '#444', background: 'rgba(0,0,0,0.03)' }}
                >
                  <Edit2 size={15} />
                </button>
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="p-2 rounded-xl transition-all hover:bg-red-50 active:bg-red-100"
                  style={{ color: '#E87B7B', background: 'rgba(232,123,123,0.08)' }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Timeline Tab ─────────────────────────────────────────────────────────────
export function TimelineTab() {
  const { lang, timeline, pets, selectedPetIdx } = useApp();
  const KO = lang === 'KO';
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<'today' | 'yesterday' | 'week' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>('');
  const dateInputRef = useRef<HTMLInputElement>(null);

  const pet = pets[selectedPetIdx] || pets[0];
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`;

  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);
  const sevenDaysAgoStr = `${sevenDaysAgo.getFullYear()}-${String(sevenDaysAgo.getMonth() + 1).padStart(2, '0')}-${String(sevenDaysAgo.getDate()).padStart(2, '0')}`;

  const dateEntries = timeline.filter(e => {
    if (e.petId !== pet?.id) return false;
    if (selectedDate === 'today') {
      return e.date === todayStr;
    } else if (selectedDate === 'yesterday') {
      return e.date === yesterdayStr;
    } else if (selectedDate === 'week') {
      return e.date >= sevenDaysAgoStr && e.date <= todayStr;
    } else if (selectedDate === 'custom') {
      return e.date === customDate;
    }
    return false;
  });
  
  const activityCount = dateEntries.length;

  const DATE_LABELS = {
    today:     { KO: '오늘', EN: 'Today' },
    yesterday: { KO: '어제', EN: 'Yesterday' },
    week:      { KO: '이번 주', EN: 'This Week' },
  };

  const getHeaderDateText = () => {
    if (selectedDate === 'today') {
      return new Intl.DateTimeFormat(KO ? 'ko-KR' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
      }).format(today);
    } else if (selectedDate === 'yesterday') {
      return new Intl.DateTimeFormat(KO ? 'ko-KR' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
      }).format(yesterday);
    } else if (selectedDate === 'custom' && customDate) {
      const [y, m, d] = customDate.split('-').map(Number);
      const dateObj = new Date(y, m - 1, d);
      return new Intl.DateTimeFormat(KO ? 'ko-KR' : 'en-US', {
        year: 'numeric', month: 'long', day: 'numeric', weekday: 'long'
      }).format(dateObj);
    } else {
      const start = new Intl.DateTimeFormat(KO ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' }).format(sevenDaysAgo);
      const end = new Intl.DateTimeFormat(KO ? 'ko-KR' : 'en-US', { month: 'short', day: 'numeric' }).format(today);
      return KO ? `${start} ~ ${end} (최근 7일)` : `${start} ~ ${end} (Last 7 Days)`;
    }
  };

  return (
    <div className="relative h-full">
      <div className="px-4 pb-6 pt-4">

        {/* ── Header Row ── */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className="text-base font-semibold"
              style={{ color: '#0F172A' }}
            >
              {KO ? '활동 타임라인' : 'Activity Timeline'}
            </h2>
            <p className="text-[12px]" style={{ color: '#64748B' }}>
              {selectedDate === 'today' && (KO ? todayStr.replace(/-/g, '.') : new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(today))}
              {selectedDate === 'yesterday' && (KO ? yesterdayStr.replace(/-/g, '.') : new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).format(yesterday))}
              {selectedDate === 'week' && (KO ? '최근 7일 기록' : 'Last 7 Days')}
              {selectedDate === 'custom' && customDate.replace(/-/g, '.')}
              {` · `}
              {KO ? `${activityCount}개의 기록` : `${activityCount} activities`}
            </p>
          </div>

          {/* Add button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #3E6D52, #5a9970)', color: '#fff' }}
          >
            <Plus size={14} strokeWidth={2.5} />
            {KO ? '기록 추가' : 'Add'}
          </motion.button>
        </div>

        {/* ── Date Filter Pills ── */}
        <div className="flex gap-2 mb-4 items-center w-full">
          {(['today', 'yesterday', 'week'] as const).map(d => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all"
              style={
                selectedDate === d
                  ? { background: '#3E6D52', color: '#FFFFFF' }
                  : { background: '#FFFFFF', color: '#4A5E58', border: '1px solid rgba(62,109,82,0.2)' }
              }
            >
              {KO ? DATE_LABELS[d].KO : DATE_LABELS[d].EN}
            </button>
          ))}

          {/* Custom Date Picker - Minimal Icon Style */}
          <div className="relative ml-auto flex items-center">
            {/* Visual Button: Just a clean icon (and date text if selected) without box */}
            <div
              className="flex items-center gap-1.5 pointer-events-none"
              style={{ color: selectedDate === 'custom' ? '#3E6D52' : '#4A5E58' }}
            >
              <Calendar size={20} strokeWidth={1.5} />
              {selectedDate === 'custom' && customDate && (
                <span className="text-sm font-medium">
                  {customDate.substring(5).replace('-', '/')}
                </span>
              )}
            </div>

            {/* Native Date Input overlaid invisibly */}
            <input
              type="date"
              value={customDate}
              onChange={(e) => {
                if (e.target.value) {
                  setCustomDate(e.target.value);
                  setSelectedDate('custom');
                }
              }}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              style={{ fontSize: '16px' }} // Prevents iOS zooming on focus
            />
          </div>
        </div>

        {/* ── Big Localized Date ── */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 mt-2 px-1"
        >
          <h1 className="text-xl font-bold" style={{ color: '#0F172A' }}>
            {getHeaderDateText()}
          </h1>
          <div className="w-8 h-1 rounded-full mt-1" style={{ background: '#3E6D52' }} />
        </motion.div>


        {/* ── Timeline List ── */}
        {dateEntries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12">
            <span style={{ fontSize: 40 }}>📋</span>
            <p className="text-sm mt-3" style={{ color: '#8a897e' }}>
              {KO ? '아직 기록이 없어요' : 'No activities yet'}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-3 text-sm font-semibold px-4 py-2 rounded-full"
              style={{ background: '#A27B5C22', color: '#A27B5C' }}
            >
              {KO ? '첫 번째 기록 추가하기' : 'Add first activity'}
            </button>
          </div>
        ) : (
          <div className="relative">
            {dateEntries.map((entry, i) => (
              <TimelineItem key={entry.id} entry={entry} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {showAddModal && (
          <AddActivityModal onClose={() => setShowAddModal(false)} petId={pet.id} />
        )}
      </AnimatePresence>
    </div>
  );
}
