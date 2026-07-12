import axios from 'axios';

const api = axios.create({
  baseURL: '/api/gamification',
});

// Challenges CRUD
export const getChallenges = async () => {
  const res = await api.get('/challenges');
  return res.data;
};

export const createChallenge = async (data) => {
  const res = await api.post('/challenges', data);
  return res.data;
};

export const updateChallenge = async (id, data) => {
  const res = await api.put(`/challenges/${id}`, data);
  return res.data;
};

export const deleteChallenge = async (id) => {
  const res = await api.delete(`/challenges/${id}`);
  return res.data;
};

// Challenge Participations CRUD
export const getChallengeParticipations = async () => {
  const res = await api.get('/participations');
  return res.data;
};

export const createChallengeParticipation = async (data) => {
  const res = await api.post('/participations', data);
  return res.data;
};

export const updateChallengeParticipation = async (id, data) => {
  const res = await api.put(`/participations/${id}`, data);
  return res.data;
};

export const deleteChallengeParticipation = async (id) => {
  const res = await api.delete(`/participations/${id}`);
  return res.data;
};

// Get Category list (Challenge scope)
export const getChallengeCategories = async () => {
  const res = await api.get('/categories');
  return res.data;
};

export default api;
