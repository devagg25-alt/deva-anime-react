// Footer.jsx
import { Link } from 'react-router-dom'
import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.links}>
        <Link to="/">Home</Link>
        <Link to="/contact">Contact</Link>
      </div>
      <p>© 2026 <span>DevaAnime</span>. All rights reserved.</p>
    </footer>
  )
}

