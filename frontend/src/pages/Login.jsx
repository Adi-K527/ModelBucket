import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';


const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault()

    try {
        const res = await fetch(import.meta.env.VITE_BACKEND_URI + "/api/user/login", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: "include",
            body: JSON.stringify({
              username,
              password,
            }),
          })

        const data = await res.json()
        
      
        if (res.status === 200) {
          document.cookie = `AUTH_TOKEN=${data.AUTH_TOKEN}; path=/; SameSite=None; Secure`;
          navigate("/")
        }
    }
    catch (error) {
        console.error(error)
    }
  }
  

  return (
    <div>
      <h2>ModelBucket Login</h2>
      <form onSubmit={onSubmit}>
        <div>
          <input type="username" placeholder="Enter your username" value={username} onChange={(e) => (setUsername(e.target.value))} required/>
        </div>
        <div>
          <input type="password" placeholder="Enter your password" value={password} onChange={(e) => (setPassword(e.target.value))} required/>
        </div>
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="/register">Sign up</a></p>
    </div>
  );
};

export default Login;
