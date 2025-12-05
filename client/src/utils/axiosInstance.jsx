import axios from "axios";

const instance = axios.create({
  baseURL: "http://localhost:9001/api/v1", // your backend API
  withCredentials: true,
});

export default instance;
