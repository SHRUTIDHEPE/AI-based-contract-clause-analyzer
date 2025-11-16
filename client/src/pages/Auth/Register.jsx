import { useState } from "react";
import { register } from "../../api/auth";

export default function Register() {
  const [data, setData] = useState({
    username: "",
    email: "",
    fullName: "",
    password: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(data);
      window.location.href = "/login";
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input placeholder="Full Name" onChange={(e) => setData({...data, fullName: e.target.value})} />
      <input placeholder="Email" onChange={(e) => setData({...data, email: e.target.value})} />
      <input placeholder="Username" onChange={(e) => setData({...data, username: e.target.value})} />
      <input type="password" placeholder="Password" onChange={(e) => setData({...data, password: e.target.value})} />
      <button>Register</button>
    </form>
  );
}
