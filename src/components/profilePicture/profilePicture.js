import * as React from 'react'
import { StaticImage } from 'gatsby-plugin-image'
import { picture } from './profilePicture.module.css'

const ProfilePicture = () => (
  <StaticImage
    className={picture}
    alt="Paul Matlashewski"
    src="../../images/profile_picture.png"
  />
)

export default ProfilePicture
