import axios from 'axios';
import authService from './authService';

const API_URL = 'http://localhost:8080/api/categories';

const getAuthHeader = () => {
  const user = authService.getCurrentUser();
  if (user && user.token) {
    return { Authorization: 'Bearer ' + user.token };
  } else {
    return {};
  }
};

const getAllCategories = () => {
  return axios.get(API_URL, { headers: getAuthHeader() });
};

const deleteCategory = (id) => {
  return axios.delete(`${API_URL}/${id}`, { headers: getAuthHeader() });
};

const createCategory = (category) => {
  return axios.post(API_URL, category, { headers: getAuthHeader() });
};

const categoryService = {
  getAllCategories,
  deleteCategory,
  createCategory,
};

export { getAllCategories, deleteCategory, createCategory };
export default categoryService; 