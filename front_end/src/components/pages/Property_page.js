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
  const [propertyMortgages, setPropertyMortgages] = useState([])
  const [ownersActiveMortgage, setOwnersActiveMortgage] = useState({})
  const [currentTermPropertyTransactions, setCurrentTermPropertyTransactions] = useState([])
  const [workplaceToDisplay, setWorkplaceToDisplay] = useState('none')
  const [askingPrice, setAskingPrice] = useState('')
  const [offerToAccept, setOfferToAccept] = useState({})
  const [offerToReject, setOfferToReject] = useState({})


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
        setActivePropertyOffers(activeOffers)
        setUsersActiveOffer(activeOffers.find(offer => offer.owner === data.id))
        const mortgages = await axios.get(`/api/mortgages/propertyspecific/${id}`)
        setPropertyMortgages(mortgages.data)
        setOwnersActiveMortgage(mortgages.data.find(mortgage => mortgage.owner === property.owner && mortgage.term_expiry !== "1992-10-13T16:00:00Z"))
        const transactions = await axios.get(`/api/transactions/propertyspecific/${id}`)
        setCurrentTermPropertyTransactions(transactions.data.filter(transaction => transaction.property_ownership_term === property.ownership_term))
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
        "BTL mortgages are subject to the property's habitability and this property is not presently habitable. A mortgage will not be offered for this property in it's current state"
      ])
      setPopUpToShow('mortgageReject')
    } else if (level.baseRate < Math.ceil(mortgageRequest.loan_value * ((mortgageRequest.interest / 100) / 12)) && mortgageRequest.LTV === '75') {
      setPopUpMessage([
        'We regret to inform you that your mortgage application has been rejected.',
        'After evaluating the potential rental income of this property, it is not viable as a sound investment.'
      ])
      setPopUpToShow('mortgageReject')
    } else {
      const postMortgageAndOffer = async () => {
        try {
          const { data } = await axios.post('/api/mortgages', { ...mortgageRequest, term_expiry: "1992-10-13T16:00:00" }, {
            headers: {
              Authorization: `Bearer ${getTokenFromLocalStorage()}`
            }
          })

          await axios.post('/api/offers', { ...offerFormData, mortgage: data.id }, {
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
    const purchaseWithMortge = usersActiveOffer.mortgage.LTV === 75 ? true : false

    //update property owner and mortgage stats
    await axios.put(`/api/properties/${property.id}`, { ...property, owner: currentUser.id, for_sale: false, mortgaged: purchaseWithMortge, ownership_term: property.ownership_term + 1 }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
    //update user capital
    const NewOwnerCapital = currentUser.capital + usersActiveOffer.mortgage.loan_value - usersActiveOffer.offer_value - usersActiveOffer.stamp_duty - usersActiveOffer.fees
    await axios.put(`/api/auth/${currentUser.id}`, { ...currentUser, capital: NewOwnerCapital }, {
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

    await axios.put(`/api/mortgages/${usersActiveOffer.mortgage.id}`, { ...usersActiveOffer.mortgage, term_expiry: mortgageExpiry }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })

    await axios.post('/api/transactions', {
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



    const currentOwner = await axios.get(`/api/auth/${property.owner}`)
    let ownersCapital = currentOwner.data.capital + usersActiveOffer.offer_value
    //cancel current owners mortgage
    if (ownersActiveMortgage) {
      console.log(ownersActiveMortgage)
      await axios.put(`/api/mortgages/${ownersActiveMortgage.id}`, { ...ownersActiveMortgage, term_expiry: "1992-10-13T16:00:00" }, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`
        }
      })
      ownersCapital = ownersCapital - ownersActiveMortgage.loan_value

      await axios.post('/api/transactions', {
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
    }

    //update current owner capital ->will need to pay off bank too (mortgage)
    await axios.put(`/api/auth/${property.owner}`, { ...currentOwner.data, capital: ownersCapital }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
    await axios.post('/api/transactions', {
      type: 'sold_property',
      property: property.id,
      owner: property.owner,
      amount: usersActiveOffer.offer_amount,
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
      await axios.put(`/api/offers/${activePropertyOffers[i].id}`, { ...activePropertyOffers[i], retracted: true, mortgage: activePropertyOffers[i].mortgage.id }, {
        headers: {
          Authorization: `Bearer ${getTokenFromLocalStorage()}`
        }
      })
    }

    //post transaction to database
    await axios.post('/api/transactions', {
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
    window.location.reload(false);
  }

  const displayWorkplace = (e) => {
    setWorkplaceToDisplay(e.target.value)
  }

  const updateAskingPrice = (e) => {
    setAskingPrice(e.target.value)
  }

  const putOnMarket = async () => {
    await axios.put(`/api/properties/${property.id}`, { ...property, for_sale: true, asking_price: askingPrice }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
    window.location.reload(false);
  }

  const takeOffMarket = async () => {
    await axios.put(`/api/properties/${property.id}`, { ...property, for_sale: false }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
    //retract all offers
    for (let i = 0; i < activePropertyOffers.length; i++) {
      await axios.put(`/api/offers/${activePropertyOffers[i].id}`, { ...activePropertyOffers[i], retracted: true, mortgage: activePropertyOffers[i].mortgage.id }, {
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
    await axios.put(`/api/offers/${offerToAccept.id}`, { ...offerToAccept, accepted: true, mortgage: offerToAccept.mortgage.id }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
    setPopUpToShow('none')
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
    await axios.put(`/api/offers/${offerToAccept.id}`, { ...offerToAccept, accepted: false, mortgage: offerToAccept.mortgage.id }, {
      headers: {
        Authorization: `Bearer ${getTokenFromLocalStorage()}`
      }
    })
    setPopUpToShow('none')
  }






  return (
    property.id ?
      property.owner === getPayload().sub ?

        <section className='property_page'> {/*************OWN PROPERTY*/}
          {level.imageArray.map(imageURL =>
            <img key={imageURL} src={imageURL} alt={`${property.address} ${level.imageArray.indexOf(imageURL) + 1}`} />
          )}
          <h2>{property.house_number_or_name} {property.address}</h2>
          <h4>TRANSACTION HISTORY</h4>
          <div>
            {currentTermPropertyTransactions.map((transaction, index) =>
              transaction.type === 'mortgage' ?
                <div key={index}>
                  <ul>
                    <li>Mortgage Loan</li>
                    <li>Loan Amount</li>
                  </ul>
                  <ul>
                    <li>{transaction.time_stamp}</li>
                    <li>{formatter.format(transaction.amount)}</li>
                  </ul>
                </div>
                :
                transaction.type === 'property_purchase' ?
                  <div key={index}>
                    <ul>
                      <li>Property Purchase</li>
                      <li>Purchase</li>
                    </ul>
                    <ul>
                      <li>{transaction.time_stamp}</li>
                      <li>{formatter.format(0 - transaction.amount)}</li>
                    </ul>
                  </div>
                  :
                  transaction.type === 'paid_mortgage' ?
                    <div key={index}>
                      <ul>
                        <li>Full Mortgage Payment</li>
                        <li>Payment</li>
                      </ul>
                      <ul>
                        <li>{transaction.time_stamp}</li>
                        <li>{formatter.format(0 - transaction.amount)}</li>
                      </ul>
                    </div>
                    :
                    transaction.type === 'income' ?
                      <div key={index}>
                        <ul>
                          <li>Property Income</li>
                          <li>Payment</li>
                        </ul>
                        <ul>
                          <li>{transaction.time_stamp}</li>
                          <li>{formatter.format(transaction.amount)}</li>
                        </ul>
                      </div>
                      :
                      transaction.type === 'valuation' ?
                        <div key={index}>
                          <ul>
                            <li>New Valuation</li>
                            <li>Valuation</li>
                          </ul>
                          <ul>
                            <li>{transaction.time_stamp}</li>
                            <li>{formatter.format(transaction.amount)}</li>
                          </ul>
                        </div>
                        :
                        transaction.type === 'improvement' ?
                          <div key={index}>
                            <ul>
                              <li>Home Imporvement</li>
                              <li>Payment</li>
                            </ul>
                            <ul>
                              <li>{transaction.time_stamp}</li>
                              <li>{formatter.format(0 - transaction.amount)}</li>
                            </ul>
                          </div>
                          :
                          <div key={index}>
                            <ul>
                              <li>{transaction.type}</li>
                              <li>Payment</li>
                            </ul>
                            <ul>
                              <li>{transaction.time_stamp}</li>
                              <li>{formatter.format(0 - transaction.amount)}</li>
                            </ul>
                          </div>
            )}
          </div>
          <hr />
          <div>
            <h4>MONTH BREAKDOWN</h4>
            {ownersActiveMortgage ?
              <div>
                <h6>Mortgage</h6>
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
                  <li>{ownersActiveMortgage.loan_value}</li>
                  <li>25 Years</li>
                  <li>Remaining Term</li> {/*FORMAT AFTER VIRTUAL CALENDAR*/}
                  <li>{ownersActiveMortgage.interest}%</li>
                  <li>{formatter.format(Math.ceil(ownersActiveMortgage.loan_value * ((ownersActiveMortgage.interest / 100) / 12)))}</li>
                </ul>
              </div>
              :
              <></>}
            {1 + 1 === 5 ?
              <>{/*ADD AFTER IMPLEMENTING LETTING FUNCTIONALITY*/}</>
              :
              <div>
                <h6>Letting</h6>
                <ul>
                  <li>Agent</li>
                  <li>Monthly Fee</li>
                  <li>Status</li>
                  <li>Monthly Income</li>
                </ul>
                <ul>
                  <li>You do not currenlty have a letting agent organised for this property</li>
                  <li>£0</li>
                  <li>VOID</li>
                  <li>£0</li>
                </ul>
              </div>
            }
            <div>
              <h6>CURRENT MONTH BREAKDOWN</h6>
              <ul>
                <li>Mortgage Payment</li>
                <li>Rent Income</li>
                <li>Void Bills</li> {/* ADD CONDITION FOR THIS NOT TO SHOW IF NOT VOID */}
                <li>Letting Fee</li>
                <li>TOTAL INCOME</li>
              </ul>
              <ul>
                <li>{ownersActiveMortgage ? formatter.format(0 - Math.ceil(ownersActiveMortgage.loan_value * ((ownersActiveMortgage.interest / 100) / 12))) : '£0'}</li>
                <li>£0</li>{/*ADD AFTER IMPLEMENTING LETTING FUNCTIONALITY*/}
                <li>{formatter.format(0 - property.void_upkeep)}</li>
                <li>£0</li> {/*ADD AFTER IMPLEMENTING LETTING FUNCTIONALITY*/}
                <li>-£438</li>
              </ul>
            </div>
          </div>
          <hr />
          <div>
            <ul>
              <li>Total Money Invested</li>
              <li>Borrowed Money</li>
              <li>Owned Equity</li>
              <li>Total Money Returned</li>
              <li>Total Profit</li>
            </ul>
            <ul>
              <li>Total Money Invested</li> {/*ADD STATE ABOVE TO CALULATE*/}
              <li>{ownersActiveMortgage ? formatter.format(0 - ownersActiveMortgage.loan_value) : '£0'}</li>
              <li>Owned Equity</li> {/*ADD AFTER IMPLEMENTING REMORTGAGING FUNCTIONALITY*/}
              <li>Total Money Returned</li> {/*ADD STATE ABOVE TO CALULATE*/}
              <li>Total Profit</li>  {/*ADD STATE ABOVE TO CALULATE*/}
            </ul>
          </div>
          <hr />
          {property.for_sale ?
            <div>
              <h4>OFFERS</h4>
              <p>Asking Price - {formatter.format(property.asking_price)}</p>
              {activePropertyOffers.length ?
                activePropertyOffers.map(offer =>
                  <div key={offer.id}>
                    <p>{formatter.format(offer.offer_value)}</p>
                    {offer.accepted === true ?
                      <button onClick={dontAcceptOfferCheck} value={offer.id}>DON'T ACCEPT OFFER</button>
                      :
                      <button onClick={acceptOfferCheck} value={offer.id}>ACCEPT OFFER</button>
                    }
                    <button onClick={rejectOfferCheck} value={offer.id}>REJECT OFFER</button>
                  </div>
                )
                :
                <p>You currently do not have any offers for this property</p>
              }
              <button value={'takeOffMarket'} onClick={displayPopUp}>TAKE OFF MARKET</button>
            </div>
            :
            <div>
              <div>
                <button value={'manageLetting'} onClick={displayWorkplace}>MANAGE LETTING</button>
                <button value={'improvements'} onClick={displayWorkplace}>IMPROVEMENTS</button>
                <button value={'getValuation'} onClick={displayWorkplace}>GET VALUATION (£500)</button> {/*ADD CONDITIONS FOR IF A VALUATION HAS ALREADY BEEN MADE IN THE LAST MONTH*/}
                <button value={'remortgage'} onClick={displayWorkplace}>REMORTGAGE</button> {/*ADD CONDITION FOR IF A VALUATION HAS BEEN MADE IN THE LAST MONTH*/}
                <button value={'payMortgage'} onClick={displayWorkplace}>PAY OFF MORTGAGE</button> {/*ADD CONDITION IF MORTGAGE EXISTS*/}
                <button value={'putOnMarket'} onClick={displayWorkplace}>PUT ON MARKET</button>
              </div>
              <div>
                {workplaceToDisplay === 'manageLetting' ?
                  <div>
                    <h4>MANAGE LETTING</h4>

                  </div>
                  :
                  workplaceToDisplay === 'improvements' ?
                    <div>
                      <h4>HOME IMPROVEMENTS</h4>

                    </div>
                    :
                    workplaceToDisplay === 'getValuation' ?
                      <div>
                        <h4>VALUATION</h4>

                      </div>
                      :
                      workplaceToDisplay === 'remortgage' ?
                        <div>
                          <h4>REMORTGAGE</h4>

                        </div>
                        :
                        workplaceToDisplay === 'payMortgage' ?
                          <div>
                            <h4>PAY MORTGAGE</h4>

                          </div>
                          :
                          workplaceToDisplay === 'putOnMarket' ?
                            <div>
                              <h4>PUT ON MARKET</h4>
                              <label for='offer_value'>Asking Price (£)</label>
                              <input type='number' min='1' step='1' name='offer_value' onChange={updateAskingPrice} />
                              <button onClick={putOnMarket}>CONFIRM</ button>
                              <p>Once your property is on the market you can no longer manage lettings, make improvements or remortgage</p>
                            </div>
                            :
                            <></>}
              </div>
            </div>
          }
          {popUpToShow === 'acceptOffer' ?
            <div className='pop_up'>
              <h4>ACCEPT OFFER</h4>
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
              {offerToAccept.offer_value - ownersActiveMortgage.loan_value < 0 &&
                <p>Accepting offer at negative equity. Please ensure you have sufficeint funds before accepting this offer.</p>
              }
              <p>The purchase will be finalised when the buyer confirms purchase</p>
              <button onClick={acceptOffer}>ACCEPT OFFER</button>
              <button value={'none'} onClick={displayPopUp}>CANCEL</button>
            </div>
            :
            popUpToShow === 'dontAcceptOffer' ?
              <div className='pop_up'>
                <h4>DON'T ACCEPT OFFER</h4>
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
                <p>Are you sure you want to retract your acceptance of this offer?</p>
                <button onClick={dontAcceptOffer}>DON'T ACCEPT OFFER</button>
                <button value={'none'} onClick={displayPopUp}>CANCEL</button>
              </div>
              :
              popUpToShow === 'rejectOffer' ?
                <div className='pop_up'>
                  <h4>REJECT OFFER</h4>
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
                  <p>Are you sure you want to reject this offer?</p>
                  <button onClick={rejectOffer}>REJECT OFFER</button>
                  <button value={'none'} onClick={displayPopUp}>CANCEL</button>
                </div>
                :
                popUpToShow === 'takeOffMarket' ?
                  <div className='pop_up'>
                    <h4>TAKE OFF MARKET</h4>
                    <p>Are you sure?</p>
                    <p>Taking a property off the market will result in all current offers being retracted.</p>
                    <button onClick={takeOffMarket}>TAKE OFF MARKET</button>
                    <button value={'none'} onClick={displayPopUp}>CANCEL</button>
                  </div>
                  :
                  <></>}

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
                  <label for='75'>Mortgage (25% deposit | 25 years)</label>
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