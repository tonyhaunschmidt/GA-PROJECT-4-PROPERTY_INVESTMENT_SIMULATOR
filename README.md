
# GA PROJECT 4- PROPERTY INVESTMENT SIMULATOR



## BRIEF
My final project on the General Assembly Software Engineering Immersive course was to develop a full-stack application with an SQL back-end using Django and a React front-end in one week. Being very interested in FinTech and understanding the advantages of using an SQL database with financial data, I was gravitated towards developing a game-like application where you can simulate investing in property.

I had a huge amount of fun not only playing with the game-like mechanics but structuring the data in the most useful way, working through the different functionalities of putting an offer on a property, applying for a mortgage, managing your properties and more.

My newly learnt technologies for this project were Python, Django, PostgreSQL, Celery, Celery Beat, Redis and React MapBox. 
## TIMEFRAME
8 days
## TECHNOLOGIES
* JavaScript
* Python
* HTML
* CSS
* SCSS
* React
* React MapBox
* Django
* PostgreSQL
* Celery & Celery Beat
* Redis


## [OPEN IN BROWSER](https://propertyinvestmentsimulator.herokuapp.com/){:target="_blank"}
Please register and log in as a new user. 

All the properties for sale are owned by the Property Investment Simulator Bank. To experience the full UX of buying a property, the property owner must accept any offer you make. You can do this by logging in as the bank using the details below, find the property you have made an offer on and accept your offer. You can then re-log in to your own account and finalise the purchase. 

* BANK@pis.com
* pisbank123

To see a maintained account you can log in with the below details (please refrain from making any transactions or processing any property management changes)

* exampleuser@pis.com
* pisuser123
## OUTLINE
The Property Investment Simulator is an application where a user can browse properties on an online marketplace, make offers and, if those offers are accepted by the property owner, finalise the transaction. In making an offer the user has different purchasing options such as buying fully with cash, or taking out an interest only, 75% LTV mortgage. They can also choose different brokers for varying rates and upfront fees.

Once the properties are in their ownership, the user can inspect an overview of their investment such as a full transaction history, mortgage and letting details and overall investment performance as well as manage certain aspects of the property such as managing the letting agent, improving the property to increase the potential rent, get a new valuation of the property, pay off your mortgage or take a new one out, or to put the property back on the market where you can off course then review and accept offers made by other users.

The user can also enjoy a complete overview of their entire portfolio where they are given a breakdown of each of their properties as well as overall statistics such as available capital, quantity of properties owned, total debt in mortgage loans, owned equity, next month's income and their bottom-line net worth. Here they can also see properties that are on the market that they have made offers on and/or saved to view later.

To help the user keep track of certain events, they also have an email inbox where they can view emails sent by The Property Investment Simulator. These emails include a welcome email to help guide the user through the first steps of using the simulation, a notification if their offer on a property has been accepted or rejected, a notification if their property for sale has had an offer made, a confirmation email to confirm a property sale or purchase, an email to let them know their mortgage has started or has been paid and a notification to let the user know that the letting agent has found tenants for their property.

As the application is a simulation, time moves quicker than the real world and so a month in The Property Investment Simulator is a day in the real world. Most events are monthly such as paying your mortgage and collecting your rent so these all happen at the same time each day.
## PLANNING
The nature of this project left me open to many ideas of features, functionalities and simulation mechanics, so a challenging part of the planning stage was narrowing down my ideas to an MVP and substantial UX which would be achievable within the given timeframe. My focus was very much on achieving enough functionality for a proof of concept.  

Once I had decided which features I wanted to run with, I created a simple wireframe design (using Excalidraw) for each page to fully mould the intended UX and plan how each feature would be used. 

![final wireframe](readme_assets/final_wireframe.png)

I knew that I would need a handful of connecting data entities so it was important for me to spend time creating a fully fledged ERD (using QuickDBD)

![ERD](readme_assets/ERD.png)

An important part of the planning stage was researching a way for time to move forward without the user having to be logged in. I quickly landed on using Celery, a task manager that can be used with Django to run scheduled tasks from the back-end. 
## DJANGO
Having my coding journey start from a place of self taught Excel, I feel that I took to the idea of SQL databases quite well. With this I loved my introduction to Django and developing an ERD to plan my individual Django apps and building their respective models. 

In this project I wanted to demonstrate a use of a many-to-many relationship, a one-to-many/many-to-one relationship and a one to one relationship. 

An example of a one-to-many/many-to-one relationship would be in the Offer model where the property and owner fields both have a foreign key linking to the respective Property and Owner tables. These relationships mean that one Property can have many Offers or one Owner can have many Offers. 

Similarly, there is also an example of a one-to-one relationship in the Offer model where one mortgage can only be related to one offer and vice versa.
A learning point for me here is that I could have used models.OneToOneField() rather than models.ForeignKey(). This would have more specifically defined a one to one relationship whereas at the moment it is only a one to one relationship due to my use case. The difference is that using OneToOneField would mean the reverse side of the relation would return a single object whereas using ForeignKey returns a QuerySet.  

![offer model](readme_assets/offer_model.png)

In the User model where we extend the default Django User model I have used ManyToManyField to define the relationship between a user and the properties they have saved. This means that a user can save many properties and a property can be saved by many users. 

![user model](readme_assets/user_model.png)

Another new concept I enjoyed learning about was Django serializers. An example of a nested serializer is in the Email app. Here you can see that I have written a PropertySerializer to convert property model instances for select fields before using that in the PopulatedEmailSerializer which inherits everything from the standard Email serializer and additionally uses the PropertySerializer to populate the property data rather than return the primary key value of each property. 

