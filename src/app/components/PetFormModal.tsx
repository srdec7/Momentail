import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Check, ChevronDown, Loader2, HelpCircle, Heart, Activity, Calendar } from 'lucide-react';
import { useApp, Pet } from '../App';
import { saveProfile } from '../../lib/api';

// ─── Default photo ─────────────────────────────────────────────────────────────
const DEFAULT_PHOTO = '/default-dog.png';

// ─── Weight unit ──────────────────────────────────────────────────────────────
const WEIGHT_UNITS = ['kg', 'lbs'] as const;

// ─── Pet Form Modal ────────────────────────────────────────────────────────────
export function PetFormModal() {
  const { lang, pets, setPets, selectedPetIdx, setSelectedPetIdx, editingPet, setShowPetFormModal, setEditingPet } = useApp();
  const KO = lang === 'KO';
  const isEditing = !!editingPet;

  // ── Form state ────────────────────────────────────────────────────────────
  const [name,       setName]       = useState(editingPet?.name       ?? '');
  const [breed,      setBreed]      = useState(editingPet?.breed      ?? '');
  const [birthdate,  setBirthdate]  = useState(editingPet?.birthdate  ?? '');
  const [weight,     setWeight]     = useState(editingPet?.weight.toString() ?? '');
  const [weightUnit, setWeightUnit] = useState<'kg' | 'lbs'>(editingPet?.weightUnit ?? 'kg');
  const [lastVaccine,setLastVaccine]= useState(editingPet?.lastVaccine ?? '');
  const [nextVet,    setNextVet]    = useState(editingPet?.nextVet     ?? '');
  const [photo,      setPhoto]      = useState(editingPet?.photo       ?? DEFAULT_PHOTO);
  const [photoFile,  setPhotoFile]  = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>(editingPet?.photo ?? DEFAULT_PHOTO);

  const [isUploading, setIsUploading] = useState(false);
  const [isSaving,    setIsSaving]    = useState(false);
  const [error,       setError]       = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [showPhotoHelp, setShowPhotoHelp] = useState(false);

  // ── Photo selection ────────────────────────────────────────────────────────
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate
    if (!file.type.startsWith('image/')) {
      setError(KO ? '이미지 파일만 업로드할 수 있어요.' : 'Only image files are allowed.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(KO ? '파일 크기는 5MB 이하여야 해요.' : 'File size must be under 5MB.');
      return;
    }

    setPhotoFile(file);
    setError('');

    // Show local preview immediately
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  // ── Resize & convert photo to base64 for local storage ────────────────────
  const uploadPhoto = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const img = new Image();
        img.onload = () => {
          const MAX = 400;
          const ratio = Math.min(MAX / img.width, MAX / img.height, 1);
          const canvas = document.createElement('canvas');
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.75));
        };
        img.onerror = reject;
        img.src = ev.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError(KO ? '이름을 입력해주세요.' : 'Please enter a name.');
      return;
    }

    setIsSaving(true);
    try {
      let finalPhoto = photo;

      // 1. Upload new photo if selected
      if (photoFile) {
        setIsUploading(true);
        try {
          finalPhoto = await uploadPhoto(photoFile);
        } catch (upErr: any) {
          // Fallback: keep existing photo URL, don't block save
          console.warn('Photo upload failed, keeping previous photo:', upErr);
          finalPhoto = photo;
        } finally {
          setIsUploading(false);
        }
      }

      // 2. Build pet object
      const petData: Partial<Pet> & { id?: string } = {
        name: name.trim(),
        breed: breed.trim(),
        birthdate: birthdate || '2024-01',
        weight: parseFloat(weight) || 0,
        weightUnit,
        lastVaccine,
        nextVet,
        photo: finalPhoto,
      };

      if (isEditing && editingPet?.id) {
        petData.id = editingPet.id;
      }

      // 3. Persist to backend
      let savedId = editingPet?.id;
      try {
        const res = await saveProfile(petData as any);
        if (res?.id) savedId = res.id;
      } catch (apiErr) {
        console.warn('API save failed:', apiErr);
      }

      // 4. Update local state
      if (isEditing) {
        const updated = pets.map(p =>
          p.id === editingPet!.id
            ? { ...p, ...petData, id: savedId ?? p.id, photo: finalPhoto }
            : p
        );
        setPets(updated);
      } else {
        const newPet: Pet = {
          id: savedId ?? `pet_${Date.now()}`,
          name: petData.name!,
          breed: petData.breed!,
          birthdate: petData.birthdate!,
          weight: petData.weight!,
          weightUnit,
          lastVaccine: petData.lastVaccine!,
          nextVet: petData.nextVet!,
          photo: finalPhoto,
        };
        setPets(prev => [...prev, newPet]);
        setSelectedPetIdx(pets.length); // select new pet
      }

      // 5. Close modal
      setShowPetFormModal(false);
      setEditingPet(null);

    } catch (err: any) {
      setError(err.message ?? (KO ? '저장 중 오류가 발생했어요.' : 'An error occurred while saving.'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setShowPetFormModal(false);
    setEditingPet(null);
  };

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-50 flex flex-col justify-end overflow-hidden"
      style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)' }}
      onClick={handleClose}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 350 }}
        className="w-full rounded-t-3xl overflow-hidden flex flex-col"
        style={{ background: '#EAE6DC', maxHeight: '92%' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Drag handle */}
        <div className="pt-3 pb-1 flex justify-center flex-shrink-0">
          <div className="w-10 h-1 rounded-full" style={{ background: 'rgba(44,54,57,0.2)' }} />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pb-3 flex-shrink-0">
          <h3 className="text-base font-bold" style={{ color: '#2C3639' }}>
            {isEditing
              ? (KO ? '반려견 정보 수정' : 'Edit Pet Profile')
              : (KO ? '새 반려견 등록' : 'Register New Pet')}
          </h3>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-full"
            style={{ background: 'rgba(44,54,57,0.08)', color: '#2C3639' }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="overflow-y-auto overflow-x-hidden flex-1 px-5 pb-6 petory-scroll">
          <form onSubmit={handleSave}>

            {/* ── Photo Upload ── */}
            <div className="flex flex-col items-center mb-5">
              <div className="relative">
                {/* Preview circle */}
                <div
                  className="w-24 h-24 rounded-2xl overflow-hidden"
                  style={{ border: '3px solid rgba(162,123,92,0.4)', boxShadow: '0 4px 16px rgba(0,0,0,0.1)' }}
                >
                  <img src={photoPreview} alt="Pet" className="w-full h-full object-cover" />
                </div>

                {/* Camera button overlay */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-2 -right-2 w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
                  style={{ background: 'linear-gradient(135deg, #A27B5C, #8b6347)', color: '#fff' }}
                >
                  {isUploading
                    ? <Loader2 size={16} className="animate-spin" />
                    : <Camera size={16} />}
                </button>

                {/* Hidden file input – no `capture` attr → user can choose gallery or camera */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </div>

              <div className="relative mt-3 flex items-center gap-1.5">
                <p className="text-[12px]" style={{ color: '#8a897e' }}>
                  {KO ? '사진을 탭하여 갤러리/카메라에서 선택' : 'Tap to choose from gallery or camera'}
                </p>
                
                {/* Help Icon */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowPhotoHelp(!showPhotoHelp)}
                    className="flex items-center justify-center text-[#A27B5C] opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <HelpCircle size={14} />
                  </button>

                  {/* Tooltip */}
                  <AnimatePresence>
                    {showPhotoHelp && (
                      <>
                        {/* Invisible backdrop to close tooltip */}
                        <div className="fixed inset-0 z-10" onClick={() => setShowPhotoHelp(false)} />
                        
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 rounded-2xl z-20 shadow-xl pointer-events-none"
                          style={{ 
                            background: 'rgba(44, 54, 57, 0.92)', 
                            backdropFilter: 'blur(10px)',
                            color: '#DCD7C9',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        >
                          <div className="text-[11px] leading-relaxed">
                            <p className="font-bold mb-1 text-[#A27B5C]">
                              {KO ? '💡 사진 가이드' : '💡 Photo Guide'}
                            </p>
                            <ul className="space-y-1 opacity-90">
                              <li>• {KO ? '추천: 1:1 정사각 비율' : 'Rec: 1:1 square ratio'}</li>
                              <li>• {KO ? '제한: 최대 5MB 이하' : 'Limit: Max 5MB'}</li>
                              <li>• {KO ? '얼굴이 중앙에 오면 예뻐요!' : 'Center the face for best look'}</li>
                            </ul>
                          </div>
                          {/* Arrow */}
                          <div 
                            className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent"
                            style={{ borderTopColor: 'rgba(44, 54, 57, 0.92)' }}
                          />
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* ── Basic Info Section ── */}
            <div className="bg-white/40 rounded-2xl p-4 mb-4 border border-[#2C3639]/10 shadow-sm">
              <h4 className="text-[14px] font-bold text-[#2C3639] mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg" style={{ background: 'rgba(162,123,92,0.15)' }}>
                  <Heart size={16} color="#A27B5C" />
                </div>
                {KO ? '기본 정보' : 'Basic Identity'}
              </h4>
              {/* ── Name ── */}
            <FieldGroup label={KO ? '이름 *' : 'Name *'}>
              <StyledInput
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={KO ? '반려견 이름' : 'Pet name'}
                required
              />
            </FieldGroup>

            {/* ── Breed ── */}
            <FieldGroup label={KO ? '견종' : 'Breed'}>
              <StyledInput
                value={breed}
                onChange={e => setBreed(e.target.value)}
                placeholder={KO ? '예: 골든 리트리버' : 'e.g. Golden Retriever'}
              />
            </FieldGroup>

            {/* ── Birthdate ── */}
            <FieldGroup label={KO ? '생년월' : 'Birth Month'}>
              <StyledInput
                type="month"
                value={birthdate}
                onChange={e => setBirthdate(e.target.value)}
              />
            </FieldGroup>

            </div>

            {/* ── Vitals Section ── */}
            <div className="bg-white/40 rounded-2xl p-4 mb-4 border border-[#2C3639]/10 shadow-sm">
              <h4 className="text-[14px] font-bold text-[#2C3639] mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg" style={{ background: 'rgba(162,123,92,0.15)' }}>
                  <Activity size={16} color="#A27B5C" />
                </div>
                {KO ? '건강 수치' : 'Health Vitals'}
              </h4>
              {/* ── Weight ── */}
            <FieldGroup label={KO ? '체중' : 'Weight'}>
              <div className="flex gap-2">
                <StyledInput
                  type="number"
                  value={weight}
                  onChange={e => setWeight(e.target.value)}
                  placeholder="0.0"
                  min="0"
                  step="0.1"
                  className="flex-1"
                />
                {/* Unit toggle */}
                <div className="flex rounded-xl overflow-hidden" style={{ border: '1.5px solid rgba(44,54,57,0.12)' }}>
                  {WEIGHT_UNITS.map(u => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setWeightUnit(u)}
                      className="px-3 py-2 text-sm font-medium transition-all"
                      style={{
                        background: weightUnit === u ? '#2C3639' : 'rgba(255,255,255,0.5)',
                        color: weightUnit === u ? '#DCD7C9' : '#8a897e',
                      }}
                    >
                      {u}
                    </button>
                  ))}
                </div>
              </div>
            </FieldGroup>

            </div>

            {/* ── Vet Section ── */}
            <div className="bg-white/40 rounded-2xl p-4 mb-4 border border-[#2C3639]/10 shadow-sm">
              <h4 className="text-[14px] font-bold text-[#2C3639] mb-4 flex items-center gap-2">
                <div className="p-1.5 rounded-lg" style={{ background: 'rgba(162,123,92,0.15)' }}>
                  <Calendar size={16} color="#A27B5C" />
                </div>
                {KO ? '병원 및 예방접종' : 'Vet Schedule'}
              </h4>
              {/* ── Last Vaccine ── */}
            <FieldGroup label={KO ? '마지막 접종일' : 'Last Vaccine Date'}>
              <StyledInput
                type="date"
                value={lastVaccine}
                onChange={e => setLastVaccine(e.target.value)}
              />
            </FieldGroup>

            {/* ── Next Vet ── */}
            <FieldGroup label={KO ? '다음 진료 예약일' : 'Next Vet Appointment'}>
              <StyledInput
                type="date"
                value={nextVet}
                onChange={e => setNextVet(e.target.value)}
              />
            </FieldGroup>

            </div>

            {/* ── Error ── */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mb-4 px-4 py-3 rounded-xl text-sm"
                  style={{ background: 'rgba(232,123,123,0.15)', color: '#c05050', border: '1px solid rgba(232,123,123,0.3)' }}
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Actions ── */}
            <div className="flex gap-2 mt-2">
              <button
                type="button"
                onClick={handleClose}
                className="flex-1 py-3.5 rounded-xl text-base font-medium"
                style={{ background: 'rgba(44,54,57,0.08)', color: '#8a897e' }}
              >
                {KO ? '취소' : 'Cancel'}
              </button>
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="submit"
                disabled={isSaving || isUploading}
                className="flex-1 py-3.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2"
                style={{
                  background: (isSaving || isUploading) ? 'rgba(162,123,92,0.5)' : 'linear-gradient(135deg, #A27B5C, #8b6347)',
                  color: '#fff',
                }}
              >
                {(isSaving || isUploading) ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {isUploading
                      ? (KO ? '사진 업로드 중...' : 'Uploading photo...')
                      : (KO ? '저장 중...' : 'Saving...')}
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    {isEditing ? (KO ? '수정 완료' : 'Save Changes') : (KO ? '등록하기' : 'Register')}
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Helper sub-components ────────────────────────────────────────────────────
function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[13px] font-medium mb-1.5" style={{ color: '#8a897e' }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function StyledInput({ className = '', ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full px-4 py-3 rounded-xl text-base outline-none transition-all ${className}`}
      style={{
        background: 'rgba(255,255,255,0.8)',
        border: '1.5px solid rgba(44,54,57,0.12)',
        color: '#2C3639',
        caretColor: '#A27B5C',
      }}
    />
  );
}
