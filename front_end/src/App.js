import React from 'react'
// import axios from 'axios'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

//COMPONENTS
import Welcome from './components/pages/Welcome_page'
import LogIn from './components/pages/Login_page'
import Register from './components/pages/Register_page'
import MyPortfolio from './components/pages/MyPortfolio_page'
import Marketplace from './components/pages/Marketplace_page'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Welcome />} />
        <Route path='login' element={<LogIn />} />
        <Route path='register' element={<Register />} />
        <Route path='myportfolio' element={<MyPortfolio />} />
        <Route path='marketplace' element={<Marketplace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
