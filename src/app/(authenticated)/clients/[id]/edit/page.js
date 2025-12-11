'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import WebcamCapture from '@/components/ui/WebcamCapture';
import FingerprintManager from '@/components/clients/FingerprintManager';
import { getClientById, updateClient, getClients } from '@/services/api';

export default function EditClientPage({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const { id } = resolvedParams;

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        cedula: '',
        fingerprintId: '',
        notes: '',
        medicalNotes: ''
    });

    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errors, setErrors] = useState({});
    const [existingClients, setExistingClients] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [clientData, allClients] = await Promise.all([
                    getClientById(id),
                    getClients()
                ]);

                setFormData({
                    firstName: clientData.first_name,
                    lastName: clientData.last_name,
                    email: clientData.email || '',
                    phone: clientData.phone || '',
                    cedula: clientData.cedula || '',
                    fingerprintId: clientData.fingerprint_id || '',
                    medicalNotes: clientData.medical_notes || ''
                });
                setCapturedPhoto(clientData.photo_url || null);

                setExistingClients(allClients.filter(c => c.id !== id));
            } catch (error) {
                console.error('Error loading client:', error);
                alert('Error al cargar datos del cliente');
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

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
            await updateClient(id, {
                first_name: formData.firstName,
                last_name: formData.lastName,
                email: formData.email || null,
                phone: formData.phone,
                cedula: formData.cedula,
                fingerprint_id: formData.fingerprintId || null,
                medical_notes: formData.medicalNotes || null,
                photo_url: capturedPhoto
            });
            alert('Cliente actualizado con éxito');
            router.push('/clients');
        } catch (error) {
            console.error('Error updating client:', error);
            alert('Error al actualizar: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) return <div>Cargando...</div>;

    return (
        <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
            <header style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold' }}>Editar Cliente</h1>
                <Button variant="ghost" onClick={() => router.back()}>Cancelar</Button>
            </header>

            <Card>
                <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1.5rem' }}>
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

                    {/* Custom Layout: Left Column (Data) | Right Column (Fingerprint) */}
                    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', alignItems: 'start' }}>
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
                                label="Teléfono"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                error={errors.phone}
                                required
                                placeholder="Ej: 54911..."
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

                    <div style={{ marginTop: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Observaciones Médicas / Físicas</label>
                        <textarea
                            name="medicalNotes"
                            value={formData.medicalNotes}
                            onChange={handleChange}
                            placeholder="Ej: Lesión de rodilla, hipertensión..."
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                borderRadius: '8px',
                                backgroundColor: 'var(--color-bg-surface, #1f2937)',
                                border: '1px solid var(--color-border, #374151)',
                                color: 'var(--color-text-main, #fff)',
                                minHeight: '100px',
                                fontFamily: 'inherit'
                            }}
                        />
                    </div>

                    <div>
                        <WebcamCapture
                            onCapture={(img) => setCapturedPhoto(img)}
                            initialImage={capturedPhoto}
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                        <Button variant="ghost" type="button" onClick={() => router.back()}>Cancelar</Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
