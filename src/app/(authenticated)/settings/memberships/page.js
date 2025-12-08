'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { getMemberships, addMembership, updateMembership, deleteMembership } from '@/services/api';
import styles from './page.module.css';

export default function MembershipsPage() {
    const [memberships, setMemberships] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        durationDays: ''
    });

    const loadMemberships = async () => {
        try {
            const data = await getMemberships();
            setMemberships(data);
        } catch (error) {
            console.error('Error loading memberships:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMemberships();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                name: formData.name,
                price: parseFloat(formData.price),
                duration_days: parseInt(formData.durationDays)
            };

            if (editingId) {
                await updateMembership(editingId, payload);
                alert('Membresía actualizada con éxito');
            } else {
                await addMembership(payload);
                alert('Membresía creada con éxito');
            }

            setFormData({ name: '', price: '', durationDays: '' });
            setEditingId(null);
            setShowForm(false);
            loadMemberships();
        } catch (error) {
            console.error('Error saving membership:', error);
            alert('Error al guardar membresía');
        }
    };

    const handleEdit = (mem) => {
        setFormData({
            name: mem.name,
            price: mem.price,
            durationDays: mem.duration_days
        });
        setEditingId(mem.id);
        setShowForm(true);
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Seguro que deseas eliminar esta membresía?')) return;
        try {
            await deleteMembership(id);
            loadMemberships();
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Error al eliminar');
        }
    };

    const handleCancel = () => {
        setFormData({ name: '', price: '', durationDays: '' });
        setEditingId(null);
        setShowForm(false);
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Configuración de Membresías</h1>
                <Button variant="primary" onClick={() => {
                    setEditingId(null);
                    setFormData({ name: '', price: '', durationDays: '' });
                    setShowForm(!showForm);
                }}>
                    {showForm ? 'Cancelar' : '+ Nueva Membresía'}
                </Button>
            </header>

            {showForm && (
                <Card className={styles.formCard}>
                    <h2 className={styles.cardTitle}>{editingId ? 'Editar Membresía' : 'Nueva Membresía'}</h2>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGrid}>
                            <Input
                                label="Nombre (ej: Promo Verano)"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <Input
                                label="Precio ($)"
                                type="number"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                required
                            />
                            <Input
                                label="Duración (Días)"
                                type="number"
                                value={formData.durationDays}
                                onChange={(e) => setFormData({ ...formData, durationDays: e.target.value })}
                                required
                            />
                        </div>
                        <div className={styles.actions}>
                            <Button type="button" variant="ghost" onClick={handleCancel}>Cancelar</Button>
                            <Button type="submit" variant="primary">Guardar</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className={styles.grid}>
                {memberships.map((mem) => (
                    <Card key={mem.id} className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.memName}>{mem.name}</h3>
                            <span className={styles.price}>${mem.price}</span>
                        </div>
                        <p className={styles.duration}>{mem.duration_days} días de duración</p>
                        <div className={styles.cardActions} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                            <Button variant="secondary" onClick={() => handleEdit(mem)} style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>Editar</Button>
                            <Button variant="danger" onClick={() => handleDelete(mem.id)} style={{ fontSize: '0.8rem', padding: '0.3rem 0.8rem' }}>Eliminar</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
