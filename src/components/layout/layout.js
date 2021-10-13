import * as React from 'react'
import Navbar from '../navbar/navbar'
import { container, content } from './layout.module.css'

const Layout = ({ pageTitle, children }) => {
  return (
    <main className={container}>
      <Navbar />
      <title>{pageTitle}</title>
      <div className={content}>
        {children}
      </div>
    </main>
  )
}

export default Layout
