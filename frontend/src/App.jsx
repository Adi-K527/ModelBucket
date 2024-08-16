import React from 'react'
import Login from './pages/Login'
import Register from './pages/Register'
import {BrowserRouter as Router, Routes, Route, useParams} from "react-router-dom"
import Dashboard from './pages/Dashboard'
import Project from './pages/Project'
import Grafana from './pages/Grafana'

const App = () => {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/project/:id" element={<Project />} />
          <Route path="/test" element={<Grafana />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App