![populated email serializer](readme_assets/populated_email_serializer.png)

Lastly, a key Django component is views. Having already completed a project with Express it was quite easy to liken them to Express controllers. Below is a simple View containing a Post request where at the front-end we can create an Email. The requested email is passed through the serializer before we check if the request data is valid and if this is passed, the new data entry is saved to the database. Lastly we return a response using the Django framework import. Additionally, I have coded exceptions to catch errors in the request and return an error response.

![email list view](readme_assets/email_list_view.png)


## CELERY, CELERY BEAT AND REDIS
As this project was the final segment of my General Assembly course, I was quite keen to implement a relatively complex technology that was not touched upon at all during the course. Using Celery was a great opportunity for me to challenge myself in this sense and it also doubled as a good opportunity for me to practice Python which was only briefly touched upon during the course when learning the Django framework.

I wanted to use Celery to run 2 tasks:
* To run through each user, and for each of their properties, by searching for the property's current mortgage and letting agreement (if they exist), determine the rent income or void payments, the mortgage payment and the letting fee, and update the users capital with the respective income or expenditure.   
* To run through all the current letting agreements and if the property is void, run a chance orientated algorithm in which if the random number generated is over a certain value it changes the 'void' value of that particular let to 'False'. This in real terms is the finding of a tenant. One of the functionalities I wanted to implement was having the choice of letting agents which affected the likelihood of finding a tenant. This was achieved by each letting agreement having a grade of 'A', 'B' or 'C' which is chosen on the front-end by the user. A feature I wanted to implement which I unfortunately wasn't able to achieve in the timeframe was to have certain events that set a fixed void period. For example, home improvements that would make the property inhabitable for a few months. This was planned for in the data structure but unfortunately not implemented on the front end.  

![celery task](readme_assets/celery_task.png)

After the tasks had been written, as there is no trigger coming from the front-end to run these tasks, Celery needed to know when to run them. This is done by writing a schedule with Celery Beat. (During production I had both tasks running every 10 seconds)  

![celery beat](readme_assets/celery_beat.png)

An important part of using Celery is selecting a message broker which lets Django and Celery talk to each other. During production I used RabbitMQ, however at deployment (the project was deployed on Heroku), it didn't appear that there was a RabbitMQ add on, so I switched over to Redis which seemed much more ready to use with Heroku. 
## CONCLUSION AND KEY LEARNING
The thing I enjoyed most about this project was finding and learning a new technology by myself and implementing it through following the documentation and a process of trial and error. I love to learn new things. This was one of the things that really attracted me to working in the tech industry. With completing the extra challenge I set myself in this final project of my GA course, I feel confident that I can continue to grow and challenge myself with learning and mastering new skills, something I very much hope to do in my career and spare time. 

I am quite glad that I managed to achieve as much as I did in the 8 day timeframe and I had decided on a focus of functionality and creating a substantial enough UX to demonstrate a proof of concept which I feel i have done, however I feel like I could spend a lot of time reviewing and refactoring large chunks of code especially in the front-end and focus more on efficiency and writing DRY code. This is definitely something that I want to work on as I progress my coding skills. 

I enjoyed using Django as a framework. It is relatively simple and I think quite elegant and I can definitely see myself using it in future projects. 


## FUTURE IMPROVEMENTS
As mentioned there are many features and simulation mechanics I would have liked to implement:
* Home improvements- As you can see from the code and front-end, this was planned however, I unfortunately ran out of time. The idea was that for a fee, you can improve your property which in turn would improve your rent income. The level 1 of each property would typically be a refurb project that you could not let out until you improved it to level 2. Level 3 would then be a luxury version of the property.
* Remortgage- If you had paid off your mortgage, re-valued your property or are simply coming to the end of your mortgage term you could remortgage your property.
* Fixed Void Periods
* Currently if left indefinitely a mortgage will never run out, even if it is past its expiry date. 
* Property issues- Random events would happen in which the user is tasked with dealing with property issues, such as a broken boiler or tenants not paying their rent. 
* Property desirability- A hidden value would be assigned to each property (and improved on each level) that would be factored into the 'find a tenant' algorithm. The user would use their own judgement of desirability by reading the descriptions.
* Search and filtering functionality for the marketplace.

I would certainly like to have spent more time styling for a much more finished look. And especially to have made the application responsive for use on mobile phones. 

Error handling on login and register

I would have enjoyed spending more time figuring out different ways of displaying the statistics and figures on the various pages.

As the users are the ones that set the price when they put the property for sale, I would love to experiment with how the economy of this simulation would develop with a handful of users. 

#### KNOWN BUGS

Occasionally on the portfolio and property page, the first render misses some of the information (portfolio breakdown & transactions) and requires a refresh from the user. 

In instances like confirming a property transaction, because of the way that the Axios requests are lined up, on occasions the entire function can fail half way through resulting in only some of the required data points being updated. Similarly this can happen if the button is pressed too many times.  



## CONTACT
I would love to receive any feedback or hear about any of your similar projects. Please get in touch!

tonyhaunschmidt@gmail.com

[tonyhaunschmidt.com](https://creative-cucurucho-1bee8e.netlify.app/){:target="_blank"}

[LinkedIn/tonyhaunschmidt](https://www.linkedin.com/in/tony-haunschmidt/){:target="_blank"}

[My GitHub Profile and Other Projects](https://github.com/tonyhaunschmidt){:target="_blank"}