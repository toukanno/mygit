import { ArrowRight, Sparkles } from 'lucide-react'
import styles from './CTA.module.css'

export default function CTA() {
  return (
    <section className={styles.cta}>
      <div className="container">
        <div className={styles.card}>
          <div className={styles.orbLeft} />
          <div className={styles.orbRight} />

          <div className={styles.inner}>
            <div className={styles.icon}>
              <Sparkles size={28} />
            </div>
            <h2 className={styles.title}>
              Start building today.<br />
              <span className="gradient-text">First 14 days free.</span>
            </h2>
            <p className={styles.subtitle}>
              No credit card required. Set up in minutes. Cancel anytime.
              Join 50,000+ teams already using Nexus.
            </p>
            <div className={styles.actions}>
              <a href="#" className="btn-primary" style={{ fontSize: '16px', padding: '16px 32px' }}>
                Get started for free <ArrowRight size={18} />
              </a>
              <a href="#" className="btn-secondary" style={{ fontSize: '16px', padding: '16px 32px' }}>
                Talk to sales
              </a>
            </div>
            <p className={styles.note}>
              ✓ SOC 2 compliant &nbsp;·&nbsp; ✓ 99.9% uptime SLA &nbsp;·&nbsp; ✓ 24/7 support
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
