import React, { useEffect, useState } from 'react'
import axios from 'axios'


const Marketplace = () => {
  const formatter = new Intl.NumberFormat('en-UK', {
    style: 'currency',
    currency: 'GBP',
    minimumFractionDigits: 0
  })
  const [marketPlaceProperies, setMarketPlaceProperies] = useState()

  useEffect(() => {
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
    <section className='market_place'>
      <h1>MARKETPLACE</h1>
      {marketPlaceProperies?.map(property => {  //SPLIT THIS WHOLE CARD INTO A SEPERATE COMPONENT
        const description = property.level === 1 ? property.short_description_level1 :
          property.level === 2 ? property.short_description_level2 :
            property.short_description_level3
        const images = property.level === 1 ? property.images_level1 :
          property.level === 2 ? property.images_level2 :
            property.images_level3
        const imagesArray = images.split('&')
        return (
          <div key={property.id}>
            {imagesArray.map(imageURL =>
              <img src={imageURL} alt={`${property.address} ${imagesArray.indexOf(imageURL) + 1}`} />
            )}

            <h3>{description}</h3>
            <h4>{property.address}</h4>
            <h2>{formatter.format(property.asking_price)}</h2>
          </div>
        )
      })}
    </section>
  )
}

export default Marketplace