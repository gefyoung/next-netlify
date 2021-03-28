import Head from 'next/head'
import { useRouter } from 'next/router'
import  Link from 'next/link'
import NavbarComp from '../components/navbar/navbar'
import SplashComp from '../components/index/splash'

export default function Home() {
  
  return (
    <div className="container">
      <Head>
        <title>Talktree</title>
        <link rel="icon" href="/favicon.png" />
      </Head>

      <main>
        <NavbarComp />
        <SplashComp />
        {/* <Header title="hello" /> */}
        {/* <p className="description" onClick={goToUsers}>
          See all users here
        </p> */}       
      </main>
    </div>
  )
}
