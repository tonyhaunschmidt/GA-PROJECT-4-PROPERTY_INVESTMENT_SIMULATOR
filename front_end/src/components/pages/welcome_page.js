import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { userIsAuthenticated } from '../helpers/authHelper'

import logo from '../../assets/small_logo.png'

const WelcomePage = () => {

  const navigate = useNavigate()

  useEffect(() => {
    userIsAuthenticated() && navigate('/myportfolio')
  }, [])


  return (
    <section className='welcome_page'>
      <img src={logo} alt='logo'></img>
      <h1>PROPERTY INVESTMENT SIMULATOR</h1>
      <p>A simulated world where you can invest in property and grow your empire</p>
      <Link to='/login'><button className='main_button_style'>Log In</button></Link>
      <Link to='/register'><button className='main_button_style'>Join</button></Link>
    </section>
  )
}

export default WelcomePage