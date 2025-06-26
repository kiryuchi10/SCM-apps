import React, { useState } from "react";
import { register } from "../services/auth";
import { useNavigate, Link } from "react-router-dom";

export default function SignupPage() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState(""); // For double entry
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    // Frontend double password check
    if (password !== password2) {
      setErr("Passwords do not match.");
      return;
    }
    if (!username || !email || !password) {
      setErr("All fields are required.");
      return;
    }

    try {
      const res = await register(username, email, password);
      setMsg("Signup successful! Please log in.");
      setErr("");
      setTimeout(() => navigate("/"), 1500);
    } catch (error) {
      // Print all error details in the console for debugging
      console.error('Signup error:', error);

      if (error.response) {
        // Server responded with error (most common)
        setErr(error.response.data?.error || JSON.stringify(error.response.data));
      } else if (error.request) {
        // Request was made but no response
        setErr("No response from server. Is the backend running?");
      } else {
        // Anything else (setup, etc)
        setErr(error.message || "Signup failed");
      }
    }

  };

  return (
    <form onSubmit={handleSignup}>
      <h2>Sign Up</h2>
      <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" />
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
      <input type="password" value={password2} onChange={e=>setPassword2(e.target.value)} placeholder="Confirm Password" />
      <button type="submit">Register</button>
      <p>
        Already have an account? <Link to="/">Login</Link>
      </p>
      {msg && <p style={{color:"green"}}>{msg}</p>}
      {err && <p style={{color:"red"}}>{err}</p>}
    </form>
  );
}
