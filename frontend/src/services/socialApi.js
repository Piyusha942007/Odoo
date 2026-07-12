import axios from 'axios';

const api = axios.create({
  baseURL: '/api/social',
});

// Category CRUD
export const getCategories = async () => {
  const res = await api.get('/categories');
  return res.data;
};

export const createCategory = async (data) => {
  const res = await api.post('/categories', data);
  return res.data;
};

export const updateCategory = async (id, data) => {
  const res = await api.put(`/categories/${id}`, data);
  return res.data;
};

export const deleteCategory = async (id) => {
  const res = await api.delete(`/categories/${id}`);
  return res.data;
};

// CSR Activities CRUD
export const getCsrActivities = async () => {
  const res = await api.get('/csr-activities');
  return res.data;
};

export const createCsrActivity = async (data) => {
  const res = await api.post('/csr-activities', data);
  return res.data;
};

export const updateCsrActivity = async (id, data) => {
  const res = await api.put(`/csr-activities/${id}`, data);
  return res.data;
};

export const deleteCsrActivity = async (id) => {
  const res = await api.delete(`/csr-activities/${id}`);
  return res.data;
};

// Department Fetch (Master Data consumption)
export const getDepartments = async () => {
  const res = await api.get('/departments');
  return res.data;
};

export default api;
