import { Zap, Shield, BarChart3, Users, Globe, Lock } from 'lucide-react'
import styles from './Features.module.css'

const features = [
  {
    icon: <Zap size={24} />,
    title: 'Blazing fast performance',
    desc: 'Optimized infrastructure that scales with your team. Deploy in seconds, not hours.',
    color: '#6c63ff',
  },
  {
    icon: <Shield size={24} />,
    title: 'Enterprise-grade security',
    desc: 'SOC 2 certified with end-to-end encryption. Your data is always protected.',
    color: '#ff6584',
  },
  {
    icon: <BarChart3 size={24} />,
    title: 'Real-time analytics',
    desc: 'Deep insights into your workflow. Track KPIs and optimize team performance.',
    color: '#43e97b',
  },
  {
    icon: <Users size={24} />,
    title: 'Seamless collaboration',
    desc: 'Real-time collaboration tools built for modern distributed teams worldwide.',
    color: '#f7971e',
  },
  {
    icon: <Globe size={24} />,
    title: 'Global edge network',
    desc: '300+ edge locations worldwide. Ultra-low latency wherever your users are.',
    color: '#4facfe',
  },
  {
    icon: <Lock size={24} />,
    title: 'Granular access control',
    desc: 'Fine-grained permissions with SSO, RBAC, and audit logs built in.',
    color: '#a18cd1',
  },
]

export default function Features() {
  return (
    <section id="features" className={styles.features}>
      <div className="container">
        <div className={styles.header}>
          <div className="section-tag">Features</div>
          <h2 className="section-title">
            Everything you need to<br />
            <span className="gradient-text">build and scale</span>
          </h2>
          <p className="section-subtitle">
            Nexus brings together the tools your team needs into a single unified platform,
            so you can focus on what matters most.
          </p>
        </div>

        <div className={styles.grid}>
          {features.map(f => (
            <div key={f.title} className={`card ${styles.card}`}>
              <div className={styles.icon} style={{ '--c': f.color }}>
                {f.icon}
              </div>
              <h3 className={styles.cardTitle}>{f.title}</h3>
              <p className={styles.cardDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
