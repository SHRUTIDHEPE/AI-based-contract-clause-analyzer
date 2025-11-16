import axios from "../utils/axiosInstance";

export const register = (data) => axios.post("/auth/register", data);
export const login = (data) => axios.post("/auth/login", data);
export const getProfile = () => axios.get("/users/me");
