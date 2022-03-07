import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getPayload, getTokenFromLocalStorage } from '../helpers/authHelper'

const PropertyPage = () => {

  const navigate = useNavigate()

  const formatter = new Intl.NumberFormat('en-UK', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0
  })

  const { id } = useParams()

  const [property, setProperty] = useState({})
  const [level, setLevel] = useState({
    level: 1,
    imageArray: [],
    shortDescription: '',
    longDescriptionParagraphs: [],
    baseRate: 0,
    improvementCost: 0
  })
  const [popUpToShow, setPopUpToShow] = useState('none')
  const [popUpMessage, setPopUpMessage] = useState([])
  const [offerFormData, setOfferFormData] = useState({})
  const [mortgageRequest, setMortgageRequest] = useState({})
  const [offerInputError, setOfferInputError] = useState('')
  const [currentUser, setCurrentUser] = useState({})
  const [propertyOffers, setPropertyOffers] = useState([])
  const [userHasActiveOffer, setUserHasActiveOffer] = useState(false)
  const [usersActiveOffer, setUsersActiveOffer] = useState({})
  const [activePropertyOffers, setActivePropertyOffers] = useState([])


  useEffect(() => {
    const getProperty = async () => {
      try {
        const { data } = await axios.get(`/api/properties/${id}`)
        setProperty(data)
        if (data.level === 1) {
          const imagesArray = data.images_level1.split('&')
          const paragraphArray = data.long_description_level1.split('$%')
          setLevel({
            level: 1,
            imageArray: imagesArray,
            shortDescription: data.short_description_level1,
            longDescriptionParagraphs: paragraphArray,
            baseRate: data.base_rate_level1,
            improvementCost: data.level1_improvement_cost
          })
        } else if (data.level === 2) {
          const imagesArray = data.images_level2.split('&')
          const paragraphArray = data.long_description_level2.split('$%')
          setLevel({
            level: 2,
            imageArray: imagesArray,
            shortDescription: data.short_description_level2,
            longDescriptionParagraphs: paragraphArray,
            baseRate: data.base_rate_level2,
            improvementCost: data.level2_improvement_cost
          })
        } else if (data.level === 3) {
          const imagesArray = data.images_level3.split('&')
          const paragraphArray = data.long_description_level3.split('$%')
          setLevel({
            level: 3,
            imageArray: imagesArray,
            shortDescription: data.short_description_level3,
            longDescriptionParagraphs: paragraphArray,
            baseRate: data.base_rate_level3,
            improvementCost: 'no improvement'
          })
        }


      } catch (err) {
        console.log(err)
      }
    }
    getProperty()
  }, [])



  useEffect(() => {
    const getUser = async () => {
      try {
        const { data } = await axios.get(`/api/auth/${getPayload().sub}`)
        setCurrentUser(data)
        const offers = await axios.get(`/api/offers/propertyspecific/${id}`)
        setPropertyOffers(offers.data)
        setUserHasActiveOffer(offers.data.some(offer => offer.owner === data.id && offer.retracted === false))
        const activeOffers = []
        for (let i = 0; i < offers.data.length; i++) {
          if (offers.data[i].retracted === false) {
            activeOffers.push(offers.data[i])
          }
        }
        console.log(activeOffers)
        setActivePropertyOffers(activeOffers)
        setUsersActiveOffer(activeOffers.find(offer => offer.owner === data.id))
      } catch (err) {
        console.log(err)
      }
    }
    getUser()
  }, [property])

  const displayPopUp = (e) => {
    setPopUpToShow(e.target.value)
    if (e.target.value === 'offerForm') {
      setOfferFormData({
        property: id,
        owner: currentUser.id,
        mortgage: 0,
        offer_value: '',
        stamp_duty: 0,
        fees: 1000,
        accepted: false,
        retracted: false,
      })
      setMortgageRequest({
        property: id,
        owner: currentUser.id,
        LTV: 0,
        loan_value: 0,
        term_expiry: '',
        interest: 5,
      })
    }
  }

  const handleOfferFormInput = (e) => {
    if (e.target.name === 'offer_value') {
      let stampDuty = 0
      if (e.target.value < 125000) {
        stampDuty = Math.ceil(e.target.value * 0.03)
      } else if (e.target.value < 250000) {
        stampDuty = Math.ceil(e.target.value * 0.05)
      } else if (e.target.value < 925000) {
        stampDuty = Math.ceil(e.target.value * 0.08)
      } else if (e.target.value < 1500000) {
        stampDuty = Math.ceil(e.target.value * 0.13)
      } else if (e.target.value >= 1500000) {
        stampDuty = Math.ceil(e.target.value * 0.15)
      }
      const loanValue = Math.floor(e.target.value * (mortgageRequest.LTV / 100))
      //payment = offer=value-loanvalue
      setOfferFormData({ ...offerFormData, [e.target.name]: e.target.value, stamp_duty: stampDuty })
      setMortgageRequest({ ...mortgageRequest, loan_value: loanValue })
      if (e.target.value % 1 !== 0) {
        setOfferInputError('Input must be a whole number')
      } else {
        setOfferInputError('')
      }
    } else if (e.target.name === 'LTV') {
      const loanValue = Math.floor(offerFormData.offer_value * (e.target.value / 100))
      let fee = 0
      if (e.target.value === '0') {
        fee = 0
      } else if (e.target.value === '75') {
        console.log('here')
        if (mortgageRequest.interest === '3') {
          fee = 2000
        } else if (mortgageRequest.interest === '4') {
          fee = 1500
        } else if (mortgageRequest.interest === '5') {
          fee = 1000
        }
      }
      //payment = offer=value-loanvalue
      setMortgageRequest({ ...mortgageRequest, [e.target.name]: e.target.value, loan_value: loanValue })
      setOfferFormData({ ...offerFormData, fees: fee + 1000 })
    } else if (e.target.name === 'interest') {
      let fee = 0
      if (e.target.value === '3') {
        fee = 2000
      } else if (e.target.value === '4') {
        fee = 1500
      } else if (e.target.value === '5') {
        fee = 1000
      }
      setOfferFormData({ ...offerFormData, fees: fee + 1000 })
      setMortgageRequest({ ...mortgageRequest, [e.target.name]: e.target.value })
    }
  }

  const handleOfferApplication = () => {
    if (offerFormData.offer_value === '') {
      setOfferInputError('You must input a value before you submit an offer')
    } else if (currentUser.capital + mortgageRequest.loan_value - offerFormData.offer_value - offerFormData.stamp_duty - offerFormData.fees < 0) {
      if (mortgageRequest.LTV === '75') {
        setPopUpMessage([
          'We regret to inform you that your mortgage application has been rejected.',
          'You must have sufficient funds to pay your deposit, stamp duty and additonal fees.',
          'regretfully, on this basis, we can not presently offer you a mortgage at this value.'
        ])
      } else if (mortgageRequest.LTV === '0') { }
      setPopUpMessage([
        'You must have sufficient funds to pay your deposit, stamp duty and legal fees.'
      ])
      setPopUpToShow('mortgageReject')
    } else if (level.baseRate === 0 && mortgageRequest.LTV === '75') {
      setPopUpMessage([
        'We regret to inform you that your mortgage application has been rejected.',
        "BTL mortgages are subject to the property's habitability and this property is not presently habitable. A mortgage will no be offered for this property in it's current state"
      ])
      setPopUpToShow('mortgageReject')
    } else if (level.baseRate < Math.ceil(mortgageRequest.loan_value * ((mortgageRequest.interest / 100) / 12)) && mortgageRequest.LTV === '75') {
      setPopUpMessage([
        'We regret to inform you that your mortgage application has been rejected.',
        'After evaluating the potential rental income of this property, it is not viable as a sound investment.'
      ])
      setPopUpToShow('mortgageReject')
    } else {
      const mortgageExpiry = new Date()
      mortgageExpiry.setDate(mortgageExpiry.getDate() + 30) //change this once I have coded the virtual calendar
      console.log(mortgageExpiry)
      const postMortgageAndOffer = async () => {
        try {
          const { data } = await axios.post('/api/mortgages', { ...mortgageRequest, term_expiry: mortgageExpiry }, {
            headers: {
              Authorization: `Bearer ${getTokenFromLocalStorage()}`
            }
          })

          await axios.post('/api/offers', { ...offerFormData, mortgage: data.id }, {
            headers: {
              Authorization: `Bearer ${getTokenFromLocalStorage()}`
            }
          })
          console.log(data)
        } catch (err) {
          console.log(err)
        }
      }
      postMortgageAndOffer()
      setPopUpToShow('offerMade')
    }
  }

  const refeshPage = () => {
    window.location.reload(false);
  }

  const retractOffer = async () => {
    await axios.put(`/api/offers/${usersActiveOffer.id}`, { ...usersActiveOffer, retracted: true, mortgage: usersActiveOffer.mortgage.id }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
    window.location.reload(false);
  }

  const propertyPurchase = async () => {
    await axios.put(`/api/properties/${property.id}`, { ...property, owner: currentUser.id, for_sale: false }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
    window.location.reload(false);
  }


  return (
    property.id ?
      property.owner === getPayload().sub ?

        <section className='property_page'> {/*************OWN PROPERTY*/}
          <h1>owned {property.address}</h1>
        </section>


        :
        property.for_sale === true ?


          <section className='property_page'> {/*************FOR SALE POST*/}
            {level.imageArray.map(imageURL =>
              <img key={imageURL} src={imageURL} alt={`${property.address} ${level.imageArray.indexOf(imageURL) + 1}`} />
            )}
            <h3>{level.shortDescription}</h3>
            <h4>{property.address}</h4>
            <h1>{formatter.format(property.asking_price)}</h1>
            <button>FAVOURITE</button>
            {level.longDescriptionParagraphs.map((paragraph, index) =>
              <p key={index}>{paragraph}</p>
            )}
            {userHasActiveOffer ?
              usersActiveOffer.accepted ?
                <>
                  <h4>YOUR OFFER HAS BEEN ACCEPTED</h4>
                  <button value={'confirmPurchase'} onClick={displayPopUp}>CONFIRM PURCHASE</button>
                  <button value={'retractOffer'} onClick={displayPopUp}>RETRACT OFFER</button>
                </>
                :
                <button value={'retractOffer'} onClick={displayPopUp}>RETRACT OFFER</button>
              :
              <button value={'offerForm'} onClick={displayPopUp}>MAKE AN OFFER</button>
            }



            {popUpToShow === 'offerForm' ?
              <div className='pop_up'>
                <h4>OFFER FORM</h4>
                <label for='offer_value'>Offer Value (£)</label>
                <input type='number' min='1' step='1' name='offer_value' onChange={handleOfferFormInput} />
                <p>{offerInputError}</p>
                <fieldset onChange={handleOfferFormInput} default='75'>
                  <label for='75'>Mortgage (25% deposit)</label>
                  <input type='radio' value='75' name='LTV' />
                  <fieldset onChange={handleOfferFormInput} disabled={mortgageRequest.LTV === '0' ? true : false}>
                    <div>
                      <label for='3'>Mortgage Broker 1 (£2,000 Fee, 3% Interest)</label>
                      <input type='radio' value='3' name='interest' />
                    </div>
                    <div>
                      <label for='4'>Mortgage Broker 2 (£1,500 Fee, 4% Interest)</label>
                      <input type='radio' value='4' name='interest' />
                    </div>
                    <div>
                      <label for='5'>Mortgage Broker 3 (£1,000 Fee, 5% Interest)</label>
                      <input type='radio' value='5' name='interest' />
                    </div>
                  </fieldset>
                  <label for='0'>Full Payment</label>
                  <input type='radio' value='0' name='LTV' />
                </fieldset>
                <hr />
                <h5>-BREAKDOWN-</h5>
                <ul>
                  <li>Payment</li>
                  <li>Stamp Duty</li>
                  <li>Fees</li>
                  <li>TOTAL</li>
                </ul>
                <ul>
                  <li>{formatter.format(offerFormData.offer_value - mortgageRequest.loan_value)}</li>
                  <li>{formatter.format(offerFormData.stamp_duty)}</li>
                  <li>{formatter.format(offerFormData.fees)}</li>
                  <li>{formatter.format(offerFormData.offer_value - mortgageRequest.loan_value + offerFormData.stamp_duty + offerFormData.fees)}</li>
                </ul>
                <hr />
                <ul>
                  <li>Monthly Payments</li>
                  <li>Capital</li>
                </ul>
                <ul>
                  <li>{formatter.format(Math.ceil(mortgageRequest.loan_value * ((mortgageRequest.interest / 100) / 12)))}</li>
                  <li>{formatter.format(currentUser.capital + mortgageRequest.loan_value - offerFormData.offer_value - offerFormData.stamp_duty - offerFormData.fees)}</li>
                </ul>
                <button onClick={handleOfferApplication}>SUBMIT OFFER</button>
                <button value={'none'} onClick={displayPopUp}>CANCEL</button>
              </div>
              :
              popUpToShow === 'mortgageReject' ?
                <div className='pop_up'>
                  <h4>APPLICATION REJECTED</h4>
                  {popUpMessage.map((paragraph, index) =>
                    <p key={index}>{paragraph}</p>
                  )}
                  <button value={'offerForm'} onClick={displayPopUp}>AMEND OFFER</button>
                  <button value={'none'} onClick={displayPopUp}>CANCEL</button>
                </div>
                :
                popUpToShow === 'offerMade' ?
                  <div className='pop_up'>
                    <h4>OFFER SENT</h4>
                    <p>Congratulations!!</p>
                    <p>Your purchase offer has been submitted</p>
                    <p>Your offer has been sent to the property owner who will review.</p>
                    <p>You will be notified by email if your offer has been accepted or rejected.</p>
                    <p>please check your emails for comfirmation of the offer being sent.</p>
                    <button onClick={refeshPage}>OK</button>
                  </div>
                  :
                  popUpToShow === 'retractOffer' ?
                    <div className='pop_up'>
                      <h4>RETRACT OFFER</h4>
                      <p>Property- {property.address}</p>
                      <p>Value- {formatter.format(usersActiveOffer.offer_value)}</p>
                      <p>Offer made on- {usersActiveOffer.time_stamp}</p>
                      <button onClick={retractOffer}>CONFIRM</button>
                      <button value={'none'} onClick={displayPopUp}>CANCEL</button>
                    </div>
                    :
                    popUpToShow === 'confirmPurchase' ?
                      <div className='pop_up'>
                        <h4>CONFIRM PURCHASE</h4>
                        <p>Property- {property.address}</p>
                        <p>Value- {formatter.format(usersActiveOffer.offer_value)}</p>
                        <p>Offer Made On- {usersActiveOffer.time_stamp}</p>
                        <p>mortgage details</p>
                        <p>Your Capital- {formatter.format(currentUser.capital + usersActiveOffer.mortgage.loan_value - usersActiveOffer.offer_value - usersActiveOffer.stamp_duty - usersActiveOffer.fees)}</p>
                        {currentUser.capital + usersActiveOffer.mortgage.loan_value - usersActiveOffer.offer_value - usersActiveOffer.stamp_duty - usersActiveOffer.fees >= 0 ?
                          <>
                            <button onClick={propertyPurchase}>CONFIRM</button>
                            <button value={'none'} onClick={displayPopUp}>CANCEL</button>
                          </>
                          :
                          <>
                            <p>You have insufficient funds for this transaction</p>
                            <button value={'none'} onClick={displayPopUp}>BACK</button>
                          </>
                        }
                      </div>
                      : <></>
            }

          </section>


          :


          <section className='property_page'> {/*************NOT OWNED/NOT FOR SALE*/}
            <p>THIS PROPERTY IS NOT CURRENTLY ON THE MARKET</p>
          </section>


      :
      <p>loading...</p>
  )
}

export default PropertyPage