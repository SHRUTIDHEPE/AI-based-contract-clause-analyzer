import axios from "../utils/axiosInstance";

export const uploadContract = (data) =>
  axios.post("/contracts/upload", data);

export const getMyContracts = (page = 1, limit = 10) =>
  axios.get(`/contracts/mine?page=${page}&limit=${limit}`);

export const getContractDetails = (id) =>
  axios.get(`/contracts/${id}`);

export const deleteContract = (id) =>
  axios.delete(`/contracts/${id}`);
