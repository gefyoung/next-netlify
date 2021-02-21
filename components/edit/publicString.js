import React, { useState } from 'react'
import ReactQuill from 'react-quill'
import { API, Auth } from 'aws-amplify'

export default function PublicString(props) {
  const [editState, setEditState] = useState()
  const [savedState, setSavedState] = useState()
  const [quillState, setQuillState] = useState(props.user.publicString)
  const [stringState, setStringState] = useState(props.user.publicString)

  const saveString = async () => {
    try {
      const userSession = await Auth.currentSession()
      const stringInit = {
        headers: { Authorization: userSession.idToken.jwtToken },
        body: {
          stringType: 'publicString',
          string: `` + quillState
        }
      }
      const savedString = await API.post(process.env.apiGateway.NAME, '/saveStrings', stringInit )
      setSavedState(true)
      setStringState(savedString.body)
    } catch (err) {
      console.log(err)
    }
  }
   
  const typingFn = (e) => {
    setQuillState(e)
    setSavedState(false)
  }
  const onCloseEdit = () => {
    setEditState(false)
    setSavedState(false)
  }

  return (
    <div className="flex flex-row bg-gray-100 my-5">
    <div className="flex flex-col mx-5 my-5">
      <h3 className='mx-5 my-5'>{props.user.Username}</h3>
    </div>
    {editState 
      ? <div>
          <ReactQuill value={quillState} onChange={typingFn}/>
          <button onClick={onCloseEdit} >close</button>
          <button onClick={saveString} >save</button>
          {savedState && <div className="">
            <div>
              saved
            </div>
        </div>}
        </div>
        
      : <div className="my-3" >
          <div>
          <div className="mx-3 my-3" dangerouslySetInnerHTML={{ __html: stringState }} ></div>
          </div>
          <div>
            <button 
              className="border-2 hover:border-black" 
              onClick={() => setEditState(true)}
            >
              edit
            </button>
          </div>
        </div>
      }
    </div>
  )
}