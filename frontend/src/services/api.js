import axios from "axios";

const AUTH_API =
  process.env.REACT_APP_AUTH_SERVICE_URL || "http://localhost:3001";
const COURSE_API =
  process.env.REACT_APP_COURSE_SERVICE_URL || "http://localhost:3002";
const AI_API = process.env.REACT_APP_AI_SERVICE_URL || "http://localhost:3003";

export const authAPI = {
  login: (email, password) =>
    axios.post(`${AUTH_API}/api/auth/login`, { email, password }),

  signup: (username, email, password) =>
    axios.post(`${AUTH_API}/api/auth/signup`, { username, email, password }),

  verify: (token) =>
    axios.get(`${AUTH_API}/api/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    }),
};

export const courseAPI = {
  getCourses: () => axios.get(`${COURSE_API}/api/courses`),

  searchCourses: (params) =>
    axios.get(`${COURSE_API}/api/courses/search`, { params }),

  uploadCourses: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return axios.post(`${COURSE_API}/api/courses/upload`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const aiAPI = {
  getRecommendations: (preferences) =>
    axios.post(`${AI_API}/api/recommendations`, preferences),

  getCategories: () => axios.get(`${AI_API}/api/recommendations/categories`),
};

export const cache = {
  set: (key, data, ttl = 300000) => {
    const item = {
      data,
      expiry: Date.now() + ttl,
    };
    localStorage.setItem(key, JSON.stringify(item));
  },

  get: (key) => {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return null;

    const item = JSON.parse(itemStr);
    if (Date.now() > item.expiry) {
      localStorage.removeItem(key);
      return null;
    }

    return item.data;
  },

  remove: (key) => {
    localStorage.removeItem(key);
  },
};
