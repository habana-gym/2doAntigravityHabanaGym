'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { addClient, getWorkoutPlans, getMemberships, getClients } from '@/services/api';
import styles from './page.module.css';

export default function NewClientPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '+598',
        cedula: '',
        membershipType: '',
        startDate: new Date().toISOString().split('T')[0],
        planId: '',
        medicalNotes: ''
    });
    const [fingerprintId, setFingerprintId] = useState('');
    const [fingerprintStep, setFingerprintStep] = useState(0); // 0: Idle, 1: First Scan, 2: Second Scan
    const [tempScan, setTempScan] = useState(''); // Store first scan to compare
    const [scanInput, setScanInput] = useState('');

    const [existingClients, setExistingClients] = useState([]);
    const [plans, setPlans] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const scanInputRef = useRef(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [plansData, membershipsData, clientsData] = await Promise.all([
                    getWorkoutPlans(),
                    getMemberships(),
                    getClients()
                ]);
                setPlans(plansData);
                setMemberships(membershipsData);
                setExistingClients(clientsData);

                // Set default if available
                if (membershipsData.length > 0) {
                    setFormData(prev => ({ ...prev, membershipType: membershipsData[0].id }));
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
        };
        loadData();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: null }));
        }
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.firstName) newErrors.firstName = 'El nombre es obligatorio';
        if (!formData.lastName) newErrors.lastName = 'El apellido es obligatorio';
        if (!formData.cedula) {
            newErrors.cedula = 'La cédula es obligatoria';
        } else {
            // Check duplicate
            const duplicate = existingClients.find(c => c.cedula === formData.cedula);
            if (duplicate) {
                newErrors.cedula = `Esta cédula ya existe (Cliente: ${duplicate.first_name} ${duplicate.last_name})`;
            }
        }

        if (!formData.phone) newErrors.phone = 'El teléfono es obligatorio';
        if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email inválido';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleScan = (e) => {
        e.preventDefault();
        const value = scanInput.trim();
        if (!value) return;

        if (fingerprintStep === 1) {
            setTempScan(value);
            setFingerprintStep(2);
            setScanInput('');
            setTimeout(() => scanInputRef.current?.focus(), 100);
            alert('Primera lectura ok. Vuelva a escanear para confirmar.');
        } else if (fingerprintStep === 2) {
            if (value === tempScan) {
                setFingerprintId(value);
                setFingerprintStep(3); // Verified
                alert('¡Huella confirmada y vinculada!');
            } else {
                setFingerprintStep(1); // Reset
                setTempScan('');
                alert('Las huellas no coinciden. Intente nuevamente desde el principio.');
            }
            setScanInput('');
        }
    };

    const startScan = () => {
        setFingerprintStep(1);
        setFingerprintId('');
        setTimeout(() => scanInputRef.current?.focus(), 100);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);

        try {
            const start = new Date(formData.startDate);
            const end = new Date(start);

            // Calculate end date based on selected membership
            const selectedMem = memberships.find(m => m.id === formData.membershipType);
            if (selectedMem) {
                end.setDate(end.getDate() + selectedMem.duration_days);
            } else {
                // Fallback default
                end.setMonth(end.getMonth() + 1);
            }

            const clientData = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email || null, // Handle empty string as null
                phone: formData.phone,
                cedula: formData.cedula,
                fingerprint_id: fingerprintId || null,
                membership_type: selectedMem ? selectedMem.name : 'Personalizado',
                start_date: formData.startDate,
                end_date: end.toISOString().split('T')[0],
                status: 'active',
                debt: selectedMem ? selectedMem.price : 0,
                status: 'active',
                debt: selectedMem ? selectedMem.price : 0,
                plan_id: formData.planId || null,
                medical_notes: formData.medicalNotes || null
            };

            await addClient(clientData);
            alert('Cliente creado con éxito');
            router.push('/clients');
        } catch (error) {
            console.error('Error creating client:', error);
            alert('Error al crear cliente: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Nuevo Cliente</h1>
                <Button variant="ghost" onClick={() => router.back()}>Cancelar</Button>
            </header>

            <Card className={styles.formCard}>
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGrid}>
                        <Input
                            label="Nombre"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            error={errors.firstName}
                            required
                        />
                        <Input
                            label="Apellido"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            error={errors.lastName}
                            required
                        />
                        <Input
                            label="Cédula / DNI"
                            name="cedula"
                            value={formData.cedula}
                            onChange={handleChange}
                            error={errors.cedula}
                            required
                        />
                        <Input
                            label="Teléfono (Para WhatsApp)"
                            name="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={handleChange}
                            error={errors.phone}
                            required
                            placeholder="Ej: 99123456"
                        />
                        <Input
                            label="Email (Opcional)"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                        />



                        <div style={{ gridColumn: '1 / -1' }}>
                            <label className={styles.label} style={{ marginBottom: '0.5rem', display: 'block' }}>Observaciones Médicas / Físicas</label>
                            <textarea
                                name="medicalNotes"
                                value={formData.medicalNotes}
                                onChange={handleChange}
                                className=""
                                placeholder="Ej: Lesión de rodilla, hipertensión, objetivos específicos..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    backgroundColor: 'var(--color-bg-surface, #1f2937)',
                                    border: '1px solid var(--color-border, #374151)',
                                    color: 'var(--color-text-main, #fff)',
                                    height: '80px',
                                    paddingTop: '0.5rem',
                                    fontFamily: 'inherit'
                                }}
                            />
                        </div>

                        {/* Fingerprint Capture Section */}
                        <div className={styles.fingerprintSection} style={{ gridColumn: '1 / -1', border: '1px solid var(--color-border)', padding: '1rem', borderRadius: '8px', marginTop: '1rem' }}>
                            <label className={styles.label}>Huella Digital / ID Biométrico (Opcional)</label>

                            {fingerprintStep === 0 && !fingerprintId && (
                                <Button type="button" variant="secondary" onClick={startScan}>
                                    ➕ Capturar Huella
                                </Button>
                            )}

                            {(fingerprintStep === 1 || fingerprintStep === 2) && (
                                <div className={styles.scanContainer}>
                                    <p style={{ marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
                                        {fingerprintStep === 1 ? '👉 Escanee el dedo ahora (1/2)' : '👉 Confirme escaneando nuevamente (2/2)'}
                                    </p>
                                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                                        <input
                                            ref={scanInputRef}
                                            type="text"
                                            value={scanInput}
                                            onChange={(e) => setScanInput(e.target.value)}
                                            onKeyDown={(e) => { if (e.key === 'Enter') handleScan(e); }}
                                            className={styles.input}
                                            placeholder="Esperando lector..."
                                            autoComplete="off"
                                        />
                                        <Button type="button" onClick={handleScan}>Confirmar</Button>
                                    </div>
                                </div>
                            )}

                            {fingerprintStep === 3 && (
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', color: 'var(--color-success)' }}>
                                    <span>✅ Huella Vinculada Correctamente ({fingerprintId})</span>
                                    <Button type="button" variant="ghost" onClick={startScan} style={{ fontSize: '0.8rem' }}>Cambiar</Button>
                                </div>
                            )}
                        </div>

                        <div className={styles.selectGroup}>
                            <label className={styles.label}>Tipo de Membresía</label>
                            <select
                                name="membershipType"
                                value={formData.membershipType}
                                onChange={handleChange}
                                className={styles.select}
                                required
                            >
                                <option value="">Seleccionar Membresía...</option>
                                {memberships.map(mem => (
                                    <option key={mem.id} value={mem.id}>
                                        {mem.name} - ${mem.price} ({mem.duration_days} días)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <Input
                            label="Fecha de Inicio"
                            name="startDate"
                            type="date"
                            value={formData.startDate}
                            onChange={handleChange}
                            required
                        />

                        <div className={styles.selectGroup}>
                            <label className={styles.label}>Plan de Entrenamiento</label>
                            <select
                                name="planId"
                                value={formData.planId}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value="">Sin plan asignado</option>
                                {plans.map(plan => (
                                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className={styles.actions}>
                        <Button variant="ghost" type="button" onClick={() => router.back()}>Cancelar</Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Guardar Cliente'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
