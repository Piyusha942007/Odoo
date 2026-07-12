import api from './api';

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
