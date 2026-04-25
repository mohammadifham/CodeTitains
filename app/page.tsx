'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Bot, ChartColumn, CircleCheckBig, Cpu, Dot, Radar, ShieldCheck, Sparkles } from 'lucide-react';
import styles from './page.module.css';

const navItems = ['Home', 'Features', 'Dashboard'];

const agentCards = [
  {
    icon: Bot,
    title: 'Crisis Coordination Agent',
    description: 'Generates action plans and routes incident workflows to the right teams.',
  },
  {
    icon: Radar,
    title: 'Field Intelligence Agent',
    description: 'Tracks emerging hotspots and surfaces location-based risk signals live.',
  },
  {
    icon: ChartColumn,
    title: 'Allocation Strategy Agent',
    description: 'Balances supplies, squads, and response timelines for better outcomes.',
  },
];

const metrics = [
  { label: 'Active responders onboarded', value: '12k+' },
  { label: 'Emergency requests coordinated', value: '180k+' },
  { label: 'Average dispatch efficiency lift', value: '34%' },
  { label: 'Weekly operational consistency', value: '92%' },
];

export default function Home() {
  return (
    <div className={styles.page}>
      <div className={styles.gridOverlay}></div>

      <div className={styles.topStrip}>
        <div className={`${styles.container} ${styles.topStripInner}`}>
          <ShieldCheck size={12} />
          Built for emergency ops teams and incident command centers
        </div>
      </div>

      <header className={styles.header}>
        <div className={`${styles.container} ${styles.headerInner}`}>
          <div className={styles.brand}>
            <div className={styles.brandIcon}>
              <Sparkles size={18} />
            </div>
            <div>
              <p className={styles.brandTitle}>DISASTERHUB</p>
              <p className={styles.brandSub}>AI Incident Operations Platform</p>
            </div>
          </div>

          <nav className={styles.navPills}>
            {navItems.map((item, index) => (
              <button key={item} type="button" className={`${styles.pill} ${index === 0 ? styles.pillActive : ''}`}>
                {item}
              </button>
            ))}
          </nav>

          <div className={styles.actions}>
            <Link href="/dashboard" className={styles.ghostBtn}>
              Dashboard
            </Link>
            <Link href="/dashboard" className={styles.primaryBtn}>
              Get Started
            </Link>
          </div>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.container}>
          <section className={styles.hero}>
            <div className={styles.heroGrid}>
              <div>
                <div className={styles.tag}>
                  <ShieldCheck size={13} /> Production-ready command platform
                </div>

                <h1 className={styles.title}>Disaster Management, Built for Real Response Teams</h1>
                <p className={styles.subtitle}>
                  Coordinate incidents, allocate resources, and execute field operations with a clear command interface designed for speed and reliability.
                </p>

                <div className={styles.ctas}>
                  <Link href="/dashboard" className={styles.primaryBtn}>
                    Start Operations <ArrowRight size={16} />
                  </Link>
                  <Link href="/dashboard" className={styles.ghostBtn}>
                    View Command Dashboard
                  </Link>
                </div>

                <div className={styles.chips}>
                  <span className={`${styles.chip} ${styles.chipCyan}`}>
                    <Cpu size={13} /> AI Dispatch Engine
                  </span>
                  <span className={`${styles.chip} ${styles.chipViolet}`}>
                    <Cpu size={13} /> Mission Timeline Intelligence
                  </span>
                </div>
              </div>

              <aside className={styles.sidePanel}>
                {agentCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <article key={card.title} className={styles.agentCard}>
                      <div className={styles.agentHeader}>
                        <div className={styles.agentIcon}>
                          <Icon size={16} />
                        </div>
                        <div>
                          <h2 className={styles.agentTitle}>{card.title}</h2>
                          <p className={styles.agentDesc}>{card.description}</p>
                        </div>
                      </div>
                    </article>
                  );
                })}

                <div className={styles.pulse}>
                  <p className={styles.pulseLabel}>Mission Pulse</p>
                  <p className={styles.pulseText}>
                    <Dot size={14} /> 14 new field updates processed in the last hour
                  </p>
                </div>
              </aside>
            </div>
          </section>

          <section className={styles.metrics}>
            {metrics.map((metric) => (
              <article key={metric.label} className={styles.metricCard}>
                <p className={styles.metricLabel}>{metric.label}</p>
                <p className={styles.metricValue}>{metric.value}</p>
                <p className={styles.metricHint}>
                  <CircleCheckBig size={14} /> Verified this week
                </p>
              </article>
            ))}
          </section>

          <section className={styles.finalCta}>
            <h3 className={styles.finalTitle}>Launch Your Mission Dashboard</h3>
            <p className={styles.finalSub}>
              Start managing requests, assignments, and field updates from a unified disaster management interface.
            </p>
            <div className={styles.finalActions}>
              <Link href="/dashboard" className={styles.primaryBtn}>
                Open Dashboard <ArrowRight size={16} />
              </Link>
              <Link href="/dashboard" className={styles.ghostBtn}>
                View Demo Flow
              </Link>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
