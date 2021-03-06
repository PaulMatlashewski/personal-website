import * as React from 'react'
import { Link } from 'gatsby'
import {
  navbar,
  navbarText,
  navbarItem,
  navbarLinks
} from './navbar.module.css'

const Navbar = () => {
  return (
    <div className={navbar}>
      <div className={navbarItem}>
        <Link to="/" className={navbarText}>Paul Matlashewski</Link>
      </div>
      <nav>
        <ul className={navbarLinks}>
          <li className={navbarItem}>
            <Link to="/projects" className={navbarText}>Projects</Link>
          </li>
          <li className={navbarItem}>
            <Link to="/about" className={navbarText}>About</Link>
          </li>
        </ul>
      </nav>
    </div>
  )
}

export default Navbar;
