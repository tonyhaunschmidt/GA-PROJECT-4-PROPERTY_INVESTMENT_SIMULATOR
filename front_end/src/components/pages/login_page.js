import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const LoginPage = () => {
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
      const { data } = await axios.post('/api/auth/login/', formData)
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
        <input type='text' name='email' placeholder='Email' onChange={handleFormInput} />
        <input type='password' name='password' placeholder='Password' onChange={handleFormInput} />
        <button>LOG IN</button>
      </form>
    </section>
  )
}

export default LoginPage