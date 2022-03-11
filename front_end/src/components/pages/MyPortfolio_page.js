import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getPayload, getTokenFromLocalStorage, userIsAuthenticated } from '../helpers/authHelper'
import ReactMapGl, { Marker } from 'react-map-gl'


import Carousel from 'react-bootstrap/Carousel'
import Nav from '../Nav'

const mapToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN

const MyPortfolioPage = () => {

  const navigate = useNavigate()



  const formatter = new Intl.NumberFormat('en-UK', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0
  })

  const [user, setUser] = useState({})
  const [usersProperties, setUsersProperties] = useState([])
  const [usersActiveMortgages, setUsersActiveMortgages] = useState([])
  const [usersActiveLets, setUsersActiveLets] = useState([])
  const [usersTransactions, setUsersTransactions] = useState([])
  const [usersActiveOffers, setUsersActiveOffers] = useState([])
  const [propertyStats, setPropertyStats] = useState([])
  const [totalMortgageLoans, setTotalMortgageLoans] = useState(0)
  const [ownedEquity, setOwnedEquity] = useState(0)
  const [marketplaceProperties, setMarketplaceProperties] = useState([])
  const [marketPropertiesToDisplay, setMarketPropertiesToDisplay] = useState([])
  const [viewport, setViewport] = useState({
    latitude: 51.515,
    longitude: -0.078,
    zoom: 6,
  })



  useEffect(() => {
    !userIsAuthenticated() && navigate('/')
    let currentUserID
    if (getPayload()) {
      currentUserID = getPayload().sub
    }
    const getUser = async () => {
      try {
        const userdata = await axios.get(`/api/auth/${currentUserID}`)
        setUser(userdata.data)
        const propertydata = await axios.get(`/api/properties/userspecific/${currentUserID}`)
        setUsersProperties(propertydata.data)
        const mortgagedata = await axios.get(`/api/mortgages/userspecific/${currentUserID}`)
        setUsersActiveMortgages(mortgagedata.data.filter(mortgage => mortgage.term_expiry !== '1992-10-13T16:00:00Z'))
        const lettingsdata = await axios.get(`/api/lettings/userspecific/${currentUserID}`)
        setUsersActiveLets(lettingsdata.data.filter(letting => letting.current === true))
        const transactionsdata = await axios.get(`/api/transactions/userspecific/${currentUserID}`)
        setUsersTransactions(transactionsdata.data)
        const offerssdata = await axios.get(`/api/offers/userspecific/${currentUserID}`)
        setUsersActiveOffers(offerssdata.data.filter(offer => offer.retracted === false))
        console.log(offerssdata.data.filter(offer => offer.retracted === false))
      } catch (err) {
        console.log(err)
      }
    }
    getUser()

  }, [])

  useEffect(() => {
    const getPropertyStats = () => {
      const propStats = []
      for (let i = 0; i < usersProperties.length; i++) {
        let baseRate = 0
        if (usersProperties[i].level === 1) {
          baseRate = usersProperties[i].base_rate_level1
        } else if (usersProperties[i].level === 2) {
          baseRate = usersProperties[i].base_rate_level2
        } else if (usersProperties[i].level === 3) {
          baseRate = usersProperties[i].base_rate_level3
        }
        const property = {
          id: usersProperties[i].id,
          property: `${usersProperties[i].house_number_or_name} ${usersProperties[i].address}`,
          mortgagePayment: 0,
          rentIncome: 0,
          voidBills: 0,
          lettingFee: 0,
          total: 0,
          void: false,
          noLettingAgent: false
        }
        //mortgage calc
        if (usersActiveMortgages.some(mortgage => mortgage.property === usersProperties[i].id)) {
          const propertyMortgage = usersActiveMortgages.find(mortgage => mortgage.property === usersProperties[i].id)
          property.mortgagePayment = (Math.ceil(propertyMortgage.loan_value * ((propertyMortgage.interest / 100) / 12)))
        } else {
          //delete else if not needed
        }
        //rent calc
        if (usersActiveLets.some(letting => letting.property === usersProperties[i].id)) {
          const propertyLetting = usersActiveLets.find(letting => letting.property === usersProperties[i].id)

          if (!propertyLetting.void) {
            property.rentIncome = baseRate
            //letting calc
            if (propertyLetting.grade === 'A') {
              property.lettingFee = Math.ceil(baseRate * 0.2)
            } else if (propertyLetting.grade === 'B') {
              property.lettingFee = Math.ceil(baseRate * 0.15)
            } else if (propertyLetting.grade === 'C') {
              property.lettingFee = Math.ceil(baseRate * 0.1)
            }
          } else {
            //void calc
            property.void = true
            property.voidBills = usersProperties[i].void_upkeep
          }
        } else {
          property.noLettingAgent = true
          property.voidBills = usersProperties[i].void_upkeep
        }
        //total calc
        property.total = property.rentIncome - property.mortgagePayment - property.voidBills - property.lettingFee
        propStats.push(property)
      }
      setPropertyStats(propStats)
    }
    const getOwnedEquity = () => {
      let equity = 0
      for (let i = 0; i < usersProperties.length; i++) {
        const propertyValuations = usersTransactions.filter(transaction => transaction.property === usersProperties[i].id && (transaction.type === 'mortgage' || transaction.type === 'valuation'))
        console.log(propertyValuations)
        if (propertyValuations.length) {
          equity += propertyValuations[propertyValuations.length - 1].amount
        }
      }
      setOwnedEquity(equity - 180000 - 75000)
    }
    getOwnedEquity()
    getPropertyStats()
    setTotalMortgageLoans(usersActiveMortgages.reduce((sum, mortgage) => sum + mortgage.loan_value, 0))
  }, [usersActiveOffers])



  useEffect(() => {
    const getMarketProperties = async () => {
      try {
        const { data } = await axios.get('/api/properties/marketplace')
        setMarketplaceProperties(data)
        const propertiesToDisplay = []
        for (let i = 0; i < usersActiveOffers.length; i++) {
          if (data.some(property => property.id === usersActiveOffers[i].property)) {
            const offeredproperty = data.find(property => property.id === usersActiveOffers[i].property)
            propertiesToDisplay.push({ ...offeredproperty, offer: usersActiveOffers[i].offer_value })
          }
        }
        for (let i = 0; i < user.saved_properties.length; i++) {
          if (data.some(property => property.id === user.saved_properties[i])) {
            const savedproperty = data.find(property => property.id === user.saved_properties[i])
            if (propertiesToDisplay.some(property => property.id === savedproperty.id)) {
              const ind = propertiesToDisplay.findIndex(property => property.id === savedproperty.id)
              propertiesToDisplay[ind] = { ...propertiesToDisplay[ind], saved: true }
            } else {
              propertiesToDisplay.push({ ...savedproperty, saved: true })
            }
          } else {
            //delete from saved
          }
        }

        console.log(propertiesToDisplay)
        setMarketPropertiesToDisplay(propertiesToDisplay)
      } catch (err) {
        console.log(err)
      }
    }
    getMarketProperties()
  }, [totalMortgageLoans])





  return (
    <section className='my_portfolio_page'>
      <Nav />
      <div className='my_portfolio_section'>
        <h1>MY PORTFOLIO</h1>
        <div className='stats_and_map'>
          <div className='stats'>
            <h5><b>{user.first_name} {user.last_name}</b></h5>
            <div className='ul_pairing'>
              <ul>
                <li><b>Capital:</b></li>
                <li><b>Properties Owned:</b></li>
                <li><b>Next Month Income:</b></li>
                <li><b>Mortgage Loans:</b></li>
                <li><b>Owned Equity:</b></li>
                <li><b>Net Worth:</b></li>
              </ul>
              <ul>
                <li>{formatter.format(user.capital)}</li>
                <li>{usersProperties.length}</li>
                <li>{formatter.format(propertyStats.reduce((sum, property) => sum + property.total, 0))}</li>
                <li>{formatter.format(totalMortgageLoans)}</li>
                <li>{formatter.format(ownedEquity)}</li>
                <li>{formatter.format(user.capital + ownedEquity)}</li>
              </ul>
            </div>
          </div>
          <div className='map'>
            <ReactMapGl
              mapboxAccessToken='pk.eyJ1IjoidG9ueWhhdW5zY2htaWR0IiwiYSI6ImNsMGxxN2Y1eTAxamEza253bGk0aDY1ZWgifQ.r583dvme3BozIBF7sZZZaw'
              height='100%'
              width='100%'
              mapStyle='mapbox://styles/mapbox/streets-v11'
              {...viewport}
              zoom={5}
            >
              {usersProperties.map(property =>
                <Marker latitude={property.lon} longitude={property.lat}>🏠</Marker>
              )}

            </ReactMapGl>
          </div>
        </div>
        <div className='table_container'>
          <table className='key'>
            <tbody>
              <tr>
                <td className='void'>Void</td>
                <td className='no_letting'> No Letting Agent</td>
              </tr>
            </tbody>
          </table>
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Rent Income</th>
                <th>Mortgage Payment</th>
                <th>Letting Fee</th>
                <th>Void</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {propertyStats.map((property, index) =>
                <tr className={`property_row ${property.void && 'void'} ${property.noLettingAgent && 'no_letting'}`} key={index}>
                  <td><Link to={`/property/${property.id}`}>{property.property}</Link></td>
                  <td>{formatter.format(property.rentIncome)}</td>
                  <td>{formatter.format(0 - property.mortgagePayment)}</td>
                  <td>{formatter.format(0 - property.lettingFee)}</td>
                  <td>{formatter.format(0 - property.voidBills)}</td>
                  <td className={property.total < 0 && 'negative'}>{formatter.format(property.total)}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <th id="total" colSpan="5">Total: </th>
                <td className={propertyStats.reduce((sum, property) => sum + property.total, 0) < 0 && 'negative'}><b>{formatter.format(propertyStats.reduce((sum, property) => sum + property.total, 0))}</b></td>
              </tr>
            </tfoot>
          </table>
        </div>
        <hr />
        <h4>Offers Submitted/Saved Properties For Sale</h4>
        <div className='market_list'>
          {marketPropertiesToDisplay.length ?
            marketPropertiesToDisplay?.map(property => {  //SPLIT THIS WHOLE CARD INTO A SEPERATE COMPONENT??
              const description = property.level === 1 ? property.short_description_level1 :
                property.level === 2 ? property.short_description_level2 :
                  property.short_description_level3
              const images = property.level === 1 ? property.images_level1 :
                property.level === 2 ? property.images_level2 :
                  property.images_level3
              const imagesArray = images.split('&')
              return (
                <Link key={property.id} to={`/property/${property.id}`}>
                  <div className='property_card'>
                    <Carousel interval={null}>
                      {imagesArray.map((imageURL, index) =>
                        <Carousel.Item key={index}>
                          <img className='d-block w-100' src={imageURL} alt={`${property.address} ${imagesArray.indexOf(imageURL) + 1}`} />

                        </Carousel.Item>
                      )}
                    </Carousel>
                    <div className='property_info'>
                      <div>
                        <h3>{description}</h3>
                        <h4>{property.address}</h4>
                        <h2>{formatter.format(property.asking_price)}</h2>
                      </div>
                      <div className='optionals'>
                        <h1>{property.saved ? '⭐️' : ' '}</h1>
                        <h4>{property.offer ? `Offer-  ${formatter.format(property.offer)}` : ' '}</h4>
                      </div>


                    </div>


                  </div>
                </Link>
              )
            }) :
            <p>No Properties to display</p>
          }
        </div>
      </div>
    </section>
  )
}

export default MyPortfolioPage