import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Edit2, Trash2, Check, X, Clock, Utensils, Footprints, Moon, Droplets, Stethoscope, Bath, Tag } from 'lucide-react';
import { useApp, ActivityType, TimelineEntry } from '../App';
import { addTimelineEntry, updateTimelineEntry, deleteTimelineEntry } from '../../lib/api';

// ─── Activity Config ───────────────────────────────────────────────────────────
const ACTIVITY_CONFIG: Record<ActivityType, { icon: React.ReactNode; labelKO: string; labelEN: string; color: string; bg: string }> = {
  meal:    { icon: <Utensils size={20} />,      labelKO: '식사',   labelEN: 'Meal',    color: '#FF9F43', bg: '#FFF3E0'  },
  walk:    { icon: <Footprints size={20} />,    labelKO: '산책',   labelEN: 'Walk',    color: '#1DD1A1', bg: '#E8F5E9'  },
  sleep:   { icon: <Moon size={20} />,          labelKO: '수면',   labelEN: 'Sleep',   color: '#5F27CD', bg: '#F3E5F5' },
  toilet:  { icon: <Droplets size={20} />,      labelKO: '배변',   labelEN: 'Toilet',  color: '#00D2D3', bg: '#E0F7FA' },
  vet:     { icon: <Stethoscope size={20} />,   labelKO: '병원',   labelEN: 'Vet',     color: '#FF4D4D', bg: '#FFEBEE' },
  bath:    { icon: <Bath size={20} />,          labelKO: '목욕',   labelEN: 'Bath',    color: '#48DBFB', bg: '#E1F5FE' },
  other:   { icon: <Tag size={20} />,           labelKO: '기타',   labelEN: 'Other',   color: '#576574', bg: '#F5F6F7'  },
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

  const handleSave = async () => {
    const entry: TimelineEntry = {
      id: `t_${Date.now()}`,
      petId,
      type,
      time,
      date: '2026-05-04',
      note,
    };
    
    try {
      const res = await addTimelineEntry({
        profileId: petId,
        type,
        time: `${entry.date}T${time}:00`,
        description: note
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
        className="rounded-t-3xl p-5"
        style={{ background: '#EAE6DC' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="w-10 h-1 rounded-full mx-auto mb-4" style={{ background: 'rgba(44,54,57,0.2)' }} />

        <h3 className="text-sm font-bold mb-4" style={{ color: '#1A2421' }}>
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
        <div className="flex items-center gap-2 mb-3 p-3 rounded-xl" style={{ background: 'rgba(44,54,57,0.06)' }}>
          <Clock size={14} style={{ color: '#8a897e' }} />
          <span className="text-sm" style={{ color: '#8a897e' }}>{KO ? '시간' : 'Time'}</span>
          <input
            type="time"
            value={time}
            onChange={e => setTime(e.target.value)}
            className="ml-auto text-base font-medium outline-none bg-transparent"
            style={{ color: '#2C3639' }}
          />
        </div>

        {/* Note input */}
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder={KO ? '메모 입력 (선택사항)' : 'Add a note (optional)'}
          rows={2}
          className="w-full px-3 py-2.5 rounded-xl text-base outline-none resize-none mb-4"
          style={{
            background: 'rgba(44,54,57,0.06)',
            border: '1px solid rgba(44,54,57,0.08)',
            color: '#2C3639',
          }}
        />

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl text-base font-medium"
            style={{ background: 'rgba(44,54,57,0.08)', color: '#8a897e' }}
          >
            {KO ? '취소' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl text-base font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #A27B5C, #8b6347)' }}
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
  const [confirmDelete, setConfirmDelete] = useState(false);

  const saveEdit = async () => {
    setTimeline(prev => prev.map(e => e.id === entry.id ? { ...e, note: editNote } : e));
    setIsEditing(false);
    try { await updateTimelineEntry(entry.id, { description: editNote }); } catch(e) { console.error(e); }
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
                  className="text-[15px] font-black tracking-tight"
                  style={{ color: '#1A2421' }}
                >
                  {KO ? cfg.labelKO : cfg.labelEN}
                </span>
                <span className="text-[12px] font-extrabold" style={{ color: '#3E6D52' }}>
                  {entry.time}
                </span>
              </div>

              {isEditing ? (
                <div className="flex gap-1.5 mt-2">
                  <input
                    autoFocus
                    value={editNote}
                    onChange={e => setEditNote(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') saveEdit(); if (e.key === 'Escape') setIsEditing(false); }}
                    className="flex-1 text-sm px-3 py-1.5 rounded-xl outline-none font-medium"
                    style={{ background: '#F5F7F6', color: '#1A2421', border: `1.5px solid ${cfg.color}` }}
                  />
                  <button onClick={saveEdit} className="p-1.5"><Check size={18} style={{ color: '#45B649' }} /></button>
                </div>
              ) : (
                entry.note ? (
                  <p className="text-sm mt-0.5 leading-relaxed font-medium" style={{ color: '#5C6B64' }}>{entry.note}</p>
                ) : (
                  <p className="text-[11px] mt-0.5 opacity-50 italic font-medium" style={{ color: '#8a8e8b' }}>
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
  const [selectedDate, setSelectedDate] = useState<'today' | 'yesterday' | 'week'>('today');

  const pet = pets[selectedPetIdx] || pets[0];
  const dateEntries = timeline.filter(e => e.petId === pet?.id && e.date === '2026-05-04');
  const activityCount = dateEntries.length;

  const DATE_LABELS = {
    today:     { KO: '오늘', EN: 'Today' },
    yesterday: { KO: '어제', EN: 'Yesterday' },
    week:      { KO: '이번 주', EN: 'This Week' },
  };

  return (
    <div className="relative h-full">
      <div className="px-4 pb-6 pt-4">

        {/* ── Header Row ── */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2
              className="text-base font-black tracking-tight"
              style={{ color: '#1A2421' }}
            >
              {KO ? '활동 타임라인' : 'Activity Timeline'}
            </h2>
            <p className="text-[12px] font-bold" style={{ color: '#5C6B64' }}>
              {KO ? '2026.05.04' : 'May 4, 2026'} · {KO ? `${activityCount}개의 기록` : `${activityCount} activities`}
            </p>
          </div>

          {/* Add button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(135deg, #A27B5C, #8b6347)', color: '#fff' }}
          >
            <Plus size={14} strokeWidth={2.5} />
            {KO ? '기록 추가' : 'Add'}
          </motion.button>
        </div>

        {/* ── Date Filter Pills ── */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {(['today', 'yesterday', 'week'] as const).map(d => (
            <button
              key={d}
              onClick={() => setSelectedDate(d)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-all"
              style={
                selectedDate === d
                  ? { background: '#2C3639', color: '#DCD7C9' }
                  : { background: 'rgba(44,54,57,0.07)', color: '#8a897e' }
              }
            >
              {KO ? DATE_LABELS[d].KO : DATE_LABELS[d].EN}
            </button>
          ))}
        </div>

        {/* ── Big Localized Date ── */}
        <motion.div 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-6 mt-2 px-1"
        >
          <h1 className="text-xl font-black tracking-tight" style={{ color: '#2C3639' }}>
            {new Intl.DateTimeFormat(KO ? 'ko-KR' : 'en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              weekday: 'long',
            }).format(new Date())}
          </h1>
          <div className="w-8 h-1 rounded-full mt-1" style={{ background: '#A27B5C' }} />
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
