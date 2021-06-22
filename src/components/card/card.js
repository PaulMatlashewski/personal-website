import * as React from 'react'
import {
  card,
  container,
  buttonList,
  cardButton,
  cardHorizontalRule,
} from './card.module.css'

const Card = ({ children }) => {
  return (
    <div className={card}>
      <div className={container}>
        {children}
        <hr className={cardHorizontalRule} />
        <div className={buttonList}>
          <button className={cardButton}><b>DEMO</b></button>
          <button className={cardButton}><b>BLOG</b></button>
        </div>
      </div>
    </div>
  )
}

export default Card;
