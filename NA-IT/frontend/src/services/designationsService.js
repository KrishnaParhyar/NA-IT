import axios from 'axios';
import authService from './authService';

const API_URL = '/api/designations';

const getAuthHeader = () => {
  const user = authService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
};

export const getAllDesignations = () => axios.get(API_URL, { headers: getAuthHeader() });
export const getDesignationById = (id) => axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
export const createDesignation = (designation) => axios.post(API_URL, designation, { headers: getAuthHeader() });
export const updateDesignation = (id, designation) => axios.put(`${API_URL}/${id}`, designation, { headers: getAuthHeader() });
export const deleteDesignation = (id) => axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() }); 