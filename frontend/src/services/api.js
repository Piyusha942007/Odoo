import axios from 'axios';

const api = axios.create({
  baseURL: '/api/social',
});

// Category Foundation API
export const getCategories = async () => {
  const res = await api.get('/categories');
  return res.data;
};

export const createCategory = async (data) => {
  const res = await api.post('/categories', data);
  return res.data;
};

// Csr Activity Skeletons
export const getCsrActivities = async () => {
  const res = await api.get('/csr-activities');
  return res.data;
};

// Challenges Skeletons
export const getChallenges = async () => {
  const res = await api.get('/challenges');
  return res.data;
};

export default api;
