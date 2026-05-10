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
  return data;
};

export const addTimelineEntry = async (entry: Partial<TimelineEntry> & { profileId: string }) => {
  const { data } = await API.post('/timeline', entry);
  return data;
};

export const deleteTimelineEntry = async (id: string) => {
  const { data } = await API.delete(`/timeline/${id}`);
  return data;
};

export const updateTimelineEntry = async (id: string, updates: any) => {
  const { data } = await API.put(`/timeline/${id}`, updates);
  return data;
};
