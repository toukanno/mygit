import { Star } from 'lucide-react'
import styles from './Testimonials.module.css'

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CTO at Vercel',
    avatar: 'SC',
    color: '#6c63ff',
    text: "Nexus completely transformed how our engineering team ships products. We've cut our deployment time by 70% and our team loves using it every day.",
  },
  {
    name: 'Marcus Rodriguez',
    role: 'Head of Eng at Stripe',
    avatar: 'MR',
    color: '#ff6584',
    text: "The security features alone made the switch worth it. SOC 2 compliance, granular RBAC, audit logs — everything we needed without the complexity.",
  },
  {
    name: 'Yuki Tanaka',
    role: 'VP Engineering at Linear',
    avatar: 'YT',
    color: '#43e97b',
    text: "I've tried every project management tool out there. Nexus is the first one our entire team actually enjoys using. The UX is just extraordinary.",
  },
  {
    name: 'Priya Nair',
    role: 'Engineering Lead at Figma',
    avatar: 'PN',
    color: '#f7971e',
    text: "The analytics dashboard gives us insights we've never had before. We caught a performance regression before our users even noticed. Game changer.",
  },
  {
    name: 'Alex Kim',
    role: 'Founder at Notion',
    avatar: 'AK',
    color: '#4facfe',
    text: "Nexus integrations are unmatched. It connects with all our existing tools seamlessly, no manual configuration needed. Setup took 20 minutes.",
  },
  {
    name: 'Emma Wilson',
    role: 'CTO at Loom',
    avatar: 'EW',
    color: '#a18cd1',
    text: "Our team went from 3 deployments a week to 30+. The automation capabilities are incredibly powerful yet simple enough that everyone can use them.",
  },
]

function Stars() {
  return (
    <div className={styles.stars}>
      {[...Array(5)].map((_, i) => (
        <Star key={i} size={14} fill="#f7971e" color="#f7971e" />
      ))}
    </div>
  )
}

export default function Testimonials() {
  return (
    <section id="testimonials" className={styles.testimonials}>
      <div className="container">
        <div className={styles.header}>
          <div className="section-tag">Testimonials</div>
          <h2 className="section-title">
            Loved by <span className="gradient-text">50,000+ teams</span>
          </h2>
          <p className="section-subtitle">
            Join the teams at top companies who've made Nexus their go-to platform.
          </p>
        </div>

        <div className={styles.grid}>
          {testimonials.map(t => (
            <div key={t.name} className={`card ${styles.card}`}>
              <Stars />
              <p className={styles.text}>"{t.text}"</p>
              <div className={styles.author}>
                <div className={styles.avatar} style={{ '--c': t.color }}>
                  {t.avatar}
                </div>
                <div>
                  <div className={styles.name}>{t.name}</div>
                  <div className={styles.role}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
