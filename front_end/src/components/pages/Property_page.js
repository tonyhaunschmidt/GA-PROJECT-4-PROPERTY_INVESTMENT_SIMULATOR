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
          </section>


          :


          <section className='property_page'> {/*************NOT OWNED/NOT FOR SALE*/}
            <p>THIS PROPERTY IS NOT CURRENTLY ON THE MARKET</p>
            <Link><button>RETURN TO MARKET</button></Link>
          </section>


      :
      <p>loading...</p>
  )
}

export default PropertyPage