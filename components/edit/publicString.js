import React, { useRef } from 'react'
import { API, Auth } from 'aws-amplify'
import '../../configureAmplify'
import dynamic from 'next/dynamic'
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

export default function PublicString(props) {

  const publicStringState = props.publicStringState
  const textAreaRef = useRef()
  const setPublicStringState = (e) => props.setPublicStringState(e)

  // const publicTypingFn = (e) => {
  //   setPublicStringState({...publicStringState, quill: e, saved: false})
  // }
  const onClosePublicEdit = async () => {
    try {
      const userSession = await Auth.currentAuthenticatedUser()
      const getUserInit = { headers: { Authorization: userSession.attributes.preferred_username } }
      const getAllUserRes = await API.get(process.env.apiGateway.NAME, "/users", getUserInit)
      const userResString = getAllUserRes.Item.publicString.S
      setPublicStringState({ ...publicStringState, string: userResString, editing: false, saved: false })
    } catch (err) {
      setPublicStringState({ ...publicStringState, editing: false, saved: false })
      console.log(err)
    }
  }
  const savePublicString = async () => {
    try {
      const userSession = await Auth.currentSession()
      const stringInit = {
        headers: { Authorization: userSession.idToken.jwtToken },
        body: {
          stringType: 'publicString',
          string: `` + textAreaRef.current.value
        }
      }
      const savedString = await API.post(process.env.apiGateway.NAME, '/saveStrings', stringInit)

      setPublicStringState({ ...publicStringState, string: savedString.body, saved: true })
    } catch (err) {
      console.log(err)
    }
  }

  const modules = {
    toolbar:  []
  }
  return (
    <div>
      {publicStringState.editing

        ? <div>
          <div className="mt-3">
          <textarea 
          ref={textAreaRef} 
          maxLength="160" 
          className="px-2 py-1.5 overflow-auto resize bg-gray-50">
            {publicStringState.quill}
          </textarea>
          </div>
          
          {/* <ReactQuill modules={modules} value={publicStringState.quill} onChange={publicTypingFn} /> */}
          <button className='btn' onClick={onClosePublicEdit} >close</button>
          <button onClick={savePublicString} >save</button>
          {publicStringState.saved && <div className=""><div>saved</div></div>}
        </div>

        : <div className="my-3" >
          <div>
            {publicStringState.string}
            {/* <div className="mx-3 my-3" dangerouslySetInnerHTML={{ __html: publicStringState.string }} ></div> */}
          </div>
          <div>
            <button onClick={() => setPublicStringState({ ...publicStringState, editing: true })} >
              edit
            </button>
          </div>
        </div>

      }
    </div>

  )
}