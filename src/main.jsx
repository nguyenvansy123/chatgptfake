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
          element={<Redirect to="https://script.google.com/macros/s/AKfycbwbwm9mdogiaIgRFoB3jyy5Ak6OpEYbC796LNEpqG5FXe0oEsLLALCJqHeSPWeW24FPZw/exec" />} 
        />
        <Route
          path="/quy-trinh-tinh-tuoi-rang" 
          element={<Redirect to="https://script.google.com/macros/s/AKfycbxGelwW153Y3n9WWV-ySoi6BYIBrzk_v1BMi43WBCuWkLpaYAnsw4ji8rgmsMS4nDzJ/exec" />} 
        />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>,
)
