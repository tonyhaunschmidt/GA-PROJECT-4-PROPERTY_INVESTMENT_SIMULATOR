import React, { useState } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

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

  const handleFormInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.post('/api/auth/register/', formData)
      navigate('/login')
    } catch (err) {
      console.log(err)
    }
  }

  return (
    <section className='register_page'>
      <form onSubmit={handleSubmit}>
        <input type='text' name='fist_name' placeholder='First Name' onChange={handleFormInput} />
        <input type='text' name='last_name' placeholder='Last name' onChange={handleFormInput} />
        <input type='text' name='username' placeholder='Username' onChange={handleFormInput} />
        <input type='text' name='email' placeholder='Email' onChange={handleFormInput} />
        <input type='password' name='password' placeholder='Password' onChange={handleFormInput} />
        <input type='password' name='password_confirmation' placeholder='Confirm Password' onChange={handleFormInput} />
        <button>JOIN</button>
      </form>
    </section>
  )
}

export default RegisterPage