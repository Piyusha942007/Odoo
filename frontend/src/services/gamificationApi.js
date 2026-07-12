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

// ==========================================
// NEW GAMIFICATION ENDPOINTS (BADGES, REWARDS, ETC.)
// ==========================================

// Settings
export const getSettings = async () => {
  const res = await api.get('/settings');
  return res.data;
};

export const updateSettings = async (data) => {
  const res = await api.put('/settings', data);
  return res.data;
};

// Badges CRUD
export const getBadges = async () => {
  const res = await api.get('/badges');
  return res.data;
};

export const createBadge = async (data) => {
  const res = await api.post('/badges', data);
  return res.data;
};

export const updateBadge = async (id, data) => {
  const res = await api.put(`/badges/${id}`, data);
  return res.data;
};

export const deleteBadge = async (id) => {
  const res = await api.delete(`/badges/${id}`);
  return res.data;
};

// Earned Badges
export const getEarnedBadges = async () => {
  const res = await api.get('/badges/earned');
  return res.data;
};

export const getEarnedBadgesByEmployee = async (employeeName) => {
  const res = await api.get(`/badges/earned/${encodeURIComponent(employeeName)}`);
  return res.data;
};

export const awardBadge = async (employee, badgeId) => {
  const res = await api.post('/badges/award', { employee, badgeId });
  return res.data;
};

// Rewards CRUD
export const getRewards = async () => {
  const res = await api.get('/rewards');
  return res.data;
};

export const createReward = async (data) => {
  const res = await api.post('/rewards', data);
  return res.data;
};

export const updateReward = async (id, data) => {
  const res = await api.put(`/rewards/${id}`, data);
  return res.data;
};

export const deleteReward = async (id) => {
  const res = await api.delete(`/rewards/${id}`);
  return res.data;
};

// Redemption
export const redeemReward = async (employee, rewardId) => {
  const res = await api.post('/rewards/redeem', { employee, rewardId });
  return res.data;
};

export const getRedemptions = async () => {
  const res = await api.get('/redemptions');
  return res.data;
};

// Profile & Leaderboard
export const getEmployeeProfile = async (employeeName) => {
  const res = await api.get(`/profile/${encodeURIComponent(employeeName)}`);
  return res.data;
};

export const getLeaderboard = async (department = '') => {
  const url = department ? `/leaderboard?department=${encodeURIComponent(department)}` : '/leaderboard';
  const res = await api.get(url);
  return res.data;
};

export default api;
