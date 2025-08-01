import axios from 'axios';
import authService from './authService';

const API_URL = '/api/departments';

const getAuthHeader = () => {
  const user = authService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
};

export const getAllDepartments = () => axios.get(API_URL, { headers: getAuthHeader() });
export const getDepartmentById = (id) => axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
export const createDepartment = (department) => axios.post(API_URL, department, { headers: getAuthHeader() });
export const updateDepartment = (id, department) => axios.put(`${API_URL}/${id}`, department, { headers: getAuthHeader() });
export const deleteDepartment = (id) => axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() }); 