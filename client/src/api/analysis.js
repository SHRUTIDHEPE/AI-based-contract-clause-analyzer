import axios from "../utils/axiosInstance";

export const runAnalysis = (id) =>
  axios.post(`/analysis/run/${id}`);

export const getAnalysis = (id) =>
  axios.get(`/analysis/${id}`);
