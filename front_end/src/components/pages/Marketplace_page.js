import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { getPayload, getTokenFromLocalStorage, userIsAuthenticated } from '../helpers/authHelper'

import Carousel from 'react-bootstrap/Carousel'
import Nav from '../Nav'

const MarketplacePage = () => {

  const navigate = useNavigate()

  const formatter = new Intl.NumberFormat('en-UK', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0
  })

  const [marketPlaceProperies, setMarketPlaceProperies] = useState()

  useEffect(() => {
    !userIsAuthenticated() && navigate('/')
    const getProperties = async () => {
      try {
        const { data } = await axios.get('/api/properties/marketplace')
        setMarketPlaceProperies(data)
      } catch (err) {
        console.log(err)
      }
    }
    getProperties()
  }, [])


  return (
    <section className='marketplace_page'>
      <Nav />
      <div className='market_page_section'>
        <h1>MARKETPLACE</h1>
        <div className='market_list'>
          {marketPlaceProperies?.map(property => {  //SPLIT THIS WHOLE CARD INTO A SEPERATE COMPONENT??
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

                    <h3>{description}</h3>
                    <h4>{property.address}</h4>
                    <h2>{formatter.format(property.asking_price)}</h2>
                  </div>
                </div>
              </Link>
            )
          })}

        </div>
      </div>



    </section>
  )
}

export default MarketplacePage