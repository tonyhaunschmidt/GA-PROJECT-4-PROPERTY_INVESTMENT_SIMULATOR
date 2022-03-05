import React from 'react'
// import axios from 'axios'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

//COMPONENTS
import Welcome from './components/pages/welcome_page'
import LogIn from './components/pages/login_page'
import Register from './components/pages/register_page'


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Welcome />} />
        <Route path='login' element={<LogIn />} />
        <Route path='register' element={<Register />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
