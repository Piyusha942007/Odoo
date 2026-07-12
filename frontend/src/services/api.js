import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Category Foundation API
export const getCategories = async () => {
  const res = await api.get('/social/categories');
  return res.data;
};

export const createCategory = async (data) => {
  const res = await api.post('/social/categories', data);
  return res.data;
};

// Csr Activity Skeletons
export const getCsrActivities = async () => {
  const res = await api.get('/social/csr-activities');
  return res.data;
};

// Challenges Skeletons
export const getChallenges = async () => {
  const res = await api.get('/social/challenges');
  return res.data;
};
export default api;
