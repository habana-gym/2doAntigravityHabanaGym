'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { getSettings, updateSetting } from '@/services/api';
import { supabase } from '@/lib/supabase'; // Need supabase client
import MFAEnrollment from '@/components/security/MFAEnrollment';
import styles from './page.module.css';

export default function SettingsPage() {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states
    const [graceDays, setGraceDays] = useState('5');
    const [factors, setFactors] = useState([]);
    const [showMFAEnroll, setShowMFAEnroll] = useState(false);

    // Password change state
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passwordMsg, setPasswordMsg] = useState('');

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await getSettings();
                setSettings(data);
                if (data.inactive_grace_days) {
                    setGraceDays(data.inactive_grace_days);
                }

                // Check MFA status
                const { data: factorsData, error: factorsError } = await supabase.auth.mfa.listFactors();
                if (!factorsError) {
                    setFactors(factorsData.all || []);
                }
            } catch (error) {
                console.error('Error loading settings:', error);
            } finally {
                setLoading(false);
            }
        };
        loadSettings();
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await updateSetting('inactive_grace_days', graceDays);
            alert('Configuración guardada correctamente');
        } catch (error) {
            console.error('Error saving settings:', error);
            alert('Error al guardar configuración');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (!newPassword || newPassword !== confirmPassword) {
            setPasswordMsg('Las contraseñas no coinciden o están vacías');
            return;
        }
        setSaving(true);
        try {
            const { error } = await supabase.auth.updateUser({ password: newPassword });
            if (error) throw error;
            setPasswordMsg('Contraseña actualizada correctamente');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error) {
            setPasswordMsg('Error: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    const handleMFAComplete = async () => {
        setShowMFAEnroll(false);
        // Refresh factors
        const { data } = await supabase.auth.mfa.listFactors();
        setFactors(data.all || []);
        alert('Autenticación de 2 Factores activada correctamente');
    };

    const handleMFARemove = async (factorId) => {
        const confirm = window.confirm('¿Estás seguro de desactivar 2FA? Tu cuenta será menos segura.');
        if (!confirm) return;

        setSaving(true);
        try {
            const { error } = await supabase.auth.mfa.unenroll({ factorId });
            if (error) throw error;

            setFactors(prev => prev.filter(f => f.id !== factorId));
            alert('2FA desactivado');
        } catch (err) {
            alert('Error al desactivar: ' + err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Cargando configuración...</div>;

    const hasVerifiedMFA = factors.some(f => f.status === 'verified');

    return (
        <div className={styles.container}>
            <PageHeader
                title="Configuración del Sistema"
                subtitle="Ajusta los parámetros generales y seguridad"
            />

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Reglas de Negocio</h3>

                <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                        <label className={styles.settingLabel}>Días de Gracia</label>
                        <p className={styles.settingDesc}>
                            Número de días que un cliente permanece "Activo" después de su fecha de vencimiento.
                        </p>
                    </div>
                    <div className={styles.inputWrapper}>
                        <input
                            type="number"
                            min="0"
                            className={styles.input}
                            value={graceDays}
                            onChange={(e) => setGraceDays(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                    <Button variant="primary" onClick={handleSave} disabled={saving}>
                        {saving ? 'Guardando...' : 'Guardar Reglas'}
                    </Button>
                </div>
            </div>

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Seguridad de la Cuenta</h3>

                {/* Password Change */}
                <div className={styles.settingRow} style={{ alignItems: 'flex-start' }}>
                    <div className={styles.settingInfo}>
                        <label className={styles.settingLabel}>Cambiar Contraseña</label>
                        <p className={styles.settingDesc}>Actualiza tu clave de acceso periódicamente.</p>
                    </div>
                    <div className={styles.inputWrapper} style={{ flexDirection: 'column', gap: '0.5rem' }}>
                        <input
                            type="password"
                            placeholder="Nueva contraseña"
                            className={styles.input}
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <input
                            type="password"
                            placeholder="Confirmar contraseña"
                            className={styles.input}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <Button variant="secondary" onClick={handlePasswordChange} disabled={saving || !newPassword}>
                            Actualizar Clave
                        </Button>
                        {passwordMsg && <p style={{ fontSize: '0.8rem', color: passwordMsg.includes('Error') ? 'red' : 'green' }}>{passwordMsg}</p>}
                    </div>
                </div>

                {/* MFA Section */}
                <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                        <label className={styles.settingLabel}>Autenticación de Dos Factores (2FA)</label>
                        <p className={styles.settingDesc}>
                            Añade una capa extra de seguridad usando una aplicación como Google Authenticator.
                        </p>
                        {hasVerifiedMFA && (
                            <span className="text-success" style={{ fontWeight: 'bold' }}>✓ ACTIVADO</span>
                        )}
                    </div>
                    <div>
                        {!hasVerifiedMFA && !showMFAEnroll && (
                            <Button variant="primary" onClick={() => setShowMFAEnroll(true)}>
                                Activar 2FA
                            </Button>
                        )}
                        {hasVerifiedMFA && (
                            <Button variant="danger" onClick={() => handleMFARemove(factors.find(f => f.status === 'verified').id)}>
                                Desactivar 2FA
                            </Button>
                        )}
                    </div>
                </div>

                {showMFAEnroll && (
                    <div style={{ marginTop: '1rem' }}>
                        <MFAEnrollment
                            onComplete={handleMFAComplete}
                            onCancel={() => setShowMFAEnroll(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
