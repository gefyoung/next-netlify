import Link from 'next/link'
import React, { useRef, useState } from 'react'
import API from '@aws-amplify/api'
import Auth from '@aws-amplify/auth'
import { useRouter } from 'next/router'
import CustomSpinner from "../components/custom/spinner"
import '../configureAmplify'
import Navbar from '../components/navbar/navbar'
import Footer from '../components/navbar/footer'
const AccountSettings = props => {

  const oldPassRef = useRef()
  const newPassRef = useRef()

  const [hiddenOldState, setHiddenOldState] = useState(true)
  const [hiddenNewState, setHiddenNewState] = useState(true)
  const [newPassState, setNewPassState] = useState(false)
  const [yesDisable, setYesDisable] = useState(false)
  // const [serverMessageState, setServerMessageState] = useState(false)

  let history = useRouter()

  const nullCognito = {
    accessToken: { jwtToken: null },
    idToken: { jwtToken: null },
    refreshToken: { jwtToken: null }
  }
  const nullLogin = ''

  const submitNewPass = async () => {
    setNewPassState("submitting")
    try {
      const userAuth = await Auth.currentAuthenticatedUser()
      await Auth.changePassword(userAuth, oldPassRef.current.value, newPassRef.current.value)
      setNewPassState("accepted")
    } catch (err) {
      setNewPassState("denied")
      // setServerMessageState(err.message)
    }
  }
  
  const signOut = () => {
    Auth.signOut()
    history.push("/users")
  }

  const disableAccount = async () => {
    const userAuth = await Auth.currentAuthenticatedUser()
    const userPool = userAuth.pool.userPoolId
    const authToken = userAuth.signInUserSession.idToken.jwtToken
    const disableAccountInit = {
      headers: { Authorization: "" + authToken },
      body: {
        userPoolId: "" + userPool
      }
    }
    await API.post(process.env.NEXT_PUBLIC_APIGATEWAY_NAME, "/disableUserSelf", disableAccountInit)
    signOut()
  }


  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1">
      <Navbar />
        <div className="container-fluid ml-3">
        <div className="row">
        {/* <div className="ml-3 mr-3">
          <Link to="/account/billing">Billing</Link>
        </div> */}
        <div >
          <Link href="/account">
            <a>Account settings</a>
            </Link>
        </div>
      </div>
        <h5 className="mt-3">Change Password</h5>
        <div className="mt-2">
        Old Password
        <div className="row container-fluid">
         
          <input 
            type={ hiddenOldState ? "password" : "text" } 
            
            ref={oldPassRef}/>
          <div 
            className="ml-1" 
            style={{cursor: "pointer"}} 
            onClick={() => setHiddenOldState(!hiddenOldState)}>
            {(hiddenOldState) ? 'show' : 'hide' }
          </div>
        </div>
        </div>
        <div className="mt-3">
        New Password
        <div className="row container-fluid">
          
          <input 
            type={ hiddenNewState ? "password" : "text" } 
            
            ref={newPassRef}/>
          <div 
            className="ml-1" 
            style={{cursor: "pointer"}} 
            onClick={() => setHiddenNewState(!hiddenNewState)}>
           {(hiddenNewState) ? 'show' : 'hide' }
          </div>
        </div>
        </div>

        <div className="row container-fluid mt-2">
          <button onClick={submitNewPass} >submit</button>
          {newPassState === "submitting" ? <CustomSpinner /> : 
            newPassState === "accepted" ? ' ✔️' : 
            newPassState === "denied" ? ' ❌' : false}    
        </div>

      <div className="mt-5">
        <h5>Sign Out</h5>
        <button
          type="button"
          onClick={signOut}
        >Sign Out
        </button>
      </div>
      <div>
      <div className="mt-5">
        <h5>Disable Account</h5>
        </div>
      <button onClick={() => setYesDisable(!yesDisable)} >Disable Account</button>
      {yesDisable && 
        <div>Are you sure? To re-enable, email geoff@talktree.me
          <div>
            <button className="mr-3" onClick={disableAccount}>yes</button>
            <button onClick={() => setYesDisable(!yesDisable)}>no</button>
          </div>
        </div>}
      </div>
      </div>
      </div>
      <Footer />
      
    </div>
  )
}

export default AccountSettings