import React, { useState, useEffect } from 'react'
import API from '@aws-amplify/api'
import Auth from '@aws-amplify/auth'
import '../../configureAmplify'
// import {loadStripe} from '@stripe/stripe-js'
import Image from 'next/image'

// const stripePromise = loadStripe(process.env.STRIPE_KEY)

export default function Onboard() {
  const [onboardingLinkState, setOnboardingLinkState] = useState()


  const getOnboardLink = async () => {
    try {
      const authSession = await Auth.currentAuthenticatedUser()
      const userSession = authSession.signInUserSession
      const params = { headers: { Authorization: userSession.idToken.jwtToken } }
      const { status, body } = await API.get(process.env.NEXT_PUBLIC_APIGATEWAY_NAME, '/onboard', params)
      setOnboardingLinkState(body.url)
    } catch (err) {
      console.log(err)
    }
  }

  useEffect(() => {
    getOnboardLink()
  }, [])

  return (
    <div>{onboardingLinkState && 
      <a href={onboardingLinkState}>
      <Image alt="connect with stripe" src='/light-on-light.png' width={190} height={33} />
      </a>
      // <div>onboard button</div>
      }</div>
  )
}