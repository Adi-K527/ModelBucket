import React from 'react'
import Login from './components/Login.jsx'
import {BrowserRouter as Router, Routes, Route, useParams} from "react-router-dom"

const App = () => {
  return (
    <Router>
      <div className="container">
        <Routes>
          <Route path="/" element={<Login />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App