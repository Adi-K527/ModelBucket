import React from 'react';
import { useState } from 'react';

const Login = () => {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const onSubmit = async (e) => {
    e.preventDefault()

    try {
        const res = await fetch(import.meta.env.VITE_BACKEND_URI + "/api/user/login", {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username,
              password,
            }),
          })
      
          console.log(res)
          const data = await res.json()
          console.log(data)
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
        <div>
          <input type="checkbox" id="rememberMe" />
          <label htmlFor="rememberMe">Remember me</label>
        </div>
        <button type="submit">Login</button>
      </form>
      <p>Don't have an account? <a href="#">Sign up</a></p>
    </div>
  );
};

export default Login;
