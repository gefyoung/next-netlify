import React from 'react'
import API from '@aws-amplify/api'
import Auth from '@aws-amplify/auth'
import '../../configureAmplify'
import PPM from './ppm'

export default function TAVS(props) {
  const tavsState = props.tavsState
  const setTavsState = (e) => props.setTavsState(e)
  const userState = props.userState
  const getUserData = () => props.getUserData()

  const deviceInputs = ['text', 'audio', 'video', 'screen']

  const handleCheckboxClick = async (tavProp) => {
    setTavsState({...tavsState, [tavProp.TAVS]: !tavsState[tavProp.TAVS]})
    try {
      const userSession = await Auth.currentSession()
      let myInit = {
        headers: { Authorization: userSession.idToken.jwtToken },
        body: { deviceName: tavProp.TAVS, deviceBool: !tavsState[tavProp.TAVS] },
      }
      await API.post(process.env.NEXT_PUBLIC_APIGATEWAY_NAME, "/users/devices", myInit)
      props.getUserData()
    } catch (err) {
      console.log(err)
    }
  }

  const CustomCheckbox = (CCprops) => (
    <div
      className="ml-3"
      style={{ cursor: "pointer" }}
      onClick={() => handleCheckboxClick(CCprops)}
    >
      <input 
        className="mr-1"
        onChange={null}
        style={{ cursor: "pointer" }}
        type="checkbox" 
        defaultChecked={tavsState[CCprops.TAVS]} 
        name={CCprops.TAVS}
        value="hello"
      />
      {CCprops.TAVS}
    </div>
  );

  return (
    <div>
      <button onClick={() => setTavsState({...tavsState, editing: !tavsState.editing})}>settings</button>
      {tavsState.editing 
        && <div>
          {deviceInputs.map((device) => <CustomCheckbox key={device} TAVS={device} />)}
          < PPM getUserData={getUserData} userState={userState} />
        </div>}
    </div>
    
  )
}