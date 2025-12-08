'use client';

import { useState, useRef, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/layout/PageHeader';
import { getClients, recordAttendance, getSettings } from '@/services/api';
import styles from './page.module.css';

export default function AttendancePage() {
    const [inputId, setInputId] = useState('');
    const [lastCheckin, setLastCheckin] = useState(null);
    const [error, setError] = useState(null);
    const [graceDays, setGraceDays] = useState(5); // Default
    const inputRef = useRef(null);

    // Load Settings & Focus
    useEffect(() => {
        const loadConfig = async () => {
            try {
                const settings = await getSettings();
                if (settings && settings.inactive_grace_days) {
                    setGraceDays(parseInt(settings.inactive_grace_days, 10));
                }
            } catch (err) {
                console.error("Error loading settings", err);
            }
        };
        loadConfig();

        const focusInput = () => inputRef.current?.focus();
        focusInput();
    }, []);

    const speak = (text) => {
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES'; // Spanish
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleCheckin = async (e) => {
        e.preventDefault();
        if (!inputId.trim()) return;

        const currentId = inputId;
        setInputId(''); // Clear immediately for next scan
        inputRef.current?.focus();

        try {
            // 1. Find client 
            const clients = await getClients();
            const client = clients.find(c => c.email === currentId || c.id === currentId || c.cedula === currentId || c.fingerprint_id === currentId);

            if (client) {
                const now = new Date();
                const endDate = new Date(client.end_date);
                // Reset time part for accurate day comparison
                now.setHours(0, 0, 0, 0);
                endDate.setHours(0, 0, 0, 0);

                const diffTime = now - endDate;
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                let accessGranted = false;
                let statusMessage = '';
                let audioMessage = '';

                if (client.status === 'active' && diffDays <= 0) {
                    // Active and not expired
                    accessGranted = true;
                    statusMessage = 'Bienvenido';
                    audioMessage = `Bienvenido, ${client.first_name}`;
                } else {
                    // Expired or Manual Debtor
                    if (diffDays > 0 && diffDays <= graceDays) {
                        // GRACE PERIOD
                        accessGranted = true; // Allow entry
                        statusMessage = `PERIODO DE GRACIA (Venció hace ${diffDays} días)`;
                        audioMessage = `Atención ${client.first_name}, su cuota venció. Por favor regularice.`;
                    } else if (diffDays > graceDays) {
                        // DENIED - Past Grace
                        accessGranted = false;
                        statusMessage = `VENCIDO (Hace ${diffDays} días)`;
                        audioMessage = `Acceso denegado. Cuota vencida.`;
                    } else if (client.status === 'debtor') {
                        // Manual Debtor status
                        accessGranted = false;
                        statusMessage = 'DEUDOR REGISTRADO';
                        audioMessage = 'Acceso denegado. Regularice su deuda.';
                    } else {
                        // Should be caught by first case, but fallback
                        accessGranted = true;
                        statusMessage = 'Bienvenido';
                        audioMessage = `Bienvenido ${client.first_name}`;
                    }
                }

                // 2. Record in DB
                await recordAttendance(client.id, accessGranted);

                speak(audioMessage);

                setLastCheckin({
                    firstName: client.first_name,
                    lastName: client.last_name,
                    membershipType: client.membership_type,
                    endDate: client.end_date,
                    debt: client.debt,
                    timestamp: new Date().toLocaleTimeString(),
                    accessGranted,
                    statusMessage,
                    isGracePeriod: diffDays > 0 && diffDays <= graceDays
                });
                setError(null);
            } else {
                setError('Cliente no encontrado');
                speak('Cliente no encontrado');
                setLastCheckin(null);
            }
        } catch (err) {
            console.error(err);
            setError('Error al registrar asistencia');
        }
    };

    return (
        <div className={styles.container}>
            <PageHeader
                title="Control de Asistencia"
                subtitle="Registro de ingresos y salidas"
            />

            <div className={styles.grid}>
                {/* Check-in Form */}
                <Card className={styles.checkinCard}>
                    <h2 className={styles.cardTitle}>Escáner Biométrico / ID</h2>
                    <form onSubmit={handleCheckin} className={styles.form}>
                        <input
                            ref={inputRef}
                            type="text"
                            placeholder="Esperando huella o código..."
                            className={styles.input}
                            value={inputId}
                            onChange={(e) => setInputId(e.target.value)}
                            autoFocus
                            autoComplete="off"
                        />
                        <Button type="submit" variant="primary" className={styles.submitBtn}>
                            Marcar
                        </Button>
                    </form>
                    <div className={styles.qrPlaceholder}>
                        <div className={styles.qrIcon}>👆</div>
                        <p>Coloque el dedo en el lector</p>
                    </div>
                </Card>

                {/* Status Display */}
                <div className={styles.statusDisplay}>
                    {lastCheckin && (
                        <Card className={`
                            ${styles.resultCard} 
                            ${lastCheckin.accessGranted ? (lastCheckin.isGracePeriod ? styles.accessWarning : styles.accessGranted) : styles.accessDenied}
                        `}>
                            <div className={styles.resultIcon}>
                                {lastCheckin.accessGranted ? (lastCheckin.isGracePeriod ? '⚠️' : '✅') : '⛔'}
                            </div>
                            <h2 className={styles.resultTitle}>
                                {lastCheckin.accessGranted ? 'Acceso Permitido' : 'Acceso Denegado'}
                            </h2>
                            <p className={styles.resultName}>
                                {lastCheckin.firstName} {lastCheckin.lastName}
                            </p>

                            <div className={styles.alertBox} style={{ background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                                <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>{lastCheckin.statusMessage}</p>
                                <p>Vencimiento: {new Date(lastCheckin.endDate).toLocaleDateString()}</p>
                            </div>
                        </Card>
                    )}

                    {error && (
                        <Card className={`${styles.resultCard} ${styles.errorCard}`}>
                            <div className={styles.resultIcon}>❌</div>
                            <h2 className={styles.resultTitle}>Error</h2>
                            <p>{error}</p>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
