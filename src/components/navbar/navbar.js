import * as React from 'react'
import { Link } from 'gatsby'
import {
  navbar,
  navbarText,
  navbarItem,
  navbarLinks } from './navbar.module.css'

const Navbar = () => {
  return (
    <div className={navbar}>
      <div className={navbarItem}>
        <span className={navbarText}>Paul Matlashewski</span>
      </div>
      <nav>
        <ul className={navbarLinks}>
          <li className={navbarItem}>
            <Link to="/" className={navbarText}>Home Page</Link>
          </li>
          <li className={navbarItem}>
            <Link to="/about" className={navbarText}>About</Link>
          </li>
          <li className={navbarItem}>
            <Link to="/blog" className={navbarText}>Blog</Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Navbar;