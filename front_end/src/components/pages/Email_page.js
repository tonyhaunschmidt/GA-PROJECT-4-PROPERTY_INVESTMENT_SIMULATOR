import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link, useNavigate } from 'react-router-dom'

import Nav from '../Nav'

import { getPayload, getTokenFromLocalStorage, userIsAuthenticated } from '../helpers/authHelper'



const Email = () => {

  const navigate = useNavigate()

  !userIsAuthenticated() && navigate('/')

  const [emails, setEmails] = useState([])
  const [currentEmail, setCurrentEmail] = useState({})

  useEffect(() => {
    const getEmails = async () => {
      try {
        const { data } = await axios.get(`/api/emails/userspecific/${getPayload().sub}/`)
        setEmails(data.reverse())
        console.log(data)
      } catch (err) {
        console.log(err)
      }
    }
    getEmails()
  }, [])

  const emailSelected = async (e) => {
    const selectedEmail = emails.find(email => email.id == e.target.value)
    setCurrentEmail(selectedEmail)
    const updatedEmails = [...emails]
    updatedEmails.splice(updatedEmails.indexOf(selectedEmail), 1, { ...selectedEmail, read: true })
    setEmails(updatedEmails)
    console.log(selectedEmail)
    await axios.put(`/api/emails/${e.target.value}/`, { ...selectedEmail, read: true, property: selectedEmail.property.id }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
  }

  return (
    <section className='email_page'>
      <Nav />
      <div className='email_section'>
        <div className='inbox'>
          <h4>Inbox</h4>
          <div className='emails'>
            {emails.map((email, index) =>
              <button key={index} value={email.id} onClick={emailSelected} className={!email.read ? 'unread' : ''}>{email.subject}- {(new Date(email.time_stamp)).toDateString()}</button>
            )}
          </div>
        </div>
        {currentEmail.subject ?
          currentEmail.subject === 'Welcome!' ?
            <div className='email'>
              <h1>{currentEmail.subject}</h1>
              <h2>{(new Date(currentEmail.time_stamp)).toDateString()}</h2>
              <p>You have taken your first step to becoming a property tycoon!</p>
              <p>You've saved £25, 000 and now you're looking to buy your first investment property!</p>
              <p>Here are a few tips to get you started:</p>
              <p>1- The first thing you'll want to do is to look for what property you want to buy. To do this go to the Marketplace (you'll find this in the navigation bar)</p>
              <p>Here you can browse different properties on the market. Click on the property to view the details, save it or make an offer!</p>
              <p>2- Make an offer! If you like the property and think it's a sound investment, then click on the 'make an offer' button</p>
              <p>When filling out the offer form, make sure you do your due diligence. You need to make sure you have enough capital, and if you decide to take out a mortgage you need to have enough rent income to cover the mortgage payments.</p>
              <p>3- After you've made your offer, its in the hands of the current owner to accept your offer! Sit tight and wait. You can always submit offers on numorous properties. Don't worry, you have the final say on if the deal goes through.</p>
              <p>4- They've accepted your offer?! That's great! Navigate to the property page and press the 'confirm purchase' button. Once you finalize the offer there is no going back so make sure you are completely happy with procressing the purchase and all your financial affairs are in order.</p>
              <p>5- Now you own your first property! Congratulations! But there is still work to do to make it a money generating asset. You'll need to navigate to the property page and do any management that you wish to do. remember, the property won't gain any income until you have tenents so you'll need to set up a letting agent.</p>
              <p>6- Letting agents are great but they're not magic! Sometimes it takes a little time for them to fill your property. The better grade letting agents are quicker at finding you tenents and dealing with any issues so you don't have to. This comes at a price of course!</p>
              <p>7- Sit back and watch your revenue increase! It may be slow at first but boy.. as an invester do we not just looove the compound effect! Once your capital is high enough, keep investing! You can go to your Portfolio to view all your stats and keep an eye on your properties.</p>
              <p>8- Remember that time moves a little quicker in this virtual world so make sure you check in a little more than you would in the real world.</p>
              <p>9- Have Fun!!</p>
              <hr />
              <p>We hope this is enought to get you started!</p>
              <p>We're really excited to see what you can do</p>
              <p>Good Luck!!</p>
              <p>The Property Investment Simulator Team</p>
            </div>
            :
            currentEmail.subject === 'Offer Accepted!' ?
              <div className='email'>
                <h1>{currentEmail.subject} - {currentEmail.property.house_number_or_name} {currentEmail.property.address}</h1>
                <h2>{(new Date(currentEmail.time_stamp)).toDateString()}</h2>
                <p>Your current offer on {currentEmail.property.house_number_or_name} {currentEmail.property.address} has been excepted by the currrent owner.</p>
                <p>Click the below link to review the property and finalize the deal.</p>
                <Link to={`/property/${currentEmail.property.id}`}><p>Marketplace/property/{currentEmail.property.house_number_or_name}{currentEmail.property.address}</p></Link>
              </div>
              :
              currentEmail.subject === 'Offer Rejected' ?
                <div className='email'>
                  <h1>{currentEmail.subject} - {currentEmail.property.house_number_or_name} {currentEmail.property.address}</h1>
                  <h2>{(new Date(currentEmail.time_stamp)).toDateString()}</h2>
                  <p>Your current offer on {currentEmail.property.house_number_or_name} {currentEmail.property.address} has been rejected by the current owner.</p>
                  <p>If you wih to make another offer, please click the below link to review the property.</p>
                  <Link to={`/property/${currentEmail.property.id}`}><p>Marketplace/property/{currentEmail.property.house_number_or_name}{currentEmail.property.address}</p></Link>
                </div>
                :
                currentEmail.subject === 'Property Sold' ?
                  <div className='email'>
                    <h1>{currentEmail.subject} - {currentEmail.property.house_number_or_name} {currentEmail.property.address}</h1>
                    <h2>{(new Date(currentEmail.time_stamp)).toDateString()}</h2>
                    <p>Congratulations! The buyer has finalised this deal.</p>
                    <p>You are no longer the owner of {currentEmail.property.house_number_or_name} {currentEmail.property.address}</p>
                  </div>
                  :
                  currentEmail.subject === 'Property Purchase' ?
                    <div className='email'>
                      <h1>{currentEmail.subject} - {currentEmail.property.house_number_or_name} {currentEmail.property.address}</h1>
                      <h2>{(new Date(currentEmail.time_stamp)).toDateString()}</h2>
                      <p>Congratulations! You have finalised this deal!</p>
                      <p>You are now the proud owner of {currentEmail.property.house_number_or_name} {currentEmail.property.address}</p>
                      <p>Don't forget to manage your new property at the below link</p>
                      <Link to={`/property/${currentEmail.property.id}`}><p>Marketplace/property/{currentEmail.property.house_number_or_name}{currentEmail.property.address}</p></Link>
                    </div>
                    :
                    currentEmail.subject === 'Mortgage Paid' ?
                      <div className='email'>
                        <h1>{currentEmail.subject} - {currentEmail.property.house_number_or_name} {currentEmail.property.address}</h1>
                        <h2>{(new Date(currentEmail.time_stamp)).toDateString()}</h2>
                        <p>Your Mortgage for {currentEmail.property.house_number_or_name} {currentEmail.property.address} has been paid off in full</p>
                      </div>
                      :
                      currentEmail.subject === 'Mortgage' ?
                        <div className='email'>
                          <h1>{currentEmail.subject} - {currentEmail.property.house_number_or_name} {currentEmail.property.address}</h1>
                          <h2>{(new Date(currentEmail.time_stamp)).toDateString()}</h2>
                          <p>You have taken a mortgage out for {currentEmail.property.house_number_or_name} {currentEmail.property.address}.</p>
                          <p>Please see the below link for details</p>
                          <Link to={`/property/${currentEmail.property.id}`}><p>Marketplace/property/{currentEmail.property.house_number_or_name}{currentEmail.property.address}</p></Link>
                        </div>
                        :
                        currentEmail.subject === 'Offer Received' ?
                          <div className='email'>
                            <h1>{currentEmail.subject} - {currentEmail.property.house_number_or_name} {currentEmail.property.address}</h1>
                            <h2>{(new Date(currentEmail.time_stamp)).toDateString()}</h2>
                            <p>You have received an offer for {currentEmail.property.house_number_or_name} {currentEmail.property.address}.</p>
                            <p>Please see the below link for details</p>
                            <Link to={`/property/${currentEmail.property.id}`}><p>Marketplace/property/{currentEmail.property.house_number_or_name}{currentEmail.property.address}</p></Link>
                          </div>
                          :
                          currentEmail.subject === 'Property Let' ?
                            <div className='email'>
                              <h1>{currentEmail.subject} - {currentEmail.property.house_number_or_name} {currentEmail.property.address}</h1>
                              <h2>{(new Date(currentEmail.time_stamp)).toDateString()}</h2>
                              <p>Your letting agent for {currentEmail.property.house_number_or_name} {currentEmail.property.address} has succesfully found tenants and they have now moved in.</p>
                              <p>Your first rent income will arrive next month in full.</p>
                              <p>Please see the below link for details</p>
                              <Link to={`/property/${currentEmail.property.id}`}><p>Marketplace/property/{currentEmail.property.house_number_or_name}{currentEmail.property.address}</p></Link>
                            </div>
                            :
                            <></>
          :
          <></>}



      </div >
    </section>
  )
}

export default Email