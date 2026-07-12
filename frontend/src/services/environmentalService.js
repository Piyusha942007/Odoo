import api from './api';

// --- Emission Factors APIs ---
export const getEmissionFactors = async (sourceType = '') => {
  const url = sourceType ? `/environmental/emission-factors?sourceType=${sourceType}` : '/environmental/emission-factors';
  const response = await api.get(url);
  return response.data;
};

export const getEmissionFactorById = async (id) => {
  const response = await api.get(`/environmental/emission-factors/${id}`);
  return response.data;
};

export const createEmissionFactor = async (factorData) => {
  const response = await api.post('/environmental/emission-factors', factorData);
  return response.data;
};

export const updateEmissionFactor = async (id, factorData) => {
  const response = await api.put(`/environmental/emission-factors/${id}`, factorData);
  return response.data;
};

export const deleteEmissionFactor = async (id) => {
  const response = await api.delete(`/environmental/emission-factors/${id}`);
  return response.data;
};

// --- Carbon Transactions APIs ---
export const getCarbonTransactions = async (department = '', calculationType = '') => {
  let query = [];
  if (department) query.push(`department=${department}`);
  if (calculationType) query.push(`calculationType=${calculationType}`);
  
  const queryString = query.length ? `?${query.join('&')}` : '';
  const response = await api.get(`/environmental/carbon-transactions${queryString}`);
  return response.data;
};

export const getCarbonTransactionById = async (id) => {
  const response = await api.get(`/environmental/carbon-transactions/${id}`);
  return response.data;
};

export const createCarbonTransaction = async (transactionData) => {
  const response = await api.post('/environmental/carbon-transactions', transactionData);
  return response.data;
};

export const updateCarbonTransaction = async (id, transactionData) => {
  const response = await api.put(`/environmental/carbon-transactions/${id}`, transactionData);
  return response.data;
};

export const deleteCarbonTransaction = async (id) => {
  const response = await api.delete(`/environmental/carbon-transactions/${id}`);
  return response.data;
};

// --- Product ESG Profile APIs ---
export const getProductEsgProfiles = async () => {
  const response = await api.get('/environmental/product-esg');
  return response.data;
};

export const getProductEsgProfileById = async (id) => {
  const response = await api.get(`/environmental/product-esg/${id}`);
  return response.data;
};

export const createProductEsgProfile = async (profileData) => {
  const response = await api.post('/environmental/product-esg', profileData);
  return response.data;
};

export const updateProductEsgProfile = async (id, profileData) => {
  const response = await api.put(`/environmental/product-esg/${id}`, profileData);
  return response.data;
};

export const deleteProductEsgProfile = async (id) => {
  const response = await api.delete(`/environmental/product-esg/${id}`);
  return response.data;
};

// --- Environmental Goals APIs ---
export const getEnvironmentalGoals = async () => {
  const response = await api.get('/environmental/goals');
  return response.data;
};

export const getEnvironmentalGoalById = async (id) => {
  const response = await api.get(`/environmental/goals/${id}`);
  return response.data;
};

export const createEnvironmentalGoal = async (goalData) => {
  const response = await api.post('/environmental/goals', goalData);
  return response.data;
};

export const updateEnvironmentalGoal = async (id, goalData) => {
  const response = await api.put(`/environmental/goals/${id}`, goalData);
  return response.data;
};

export const deleteEnvironmentalGoal = async (id) => {
  const response = await api.delete(`/environmental/goals/${id}`);
  return response.data;
};

// --- ESG Configuration & Scoring APIs ---
export const getEsgConfig = async () => {
  const response = await api.get('/environmental/config');
  return response.data;
};

export const saveEsgConfig = async (configData) => {
  const response = await api.post('/environmental/config', configData);
  return response.data;
};

export const getLiveDashboard = async () => {
  const response = await api.get('/environmental/dashboard');
  return response.data;
};

export const recomputeEsgScores = async (periodData = {}) => {
  const response = await api.post('/environmental/recompute-scores', periodData);
  return response.data;
};

export const getDepartmentTracking = async (deptId, year) => {
  const response = await api.get(`/environmental/departments/${deptId}/tracking?year=${year}`);
  return response.data;
};


