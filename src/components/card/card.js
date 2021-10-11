import * as React from 'react'
import { Link } from 'gatsby'
import {
  card,
  container,
  buttonList,
  cardButton,
  cardHorizontalRule,
} from './card.module.css'

const Card = ({ children, page }) => {
  return (
    <div className={card}>
      <div className={container}>
        {children}
        <hr className={cardHorizontalRule} />
        <div className={buttonList}>
            <Link className={cardButton} to={page}>
            <b>DEMO</b>
            </Link>
        </div>
      </div>
    </div>
  )
}

export default Card;
