import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

import smallLogo from '../../assets/small_logo.png'


const RegisterPage = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    password_confirmation: '',
  })
  const [intro, setintro] = useState(true)
  const [WelcomeIntro, setWelcomeIntro] = useState(false)

  const handleFormInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/auth/register', formData)
      //navigate('/login')
      setWelcomeIntro(true)
    } catch (err) {
      console.log(err)
    }
  }

  const passIntro = () => {
    setintro(false)
  }

  const goToLogin = () => {
    navigate('/login')
  }

  return (
    <section className='register_page'>
      <form onSubmit={handleSubmit}>
        <Link to='/'><img src={smallLogo} alt='favicon logo' className='small-logo' /></Link>
        {WelcomeIntro ?
          <>
            <h4>WELCOME!</h4>
            <p className='intro'>Congratulations you've registered an account. Log in to get started.</p>
            <button className='main_button_style' onClick={goToLogin}>LOG IN</button>
          </>
          :
          <>
            {intro ?
              <>
                <p className='intro'>You're a budding property investor. You've saved £25 000 and can't wait to buy your first investment property.</p>
                <p className='intro'>Click 'JOIN' below to create your account and get started!</p>
                <button onClick={passIntro} className='main_button_style'>JOIN</button>
              </>
              :
              <>
                <input type='text' name='first_name' placeholder='First Name' onChange={handleFormInput} />
                <input type='text' name='last_name' placeholder='Last name' onChange={handleFormInput} />
                <input type='text' name='username' placeholder='Username' onChange={handleFormInput} />
                <input type='text' name='email' placeholder='Email' onChange={handleFormInput} />
                <input type='password' name='password' placeholder='Password' onChange={handleFormInput} />
                <input type='password' name='password_confirmation' placeholder='Confirm Password' onChange={handleFormInput} />
                <button className='main_button_style'>JOIN</button>
              </>}
            <p>Already have an account? <Link to='/login'>Log In</Link></p>
          </>
        }
      </form>

    </section>
  )
}

export default RegisterPage