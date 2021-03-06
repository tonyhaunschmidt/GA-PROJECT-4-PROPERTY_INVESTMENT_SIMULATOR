import React, { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getPayload, getTokenFromLocalStorage, userIsAuthenticated } from '../helpers/authHelper'
import ReactMapGl, { Marker } from 'react-map-gl'

import Nav from '../Nav'

import Carousel from 'react-bootstrap/Carousel'

const PropertyPage = () => {

  const navigate = useNavigate()

  !userIsAuthenticated() && navigate('/')

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
  const [propertyMortgages, setPropertyMortgages] = useState([])
  const [ownersActiveMortgage, setOwnersActiveMortgage] = useState({})
  const [currentTermPropertyTransactions, setCurrentTermPropertyTransactions] = useState([])
  const [transactionStats, setTransactionStats] = useState({
    totalInvested: 0,
    totalReturned: 0,
  })
  const [lastValuation, setLastValuation] = useState(0)
  const [workplaceToDisplay, setWorkplaceToDisplay] = useState('manageLetting')
  const [askingPrice, setAskingPrice] = useState('')
  const [offerToAccept, setOfferToAccept] = useState({})
  const [offerToReject, setOfferToReject] = useState({})
  const [currentLetAgent, setCurrentLetAgent] = useState({ grade: 'none' })
  const [selectedLetAgent, setSelectedLetAgent] = useState({})
  const [newValuation, setnewValuation] = useState(0)
  const [savedProperty, setSavedProperty] = useState(false)
  const [viewState, setViewState] = useState({
    latitude: 55.3781,
    longitude: -3.4360,
    zoom: 4,
  })


  useEffect(() => {
    const getProperty = async () => {
      try {
        const { data } = await axios.get(`/api/properties/${id}/`)
        setProperty(data)
        setViewState({
          longitude: data.lon,
          latitude: data.lat,
          zoom: 15,
        })
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
        const { data } = await axios.get(`/api/auth/${getPayload().sub}/`)
        setCurrentUser(data)
        const offers = await axios.get(`/api/offers/propertyspecific/${id}/`)
        setPropertyOffers(offers.data)
        setUserHasActiveOffer(offers.data.some(offer => offer.owner === data.id && offer.retracted === false))
        const activeOffers = []
        for (let i = 0; i < offers.data.length; i++) {
          if (offers.data[i].retracted === false) {
            activeOffers.push(offers.data[i])
          }
        }
        setSavedProperty(data.saved_properties.some(property => property == id))
        setActivePropertyOffers(activeOffers)
        setUsersActiveOffer(activeOffers.find(offer => offer.owner === data.id))
        const mortgages = await axios.get(`/api/mortgages/propertyspecific/${id}/`)
        setPropertyMortgages(mortgages.data)
        setOwnersActiveMortgage(mortgages.data.find(mortgage => mortgage.owner === property.owner && mortgage.term_expiry !== "1992-10-13T16:00:00Z"))
        const transactions = await axios.get(`/api/transactions/propertyspecific/${id}/`)
        setCurrentTermPropertyTransactions(transactions.data.filter(transaction => transaction.property_ownership_term === property.ownership_term))
        const lettings = await axios.get(`/api/lettings/propertyspecific/${id}/`)
        lettings.data.some(letting => letting.current === true) && setCurrentLetAgent(lettings.data.find(letting => letting.current === true))
        console.log(property.lat)

      } catch (err) {
        console.log(err)
      }
    }
    getUser()
  }, [property])

  useEffect(() => {
    const getTransactionStats = () => {
      let totalInvested = 0
      let totalReturned = 0
      for (let i = 0; i < currentTermPropertyTransactions.length; i++) {
        if (currentTermPropertyTransactions[i].type === 'mortgage') {
          totalInvested -= currentTermPropertyTransactions[i].amount
        } else if (currentTermPropertyTransactions[i].type === 'paid_mortgage') {
          totalInvested += currentTermPropertyTransactions[i].amount
        } else if (currentTermPropertyTransactions[i].type === 'property_purchase') {
          totalInvested += currentTermPropertyTransactions[i].amount
          totalInvested += currentTermPropertyTransactions[i].stamp_duty
          totalInvested += currentTermPropertyTransactions[i].fees
          setLastValuation(currentTermPropertyTransactions[i].amount)
        } else if (currentTermPropertyTransactions[i].type === 'income') {
          totalReturned += currentTermPropertyTransactions[i].amount
        } else if (currentTermPropertyTransactions[i].type === 'valuation') {
          setLastValuation(currentTermPropertyTransactions[i].amount)
        } else if (currentTermPropertyTransactions[i].type === 'improvement') {
          totalInvested += currentTermPropertyTransactions[i].amount
        } else {
          totalInvested += currentTermPropertyTransactions[i].amount
        }
      }
      setTransactionStats({ totalInvested: totalInvested, totalReturned: totalReturned })
    }
    getTransactionStats()
  }, [currentTermPropertyTransactions])

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
        interest: 10,
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
        "BTL mortgages are subject to the property's habitability and this property is not presently habitable. A mortgage will not be offered for this property in it's current state."
      ])
      setPopUpToShow('mortgageReject')
    } else if (level.baseRate < Math.ceil(mortgageRequest.loan_value * ((mortgageRequest.interest / 100) / 12)) && mortgageRequest.LTV === '75') {
      setPopUpMessage([
        'We regret to inform you that your mortgage application has been rejected.',
        'After evaluating the potential rental income of this property, it is not viable as a sound investment.'
      ])
      setPopUpToShow('mortgageReject')
    } else if (mortgageRequest.loan_value < 15000 && mortgageRequest.LTV === '75') {
      setPopUpMessage([
        'We regret to inform you that your mortgage application has been rejected.',
        'The requested loan value is below our minimum loan allowance.'
      ])
      setPopUpToShow('mortgageReject')
    } else {
      const postMortgageAndOffer = async () => {
        try {
          const { data } = await axios.post('/api/mortgages/', { ...mortgageRequest, term_expiry: "1992-10-13T16:00:00" }, {
            headers: {
              Authorization: `Bearer ${getTokenFromLocalStorage()}`
            }
          })

          await axios.post('/api/offers/', { ...offerFormData, mortgage: data.id }, {
            headers: {
              Authorization: `Bearer ${getTokenFromLocalStorage()}`
            }
          })
        } catch (err) {
          console.log(err)
        }
      }
      postMortgageAndOffer()
      setPopUpToShow('offerMade')
    }
    const sendemail = async () => {
      await axios.post('/api/emails/', {
        property: property.id,
        recipient: property.owner,
        subject: 'Offer Received',
        read: false,
      }, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`
        }
      })
    }
    sendemail()
  }


  const refeshPage = () => {
    window.location.reload(false);
  }

  const retractOffer = async () => {
    await axios.put(`/api/offers/${usersActiveOffer.id}/`, { ...usersActiveOffer, retracted: true, mortgage: usersActiveOffer.mortgage.id }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
    window.location.reload(false);
  }

  const propertyPurchase = async () => {
    const purchaseWithMortge = usersActiveOffer.mortgage.LTV === 75 ? true : false

    //update property owner and mortgage stats
    await axios.put(`/api/properties/${property.id}/`, { ...property, owner: currentUser.id, for_sale: false, mortgaged: purchaseWithMortge, ownership_term: property.ownership_term + 1 }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
    //update user capital
    const NewOwnerCapital = currentUser.capital + usersActiveOffer.mortgage.loan_value - usersActiveOffer.offer_value - usersActiveOffer.stamp_duty - usersActiveOffer.fees
    await axios.put(`/api/auth/${currentUser.id}/`, { ...currentUser, capital: NewOwnerCapital }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
    //start mortgage
    let mortgageExpiry
    if (usersActiveOffer.mortgage.LTV === 75) {
      mortgageExpiry = new Date()
      mortgageExpiry.setDate(mortgageExpiry.getDate() + 30) //change this once I have coded the virtual calendar
    } else {
      mortgageExpiry = "1992-10-13T16:00:00"
    }

    await axios.put(`/api/mortgages/${usersActiveOffer.mortgage.id}/`, { ...usersActiveOffer.mortgage, term_expiry: mortgageExpiry }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })


    if (usersActiveOffer.mortgage.LTV === 75) {
      await axios.post('/api/transactions/', {
        type: 'mortgage',
        property: property.id,
        owner: currentUser.id,
        amount: usersActiveOffer.mortgage.loan_value,
        stamp_duty: 0,
        fees: 0,
        property_ownership_term: property.ownership_term + 1
      }, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`
        }
      })
      await axios.post('/api/emails/', {
        property: property.id,
        recipient: currentUser.id,
        subject: 'Mortgage',
        read: false,
      }, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`
        }
      })
    }


    const currentOwner = await axios.get(`/api/auth/${property.owner}/`)
    let ownersCapital = currentOwner.data.capital + usersActiveOffer.offer_value
    //cancel current owners mortgage
    if (ownersActiveMortgage) {
      console.log(ownersActiveMortgage)
      await axios.put(`/api/mortgages/${ownersActiveMortgage.id}/`, { ...ownersActiveMortgage, term_expiry: "1992-10-13T16:00:00" }, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`
        }
      })
      ownersCapital = ownersCapital - ownersActiveMortgage.loan_value


      await axios.post('/api/transactions/', {
        type: 'paid_mortgage',
        property: property.id,
        owner: property.owner,
        amount: ownersActiveMortgage.loan_value,
        stamp_duty: 0,
        fees: 0,
        property_ownership_term: property.ownership_term
      }, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`
        }
      })

      await axios.post('/api/emails/', {
        property: property.id,
        recipient: property.owner,
        subject: 'Mortgage Paid',
        read: false,
      }, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`
        }
      })
    }


    //cancel letting agent
    if (currentLetAgent.id) {
      await axios.put(`/api/lettings/${currentLetAgent.id}/`, { ...currentLetAgent, current: false }, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`
        }
      })
    }


    //update current owner capital ->will need to pay off bank too (mortgage)
    await axios.put(`/api/auth/${property.owner}/`, { ...currentOwner.data, capital: ownersCapital }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })

    await axios.post('/api/transactions/', {
      type: 'sold_property',
      property: property.id,
      owner: property.owner,
      amount: usersActiveOffer.offer_value,
      stamp_duty: 0,
      fees: 0,
      property_ownership_term: property.ownership_term
    }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })

    //retract all offers
    for (let i = 0; i < activePropertyOffers.length; i++) {
      await axios.put(`/api/offers/${activePropertyOffers[i].id}/`, { ...activePropertyOffers[i], retracted: true, mortgage: activePropertyOffers[i].mortgage.id }, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`
        }
      })
    }

    //post transaction to database
    await axios.post('/api/transactions/', {
      type: 'property_purchase',
      property: property.id,
      owner: currentUser.id,
      amount: usersActiveOffer.offer_value,
      stamp_duty: usersActiveOffer.stamp_duty,
      fees: usersActiveOffer.fees,
      property_ownership_term: property.ownership_term + 1
    }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })

    //Send Emails
    await axios.post('/api/emails/', {
      property: property.id,
      recipient: currentUser.id,
      subject: 'Property Purchase',
      read: false,
    }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })

    await axios.post('/api/emails/', {
      property: property.id,
      recipient: property.owner,
      subject: 'Property Sold',
      read: false,
    }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })

    window.location.reload(false);
  }

  const displayWorkplace = (e) => {
    setWorkplaceToDisplay(e.target.value)
  }

  const updateAskingPrice = (e) => {
    setAskingPrice(e.target.value)
  }

  const putOnMarket = async () => {
    await axios.put(`/api/properties/${property.id}/`, { ...property, for_sale: true, asking_price: askingPrice }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
    window.location.reload(false);
  }

  const takeOffMarket = async () => {
    await axios.put(`/api/properties/${property.id}/`, { ...property, for_sale: false }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
    //retract all offers
    for (let i = 0; i < activePropertyOffers.length; i++) {
      await axios.put(`/api/offers/${activePropertyOffers[i].id}/`, { ...activePropertyOffers[i], retracted: true, mortgage: activePropertyOffers[i].mortgage.id }, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`
        }
      })
    }
    window.location.reload(false);
  }

  const rejectOfferCheck = (e) => {
    setOfferToReject(activePropertyOffers.find(offer => offer.id == e.target.value))
    setPopUpToShow('rejectOffer')
  }
  const rejectOffer = async () => {
    await axios.put(`/api/offers/${offerToReject.id}`, { ...offerToReject, retracted: true, mortgage: offerToReject.mortgage.id }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
    setActivePropertyOffers(activePropertyOffers.filter(offer => offer.id != offerToReject.id))
    setPopUpToShow('none')
    await axios.post('/api/emails/', {
      property: property.id,
      recipient: offerToReject.owner,
      subject: 'Offer Rejected',
      read: false,
    }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
  }


  const acceptOfferCheck = (e) => {
    setOfferToAccept(activePropertyOffers.find(offer => offer.id == e.target.value))
    setPopUpToShow('acceptOffer')
  }

  const acceptOffer = async () => {
    const offersOnDisplay = [...activePropertyOffers]
    const indexOfOfferToAccept = offersOnDisplay.indexOf(offerToAccept)
    offersOnDisplay[indexOfOfferToAccept] = { ...offerToAccept, accepted: true }
    setActivePropertyOffers(offersOnDisplay)
    await axios.put(`/api/offers/${offerToAccept.id}/`, { ...offerToAccept, accepted: true, mortgage: offerToAccept.mortgage.id }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
    setPopUpToShow('none')
    await axios.post('/api/emails/', {
      property: property.id,
      recipient: offerToAccept.owner,
      subject: 'Offer Accepted!',
      read: false,
    }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
  }

  const dontAcceptOfferCheck = (e) => {
    setOfferToAccept(activePropertyOffers.find(offer => offer.id == e.target.value))
    setPopUpToShow('dontAcceptOffer')
  }
  const dontAcceptOffer = async () => {
    const offersOnDisplay = [...activePropertyOffers]
    const indexOfOfferToAccept = offersOnDisplay.indexOf(offerToAccept)
    offersOnDisplay[indexOfOfferToAccept] = { ...offerToAccept, accepted: false }
    setActivePropertyOffers(offersOnDisplay)
    await axios.put(`/api/offers/${offerToAccept.id}/`, { ...offerToAccept, accepted: false, mortgage: offerToAccept.mortgage.id }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
    setPopUpToShow('none')
  }

  const handleLetSelect = (e) => {
    setSelectedLetAgent({
      property: property.id,
      owner: currentUser.id,
      current: true,
      grade: e.target.value,
      void: true,
      fixed_void: "1992-10-13T16:00:00"
    })
    setPopUpMessage('')
  }

  const handleLettingChange = async () => {
    let fixedVoid = "1992-10-13T16:00:00"
    if (currentLetAgent.fixed_void) {
      fixedVoid = currentLetAgent.fixed_void
      await axios.put(`/api/lettings/${currentLetAgent.id}/`, { ...currentLetAgent, current: false }, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`
        }
      })
    }
    if (selectedLetAgent.property) {
      await axios.post('/api/lettings/', { ...selectedLetAgent, fixed_void: fixedVoid }, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`
        }
      })
      window.location.reload(false);
    } else {
      setPopUpMessage('You must select a letting agent')
    }
  }

  const handlePayOffMortgage = async () => {
    if (currentUser.capital < ownersActiveMortgage.loan_value) {
      setPopUpMessage('You have insufficient funds to make this transaction')
    } else {
      await axios.put(`/api/mortgages/${ownersActiveMortgage.id}/`, { ...ownersActiveMortgage, term_expiry: "1992-10-13T16:00:00" }, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`
        }
      })
      await axios.put(`/api/auth/${currentUser.id}/`, { ...currentUser, capital: currentUser.capital - ownersActiveMortgage.loan_value }, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`
        }
      })
      await axios.post('/api/transactions/', {
        type: 'paid_mortgage',
        property: property.id,
        owner: currentUser.id,
        amount: ownersActiveMortgage.loan_value,
        stamp_duty: 0,
        fees: 0,
        property_ownership_term: property.ownership_term
      }, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`
        }
      })
      window.location.reload(false);
    }
  }

  const getValuation = async () => {
    if (currentUser.capital < 500) {
      setPopUpMessage('You must have sufficient funds to make this request')
    } else {
      const valuation = lastValuation + (((Math.floor(Math.random() * 20)) - 10) * 1000)
      await axios.put(`/api/auth/${currentUser.id}/`, { ...currentUser, capital: currentUser.capital - 500 }, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`
        }
      })
      await axios.post('/api/transactions/', {
        type: 'valuation',
        property: property.id,
        owner: currentUser.id,
        amount: valuation,
        stamp_duty: 0,
        fees: 0,
        property_ownership_term: property.ownership_term
      }, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`
        }
      })
      setnewValuation(valuation)
      setPopUpToShow('valuation')
    }
  }

  const handleSave = async () => {
    console.log(currentUser.saved_properties)
    const savedProps = [...currentUser.saved_properties, property.id]
    await axios.put(`/api/auth/${currentUser.id}/`, { ...currentUser, saved_properties: savedProps }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
    setSavedProperty(true)
  }

  const handleUnsave = async () => {
    const saved = [...currentUser.saved_properties]
    saved.splice(saved.indexOf(id), 1)
    console.log(saved)
    console.log({ ...currentUser, saved_properites: saved })
    await axios.put(`/api/auth/${currentUser.id}/`, { ...currentUser, saved_properties: saved }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
    setSavedProperty(false)
  }






  return (
    property.id ?
      property.owner === getPayload().sub ?
        <section className='property_page'> {/*************OWN PROPERTY*/}
          <Nav />
          <div className='property_page_section'>
            <Carousel interval={null}>
              {level.imageArray.map((imageURL, index) =>
                <Carousel.Item key={index}>
                  <img src={imageURL} alt={`${property.address} ${level.imageArray.indexOf(imageURL) + 1}`} />
                </Carousel.Item>
              )}
            </Carousel>
            <h2>{property.house_number_or_name} {property.address}</h2>
            <h5>TRANSACTION HISTORY</h5>
            <div className='transaction_container'>
              <small>[END]</small>
              {currentTermPropertyTransactions.reverse().map((transaction, index) =>
                transaction.type === 'mortgage' ?
                  <div className='ul_pairing' key={index}>
                    <ul>
                      <li>Mortgage Loan</li>
                      <li>Loan Amount</li>
                    </ul>
                    <ul>
                      <li>{(new Date(transaction.time_stamp)).toDateString()}</li>
                      <li>{formatter.format(transaction.amount)}</li>
                    </ul>
                  </div>
                  :
                  transaction.type === 'property_purchase' ?
                    <div className='ul_pairing' key={index}>
                      <ul>
                        <li>Property Purchase</li>
                        <li>Purchase</li>
                        <li>Stamp Duty</li>
                        <li>Fees</li>
                      </ul>
                      <ul>
                        <li>{(new Date(transaction.time_stamp)).toDateString()}</li>
                        <li>{formatter.format(0 - transaction.amount)}</li>
                        <li>{formatter.format(0 - transaction.stamp_duty)}</li>
                        <li>{formatter.format(0 - transaction.fees)}</li>
                      </ul>
                    </div>
                    :
                    transaction.type === 'paid_mortgage' ?
                      <div className='ul_pairing' key={index}>
                        <ul>
                          <li>Full Mortgage Payment</li>
                          <li>Payment</li>
                        </ul>
                        <ul>
                          <li>{(new Date(transaction.time_stamp)).toDateString()}</li>
                          <li>{formatter.format(0 - transaction.amount)}</li>
                        </ul>
                      </div>
                      :
                      transaction.type === 'income' ?
                        <div className='ul_pairing' key={index}>
                          <ul>
                            <li>Property Income</li>
                            <li>Payment</li>
                          </ul>
                          <ul>
                            <li>{(new Date(transaction.time_stamp)).toDateString()}</li>
                            <li>{formatter.format(transaction.amount)}</li>
                          </ul>
                        </div>
                        :
                        transaction.type === 'valuation' ?
                          <div className='ul_pairing' key={index}>
                            <ul>
                              <li>New Valuation</li>
                              <li>Valuation</li>
                            </ul>
                            <ul>
                              <li>{(new Date(transaction.time_stamp)).toDateString()}</li>
                              <li>{formatter.format(transaction.amount)}</li>
                            </ul>
                          </div>
                          :
                          transaction.type === 'improvement' ?
                            <div className='ul_pairing' key={index}>
                              <ul>
                                <li>Home Imporvement</li>
                                <li>Payment</li>
                              </ul>
                              <ul>
                                <li>{(new Date(transaction.time_stamp)).toDateString()}</li>
                                <li>{formatter.format(0 - transaction.amount)}</li>
                              </ul>
                            </div>
                            :
                            <div className='ul_pairing' key={index}>
                              <ul>
                                <li>{transaction.type}</li>
                                <li>Payment</li>
                              </ul>
                              <ul>
                                <li>{(new Date(transaction.time_stamp)).toDateString()}</li>
                                <li>{formatter.format(0 - transaction.amount)}</li>
                              </ul>
                            </div>
              )}
            </div>
            <hr />
            <div>
              <h5>MORTGAGE AND LETTING</h5>
              <h6>Mortgage</h6>
              {ownersActiveMortgage ?
                <div>

                  <div className='ul_pairing'>
                    <ul>
                      <li>Type</li>
                      <li>LTV</li>
                      <li>loan Value</li>
                      <li>Term</li>
                      <li>Remaining Term</li>
                      <li>Interest</li>
                      <li>Monthly Payments</li>
                    </ul>
                    <ul>
                      <li>Interest Only (Fixed Rate)</li>
                      <li>{ownersActiveMortgage.LTV}%</li>
                      <li>{formatter.format(ownersActiveMortgage.loan_value)}</li>
                      <li>25 Years</li>
                      <li>Remaining Term</li> {/*FORMAT AFTER VIRTUAL CALENDAR*/}
                      <li>{ownersActiveMortgage.interest}%</li>
                      <li>{formatter.format(Math.ceil(ownersActiveMortgage.loan_value * ((ownersActiveMortgage.interest / 100) / 12)))}</li>
                    </ul>
                  </div>
                </div>
                :
                <p>This property has no mortgage</p>}

              <div>
                <h6>Letting</h6>
                <div className='ul_pairing'>
                  <ul>
                    <li>Agent</li>
                    <li>Monthly Fee</li>
                    <li>Status</li>
                    <li>Monthly Income</li>
                  </ul>
                  {currentLetAgent.id ?
                    <ul>
                      {currentLetAgent.grade === 'A' ?
                        <li>Premium Gold Lets</li>
                        : currentLetAgent.grade === 'B' ?
                          <li>Middle Lettings</li>
                          : currentLetAgent.grade === 'C' &&
                          <li>Lettings 'R' us</li>
                      }
                      {currentLetAgent.void ?
                        <li>??0</li>
                        : currentLetAgent.grade === 'A' ?
                          <li>{formatter.format(Math.ceil(level.baseRate * 0.2))}</li>
                          : currentLetAgent.grade === 'B' ?
                            <li>{formatter.format(Math.ceil(level.baseRate * 0.15))}</li>
                            : currentLetAgent.grade === 'C' &&
                            <li>{formatter.format(Math.ceil(level.baseRate * 0.1))}</li>
                      }
                      <li>{currentLetAgent.void ? 'VOID' : 'LET'}</li>
                      {currentLetAgent.void ?
                        <li>??0</li>
                        :
                        <li>{formatter.format(level.baseRate)}</li>
                      }
                    </ul>
                    :
                    <ul>
                      <li>No Letting Agent</li>
                      <li>??0</li>
                      <li>VOID</li>
                      <li>??0</li>
                    </ul>
                  }
                </div>
              </div>

              <div>
                <h6>Current Month Breakdown</h6>
                <div className='ul_pairing'>
                  <ul>
                    <li>Rent Income</li>
                    <li>Mortgage Payment</li>
                    {currentLetAgent.void || currentLetAgent.grade === 'none' ? <li>Void Bills</li> : <></>}
                    <li>Letting Fee</li>
                    <li>TOTAL INCOME</li>
                  </ul>
                  <ul>
                    {currentLetAgent.void || currentLetAgent.grade === 'none' ?
                      <li>??0</li>
                      : currentLetAgent.grade === 'A' ?
                        <li>{formatter.format(level.baseRate)}</li>
                        : currentLetAgent.grade === 'B' ?
                          <li>{formatter.format(level.baseRate)}</li>
                          : currentLetAgent.grade === 'C' &&
                          <li>{formatter.format(level.baseRate)}</li>
                    }
                    <li>{ownersActiveMortgage ? formatter.format(0 - Math.ceil(ownersActiveMortgage.loan_value * ((ownersActiveMortgage.interest / 100) / 12))) : '??0'}</li>
                    {currentLetAgent.void || currentLetAgent.grade === 'none' ? <li>{formatter.format(0 - property.void_upkeep)}</li> : <></>}
                    {currentLetAgent.void || currentLetAgent.grade === 'none' ?
                      <li>??0</li>
                      : currentLetAgent.grade === 'A' ?
                        <li>{formatter.format(0 - Math.ceil(level.baseRate * 0.2))}</li>
                        : currentLetAgent.grade === 'B' ?
                          <li>{formatter.format(0 - Math.ceil(level.baseRate * 0.15))}</li>
                          : currentLetAgent.grade === 'C' &&
                          <li>{formatter.format(0 - Math.ceil(level.baseRate * 0.1))}</li>
                    }
                    {currentLetAgent.void || currentLetAgent.grade === 'none' ?
                      <li>{ownersActiveMortgage ?
                        formatter.format(0 - Math.ceil(ownersActiveMortgage.loan_value * ((ownersActiveMortgage.interest / 100) / 12)) - property.void_upkeep)
                        :
                        formatter.format(0 - property.void_upkeep)
                      }</li>
                      : currentLetAgent.grade === 'A' ?
                        <li>{ownersActiveMortgage ?
                          formatter.format(0 - Math.ceil(level.baseRate * 0.2) + level.baseRate - Math.ceil(ownersActiveMortgage.loan_value * ((ownersActiveMortgage.interest / 100) / 12)))
                          :
                          formatter.format(0 - Math.ceil(level.baseRate * 0.2) + level.baseRate)
                        }</li>
                        : currentLetAgent.grade === 'B' ?
                          <li>{ownersActiveMortgage ?
                            formatter.format(0 - Math.ceil(level.baseRate * 0.15) + level.baseRate - Math.ceil(ownersActiveMortgage.loan_value * ((ownersActiveMortgage.interest / 100) / 12)))
                            :
                            formatter.format(0 - Math.ceil(level.baseRate * 0.15) + level.baseRate)
                          }</li>
                          : currentLetAgent.grade === 'C' &&
                          <li>{ownersActiveMortgage ?
                            formatter.format(0 - Math.ceil(level.baseRate * 0.1) + level.baseRate - Math.ceil(ownersActiveMortgage.loan_value * ((ownersActiveMortgage.interest / 100) / 12)))
                            :
                            formatter.format(0 - Math.ceil(level.baseRate * 0.1) + level.baseRate)
                          }</li>
                    }
                  </ul>
                </div>
              </div>
            </div>
            <hr />
            <h5>PROPERTY OVERVIEW</h5>
            <div className='ul_pairing overview'>
              <ul>
                <li>Total Money Invested</li>
                <li>Borrowed Money</li>
                <li>Owned Equity</li>
                <li>Total Money Returned</li>
                <li>TOTAL PROFIT</li>
              </ul>
              <ul>
                <li>{formatter.format(transactionStats.totalInvested)}</li>
                <li>{ownersActiveMortgage ? formatter.format(0 - ownersActiveMortgage.loan_value) : '??0'}</li>
                <li>{ownersActiveMortgage ? formatter.format(lastValuation - ownersActiveMortgage.loan_value) : formatter.format(lastValuation)}</li>
                <li>{formatter.format(transactionStats.totalReturned)}</li>
                <li>{ownersActiveMortgage ? formatter.format(lastValuation - ownersActiveMortgage.loan_value - transactionStats.totalInvested + transactionStats.totalReturned) : formatter.format(lastValuation - transactionStats.totalInvested + transactionStats.totalReturned)}</li>
              </ul>
            </div>
            <hr />
            {property.for_sale ?
              <div>
                <h4>FOR SALE</h4>
                <p>Asking Price - {formatter.format(property.asking_price)}</p>
                <h5>OFFERS</h5>
                {activePropertyOffers.length ?
                  activePropertyOffers.map(offer =>
                    <div className='offer_card' key={offer.id}>
                      <p>{formatter.format(offer.offer_value)}</p>
                      <div>
                        {offer.accepted === true ?
                          <button className='orange_button_style' onClick={dontAcceptOfferCheck} value={offer.id}>DON'T ACCEPT OFFER</button>
                          :
                          <button className='green_button_style' onClick={acceptOfferCheck} value={offer.id}>ACCEPT OFFER</button>
                        }
                        <button className='main_button_style' onClick={rejectOfferCheck} value={offer.id}>REJECT OFFER</button>
                      </div>
                    </div>
                  )
                  :
                  <p>You currently do not have any offers for this property</p>
                }
                <button className='main_button_style' value={'takeOffMarket'} onClick={displayPopUp}>TAKE OFF MARKET</button>
              </div>
              :
              <div className='workplace'>
                <div className='workplace_button_container'>
                  <button className='main_button_style' value={'manageLetting'} onClick={displayWorkplace}>MANAGE LETTING</button>
                  <button className='main_button_style' value={'improvements'} onClick={displayWorkplace}>IMPROVEMENTS</button>
                  <button className='main_button_style' value={'getValuation'} onClick={displayWorkplace}>GET VALUATION (??500)</button> {/*ADD CONDITIONS FOR IF A VALUATION HAS ALREADY BEEN MADE IN THE LAST MONTH*/}
                  <button className='main_button_style' value={'remortgage'} onClick={displayWorkplace}>REMORTGAGE</button> {/*ADD CONDITION FOR IF A VALUATION HAS BEEN MADE IN THE LAST MONTH*/}
                  {ownersActiveMortgage ?
                    <button className='main_button_style' value={'payMortgage'} onClick={displayWorkplace}>PAY OFF MORTGAGE</button>
                    :
                    <button className='disabled_button_style'>PAY OFF MORTGAGE</button>
                  }
                  <button className='main_button_style' value={'putOnMarket'} onClick={displayWorkplace}>PUT ON MARKET</button>
                </div>
                <div className='workplace_box'>
                  {workplaceToDisplay === 'manageLetting' ?
                    <div>
                      <h5>-- MANAGE LETTING --</h5>
                      {currentLetAgent.grade === 'none' ?
                        <p>Current Agent: None</p>
                        : currentLetAgent.grade === 'A' ?
                          <p>Current Agent: Premium Gold Lets</p>
                          : currentLetAgent.grade === 'B' ?
                            <p>Current Agent: Middle Lettings</p>
                            : currentLetAgent.grade === 'C' &&
                            <p>Current Agent: Lettings 'R' us</p>
                      }
                      <select defaultValue={'default'} onChange={handleLetSelect}>
                        <option value='default' disabled>-Select-</option>
                        <option value='C' disabled={currentLetAgent.grade === 'C'}>Lettings 'R' Us (10% rent fee)</option>
                        <option value='B' disabled={currentLetAgent.grade === 'B'}>Middle Lettings (15% rent fee)</option>
                        <option value='A' disabled={currentLetAgent.grade === 'A'}>Premium Gold Lets (20% rent fee)</option>
                      </select>
                      <button className='main_button_style' onClick={handleLettingChange}>CHANGE LETTING</button>
                      <p>{popUpMessage}</p>
                      <p>Changing your letting agent will initiate a new void period</p>
                    </div>
                    :
                    workplaceToDisplay === 'improvements' ?
                      <div>
                        <h5>-- HOME IMPROVEMENTS --</h5>

                      </div>
                      :
                      workplaceToDisplay === 'getValuation' ?
                        1 + 1 === 5 ?
                          <div> {/*add condition to show 'your last valuation was ***. you can only revaluate your house once a month*/}
                            <h4>VALUATION</h4>
                            <p>Your last valuation was {formatter.format(lastValuation)}</p>
                            <p>You can only valuate your property once per month</p>
                          </div>
                          :
                          <div>
                            <h5>-- VALUATION --</h5>
                            <p>Cost to valuate your property- ??500</p>
                            <button className='main_button_style' onClick={getValuation}>GET VALUATION</button>
                            <p>{popUpMessage}</p>
                          </div>
                        :
                        workplaceToDisplay === 'remortgage' ?
                          <div>
                            <h5>-- REMORTGAGE --</h5>

                          </div>
                          :
                          workplaceToDisplay === 'payMortgage' ?
                            <div>
                              <h5>-- PAY OFF MORTGAGE --</h5>
                              <p>Pay off full mortgage loan value?</p>
                              <h5>{formatter.format(ownersActiveMortgage.loan_value)}</h5>
                              <button className='main_button_style' onClick={handlePayOffMortgage}>PAY OFF MORTGAGE</button>
                              <p>{popUpMessage}</p>

                            </div>
                            :
                            workplaceToDisplay === 'putOnMarket' ?
                              <div>
                                <h5>-- PUT ON MARKET --</h5>
                                <div className='money_input'>
                                  <label for='offer_value'>??</label>
                                  <input type='number' min='1' step='1' name='offer_value' placeholder='Asking Price' onChange={updateAskingPrice} />
                                </div>
                                <button className='main_button_style' onClick={putOnMarket}>CONFIRM</ button>
                                <p>Once your property is on the market you can no longer manage lettings, make improvements or remortgage</p>
                              </div>
                              :
                              <></>}
                </div>
              </div>
            }
            {popUpToShow === 'acceptOffer' ?
              <div className='pop_up'>
                <div className='text_popup'>
                  <h4>-- ACCEPT OFFER --</h4>
                  <div className='ul_pairing'>
                    <ul>
                      <li>Offer Value</li>
                      <li>Mortgage To Pay Off</li>
                      <li>Net Income</li>
                    </ul>
                    <ul>
                      <li>{formatter.format(offerToAccept.offer_value)}</li>
                      <li>{ownersActiveMortgage ? formatter.format(0 - ownersActiveMortgage.loan_value) : 'No mortgage'}</li>
                      <li>{ownersActiveMortgage ? formatter.format(offerToAccept.offer_value - ownersActiveMortgage.loan_value) : formatter.format(offerToAccept.offer_value)}</li>
                    </ul>
                  </div>

                  {!ownersActiveMortgage ?
                    <></>
                    :
                    offerToAccept.offer_value - ownersActiveMortgage.loan_value < 0 &&
                    <p>Accepting offer at negative equity. Please ensure you have sufficeint funds before accepting this offer.</p>
                  }
                  <p>The purchase will be finalised when the buyer confirms purchase</p>
                  <button className='green_button_style' onClick={acceptOffer}>ACCEPT OFFER</button>
                  <button className='main_button_style' value={'none'} onClick={displayPopUp}>CANCEL</button>
                </div>
              </div>
              :
              popUpToShow === 'dontAcceptOffer' ?
                <div className='pop_up'>
                  <div className='text_popup'>
                    <h4>-- DON'T ACCEPT OFFER --</h4>
                    <div className='ul_pairing'>
                      <ul>
                        <li>Offer Value</li>
                        <li>Mortgage To Pay Off</li>
                        <li>Net Income</li>
                      </ul>
                      <ul>
                        <li>{formatter.format(offerToAccept.offer_value)}</li>
                        <li>{ownersActiveMortgage ? formatter.format(0 - ownersActiveMortgage.loan_value) : 'No mortgage'}</li>
                        <li>{ownersActiveMortgage ? formatter.format(offerToAccept.offer_value - ownersActiveMortgage.loan_value) : formatter.format(offerToAccept.offer_value)}</li>
                      </ul>
                    </div>
                    <p>Are you sure you want to retract your acceptance of this offer?</p>
                    <button className='orange_button_style' onClick={dontAcceptOffer}>DON'T ACCEPT OFFER</button>
                    <button className='main_button_style' value={'none'} onClick={displayPopUp}>CANCEL</button>
                  </div>
                </div>
                :
                popUpToShow === 'rejectOffer' ?
                  <div className='pop_up'>
                    <div className='text_popup'>
                      <h4>-- REJECT OFFER --</h4>
                      <div className='ul_pairing'>
                        <ul>
                          <li>Offer Value</li>
                          <li>Mortgage To Pay Off</li>
                          <li>Net Income</li>
                        </ul>
                        <ul>
                          <li>{formatter.format(offerToAccept.offer_value)}</li>
                          <li>{ownersActiveMortgage ? formatter.format(0 - ownersActiveMortgage.loan_value) : 'No mortgage'}</li>
                          <li>{ownersActiveMortgage ? formatter.format(offerToAccept.offer_value - ownersActiveMortgage.loan_value) : formatter.format(offerToAccept.offer_value)}</li>
                        </ul>
                      </div>
                      <p>Are you sure you want to reject this offer?</p>
                      <button className='main_button_style' onClick={rejectOffer}>REJECT OFFER</button>
                      <button className='main_button_style' value={'none'} onClick={displayPopUp}>CANCEL</button>
                    </div>
                  </div>
                  :
                  popUpToShow === 'takeOffMarket' ?
                    <div className='pop_up'>
                      <div className='text_popup'>
                        <h4>-- TAKE OFF MARKET --</h4>
                        <p>Are you sure?</p>
                        <p>Taking a property off the market will result in all current offers being retracted.</p>
                        <button className='main_button_style' onClick={takeOffMarket}>TAKE OFF MARKET</button>
                        <button className='main_button_style' value={'none'} onClick={displayPopUp}>CANCEL</button>
                      </div>
                    </div>
                    :
                    popUpToShow === 'valuation' ?
                      <div className='pop_up'>
                        <div className='text_popup'>
                          <h4>-- YOUR NEW VALUATION --</h4>
                          <h4>{formatter.format(newValuation)}</h4>
                          <button className='main_button_style' onClick={refeshPage}>OK</button>
                        </div>
                      </div>
                      :
                      <></>}
          </div>
        </section>


        :
        property.for_sale === true ?


          <section className='property_page'> {/*************FOR SALE POST*/}
            <Nav />
            <div className='property_page_section'>
              <Carousel interval={null}>
                {level.imageArray.map((imageURL, index) =>
                  <Carousel.Item key={index}>
                    <img src={imageURL} alt={`${property.address} ${level.imageArray.indexOf(imageURL) + 1}`} />
                  </Carousel.Item>
                )}
              </Carousel>
              <div className='prop_info'>
                <div>
                  <h3>{level.shortDescription}</h3>
                  <h4>{property.address}</h4>
                </div>
                <h1>{formatter.format(property.asking_price)}</h1>
              </div>
              {level.longDescriptionParagraphs.map((paragraph, index) =>
                <p key={index}>{paragraph}</p>
              )}

              <div>
                {userHasActiveOffer ?
                  usersActiveOffer.accepted ?
                    <>
                      <h4>YOUR OFFER HAS BEEN ACCEPTED</h4>

                      <button className='main_button_style' value={'confirmPurchase'} onClick={displayPopUp}>CONFIRM PURCHASE</button>
                      <button className='main_button_style' value={'retractOffer'} onClick={displayPopUp}>RETRACT OFFER</button>
                    </>
                    :
                    <button className='main_button_style' value={'retractOffer'} onClick={displayPopUp}>RETRACT OFFER</button>
                  :
                  <button className='main_button_style' value={'offerForm'} onClick={displayPopUp}>MAKE AN OFFER</button>
                }
                {savedProperty ?
                  <button className='main_button_style' onClick={handleUnsave}>UNSAVE</button>
                  :
                  <button className='main_button_style' onClick={handleSave}>SAVE</button>
                }
              </div>
              <div className='map'>
                <ReactMapGl
                  mapboxAccessToken='pk.eyJ1IjoidG9ueWhhdW5zY2htaWR0IiwiYSI6ImNsMGxxN2Y1eTAxamEza253bGk0aDY1ZWgifQ.r583dvme3BozIBF7sZZZaw'
                  height='100%'
                  width='100%'
                  mapStyle='mapbox://styles/mapbox/streets-v11'
                  {...viewState}
                  onMove={evt => setViewState(evt.viewState)}
                >
                  <Marker latitude={property.lat} longitude={property.lon}>????</Marker>
                </ReactMapGl>
              </div>
            </div>



            {popUpToShow === 'offerForm' ?
              <div className='pop_up'>
                <div className='offer_form'>
                  <h4>-- OFFER FORM --</h4>
                  <div className='money_input'>
                    <label for='offer_value'>??</label>
                    <input type='number' min='1' step='1' name='offer_value' placeholder='Offer Value' onChange={handleOfferFormInput} />
                  </div>
                  <p className='small_error_text'>{offerInputError}</p>
                  <fieldset onChange={handleOfferFormInput} default='0'>
                    <label for='75'>Mortgage (25% deposit | 25 years)</label>
                    <input type='radio' value='75' name='LTV' />
                    <fieldset className='sub_options' onChange={handleOfferFormInput} disabled={mortgageRequest.LTV == '0' ? true : false}>
                      <div>
                        <label for='3'>Mortgage Broker 1 (??2,000 Fee, 3% Interest)</label>
                        <input type='radio' value='3' name='interest' />
                      </div>
                      <div>
                        <label for='4'>Mortgage Broker 2 (??1,500 Fee, 4% Interest)</label>
                        <input type='radio' value='4' name='interest' />
                      </div>
                      <div>
                        <label for='5'>Mortgage Broker 3 (??1,000 Fee, 5% Interest)</label>
                        <input type='radio' value='5' name='interest' />
                      </div>
                    </fieldset>
                    <label for='0'>Full Payment</label>
                    <input type='radio' value='0' name='LTV' selected='selected' />
                  </fieldset>
                  <hr />
                  <h6>-BREAKDOWN-</h6>
                  <div className='ul_pairing'>
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
                  </div>

                  <hr />
                  <div className='ul_pairing'>
                    <ul>
                      <li>Monthly Payments</li>
                      <li>Remaining Capital</li>
                    </ul>
                    <ul>
                      <li>{formatter.format(Math.ceil(mortgageRequest.loan_value * ((mortgageRequest.interest / 100) / 12)))}</li>
                      <li>{formatter.format(currentUser.capital + mortgageRequest.loan_value - offerFormData.offer_value - offerFormData.stamp_duty - offerFormData.fees)}</li>
                    </ul>
                  </div>
                  <button className='main_button_style' onClick={handleOfferApplication}>SUBMIT OFFER</button>
                  <button className='main_button_style' value={'none'} onClick={displayPopUp}>CANCEL</button>

                </div>

              </div>
              :
              popUpToShow === 'mortgageReject' ?
                <div className='pop_up'>
                  <div className='text_popup'>
                    <h4>-- APPLICATION REJECTED --</h4>
                    {popUpMessage.map((paragraph, index) =>
                      <p key={index}>{paragraph}</p>
                    )}
                    <button className='main_button_style' value={'offerForm'} onClick={displayPopUp}>AMEND OFFER</button>
                    <button className='main_button_style' value={'none'} onClick={displayPopUp}>CANCEL</button>
                  </div>
                </div>
                :
                popUpToShow === 'offerMade' ?
                  <div className='pop_up'>
                    <div className='text_popup'>
                      <h4>-- OFFER SENT --</h4>
                      <p>Congratulations!!</p>
                      <p>Your purchase offer has been submitted</p>
                      <p>Your offer has been sent to the property owner who will review.</p>
                      <p>You will be notified by email if your offer has been accepted or rejected.</p>
                      <p>please check your emails for comfirmation of the offer being sent.</p>
                      <button className='main_button_style' onClick={refeshPage}>OK</button>
                    </div>
                  </div>
                  :
                  popUpToShow === 'retractOffer' ?
                    <div className='pop_up'>
                      <div className='text_popup'>
                        <h4>-- RETRACT OFFER --</h4>
                        <p>Property- {property.address}</p>
                        <p>Value- {formatter.format(usersActiveOffer.offer_value)}</p>
                        <p>Offer made on- {usersActiveOffer.time_stamp}</p>
                        <button className='main_button_style' onClick={retractOffer}>CONFIRM</button>
                        <button className='main_button_style' value={'none'} onClick={displayPopUp}>CANCEL</button>
                      </div>
                    </div>
                    :
                    popUpToShow === 'confirmPurchase' ?
                      <div className='pop_up'>
                        <div className='text_popup'>
                          <h4>-- CONFIRM PURCHASE --</h4>
                          <p>Property- {property.address}</p>
                          <p>Offer Value- {formatter.format(usersActiveOffer.offer_value)}</p>
                          <p>Offer Made On- {(new Date(usersActiveOffer.time_stamp)).toDateString()}</p>
                          <hr />
                          {usersActiveOffer.mortgage.LTV === 75 ?
                            <>
                              <p>-Mortgage-</p>
                              <p>75% LTV</p>
                              <p>Loan value- {formatter.format(usersActiveOffer.mortgage.loan_value)}</p>
                            </>

                            :
                            <p>No Mortgage</p>
                          }
                          <hr />
                          <p>Your Remaining Capital- {formatter.format(currentUser.capital + usersActiveOffer.mortgage.loan_value - usersActiveOffer.offer_value - usersActiveOffer.stamp_duty - usersActiveOffer.fees)}</p>
                          {currentUser.capital + usersActiveOffer.mortgage.loan_value - usersActiveOffer.offer_value - usersActiveOffer.stamp_duty - usersActiveOffer.fees >= 0 ?
                            <>
                              <button className='main_button_style' onClick={propertyPurchase}>CONFIRM</button>
                              <button className='main_button_style' value={'none'} onClick={displayPopUp}>CANCEL</button>
                            </>
                            :
                            <>
                              <p className='small_error_text'>You have insufficient funds for this transaction</p>
                              <button className='main_button_style' value={'none'} onClick={displayPopUp}>BACK</button>
                            </>
                          }
                        </div>
                      </div>
                      : <></>
            }

          </section>


          :


          <section className='property_page'> {/*************NOT OWNED/NOT FOR SALE*/}
            <Nav />
            <div className='property_page_section'>
              <p>THIS PROPERTY IS NOT CURRENTLY ON THE MARKET</p>
            </div>
          </section>


      :
      <p>loading...</p>
  )
}

export default PropertyPage