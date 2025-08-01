import axios from 'axios';
import authService from './authService';

const API_URL = '/api/employees';

const getAuthHeader = () => {
  const user = authService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
};

export const getAllEmployees = () => axios.get(API_URL, { headers: getAuthHeader() });
export const getEmployeeById = (id) => axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
export const createEmployee = (employee) => axios.post(API_URL, employee, { headers: getAuthHeader() });
export const updateEmployee = (id, employee) => axios.put(`${API_URL}/${id}`, employee, { headers: getAuthHeader() });
export const deleteEmployee = (id) => axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() }); 