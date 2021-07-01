import * as React from 'react'
import { iconButton } from './iconButton.module.css'

const IconButton = ({ onClick, children }) => {
  return (
    <button className={iconButton} onClick={onClick}>
      {children}
    </button>
  )
}

export default IconButton;
