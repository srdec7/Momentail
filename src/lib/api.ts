import { Pet, TimelineEntry } from '../app/App';

const PROFILES_KEY = 'petory_profiles';
const TIMELINE_KEY = 'petory_timelines';

// Helper functions for localStorage
const getLocalData = (key: string) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (e) {
    console.error('Error reading from localStorage', e);
    return null;
  }
};

const setLocalData = (key: string, data: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Error writing to localStorage', e);
  }
};

// ─── Profiles ───

export const getProfiles = async () => {
  const profiles = getLocalData(PROFILES_KEY) || [];
  return profiles;
};

export const getProfile = async (profileId: string = 'default') => {
  const profiles = getLocalData(PROFILES_KEY) || [];
  return profiles.find((p: any) => p.id === profileId) || null;
};

export const saveProfile = async (profile: Partial<Pet> & { id?: string }) => {
  let profiles = getLocalData(PROFILES_KEY) || [];
  
  if (profile.id) {
    // Update existing
    profiles = profiles.map((p: any) => p.id === profile.id ? { ...p, ...profile } : p);
  } else {
    // Create new
    profile.id = `pet_${Date.now()}`;
    profiles.push(profile);
  }
  
  setLocalData(PROFILES_KEY, profiles);
  return { success: true, profile };
};

export const deleteProfile = async (profileId: string) => {
  let profiles = getLocalData(PROFILES_KEY) || [];
  profiles = profiles.filter((p: any) => p.id !== profileId);
  setLocalData(PROFILES_KEY, profiles);
  
  // Also delete associated timeline
  let timelines = getLocalData(TIMELINE_KEY) || [];
  timelines = timelines.filter((t: any) => t.profileId !== profileId);
  setLocalData(TIMELINE_KEY, timelines);
  
  return { success: true };
};

// ─── Timeline ───

export const getTimeline = async (profileId: string = 'default') => {
  const timelines = getLocalData(TIMELINE_KEY) || [];
  const profileTimelines = timelines.filter((t: any) => t.profileId === profileId);
  
  // Sort by time descending (newest first)
  profileTimelines.sort((a: any, b: any) => new Date(b.time).getTime() - new Date(a.time).getTime());
  
  return profileTimelines.map((item: any) => {
    // Convert to frontend format
    let date = '';
    let time = '';
    if (item.time) {
      const dt = new Date(item.time);
      date = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      time = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
    }
    
    return {
      ...item,
      date: date || item.date,
      time: time || item.time
    };
  });
};

export const addTimelineEntry = async (entry: Partial<TimelineEntry> & { profileId: string }) => {
  let timelines = getLocalData(TIMELINE_KEY) || [];
  
  const newEntry = {
    id: `tl_${Date.now()}`,
    profileId: entry.profileId,
    type: entry.type,
    time: entry.time, // Frontend sends "YYYY-MM-DDTHH:mm:00"
    note: entry.note || '',
    value: entry.value,
    unit: entry.unit,
    created_at: new Date().toISOString()
  };
  
  timelines.push(newEntry);
  setLocalData(TIMELINE_KEY, timelines);
  
  return { success: true, data: newEntry };
};

export const updateTimelineEntry = async (id: string, updates: any) => {
  let timelines = getLocalData(TIMELINE_KEY) || [];
  let updatedEntry = null;
  
  timelines = timelines.map((t: any) => {
    if (t.id === id) {
      updatedEntry = { ...t, ...updates };
      return updatedEntry;
    }
    return t;
  });
  
  setLocalData(TIMELINE_KEY, timelines);
  return { success: true, data: updatedEntry };
};

export const deleteTimelineEntry = async (id: string) => {
  let timelines = getLocalData(TIMELINE_KEY) || [];
  timelines = timelines.filter((t: any) => t.id !== id);
  setLocalData(TIMELINE_KEY, timelines);
  return { success: true };
};
