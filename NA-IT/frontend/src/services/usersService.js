import axios from 'axios';
import authService from './authService';

const API_URL = '/api/users';

const getAuthHeader = () => {
  const user = authService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
};

export const getAllUsers = () => axios.get(API_URL, { headers: getAuthHeader() });
export const getUserById = (id) => axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
export const createUser = (user) => axios.post(API_URL, user, { headers: getAuthHeader() });
export const updateUser = (id, user) => axios.put(`${API_URL}/${id}`, user, { headers: getAuthHeader() });
export const deleteUser = (id) => axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() }); 