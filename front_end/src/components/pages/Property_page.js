import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import axios from 'axios'
import { getPayload } from '../helpers/authHelper'

const PropertyPage = () => {

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
  const [offerFormData, setOfferFormData] = useState({
    property: id,
    owner: getPayload.sub,
    mortgage: 0,
    offer_value: 0,
    stamp_duty: 0,
    fees: 2000,
    accepted: false,
    retracted: false,
  })
  const [mortgageRequest, setMortgageRequest] = useState({
    property: id,
    owner: getPayload.sub,
    LTV: 75,
    loan_value: 0,
    term_expirary: 0,
    interest: 5,
  })

  useEffect(() => {
    const getProperty = async () => {
      try {
        const { data } = await axios.get(`/api/properties/${id}`)
        setProperty(data)
        console.log(data)
      } catch (err) {
        console.log(err)
      }
    }
    getProperty()
  }, [])



  useEffect(() => {
    if (property.level === 1) {
      const imagesArray = property.images_level1.split('&')
      const paragraphArray = property.long_description_level1.split('$%')
      setLevel({
        level: 1,
        imageArray: imagesArray,
        shortDescription: property.short_description_level1,
        longDescriptionParagraphs: paragraphArray,
        baseRate: property.base_rate_level1,
        improvementCost: property.level1_improvement_cost
      })
    } else if (property.level === 2) {
      const imagesArray = property.images_level2.split('&')
      const paragraphArray = property.long_description_level2.split('$%')
      setLevel({
        level: 2,
        imageArray: imagesArray,
        shortDescription: property.short_description_level2,
        longDescriptionParagraphs: paragraphArray,
        baseRate: property.base_rate_level2,
        improvementCost: property.level2_improvement_cost
      })
    } else if (property.level === 3) {
      const imagesArray = property.images_level3.split('&')
      const paragraphArray = property.long_description_level3.split('$%')
      setLevel({
        level: 3,
        imageArray: imagesArray,
        shortDescription: property.short_description_level3,
        longDescriptionParagraphs: paragraphArray,
        baseRate: property.base_rate_level3,
        improvementCost: 'no improvement'
      })
    }
  }, [property])

  const displayPopUp = (e) => {
    setPopUpToShow(e.target.value)
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
      } else if (e.target.value > 1500000) {
        stampDuty = Math.ceil(e.target.value * 0.15)
      }
      const loanValue = Math.floor(e.target.value * (mortgageRequest.LTV / 100))
      //payment = offer=value-loanvalue
      setOfferFormData({ ...offerFormData, [e.target.name]: e.target.value, stamp_duty: stampDuty })
      setMortgageRequest({ ...mortgageRequest, loan_value: loanValue })
    } else if (e.target.name === 'LTV') {
      const loanValue = Math.floor(offerFormData.offer_value * (e.target.value / 100))
      //payment = offer=value-loanvalue
      setMortgageRequest({ ...mortgageRequest, [e.target.name]: e.target.value, loan_value: loanValue })
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
    console.log(offerFormData, mortgageRequest)

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
            {level.longDescriptionParagraphs.map((paragraph, index) =>
              <p key={index}>{paragraph}</p>
            )}
            <button value={'offerForm'} onClick={displayPopUp}>MAKE AN OFFER</button>

            {popUpToShow === 'offerForm' ?
              <div className='pop_up'>

                <h4>OFFER FORM</h4>
                <input type='number' pattern='^\\$?(([1-9](\\d*|\\d{0,2}(,\\d{3})*))|0)(\\.\\d{1,2})?$' min='1' name='offer_value' placeholder='Offer Amount' onChange={handleOfferFormInput} />
                <fieldset onChange={handleOfferFormInput} default='75'>
                  <label for='75'>Mortgage (25% deposit)</label>
                  <input type='radio' value='75' name='LTV' />
                  <fieldset onChange={handleOfferFormInput} disabled={mortgageRequest.LTV === '0' ? true : false}>
                    <label for='3'>Mortgage Broker 1 (£2,000 Fee, 3% Interest)</label>
                    <input type='radio' value='3' name='interest' />
                    <label for='4'>Mortgage Broker 2 (£1,500 Fee, 4% Interest)</label>
                    <input type='radio' value='4' name='interest' />
                    <label for='5'>Mortgage Broker 3 (£1,000 Fee, 5% Interest)</label>
                    <input type='radio' value='5' name='interest' checked='checked' />
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
                  <li>Capital</li>
                </ul>
                <button>SUBMIT OFFER</button>
                <button value={'none'} onClick={displayPopUp}>CANCEL</button>

              </div>
              :
              popUpToShow === 'mortgageReject' ?
                <div className='pop_up'>
                  <button value={'offerForm'} onClick={displayPopUp}>AMEND OFFER</button>
                </div>
                :
                popUpToShow === 'offerMade' ?
                  <div className='pop_up'>

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