import axios from 'axios';
import authService from './authService';

const API_URL = '/api/audit-logs';

const getAuthHeader = () => {
  const user = authService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
};

export const getAllAuditLogs = () => axios.get(API_URL, { headers: getAuthHeader() });
export const getAuditLogById = (id) => axios.get(`${API_URL}/${id}`, { headers: getAuthHeader() });
export const createAuditLog = (log) => axios.post(API_URL, log, { headers: getAuthHeader() });
export const deleteAuditLog = (id) => axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() }); 