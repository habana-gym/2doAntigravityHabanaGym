'use client';

import { useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import styles from './page.module.css';

export default function LandingPage() {
  const [activeTip, setActiveTip] = useState('nutrition');

  const tips = {
    nutrition: {
      title: 'Nutrición Óptima',
      items: ['Proteína en cada comida', 'Hidrátate constantemente', 'Come cada 3-4 horas', 'Frutas y verduras variadas', 'Evita alimentos procesados']
    },
    technique: {
      title: 'Técnica Perfecta',
      items: ['Controla el movimiento', 'Respira correctamente', 'Postura adecuada', 'Rango completo de movimiento', 'Peso apropiado']
    },
    mindset: {
      title: 'Fuerza Mental',
      items: ['Establece metas claras', 'Celebra pequeños logros', 'Rodéate de gente positiva', 'Visualiza tu éxito', 'Nunca te rindas']
    },
    recovery: {
      title: 'Recuperación Óptima',
      items: ['7-9 horas de sueño', 'Días de descanso activo', 'Estiramientos post-entreno', 'Hidratación adecuada', 'Manejo del estrés']
    },
    progress: {
      title: 'Progreso Constante',
      items: ['Registra tus entrenamientos', 'Aumenta peso gradualmente', 'Varía tus rutinas', 'Mide tu progreso', 'Aprende de expertos']
    }
  };

  return (
    <div className={styles.container}>
      {/* Navigation */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          HABANA<span>GYM</span>
        </div>
        <div className={styles.navLinks}>
          <Link href="#home">Inicio</Link>
          <Link href="#workouts">Entrenamientos</Link>
          <Link href="#supplements">Suplementos</Link>
          <Link href="#tips">Tips</Link>
          <Link href="/dashboard">
            <Button variant="primary">Iniciar Sesión</Button>
          </Link>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <section id="home" className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.heroTitle}>
              Transforma tu <span className={styles.highlight}>Cuerpo</span>,<br />
              Fortalece tu <span className={styles.highlight}>Mente</span>
            </h1>
            <p className={styles.heroText}>
              Donde tus límites se convierten en tu punto de partida.
              Tecnología avanzada y entrenamiento profesional para resultados reales.
            </p>
            <div className={styles.heroButtons}>
              <Link href="/dashboard">
                <Button variant="primary" className={styles.ctaBtn}>Comenzar Ahora</Button>
              </Link>
              <Button variant="secondary" className={styles.ctaBtn}>Ver Horarios</Button>
            </div>
          </div>
          <div className={styles.heroImageContainer}>
            <div className={styles.heroImagePlaceholder}>
              <div className={styles.floatingShape}></div>
            </div>
          </div>
        </section>

        {/* Workouts Section */}
        <section id="workouts" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Elige tu Desafío</h2>
            <p className={styles.sectionSubtitle}>Cada rutina está diseñada para llevarte al siguiente nivel.</p>
          </div>
          <div className={styles.grid}>
            <div className={styles.card}>
              <div className={styles.cardIcon}>💪</div>
              <h3>Fuerza y Potencia</h3>
              <p>Desarrolla músculo y fuerza con entrenamiento de pesas intensivo.</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>🏃</div>
              <h3>Cardio Intenso</h3>
              <p>Quema calorías y mejora tu resistencia cardiovascular.</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>⚡</div>
              <h3>HIIT Express</h3>
              <p>Entrenamiento de alta intensidad para resultados rápidos.</p>
            </div>
            <div className={styles.card}>
              <div className={styles.cardIcon}>🧘</div>
              <h3>Funcional Training</h3>
              <p>Mejora tu movilidad y fuerza para la vida diaria.</p>
            </div>
          </div>
        </section>

        {/* Facilities Section */}
        <section className={`${styles.section} ${styles.bgDark}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Nuestras Instalaciones</h2>
            <p className={styles.sectionSubtitle}>Espacios diseñados para tu máximo rendimiento.</p>
          </div>
          <div className={styles.facilitiesGrid}>
            <div className={styles.facilityItem}>Zona de Pesas Libres</div>
            <div className={styles.facilityItem}>Área Cardiovascular</div>
            <div className={styles.facilityItem}>Estudio Funcional</div>
            <div className={styles.facilityItem}>Zona de Estiramiento</div>
          </div>
        </section>

        {/* Supplements Section */}
        <section id="supplements" className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Suplementos Recomendados</h2>
            <p className={styles.sectionSubtitle}>Maximiza tus resultados con la nutrición adecuada.</p>
          </div>
          <div className={styles.grid}>
            <div className={styles.productCard}>
              <div className={styles.productBadge}>Popular</div>
              <h3>Proteína Whey</h3>
              <p>Construcción y reparación de músculos. Ideal post-entrenamiento.</p>
            </div>
            <div className={styles.productCard}>
              <h3>Creatina</h3>
              <p>Aumenta fuerza y volumen muscular. Mejora el rendimiento.</p>
            </div>
            <div className={styles.productCard}>
              <h3>BCAA</h3>
              <p>Aminoácidos esenciales para recuperación y energía.</p>
            </div>
            <div className={styles.productCard}>
              <h3>Pre-Workout</h3>
              <p>Energía y enfoque para entrenamientos intensos.</p>
            </div>
            <div className={styles.productCard}>
              <h3>Omega-3</h3>
              <p>Salud cardiovascular y reducción de inflamación.</p>
            </div>
            <div className={styles.productCard}>
              <h3>Multivitamínico</h3>
              <p>Nutrientes esenciales para rendimiento óptimo.</p>
            </div>
          </div>
        </section>

        {/* Tips Section */}
        <section id="tips" className={`${styles.section} ${styles.bgDark}`}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Tips Profesionales</h2>
            <p className={styles.sectionSubtitle}>Consejos de expertos para maximizar tus resultados.</p>
          </div>

          <div className={styles.tabsContainer}>
            <div className={styles.tabsList}>
              <button
                className={`${styles.tabBtn} ${activeTip === 'nutrition' ? styles.activeTab : ''}`}
                onClick={() => setActiveTip('nutrition')}
              >Nutrición</button>
              <button
                className={`${styles.tabBtn} ${activeTip === 'technique' ? styles.activeTab : ''}`}
                onClick={() => setActiveTip('technique')}
              >Técnica</button>
              <button
                className={`${styles.tabBtn} ${activeTip === 'mindset' ? styles.activeTab : ''}`}
                onClick={() => setActiveTip('mindset')}
              >Motivación</button>
              <button
                className={`${styles.tabBtn} ${activeTip === 'recovery' ? styles.activeTab : ''}`}
                onClick={() => setActiveTip('recovery')}
              >Recuperación</button>
              <button
                className={`${styles.tabBtn} ${activeTip === 'progress' ? styles.activeTab : ''}`}
                onClick={() => setActiveTip('progress')}
              >Progreso</button>
            </div>

            <div className={styles.tabContent}>
              <h3>{tips[activeTip].title}</h3>
              <ul className={styles.tipsList}>
                {tips[activeTip].items.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Offers Section */}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>¡Ofertas Especiales!</h2>
          </div>
          <div className={styles.offersGrid}>
            <div className={`${styles.offerCard} ${styles.offerPrimary}`}>
              <h3>Nuevos Clientes</h3>
              <div className={styles.offerPrice}>50% OFF</div>
              <p>En tu primera mensualidad</p>
              <ul className={styles.offerFeatures}>
                <li>+ Evaluación física gratuita</li>
              </ul>
            </div>
            <div className={styles.offerCard}>
              <h3>Plan Anual</h3>
              <div className={styles.offerPrice}>3 Meses GRATIS</div>
              <p>Al pagar el año completo</p>
              <ul className={styles.offerFeatures}>
                <li>+ Camiseta exclusiva Habana Gym</li>
              </ul>
            </div>
            <div className={styles.offerCard}>
              <h3>Programa de Referidos</h3>
              <div className={styles.offerPrice}>1 Mes GRATIS</div>
              <p>Trae un amigo</p>
              <ul className={styles.offerFeatures}>
                <li>Ambos reciben el beneficio</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerCol}>
            <h3>HABANA GYM</h3>
            <p>Donde tus límites se convierten en tu punto de partida.</p>
          </div>
          <div className={styles.footerCol}>
            <h4>Horarios</h4>
            <p>Lunes - Viernes: 5:00 AM - 11:00 PM</p>
            <p>Sábados: 6:00 AM - 10:00 PM</p>
            <p>Domingos: 7:00 AM - 8:00 PM</p>
          </div>
          <div className={styles.footerCol}>
            <h4>Contacto</h4>
            <p>📞 +1 (555) 123-4567</p>
            <p>📧 info@habanagym.com</p>
            <p>📍 Calle Principal #123, Ciudad</p>
          </div>
        </div>
        <div className={styles.copyright}>
          <p>© 2025 Habana Gym. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
}
