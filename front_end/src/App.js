import React from 'react'
// import axios from 'axios'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

//COMPONENTS
import WelcomePage from './components/pages/Welcome_page'
import LogInPage from './components/pages/Login_page'
import RegisterPage from './components/pages/Register_page'
import MyPortfolioPage from './components/pages/MyPortfolio_page'
import MarketplacePage from './components/pages/Marketplace_page'
import PropertyPage from './components/pages/Property_page'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<WelcomePage />} />
        <Route path='login' element={<LogInPage />} />
        <Route path='register' element={<RegisterPage />} />
        <Route path='myportfolio' element={<MyPortfolioPage />} />
        <Route path='marketplace' element={<MarketplacePage />} />
        <Route path='property/:id' element={<PropertyPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
