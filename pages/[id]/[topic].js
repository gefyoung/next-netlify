import React, { useEffect, useState }  from 'react'
import Amplify, { API, Auth } from 'aws-amplify'
import Link from 'next/link'
import { useRouter } from 'next/router'
import Head from 'next/head'
import '../../configureAmplify'
import NavbarComp from '../../components/navbar/navbar'
import UserComp from '../../components/[id]/userComp'
import KeyToImage from '../../components/custom/keyToImage'

export default function Topic( { user, topic } ) {
  const router = useRouter()
  if (router.isFallback) {
    return (
      <div>
        the page is being created, try refreshing the page
      </div>
    )
  } 
    const [stringState, setStringState] = useState('')
    
    useEffect(() => {
      (async () => setStringState( await KeyToImage(topic.string)))()
    }, [topic])
  
    return (
      <>
        <Head>
          <title>{topic.topic}</title>
          <meta name="description" content={topic.description} />
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        </Head>
        <NavbarComp />
        <UserComp user={user} />
        <div className="mx-5">
          <div className="flex justify-center">
            <div className="my-5 prose bg-gray-100" dangerouslySetInnerHTML={{ __html: stringState }} ></div>
          </div>
        </div>
      </>
    )
}

export async function getStaticPaths() {
  const getAllUsersRes = await API.get(process.env.apiGateway.NAME, "/getAllUsers")
  const paths = []
  getAllUsersRes.body.Items.map(user => { 
      if (user.topics) { Object.keys(user.topics.M).map((topic) => {
        paths.push({ params: { id: user.Username.S, topic: topic }})
    }) } else {
      paths.push({ params: { id: user.Username.S, topic: "" }})
    }
  })
  
  return {
    paths,
    fallback: true
  }
}

export async function getStaticProps({ params }) {
  let user
  let topic
  const getAllUsersRes = await API.get(process.env.apiGateway.NAME, "/getAllUsers")
  getAllUsersRes.body.Items.forEach((userRes) => {
    const TAVS = []
    userRes.deviceInput.M.text.BOOL && TAVS.push("📝")
    userRes.deviceInput.M.audio.BOOL && TAVS.push("📞")
    userRes.deviceInput.M.video.BOOL && TAVS.push("📹")
    userRes.deviceInput.M.screen.BOOL && TAVS.push("💻")
    if (userRes.Username.S === params.id) {
      user = {
        Username: userRes.Username.S,
        active: userRes.active.BOOL,
        busy: userRes.busy.BOOL,
        folders: userRes.folders?.SS || [],
        TAVS: TAVS,
        ppm: userRes.ppm.N,
        ratingAv: userRes.ratingAv?.S || null,
        publicString: userRes.publicString?.S || null,
        topics: userRes.topics?.M || null,
      }

      for (const key in user.topics) {
        if (key === params.topic) {
          const h2Index = user.topics[key].S.indexOf('<h2>')
          const h2IndexEnd = user.topics[key].S.indexOf('</h2>', h2Index)
          const h2Description = user.topics[key].S.slice(h2Index + 4, h2IndexEnd)

          topic = { topic: key, string: user.topics[key].S, description: h2Description }
        }
    }    
  }})

  return { 
    props: { user: user, topic: topic },
    revalidate: 1
  }
}