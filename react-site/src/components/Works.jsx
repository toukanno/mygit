import { useState } from 'react'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import styles from './Works.module.css'

const steps = [
  {
    num: '01',
    title: 'Connect your tools',
    desc: 'Integrate with 200+ tools in minutes. GitHub, Slack, Figma, Jira — everything your team already uses.',
    points: ['One-click integrations', 'Auto-sync in real-time', 'No code required'],
  },
  {
    num: '02',
    title: 'Automate your workflow',
    desc: 'Set up powerful automations that handle repetitive tasks, so your team can focus on high-impact work.',
    points: ['Visual workflow builder', 'Conditional logic & branching', '1000+ automation templates'],
  },
  {
    num: '03',
    title: 'Ship with confidence',
    desc: 'Deploy reliably with built-in monitoring, rollbacks, and real-time alerts to keep everything running smoothly.',
    points: ['One-click deployments', 'Instant rollbacks', 'Real-time monitoring'],
  },
]

export default function Works() {
  const [active, setActive] = useState(0)

  return (
    <section id="works" className={styles.works}>
      <div className="container">
        <div className={styles.header}>
          <div className="section-tag">How it works</div>
          <h2 className="section-title">
            Up and running in<br />
            <span className="gradient-text">three simple steps</span>
          </h2>
        </div>

        <div className={styles.layout}>
          <div className={styles.steps}>
            {steps.map((s, i) => (
              <div
                key={s.num}
                className={`${styles.step} ${active === i ? styles.active : ''}`}
                onClick={() => setActive(i)}
              >
                <div className={styles.stepNum}>{s.num}</div>
                <div className={styles.stepBody}>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepDesc}>{s.desc}</p>
                  {active === i && (
                    <ul className={styles.points}>
                      {s.points.map(p => (
                        <li key={p}>
                          <CheckCircle2 size={15} />
                          {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <ArrowRight size={18} className={styles.arrow} />
              </div>
            ))}
          </div>

          <div className={styles.visual}>
            <div className={styles.visualOrb} />
            <div className={styles.visualCard}>
              <div className={styles.visualNum}>{steps[active].num}</div>
              <h3 className={styles.visualTitle}>{steps[active].title}</h3>
              <div className={styles.visualBars}>
                {[90, 65, 80, 45, 70].map((w, i) => (
                  <div key={i} className={styles.visualBarRow}>
                    <div className={styles.visualBar} style={{ width: `${w}%` }} />
                  </div>
                ))}
              </div>
              <div className={styles.visualDots}>
                {steps.map((_, i) => (
                  <div key={i} className={`${styles.dot} ${active === i ? styles.dotActive : ''}`} onClick={() => setActive(i)} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
