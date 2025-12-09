'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import styles from './page.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // MFA State
    const [needsMFA, setNeedsMFA] = useState(false);
    const [mfaCode, setMfaCode] = useState('');
    const [factorId, setFactorId] = useState(null);
    const [trustDevice, setTrustDevice] = useState(false);

    const router = useRouter();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!needsMFA) {
                // Step 1: Initial Login
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });

                if (error) throw error;

                // Check for Trusted Device Cookie/Flag
                const isTrusted = localStorage.getItem('mfa_trusted_device') === 'true';

                // Check if user has MFA enabled
                const { data: factors, error: factorsError } = await supabase.auth.mfa.listFactors();
                if (factorsError) throw factorsError;

                if (factors && factors.all) {
                    const verifiedFactor = factors.all.find(f => f.status === 'verified' && f.factor_type === 'totp');

                    if (verifiedFactor) {
                        // If device is trusted, we can technically skip the UI challenge
                        // BUT ideally we should perform a background challenge if Supabase requires it.
                        // Currently Supabase doesn't enforce AAL2 on standard middleware unless configured.
                        // So for "convenience", if trusted, we skip the UI.

                        if (isTrusted) {
                            console.log('Device is trusted, skipping MFA UI challenge.');
                            router.push('/dashboard');
                            router.refresh();
                            return;
                        }

                        // Not trusted, show UI
                        setFactorId(verifiedFactor.id);
                        setNeedsMFA(true);
                        setLoading(false);
                        return; // Stop here, show MFA input
                    }
                }

                router.push('/dashboard');
                router.refresh();

            } else {
                // Step 2: MFA Verification
                const { data: challengeData, error: challengeError } = await supabase.auth.mfa.challenge({
                    factorId
                });
                if (challengeError) throw challengeError;

                const { data: verifyData, error: verifyError } = await supabase.auth.mfa.verify({
                    factorId,
                    challengeId: challengeData.id,
                    code: mfaCode
                });
                if (verifyError) throw verifyError;

                // Success! Handle Trust Device
                if (trustDevice) {
                    localStorage.setItem('mfa_trusted_device', 'true');
                }

                router.push('/dashboard');
                router.refresh();
            }

        } catch (err) {
            console.error(err);
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            if (!needsMFA || (needsMFA && error)) {
                setLoading(false);
            }
            if (needsMFA && !error) setLoading(false);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <div className={styles.logo}>
                    HABANA<span>GYM</span>
                </div>

                <form onSubmit={handleLogin} className={styles.form}>
                    {error && <div className={styles.error}>{error}</div>}

                    {!needsMFA ? (
                        <>
                            <Input
                                label="Correo Electrónico"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                placeholder="admin@habanagym.com"
                            />

                            <Input
                                label="Contraseña"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                placeholder="••••••••"
                            />
                        </>
                    ) : (
                        <>
                            <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
                                <p className="text-muted" style={{ fontSize: '0.9rem' }}>
                                    Ingresa el código de 6 dígitos de tu aplicación.
                                </p>
                            </div>
                            <Input
                                label="Código de Seguridad (2FA)"
                                type="text"
                                value={mfaCode}
                                onChange={(e) => setMfaCode(e.target.value)}
                                required
                                placeholder="000000"
                                maxLength={6}
                                autoFocus
                            />

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                marginBottom: '1rem',
                                fontSize: '0.9rem',
                                color: 'var(--color-text-dim)'
                            }}>
                                <input
                                    type="checkbox"
                                    id="trustDevice"
                                    checked={trustDevice}
                                    onChange={(e) => setTrustDevice(e.target.checked)}
                                    style={{ width: 'auto', margin: 0 }}
                                />
                                <label htmlFor="trustDevice" style={{ cursor: 'pointer' }}>
                                    No pedir código en este dispositivo
                                </label>
                            </div>
                        </>
                    )}

                    <Button type="submit" variant="primary" disabled={loading} style={{ width: '100%' }}>
                        {loading ? 'Verificando...' : (needsMFA ? 'Confirmar Código' : 'Iniciar Sesión')}
                    </Button>

                    {needsMFA && (
                        <Button
                            type="button"
                            variant="secondary"
                            style={{ width: '100%', marginTop: '0.5rem' }}
                            onClick={() => {
                                setNeedsMFA(false);
                                setMfaCode('');
                                setPassword('');
                                setTrustDevice(false);
                                setError(null);
                            }}
                        >
                            Cancelar
                        </Button>
                    )}
                </form>
            </div>
        </div>
    );
}
