import axios from "../utils/axiosInstance";

export const uploadContract = (data) =>
  axios.post("/contracts/upload", data);

export const getMyContracts = () =>
  axios.get("/contracts/mine");

export const getContractDetails = (id) =>
  axios.get(`/contracts/${id}`);
