import Sidebar from '@/components/layout/Sidebar';
import styles from './layout.module.css';

export default function AuthenticatedLayout({ children }) {
    return (
        <div className={styles.container}>
            <Sidebar />
            <main className={styles.main}>
                {children}
            </main>
        </div>
    );
}
