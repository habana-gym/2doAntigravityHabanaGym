'use client';

import { useState, useEffect, useRef } from 'react';
import { getClientByCedula, recordAttendance } from '@/services/api';
import Card from '@/components/ui/Card';
import styles from './AccessPoint.module.css'; // We'll assume a CSS module or inline styles

export default function AccessPoint() {
    const [input, setInput] = useState('');
    const [lastAccess, setLastAccess] = useState(null); // { client, status, message, daysLeft }
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);
    const timeoutRef = useRef(null);

    // Focus input automatically to capture scanner
    useEffect(() => {
        const focusInterval = setInterval(() => {
            if (inputRef.current && document.activeElement !== inputRef.current) {
                // Optional: Only create friction if we really want dedicated kiosk mode
                // inputRef.current.focus(); 
            }
        }, 2000);
        return () => clearInterval(focusInterval);
    }, []);

    const processAccess = async (identifier) => {
        if (!identifier) return;
        setLoading(true);
        setLastAccess(null); // Clear previous

        try {
            const client = await getClientByCedula(identifier);

            if (!client) {
                setLastAccess({
                    status: 'error',
                    message: 'Cliente no encontrado',
                    client: null
                });
                playSound('error');
                return;
            }

            // Logic for access
            const now = new Date();
            const endDate = new Date(client.end_date);
            const daysLeft = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));

            let status = 'success';
            let message = '¡Bienvenido!';
            let accessGranted = true;

            if (client.status === 'debtor' || client.debt > 0) {
                status = 'warning'; // Allow entry but warn, or denied? User logic: "ver ventanita"
                message = 'ALERTA: Cliente con DEUDA';
                accessGranted = true; // Let's record as granted but warn
                playSound('warning');
            } else if (daysLeft < 0) {
                status = 'danger';
                message = 'MEMBRESÍA VENCIDA';
                accessGranted = false;
                playSound('denied');
            } else if (daysLeft <= 3) {
                status = 'warning';
                message = `Vence pronto (${daysLeft} días)`;
                playSound('warning');
            } else {
                playSound('success');
            }

            // Record attendance
            await recordAttendance(client.id, accessGranted);

            setLastAccess({
                client,
                status,
                message,
                daysLeft,
                accessGranted
            });

            // Auto-clear after 5 seconds
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                setLastAccess(null);
                setInput('');
                inputRef.current?.focus();
            }, 5000);

        } catch (error) {
            console.error(error);
            setLastAccess({ status: 'error', message: 'Error de sistema' });
        } finally {
            setLoading(false);
            setInput(''); // Clear input for next scan
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            processAccess(input);
        }
    };

    const playSound = (type) => {
        // Simple beep synthesis
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (type === 'success') {
            osc.frequency.setValueAtTime(880, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1);
        } else if (type === 'warning') {
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(440, ctx.currentTime);
        } else if (type === 'denied') {
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(150, ctx.currentTime);
            osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.3);
        } else {
            osc.type = 'square';
            osc.frequency.setValueAtTime(200, ctx.currentTime);
        }

        osc.start();
        osc.stop(ctx.currentTime + 0.3);
    };

    return (
        <Card className={styles.container}>
            <div className={styles.header}>
                <h2>📍 Punto de Acceso</h2>
                <div className={styles.indicator}>
                    {loading ? 'Procesando...' : 'Esperando huella/cédula...'}
                </div>
            </div>

            <input
                ref={inputRef}
                className={styles.hiddenInput}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Haga clic aquí y escanee..."
                autoFocus
            />

            {lastAccess && (
                <div className={`${styles.resultModal} ${styles[lastAccess.status]}`}>
                    {lastAccess.client ? (
                        <>
                            <div className={styles.photoContainer}>
                                {lastAccess.client.photo_url ? (
                                    <img src={lastAccess.client.photo_url} alt="Profile" className={styles.photo} />
                                ) : (
                                    <div className={styles.photoPlaceholder}>Sin Foto</div>
                                )}
                            </div>
                            <div className={styles.info}>
                                <h3 className={styles.name}>{lastAccess.client.first_name} {lastAccess.client.last_name}</h3>
                                <p className={styles.statusMsg}>{lastAccess.message}</p>
                                <div className={styles.details}>
                                    <span>Vencimiento: {new Date(lastAccess.client.end_date).toLocaleDateString()}</span>
                                    <span>Días Restantes: {lastAccess.daysLeft}</span>
                                </div>
                            </div>
                        </>
                    ) : (
                        <h3 className={styles.errorMsg}>{lastAccess.message}</h3>
                    )}
                </div>
            )}
        </Card>
    );
}

// Inline CSS for simplicity or use styles object
const css = `
.container {
    padding: 1rem;
    background: #111827;
    margin-bottom: 2rem;
    border: 1px solid #374151;
}
.header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}
.indicator {
    font-size: 0.9rem;
    color: #9ca3af;
    animation: pulse 2s infinite;
}
.hiddenInput {
    width: 100%;
    padding: 0.5rem;
    background: #1f2937;
    border: 1px solid #374151;
    color: transparent; /* Hide text but keep cursor visible acting */
    caret-color: white;
    margin-bottom: 1rem;
}
.hiddenInput:focus {
    border-color: #3b82f6;
    outline: none;
}
.resultModal {
    display: flex;
    gap: 1.5rem;
    padding: 1.5rem;
    border-radius: 12px;
    align-items: center;
    animation: slideIn 0.3s ease-out;
}
.success {
    background: rgba(16, 185, 129, 0.1);
    border: 2px solid #10b981;
    color: #10b981;
}
.warning {
    background: rgba(245, 158, 11, 0.1);
    border: 2px solid #f59e0b;
    color: #f59e0b;
}
.danger, .error {
    background: rgba(239, 68, 68, 0.1);
    border: 2px solid #ef4444;
    color: #ef4444;
}
.photoContainer {
    width: 120px;
    height: 120px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid currentColor;
    flex-shrink: 0;
}
.photo {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.photoPlaceholder {
    width: 100%;
    height: 100%;
    background: #000;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: bold;
    color: #fff;
}
.info {
    flex: 1;
}
.name {
    margin: 0 0 0.5rem 0;
    font-size: 1.5rem;
    color: #fff;
}
.statusMsg {
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
}
.details {
    display: flex;
    gap: 1rem;
    font-size: 0.9rem;
    color: #d1d5db;
}
@keyframes slideIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.5; }
    100% { opacity: 1; }
}
`;
