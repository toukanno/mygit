import { ArrowRight, Play } from 'lucide-react'
import styles from './Hero.module.css'

export default function Hero() {
  return (
    <section className={styles.hero}>
      {/* Background orbs */}
      <div className={styles.orbPurple} />
      <div className={styles.orbPink} />
      <div className={styles.grid} />

      <div className={`container ${styles.inner}`}>
        <div className={styles.badge}>
          <span className={styles.dot} />
          New: AI-powered workflows are here
          <ArrowRight size={14} />
        </div>

        <h1 className={styles.title}>
          Build faster.<br />
          Ship <span className="gradient-text">smarter.</span><br />
          Scale infinitely.
        </h1>

        <p className={styles.subtitle}>
          Nexus is the all-in-one platform for modern teams. Collaborate, automate,
          and deploy with confidence — all from a single, beautiful interface.
        </p>

        <div className={styles.actions}>
          <a href="#" className="btn-primary">
            Start for free <ArrowRight size={16} />
          </a>
          <button className={styles.playBtn}>
            <span className={styles.playIcon}><Play size={14} fill="currentColor" /></span>
            Watch demo
          </button>
        </div>

        <div className={styles.stats}>
          {[
            { value: '50K+', label: 'Active teams' },
            { value: '99.9%', label: 'Uptime SLA' },
            { value: '4.9★', label: 'User rating' },
          ].map(s => (
            <div key={s.label} className={styles.stat}>
              <span className={styles.statValue}>{s.value}</span>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        <div className={styles.preview}>
          <div className={styles.previewBar}>
            <span /><span /><span />
          </div>
          <div className={styles.previewContent}>
            <div className={styles.previewSidebar}>
              {['Dashboard', 'Projects', 'Team', 'Analytics', 'Settings'].map(item => (
                <div key={item} className={styles.previewItem}>{item}</div>
              ))}
            </div>
            <div className={styles.previewMain}>
              <div className={styles.previewCard}>
                <div className={styles.previewCardHead} />
                <div className={styles.previewCardBody}>
                  <div className={styles.bar} style={{ width: '80%' }} />
                  <div className={styles.bar} style={{ width: '60%' }} />
                  <div className={styles.bar} style={{ width: '90%' }} />
                </div>
              </div>
              <div className={styles.previewGrid}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className={styles.previewMini} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
