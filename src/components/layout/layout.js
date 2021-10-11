import * as React from 'react'
import { useStaticQuery, graphql } from 'gatsby'
import Navbar from '../navbar/navbar'
import {
  container
} from './layout.module.css'

const Layout = ({ pageTitle, children }) => {
  const data = useStaticQuery(graphql`
    query {
      site {
        siteMetadata {
          title
        }
      }
    }  
  `)

  return (
    <main className={container}>
      <Navbar />
      <title>{pageTitle} | {data.site.siteMetadata.title}</title>
      {/* <h1 className={heading}>{pageTitle}</h1> */}
      {children}
    </main>
  )
}

export default Layout
