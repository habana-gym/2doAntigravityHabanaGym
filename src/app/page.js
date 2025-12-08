'use client';

import Link from 'next/link';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

export default function LandingPage() {
  return (
    <div className={styles.container}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          HABANA<span>GYM</span>
        </div>
        <div className={styles.navLinks}>
          <Link href="#features">Características</Link>
          <Link href="#contact">Contacto</Link>
          <Link href="/dashboard">
            <Button variant="primary">Iniciar Sesión</Button>
          </Link>
        </div>
      </nav>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Transforma tu <span className="text-primary">Cuerpo</span>,<br />
              Domina tu <span className="text-primary">Mente</span>
            </h1>
            <p className={styles.heroText}>
              La solución completa para la gestión de tu entrenamiento y progreso.
              Tecnología avanzada para resultados reales.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/dashboard">
                <Button variant="primary" className={styles.ctaBtn}>Comenzar Ahora</Button>
              </Link>
              <Button variant="secondary" className={styles.ctaBtn}>Descargar App</Button>
            </div>
          </div>
          <div className={styles.heroImage}>
            {/* Placeholder for hero image */}
            <div className={styles.imagePlaceholder}>
              <div className={styles.circle}></div>
            </div>
          </div>
        </section>

        <section id="features" className={styles.features}>
          <h2 className={styles.sectionTitle}>¿Por qué Habana GYM?</h2>
          <div className={styles.featureGrid}>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>💪</div>
              <h3>Entrenamientos</h3>
              <p>Planes personalizados y seguimiento detallado de tu progreso.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📊</div>
              <h3>Estadísticas</h3>
              <p>Visualiza tu evolución con gráficos y reportes avanzados.</p>
            </div>
            <div className={styles.featureCard}>
              <div className={styles.featureIcon}>📱</div>
              <h3>App Móvil</h3>
              <p>Lleva tu gimnasio contigo. Acceso total desde tu smartphone.</p>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <p>© 2025 Habana GYM. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
