import React from 'react'
import styles from '../styles/game.module.css'

interface ButtonProps {
  onClick: () => void
  text: string
}

export default function Button({ onClick, text }: ButtonProps) {
  return (
    <button className={styles.btn} onClick={onClick}>
      {text}
    </button>
  )
}
