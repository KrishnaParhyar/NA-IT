import axios from 'axios';

const API_URL = 'http://localhost:8080/api/auth/';

const signup = (username, password, role) => {
  return axios.post(API_URL + 'signup', {
    username,
    password,
    role,
  });
};

const login = (username, password) => {
  return axios
    .post(API_URL + 'login', {
      username,
      password,
    })
    .then((response) => {
      if (response.data.token) {
        localStorage.setItem('user', JSON.stringify(response.data));
      }
      return response.data;
    });
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const authService = {
  signup,
  login,
  logout,
  getCurrentUser,
};

export default authService; 