import axios from 'axios';
import authService from './authService';

const API_URL = '/api/stock';

const getAuthHeader = () => {
  const user = authService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
};

export const getAllStock = () => axios.get(API_URL, { headers: getAuthHeader() });
export const getStockById = (id) => axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
export const createStock = (stock) => axios.post(API_URL, stock, { headers: getAuthHeader() });
export const updateStock = (id, stock) => axios.put(`${API_URL}/${id}`, stock, { headers: getAuthHeader() });
export const deleteStock = (id) => axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() }); 