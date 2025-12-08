'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/layout/PageHeader';
import { getWorkoutPlans, deleteWorkoutPlan } from '@/services/api';
import styles from './page.module.css';

export default function WorkoutsPage() {
    const router = useRouter();
    const [plans, setPlans] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadPlans = async () => {
        try {
            const data = await getWorkoutPlans();
            setPlans(data);
        } catch (error) {
            console.error('Error loading plans:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPlans();
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('¿Seguro que deseas eliminar este plan?')) return;
        try {
            await deleteWorkoutPlan(id);
            loadPlans();
        } catch (error) {
            console.error('Error deleting plan:', error);
            alert('Error al eliminar plan');
        }
    };

    if (loading) return <div className={styles.container}>Cargando...</div>;

    return (
        <div className={styles.container}>
            <PageHeader
                title="Entrenamientos"
                subtitle="Gestión de planes y ejercicios"
                actions={
                    <>
                        <Button variant="secondary" onClick={() => router.push('/exercises')}>Ejercicios</Button>
                        <Button variant="primary" onClick={() => router.push('/workouts/new')}>+ Nuevo Plan</Button>
                    </>
                }
            />

            <div className={styles.grid}>
                {plans.length === 0 ? (
                    <p>No hay planes creados. ¡Crea el primero!</p>
                ) : (
                    plans.map((plan) => (
                        <Card key={plan.id} className={styles.planCard}>
                            <div className={styles.cardHeader}>
                                <h3 className={styles.planName}>{plan.name}</h3>
                                <span className={styles.levelBadge}>{plan.level || 'N/A'}</span>
                            </div>
                            <div className={styles.cardBody}>
                                <div className={styles.infoRow}>
                                    <span>Duración:</span>
                                    <span>{plan.duration}</span>
                                </div>
                                <div className={styles.infoRow}>
                                    <span>Ejercicios:</span>
                                    <span>{plan.exercises}</span>
                                </div>
                            </div>
                            <div className={styles.cardFooter}>
                                <Button variant="secondary" className={styles.cardBtn} onClick={() => router.push(`/workouts/${plan.id}/edit`)}>Editar</Button>
                                <Button variant="danger" className={styles.cardBtn} onClick={() => handleDelete(plan.id)}>Eliminar</Button>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
