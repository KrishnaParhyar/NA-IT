import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8080/api/issuance';

const getAuthHeader = () => {
  const user = authService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
};

const issueItem = (data) => {
  return axios.post(`${API_URL}/issue`, data, { headers: getAuthHeader() });
};

const issuePeripherals = (data) => {
  return axios.post(`${API_URL}/issue-peripherals`, data, { headers: getAuthHeader() });
};

const receiveItem = (data) => {
  return axios.post(`${API_URL}/receive`, data, { headers: getAuthHeader() });
};

const getLogs = () => {
  return axios.get(`${API_URL}/logs`, { headers: getAuthHeader() });
};

const getMyItems = () => {
  return axios.get(`${API_URL}/my-items`, { headers: getAuthHeader() });
};

const issuanceService = {
  issueItem,
  issuePeripherals,
  receiveItem,
  getLogs,
  getMyItems,
};

export default issuanceService; 