'use client';

import { useState, useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import Button from '@/components/ui/Button';
import { getSettings, updateSetting } from '@/services/api';
import styles from './page.module.css';

export default function SettingsPage() {
    const [settings, setSettings] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form states
    const [graceDays, setGraceDays] = useState('5');

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const data = await getSettings();
                setSettings(data);
                if (data.inactive_grace_days) {
                    setGraceDays(data.inactive_grace_days);
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

    if (loading) return <div>Cargando configuración...</div>;

    return (
        <div className={styles.container}>
            <PageHeader
                title="Configuración del Sistema"
                subtitle="Ajusta los parámetros generales de Habana GYM"
            />

            <div className={styles.section}>
                <h3 className={styles.sectionTitle}>Reglas de Negocio</h3>

                <div className={styles.settingRow}>
                    <div className={styles.settingInfo}>
                        <label className={styles.settingLabel}>Días de Gracia</label>
                        <p className={styles.settingDesc}>
                            Número de días que un cliente permanece "Activo" después de su fecha de vencimiento antes de pasar a "Deudor/Inactivo".
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
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="primary" onClick={handleSave} disabled={saving}>
                    {saving ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
            </div>
        </div>
    );
}
