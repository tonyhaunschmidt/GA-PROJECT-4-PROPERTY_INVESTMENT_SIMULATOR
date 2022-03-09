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
  const [propertyStats, setPropertyStats] = useState([])
  const [totalMortgageLoans, setTotalMortgageLoans] = useState(0)
  const [ownedEquity, setOwnedEquity] = useState(0)


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
        if (propertyValuations.length) {
          equity += propertyValuations[propertyValuations.length - 1].amount
        }
        console.log(equity)

        //HAVE TO TAKE AWAY MORTGAGES FROM THIS!!
      }
      setOwnedEquity(equity - usersActiveMortgages.reduce((sum, mortgage) => sum + mortgage.loan_value, 0))
    }
    getOwnedEquity()
    getPropertyStats()
    setTotalMortgageLoans(usersActiveMortgages.reduce((sum, mortgage) => sum + mortgage.loan_value, 0))
  }, [usersTransactions])


  //get market properties
  //filter out of those ones you have book marked
  //if ones you have book marked are not on market then take them out your list
  //get all offers from you and filter by not rejected and if the property is on the market
  //list book marked and offered


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
            <li>{formatter.format(user.capital - totalMortgageLoans + ownedEquity)}</li>
          </ul>
        </div>
        <div>
          <p>[map]</p>
        </div>
      </div>
      <div>
        <table>
          <tr>
            <th>Property</th>
            <th>Mortgage Payment</th>
            <th>Rent Income</th>
            <th>Void</th>
            <th>Letting Fee</th>
            <th>Total</th>
          </tr>
          {propertyStats.map((property, index) =>

            <tr key={index}>
              <td><Link to={`/property/${property.id}`}>{property.property}</Link></td>
              <td>{formatter.format(property.mortgagePayment)}</td>
              <td>{formatter.format(property.rentIncome)}</td>
              <td>{formatter.format(property.voidBills)}</td>
              <td>{formatter.format(property.lettingFee)}</td>
              <td>{formatter.format(property.total)}</td>
            </tr>
          )}
          <tfoot>
            <tr>
              <th id="total" colspan="5">Total :</th>
              <td>{formatter.format(propertyStats.reduce((sum, property) => sum + property.total, 0))}</td>
            </tr>
          </tfoot>
        </table>
      </div>
      <h4>Book Marked/Offered Properties</h4>
      <div>

      </div>
    </section>
  )
}

export default MyPortfolioPage