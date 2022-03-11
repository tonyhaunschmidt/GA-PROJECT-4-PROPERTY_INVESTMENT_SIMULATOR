import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate, Link } from 'react-router-dom'

import smallLogo from '../../assets/small_logo.png'

const LogIn = () => {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })

  const handleFormInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await axios.post('/api/auth/login', formData)
      setTokenToLocalStorage(data.token)
      navigate('/myportfolio')
    } catch (err) {
      console.log(err)
    }
  }

  const setTokenToLocalStorage = (token) => {
    window.localStorage.setItem('PIS', token)
  }

  return (
    <section className='login_page'>
      <form onSubmit={handleSubmit}>
        <Link to='/'><img src={smallLogo} alt='favicon logo' className='small-logo' /></Link>
        <h4>LOG IN</h4>
        <input type='text' name='email' placeholder='Email' onChange={handleFormInput} />
        <input type='password' name='password' placeholder='Password' onChange={handleFormInput} />
        <button className='main_button_style'>LOG IN</button>
        <div>
          <p>Don't have an account? <Link to='/register'>Join</Link></p>
        </div>
      </form>
    </section>
  )
}

export default LogIn