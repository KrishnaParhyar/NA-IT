import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8080/api/items'; // Removed the trailing slash

const getAuthHeader = () => {
  const user = authService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
};

const getAllItems = () => {
  return axios.get(API_URL, { headers: getAuthHeader() });
};

const createItem = (itemData) => {
  return axios.post(API_URL, itemData, { headers: getAuthHeader() });
};

const deleteItem = (itemId) => {
  return axios.delete(`${API_URL}/${itemId}`, { headers: getAuthHeader() });
};

const updateItem = (itemId, itemData) => {
  return axios.put(`${API_URL}/${itemId}`, itemData, { headers: getAuthHeader() });
};

// Add other item-related functions here (update)

const itemService = {
  getAllItems,
  createItem,
  deleteItem,
  updateItem,
};

export default itemService; 