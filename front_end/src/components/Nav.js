import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

import { getPayload } from './helpers/authHelper'

import smallLogo from '../assets/small_logo.png'


const Nav = () => {

  const ref = useRef()
  const navigate = useNavigate()

  const [currentUser, setCurrentUser] = useState({})
  const [displayDropDown, setDisplayDropDown] = useState(false)
  const [unreadEmails, setUnreadEmails] = useState(false)

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const payload = getPayload()
        const { data } = await axios.get(`/api/auth/${payload.sub}/`)
        setCurrentUser(data)
      } catch (err) {
        console.log(err)
      }
    }
    const emails = async () => {
      try {
        const { data } = await axios.get(`/api/emails/userspecific/${getPayload().sub}/`)
        if (data.some(email => email.read === false)) {
          setUnreadEmails(true)
        }

      } catch (err) {
        console.log(err)
      }
    }
    emails()
    getCurrentUser()
  }, [])

  const handleLogout = () => {
    window.localStorage.removeItem('PIS')
    navigate('/')
  }



  return (
    <nav >
      <Link to='/'><img src={smallLogo} alt='favicon logo' className='small-logo' /></Link>
      <ul>
        <li><Link to={'/myportfolio'}>My Portfolio</Link></li>
        <li><Link to="/marketplace">Marketplace</Link></li>
        <li className={unreadEmails ? 'unreademails' : ''}><Link to="/email">Email</Link></li>
        <li className='link' onClick={handleLogout}>Log Out</li>
      </ul>
    </nav>
  )
}

export default Nav