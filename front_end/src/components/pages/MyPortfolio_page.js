import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getPayload, getTokenFromLocalStorage } from '../helpers/authHelper'

const MyPortfolioPage = () => {

  const currentUserID = getPayload().sub

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



  useEffect(() => {
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
          void: true,
          noLettingAgent: true
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
          property.noLettingAgent = false
          if (!propertyLetting.void) {
            property.void = false
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
            property.voidBills = usersProperties[i].void_upkeep
          }
        } else {
          //delete else if not needed
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
      <h1>MY PORTFOLIO</h1>
      <div>
        <div>
          <p>{user.first_name} {user.last_name}</p>
          <ul>
            <li>Capital</li>
            <li>Properties Owned</li>
            <li>Next Month Income</li>
            <li>Mortgage Loans</li>
            <li>Owned Equity</li>
            <li>Net Worth</li>
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
        <div>
          <p>[map]</p>
        </div>
      </div>
      <div>
        <table>
          <thead>
            <tr>
              <th>Property</th>
              <th>Rent Income</th>
              <th>Mortgage Payment</th>
              <th>Void</th>
              <th>Letting Fee</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {propertyStats.map((property, index) =>
              <tr key={index}>
                <td><Link to={`/property/${property.id}`}>{property.property}</Link></td>
                <td>{formatter.format(property.rentIncome)}</td>
                <td>{formatter.format(0 - property.mortgagePayment)}</td>
                <td>{formatter.format(0 - property.voidBills)}</td>
                <td>{formatter.format(0 - property.lettingFee)}</td>
                <td>{formatter.format(property.total)}</td>
              </tr>
            )}
          </tbody>
          <tfoot>
            <tr>
              <th id="total" colSpan="5">Total :</th>
              <td>{formatter.format(propertyStats.reduce((sum, property) => sum + property.total, 0))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <h4>Offers Submitted/Saved Properties For Sale</h4>
      <div>
        {marketPropertiesToDisplay?.map(property => {  //SPLIT THIS WHOLE CARD INTO A SEPERATE COMPONENT??
          const description = property.level === 1 ? property.short_description_level1 :
            property.level === 2 ? property.short_description_level2 :
              property.short_description_level3
          const images = property.level === 1 ? property.images_level1 :
            property.level === 2 ? property.images_level2 :
              property.images_level3
          const imagesArray = images.split('&')
          return (
            <Link key={property.id} to={`/property/${property.id}`}>
              <div>
                {imagesArray.map(imageURL =>
                  <img key={imageURL} src={imageURL} alt={`${property.address} ${imagesArray.indexOf(imageURL) + 1}`} />
                )}

                <h3>{description}</h3>
                <h4>{property.address}</h4>
                <h2>{formatter.format(property.asking_price)}</h2>
                {property.offer && <h4>offer-  {formatter.format(property.offer)}</h4>}
                {property.saved && <h4>saved</h4>}

              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}

export default MyPortfolioPage