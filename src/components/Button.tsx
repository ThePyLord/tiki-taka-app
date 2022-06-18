import React from 'react'
import styles from '../styles/game.module.css'

interface Props {
  onClick: () => void
  text: string
}

export default function Button({ onClick, text }: Props) {
  return (
    <button className={styles.btn} onClick={onClick}>
      {text}
    </button>
  )
}
