import { useState } from 'react'
import { Menu, X, Zap } from 'lucide-react'
import styles from './Navbar.module.css'

const links = ['Features', 'Works', 'Testimonials', 'Pricing']

export default function Navbar({ scrolled }) {
  const [open, setOpen] = useState(false)

  return (
    <header className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
      <div className={`container ${styles.inner}`}>
        <a href="#" className={styles.logo}>
          <Zap size={20} fill="currentColor" />
          <span>Nexus</span>
        </a>

        <nav className={`${styles.nav} ${open ? styles.open : ''}`}>
          {links.map(l => (
            <a key={l} href={`#${l.toLowerCase()}`} className={styles.link} onClick={() => setOpen(false)}>
              {l}
            </a>
          ))}
        </nav>

        <div className={styles.actions}>
          <a href="#" className="btn-secondary" style={{ padding: '10px 20px', fontSize: '14px' }}>
            Log in
          </a>
          <a href="#" className="btn-primary" style={{ padding: '10px 20px', fontSize: '14px' }}>
            Get started
          </a>
        </div>

        <button className={styles.hamburger} onClick={() => setOpen(!open)}>
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
    </header>
  )
}
