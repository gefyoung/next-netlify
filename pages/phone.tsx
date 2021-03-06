import React, { useEffect, useRef, useState } from 'react'
import API from '@aws-amplify/api'
import Auth from '@aws-amplify/auth'
import '../configureAmplify'
import dynamic from "next/dynamic"
import urlBase64ToUint8Array from '../components/custom/url64to8array'
import Footer from '../components/navbar/footer'
import Navbar from '../components/navbar/navbar'
import Head from 'next/head'
const MessageInitOT = dynamic(() => import('../components/receiver/messageOtReceiver'), { ssr: false })

const Phone = () => {
  const [state, setState] = useState({
    pageState: 'waiting',
    // prevMessages: [],
    otToken: {
      Receiver: null,
      apikey: null,
      caller: null,
      deviceInput: null,
      sessionId: null,
      token: null
    }
  })
  const prevMessageRef = useRef('')

  const checkForCalls = async () => {
    try {
      const userSession = await Auth.currentSession()
      const authHeader = { headers: { Authorization: userSession.getIdToken().getJwtToken() } }

      const registration = await navigator.serviceWorker.ready
      if (Notification.permission !== "granted") {
        Notification.requestPermission()
      }
      try {
        /* get existing subscription */
        const subscription = await registration.pushManager.getSubscription()
        /* duplicated code in catch */
        const subEndpoint = subscription.endpoint
        const newSubscription = JSON.parse(JSON.stringify(subscription))
        let myInit = {
          headers: { Authorization: userSession.getIdToken().getJwtToken() },
          body: {
            endpoint: subEndpoint,
            auth: newSubscription.keys.auth,
            p256dh: newSubscription.keys.p256dh,
            phoneToken: 'null'
          }
        }
        await API.post(process.env.NEXT_PUBLIC_APIGATEWAY_NAME, "/register", myInit)
      } catch (err) {
        /* if subscription doesn't exist */
        const response = await API.get(process.env.NEXT_PUBLIC_APIGATEWAY_NAME, "/register", {
          headers: { Authorization: userSession.getIdToken().getJwtToken() }
        })
        console.log('getVapid', response)
        const vapidPublicKey2 = "" + response;
        const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey2)
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        })
        /* duplicate code in try */
        const subEndpoint = subscription.endpoint
        const newSubscription = JSON.parse(JSON.stringify(subscription))
        let myInit = {
          headers: { Authorization: userSession.getIdToken().getJwtToken() },
          body: {
            endpoint: subEndpoint,
            auth: newSubscription.keys.auth,
            p256dh: newSubscription.keys.p256dh,
            phoneToken: 'null'
          }
        }
        await API.post(process.env.NEXT_PUBLIC_APIGATEWAY_NAME, "/register", myInit)
      }

      const otSession = await API.get(process.env.NEXT_PUBLIC_APIGATEWAY_NAME, "/tokbox", authHeader)
      setState({
        ...state,
        otToken: {
          Receiver: otSession.body.Item.Receiver.S,
          apikey: otSession.body.Item.apikey.S,
          caller: otSession.body.Item.caller.S,
          deviceInput: otSession.body.Item.deviceInput.S,
          sessionId: otSession.body.Item.sessionId.S !== 'null' ? otSession.body.Item.sessionId.S : null,
          token: otSession.body.Item.token.S
        }
      })
      // audio.load()
    } catch (err) {
      err === 'No current user' ? setState({ ...state, pageState: 'no auth' }) : console.log("phoneErr", err)
    }
  }

  const messageListener = async () => {
    navigator.serviceWorker.addEventListener("message", async (event) => {
      if (event.data.message === "sessionCreated") {
        try {
          const userSession = await Auth.currentSession()
          const authHeader = { headers: { Authorization: userSession.getIdToken().getJwtToken() } }
          const otSession = await API.get(process.env.NEXT_PUBLIC_APIGATEWAY_NAME, "/tokbox", authHeader)
          setState({
            ...state,
            otToken: {
              Receiver: otSession.body.Item.Receiver.S,
              apikey: otSession.body.Item.apikey.S,
              caller: otSession.body.Item.caller.S,
              deviceInput: otSession.body.Item.deviceInput.S,
              sessionId: otSession.body.Item.sessionId.S,
              token: otSession.body.Item.token.S
            }
          })
        } catch (err) {
          console.log(err)
        }

      } else if (event.data.message === "callDisconnected") {
        console.log('call disconnected from push')
        setState({
          ...state,
          pageState: 'disconnected',
          otToken: {
            Receiver: null,
            apikey: null,
            caller: null,
            deviceInput: null,
            sessionId: null,
            token: null
          }
        })
      } else {
        /* not using state refresh because that messes with accept/decline state */
        prevMessageRef.current = prevMessageRef.current + `them: ${event.data.message} \n`
      }
    })
  }

  const acceptCall = async () => {
    try {
      setState({ ...state, pageState: 'accepted' })
      const userSession = await Auth.currentSession()
      const authHeader = { headers: { Authorization: userSession.getIdToken().getJwtToken() } }
      const getOTsession = await API.get(process.env.NEXT_PUBLIC_APIGATEWAY_NAME, "/tokbox", authHeader)
      /* check to see if the caller didn't disconnect, if they didn't use the already existing OT state */
      if (getOTsession.body.Item.sessionId.S === 'null') {
        setState({
          ...state,
          pageState: 'disconnected',
          otToken: {
            Receiver: null,
            apikey: null,
            caller: null,
            deviceInput: null,
            sessionId: null,
            token: null
          }
        })
      }
    } catch (err) {
      console.log("acceptCall err: ", err)
    }
  }

  const declineCall = async () => {
    const authenticatedUser = await Auth.currentAuthenticatedUser()
    navigator.sendBeacon(
      process.env.NEXT_PUBLIC_APIGATEWAY_URL +
      "/disconnectCall" +
      "?receiver=" + authenticatedUser.username +
      "&sessionId=" + null
    )
    setState({
      ...state,
      pageState: 'waiting',
      otToken: {
        Receiver: null,
        apikey: null,
        caller: null,
        deviceInput: null,
        sessionId: null,
        token: null
      }
    })
  }

  useEffect(() => {
    checkForCalls()
    messageListener()
  }, [])

  const AcceptDecline = () => {
    return (
      <div className="container">
        <div className="mt-5 row justify-content-center">
          <button onClick={() => acceptCall()}>Accept Call</button>
        </div>
        <div className="mt-5 row justify-content-center">
          <button onClick={() => declineCall()}>Decline Call</button>
        </div>
      </div>
    )
  }

  return (
    <>
      <Head>
        <script src="https://static.opentok.com/v2.20.1/js/opentok.min.js"></script>
      </Head>
      <div className="flex flex-col min-h-screen">
        <div className="flex-1">
          <Navbar />
          <div className="mx-5 my-5">
            {state.pageState === 'waiting' && state.otToken.sessionId
              ? <AcceptDecline />
              : state.pageState === 'accepted'
                ? <div><MessageInitOT
                  prevMessages={prevMessageRef.current}
                  tokenData={state.otToken}
                // allowedDevices={state.TAVS}
                /></div>
                : state.pageState === 'disconnected'
                  ? <div>caller disconnected, waiting</div>
                  : state.pageState === "no auth"
                    ? <div>You need to be logged in</div>
                    : <div>
                      <div className="text-lg font-medium">Waiting on calls</div>
                      <div className="mt-5 max-w-prose">You'll be e-mailed a link to open this phone when someone is trying to call you;
                        you can receive notifications, and do not need this tab open; accept or decline the call after alerted</div>
                      <div>
                      </div>
                    </div>}
          </div>
        </div>
        <Footer />

      </div>
    </>
  )
}

export default Phone