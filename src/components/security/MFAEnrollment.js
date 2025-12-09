'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import QRCode from 'qrcode';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './MFAEnrollment.module.css';

export default function MFAEnrollment({ onComplete, onCancel }) {
    const [factorId, setFactorId] = useState(null);
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [verifyCode, setVerifyCode] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        startEnrollment();
    }, []);

    const startEnrollment = async () => {
        try {
            const { data, error } = await supabase.auth.mfa.enroll({
                factorType: 'totp',
            });

            if (error) throw error;

            setFactorId(data.id);

            // Generate QR Code
            const url = await QRCode.toDataURL(data.totp.uri);
            setQrCodeUrl(url);
        } catch (err) {
            console.error('Error starting enrollment:', err);
            setError('No se pudo iniciar el enrolamiento MFA');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async () => {
        setLoading(true);
        setError(null);
        try {
            // 1. Create Challenge
            const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                factorId
            });
            if (challengeError) throw challengeError;

            // 2. Verify Code
            const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
                factorId,
                challengeId: challengeData.id,
                code: verifyCode
            });
            if (verifyError) throw verifyError;

            onComplete?.();
        } catch (err) {
            console.error('Error verifying MFA:', err);
            setError('Código incorrecto. Inténtalo de nuevo.');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !qrCodeUrl) return <div>Generando código de seguridad...</div>;

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>Configurar Autenticación de Dos Factores (2FA)</h3>

            <div className={styles.steps}>
                <div>
                    <p>1. Escanea este código QR con tu aplicación de autenticación (Google Authenticator, Authy, etc.):</p>
                    {qrCodeUrl && (
                        <div className={styles.qrContainer}>
                            <img src={qrCodeUrl} alt="QR Code for MFA" />
                        </div>
                    )}
                </div>

                <div>
                    <p>2. Ingresa el código de 6 dígitos que aparece en tu aplicación:</p>
                    <div style={{ marginTop: '0.5rem' }}>
                        <Input
                            value={verifyCode}
                            onChange={(e) => setVerifyCode(e.target.value)}
                            placeholder="000000"
                            maxLength={6}
                        />
                    </div>
                </div>

                {error && <div className="text-danger">{error}</div>}

                <div className={styles.actions}>
                    <Button variant="secondary" onClick={onCancel}>Cancelar</Button>
                    <Button variant="primary" onClick={handleVerify} disabled={verifyCode.length !== 6 || loading}>
                        {loading ? 'Verificando...' : 'Activar 2FA'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
