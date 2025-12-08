'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Sidebar.module.css';

const menuItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📊' },
    { label: 'Clientes', href: '/clients', icon: '👥' },
    { label: 'Entrenamientos', href: '/workouts', icon: '💪' },
    { label: 'Asistencia', href: '/attendance', icon: '📅' },
    { label: 'Membresías', href: '/settings/memberships', icon: '💳' },
    { label: 'Reportes', href: '/reports', icon: '📈' },
    { label: 'Configuración', href: '/settings', icon: '⚙️' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar}>
            <div className={styles.logo}>
                <img src="/logo-main.jpg" alt="Habana Gym" style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px' }} />
            </div>

            <nav className={styles.nav}>
                {menuItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`${styles.link} ${pathname === item.href ? styles.active : ''}`}
                    >
                        <span className={styles.icon}>{item.icon}</span>
                        {item.label}
                    </Link>
                ))}
            </nav>

            <div className={styles.footer}>
                <div className={styles.user}>
                    <div className={styles.avatar}>A</div>
                    <div className={styles.userInfo}>
                        <p className={styles.userName}>Admin</p>
                        <p className={styles.userRole}>Administrador</p>
                    </div>
                </div>
            </div>
        </aside>
    );
}
