import React, { useState } from "react";
import { register } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const res = await register(username, email, password);
      setMsg("Signup successful! Please log in.");
      setErr("");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      setErr(error.response?.data?.error || "Signup failed");
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <h2>Sign Up</h2>
      <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" />
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Register</button>
      <p>
        Already have an account? <Link to="/">Login</Link>
      </p>
      {msg && <p style={{color:"green"}}>{msg}</p>}
      {err && <p style={{color:"red"}}>{err}</p>}
    </form>
  );
}
