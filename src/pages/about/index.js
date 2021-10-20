import * as React from 'react'
import Layout from '../../components/layout/layout'
import { aboutCard, title } from './about.module.css'

const AboutPage = () => {
  return (
    <Layout pageTitle="About Paul">
      <div className={aboutCard}>
        <h1 className={title}>About Paul Matlashewski</h1>
        <p>
          I'm a M.Sc. student in geophysics at The University of British Columbia. I like writing code to solve challenging problems.
        </p>
        <p>
          <a style={{color: '#2196f3'}} href='https://drive.google.com/file/d/1QrDPpv6y1RpTYb5y7MfjFBmHxqneIL7W/view?usp=sharing' target="_blank">
            My Resume
          </a>
        </p>
      </div>
    </Layout>
  )
}

export default AboutPage
