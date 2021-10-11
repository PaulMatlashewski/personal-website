import * as React from 'react'
import ProfilePicture from '../profilePicture/profilePicture'
import { StaticImage } from 'gatsby-plugin-image'
import { profile, profileCard, title, links, link } from './profile.module.css'

const Profile = () => (
  <div className={profile}>
    <div className={profileCard}>
      <ProfilePicture/>
      <h1 className={title}>Paul Matlashewski</h1>
      <h3>Geophysics M.Sc. Student & Programmer</h3>
      <div className={links}>
        <a className={link} href="https://github.com/PaulMatlashewski">
          <StaticImage
            src="../../images/GitHub-Mark-Light-32px.png"
            alt="Github"
          />
        </a>
        <a className={link} href="https://linkedin.com/in/pmatlashewski">
          <StaticImage
            src="../../images/linkedin_logo_white.png"
            alt="LinkedIn"
          />
        </a>
      </div>
    </div>
  </div>
  
)

export default Profile
