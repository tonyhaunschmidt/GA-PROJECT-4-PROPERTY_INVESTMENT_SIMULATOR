import React from 'react'
import { Link } from 'react-router-dom'

const WelcomePage = () => {


  return (
    <section className='welcome_page'>
      <h1>PROPERTY INVESTMENT SIMULATOR</h1>
      <p>A simulated world where you can invest in property and grow your empire</p>
      <Link to='/login'><button>Log In</button></Link>
      <Link to='/register'><button>Join</button></Link>
    </section>
  )
}

export default WelcomePage