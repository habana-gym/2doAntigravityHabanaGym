'use client';

import { useEffect, useState } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import { getClients } from '@/services/api';
import styles from './page.module.css';

export default function ClientDashboardPage() {
    const [client, setClient] = useState(null);

    useEffect(() => {
        const loadClient = async () => {
            // Simulating login by getting the first client
            const clients = await getClients();
            if (clients && clients.length > 0) {
                setClient({
                    ...clients[0],
                    firstName: clients[0].first_name,
                    lastName: clients[0].last_name,
                    plan: 'Hipertrofia Principiante', // Placeholder
                    daysLeft: 15, // Placeholder
                    nextWorkout: 'Pierna', // Placeholder
                });
            }
        };
        loadClient();
    }, []);

    if (!client) return <div className={styles.container}>Cargando...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Hola, {client.firstName} 👋</h1>
                <p className={styles.subtitle}>Vamos a entrenar</p>
            </header>

            {/* QR Code Card */}
            <Card className={styles.qrCard}>
                <div className={styles.qrCode}>
                    {/* Placeholder QR */}
                    <div className={styles.qrPlaceholder}>
                        <div className={styles.qrPattern}></div>
                    </div>
                </div>
                <p className={styles.qrText}>Tu Pase de Acceso</p>
            </Card>

            <div className={styles.statsRow}>
                <Card className={styles.statCard}>
                    <span className={styles.statValue}>{client.daysLeft}</span>
                    <span className={styles.statLabel}>Días Restantes</span>
                </Card>
                <Card className={styles.statCard}>
                    <span className={styles.statValue}>12</span>
                    <span className={styles.statLabel}>Asistencias</span>
                </Card>
            </div>

            <Card title="Tu Plan Actual" className={styles.planCard}>
                <div className={styles.planInfo}>
                    <h3>{client.plan}</h3>
                    <p>Siguiente: <strong>{client.nextWorkout}</strong></p>
                </div>
                <Button variant="primary" className={styles.startBtn}>
                    Comenzar Entrenamiento
                </Button>
            </Card>

            <div className={styles.quickActions}>
                <Button variant="secondary" className={styles.actionBtn}>Mi Progreso</Button>
                <Button variant="secondary" className={styles.actionBtn}>Perfil</Button>
            </div>
        </div>
    );
}
