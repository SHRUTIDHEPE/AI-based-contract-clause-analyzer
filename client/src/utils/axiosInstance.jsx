import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:9001/api/v1", // your backend API
  withCredentials: true,
});

instance.interceptors.request.use((config) => {
  return config;
});

export default instance;
