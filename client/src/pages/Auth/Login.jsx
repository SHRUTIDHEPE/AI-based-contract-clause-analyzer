import { useState, useContext } from "react";
import { login } from "../../api/auth";
import { AuthContext } from "../../context/AuthContext";

export default function Login() {
  const { setUser } = useContext(AuthContext);
  const [data, setData] = useState({ username: "", password: "" });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await login(data);
    localStorage.setItem("token", res.data.token);
    setUser(res.data.user);
    window.location.href = "/";
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="username" onChange={(e) => setData({...data, username: e.target.value})} />
      <input placeholder="password" type="password" onChange={(e) => setData({...data, password: e.target.value})} />
      <button>Login</button>
    </form>
  );
}
