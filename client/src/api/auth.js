import axios from "../utils/axiosInstance";

export const register = (data) => axios.post("/users/register", data);
export const login = (data) => axios.post("/users/login", data);
export const refreshToken = (data) => axios.post("/users/refresh-token", data);
export const logout = () => axios.post("/users/logout");
export const changePassword = (data) => axios.post("/users/change-password", data);
export const getCurrentUser = () => axios.get("/users/current-user");
export const updateAccount = (data) => axios.patch("/users/update-account", data);
