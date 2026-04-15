import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import Redirect from './Redirect.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route 
          path="/khth-dmkt" 
          element={<Redirect to="https://script.google.com/macros/s/AKfycbwQ1GsGCE6U7LZAGWdMje9XDmpkhiDemChRWe4JSTa7UDUhSXGI-_u-E8w3A2o9Mrg/exec" />} 
        />
        <Route 
          path="/khth-dmkt-nvyt" 
          element={<Redirect to="https://script.google.com/macros/s/AKfycbyHAXINfVhfqYeqwX7RXKzf8J6Dthn9BiypVAXnHSJwBRRLBXvA8TrSU2uXUeKEI1wBEA/exec" />} 
        />
        <Route
          path="/quy-trinh-tinh-tuoi-rang" 
          element={<Redirect to="https://script.google.com/macros/s/AKfycbyzfi5B0Snd3PkA_UvNo6qq7KGostO8m2Mtoo1gYu_TYjqnnN_zd03jd8H4SW8qn5hI/exec" />} 
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
