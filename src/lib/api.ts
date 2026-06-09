import axios from 'axios';
import { Pet, TimelineEntry } from '../app/App';

const API = axios.create({
  baseURL: '/api'
});

export const getProfile = async (profileId: string = 'default') => {
  const { data } = await API.get('/profile', { params: { profileId } });
  return data;
};

export const getProfiles = async () => {
  const { data } = await API.get('/profiles');
  return data;
};

export const saveProfile = async (profile: Partial<Pet> & { id?: string }) => {
  const { data } = await API.post('/profile', profile);
  return data;
};

export const deleteProfile = async (profileId: string) => {
  const { data } = await API.delete(`/profile`, { params: { profileId } });
  return data;
};

export const getTimeline = async (profileId: string = 'default') => {
  const { data } = await API.get('/timeline', { params: { profileId } });
  
  // Parse description to extract note, value, and unit if it's a JSON string
  return data.map((item: any) => {
    let note = item.description || '';
    let value = undefined;
    let unit = undefined;
    
    try {
      if (note.startsWith('{')) {
        const parsed = JSON.parse(note);
        note = parsed.note || '';
        value = parsed.value;
        unit = parsed.unit;
      }
    } catch (e) {
      // Not a JSON string, keep as regular note
    }
    
    // Convert UTC datetime to local YYYY-MM-DD and HH:mm
    let date = '';
    let time = '';
    if (item.time) {
      const dt = new Date(item.time);
      date = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}-${String(dt.getDate()).padStart(2, '0')}`;
      time = `${String(dt.getHours()).padStart(2, '0')}:${String(dt.getMinutes()).padStart(2, '0')}`;
    }
    
    return {
      ...item,
      note,
      value,
      unit,
      date: date || item.date,
      time: time || item.time
    };
  });
};

export const addTimelineEntry = async (entry: Partial<TimelineEntry> & { profileId: string }) => {
  // Serialize note, value, and unit into a JSON string for the description field
  const descriptionPayload = JSON.stringify({
    note: entry.note || '',
    value: entry.value,
    unit: entry.unit
  });

  const payload = {
    profileId: entry.profileId,
    type: entry.type,
    time: entry.time, // Frontend sends "YYYY-MM-DDTHH:mm:00" for new entries
    description: descriptionPayload
  };

  const { data } = await API.post('/timeline', payload);
  return data;
};

export const deleteTimelineEntry = async (id: string) => {
  const { data } = await API.delete(`/timeline/${id}`);
  return data;
};

export const updateTimelineEntry = async (id: string, updates: any) => {
  let payload = { ...updates };
  
  // If updating note, value, or unit, we need to serialize them again
  if (updates.note !== undefined || updates.value !== undefined || updates.unit !== undefined) {
    payload.description = JSON.stringify({
      note: updates.note || '',
      value: updates.value,
      unit: updates.unit
    });
    delete payload.note;
    delete payload.value;
    delete payload.unit;
  }
  
  const { data } = await API.put(`/timeline/${id}`, payload);
  return data;
};
