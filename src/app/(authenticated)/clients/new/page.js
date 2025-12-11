'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import WebcamCapture from '@/components/ui/WebcamCapture';
import FingerprintManager from '@/components/clients/FingerprintManager';
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
        medicalNotes: '',
        fingerprintId: null
    });

    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [existingClients, setExistingClients] = useState([]);
    const [plans, setPlans] = useState([]);
    const [memberships, setMemberships] = useState([]);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

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


    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setIsSubmitting(true);

        try {
            const start = new Date(formData.startDate);
            const end = new Date(start);

            const selectedMem = memberships.find(m => m.id === formData.membershipType);
            if (selectedMem) {
                end.setDate(end.getDate() + selectedMem.duration_days);
            } else {
                end.setMonth(end.getMonth() + 1);
            }

            const clientData = {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email || null,
                phone: formData.phone,
                cedula: formData.cedula,
                fingerprint_id: formData.fingerprintId || null,
                membership_type: selectedMem ? selectedMem.name : 'Personalizado',
                start_date: formData.startDate,
                end_date: end.toISOString().split('T')[0],
                status: 'active',
                debt: selectedMem ? selectedMem.price : 0,
                plan_id: formData.planId || null,
                medical_notes: formData.medicalNotes || null,
                photo_url: capturedPhoto || null
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
                        {/* Row 1: Name and Last Name */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
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
                        </div>

                        {/* Row 2: Custom Layout - Left Column (Data) | Right Column (Fingerprint) */}
                        <div style={{
                            gridColumn: '1 / -1', // Fix: Span across parent grid columns
                            display: 'grid',
                            gridTemplateColumns: '2fr 1fr',
                            gap: '1rem',
                            alignItems: 'start'
                        }}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
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
                            </div>

                            {/* Fingerprint centered in the right column */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                height: '100%',
                                paddingTop: '1rem'
                            }}>
                                <FingerprintManager
                                    value={formData.fingerprintId}
                                    onChange={(code) => setFormData(prev => ({ ...prev, fingerprintId: code }))}
                                />
                            </div>
                        </div>

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

                        {/* Photo Capture Section */}
                        <div style={{ gridColumn: '1 / -1', marginTop: '1rem' }}>
                            <WebcamCapture
                                onCapture={(img) => setCapturedPhoto(img)}
                                initialImage={capturedPhoto}
                            />
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
        </div >
    );
}
