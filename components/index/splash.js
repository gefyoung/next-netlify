import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function SplashPage() {
  // const loader = () => {
  //   return "https://d1pvyp5tr4e89i.cloudfront.net/eyJidWNrZXQiOiJ0YWxrdHJlZWltYWdlc3B1YmxpYyIsImtleSI6IjJfMS5qcGciLCJlZGl0cyI6eyJyZXNpemUiOnsid2lkdGgiOjEwMjQsImhlaWdodCI6NzY4LCJmaXQiOiJjb3ZlciJ9fX0="
  // }

  return (
    <div className="mx-5 my-5">
      <h1 className="mx-5 my-4 mt-10">create a page, write stuff</h1>
      <h1 className="mx-5 my-4">get found on google</h1>
      <h1 className="mx-5 my-4 mb-10">make money maybe</h1>
      <Link className="mx-5 my-5" href="/6779991/How-to-upload-images-to-S3-using-Quill,-React,-Next,-and-Amp">
        <button>see example user</button>
      </Link>
      {/* <Image 
      loader={loader}
      src="/2_1.jpg" alt="testImage" width={1024} height={768} /> */}
    </div>
    


  )
}