import { Zap, Twitter, Github, Linkedin } from 'lucide-react'
import styles from './Footer.module.css'

const links = {
  Product: ['Features', 'Changelog', 'Roadmap', 'Pricing', 'Status'],
  Company: ['About', 'Blog', 'Careers', 'Press', 'Contact'],
  Resources: ['Documentation', 'API Reference', 'Community', 'Tutorials', 'Webinars'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy', 'GDPR'],
}

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.top}>
          <div className={styles.brand}>
            <a href="#" className={styles.logo}>
              <Zap size={20} fill="currentColor" />
              <span>Nexus</span>
            </a>
            <p className={styles.tagline}>
              The all-in-one platform for modern engineering teams.
              Build, deploy, and scale with confidence.
            </p>
            <div className={styles.socials}>
              <a href="#" className={styles.social}><Twitter size={18} /></a>
              <a href="#" className={styles.social}><Github size={18} /></a>
              <a href="#" className={styles.social}><Linkedin size={18} /></a>
            </div>
          </div>

          <div className={styles.cols}>
            {Object.entries(links).map(([group, items]) => (
              <div key={group} className={styles.col}>
                <h4 className={styles.colTitle}>{group}</h4>
                <ul className={styles.colLinks}>
                  {items.map(item => (
                    <li key={item}>
                      <a href="#" className={styles.link}>{item}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.bottom}>
          <p className={styles.copy}>© 2026 Nexus, Inc. All rights reserved.</p>
          <div className={styles.bottomLinks}>
            <a href="#" className={styles.link}>Privacy</a>
            <a href="#" className={styles.link}>Terms</a>
            <a href="#" className={styles.link}>Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
