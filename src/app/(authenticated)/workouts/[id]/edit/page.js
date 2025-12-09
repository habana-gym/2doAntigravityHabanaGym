'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { getWorkoutPlanById, updateWorkoutPlan, getExercises } from '@/services/api';
import styles from '../../new/page.module.css'; // Reuse styles

export default function EditWorkoutPage() {
    const router = useRouter();
    const params = useParams();
    const [planData, setPlanData] = useState({
        name: '',
        duration: '',
        level: 'Principiante',
        description: ''
    });
    const [exercises, setExercises] = useState([]);
    const [selectedExercises, setSelectedExercises] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [exercisesData, plan] = await Promise.all([
                    getExercises(),
                    getWorkoutPlanById(params.id)
                ]);
                setExercises(exercisesData);

                // Pre-fill Plan Data
                setPlanData({
                    name: plan.name,
                    duration: plan.duration,
                    level: plan.level,
                    description: plan.description || ''
                });

                // Pre-fill Exercises
                // Map existing plan_exercises to our state structure
                if (plan.plan_exercises) {
                    const formattedExercises = plan.plan_exercises.map(pe => ({
                        id: pe.exercise.id,
                        exercise_id: pe.exercise.id,
                        sets: pe.sets || '',
                        reps: pe.reps || '',
                        weight: pe.weight || '',
                        rest_time: pe.rest_time || '',
                        notes: pe.notes || ''
                    }));
                    setSelectedExercises(formattedExercises);
                }
            } catch (error) {
                console.error('Error loading data:', error);
                alert('Error al cargar el plan');
            } finally {
                setLoading(false);
            }
        };
        if (params.id) loadData();
    }, [params.id]);

    const handleToggleExercise = (exerciseId) => {
        setSelectedExercises(prev => {
            const exists = prev.find(ex => ex.id === exerciseId);
            if (exists) {
                return prev.filter(ex => ex.id !== exerciseId);
            } else {
                return [...prev, {
                    id: exerciseId,
                    exercise_id: exerciseId,
                    sets: '',
                    reps: '',
                    weight: '',
                    rest_time: '',
                    notes: ''
                }];
            }
        });
    };

    const handleExerciseDetailChange = (exerciseId, field, value) => {
        setSelectedExercises(prev => prev.map(ex =>
            ex.id === exerciseId ? { ...ex, [field]: value } : ex
        ));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting Update with:', { planData, selectedExercises });
        try {
            await updateWorkoutPlan(params.id, {
                ...planData,
                exercises: selectedExercises
            });
            console.log('Update success, redirecting...');
            alert('Plan actualizado con éxito');
            router.push('/workouts');
        } catch (error) {
            console.error('Error updating plan:', error);
            alert('Error al actualizar el plan');
        }
    };

    if (loading) return <div className={styles.container}>Cargando...</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <h1 className={styles.title}>Editar Plan de Entrenamiento</h1>
                <Button variant="ghost" onClick={() => router.back()}>Cancelar</Button>
            </header>

            <div className={styles.grid}>
                <Card className={styles.formCard}>
                    <h2 className={styles.cardTitle}>Detalles del Plan</h2>
                    <form id="planForm" onSubmit={handleSubmit} className={styles.form}>
                        <Input
                            label="Nombre del Plan"
                            value={planData.name}
                            onChange={(e) => setPlanData({ ...planData, name: e.target.value })}
                            placeholder="Ej: Hipertrofia Total"
                            required
                        />
                        <Input
                            label="Duración (Semanas)"
                            value={planData.duration}
                            onChange={(e) => setPlanData({ ...planData, duration: e.target.value })}
                            placeholder="Ej: 8 semanas"
                        />

                        <div style={{ gridColumn: '1 / -1' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Método de Entrenamiento / Instrucciones</label>
                            <textarea
                                value={planData.description}
                                onChange={(e) => setPlanData({ ...planData, description: e.target.value })}
                                placeholder="Ej: Fase excéntrica lenta (3s), descanso activo entre series..."
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

                        <div className={styles.selectGroup}>
                            <label className={styles.label}>Nivel</label>
                            <select
                                value={planData.level}
                                onChange={(e) => setPlanData({ ...planData, level: e.target.value })}
                                className={styles.select}
                            >
                                <option value="Principiante">Principiante</option>
                                <option value="Intermedio">Intermedio</option>
                                <option value="Avanzado">Avanzado</option>
                            </select>
                        </div>
                    </form>
                </Card>

                <Card className={styles.exercisesCard}>
                    <h2 className={styles.cardTitle}>Seleccionar y Configurar Ejercicios ({selectedExercises.length})</h2>
                    <div className={styles.exercisesList}>
                        {exercises.map((exercise) => {
                            const isSelected = selectedExercises.some(ex => ex.id === exercise.id);
                            const selectedData = selectedExercises.find(ex => ex.id === exercise.id) || {};

                            return (
                                <div
                                    key={exercise.id}
                                    className={`${styles.exerciseItem} ${isSelected ? styles.selected : ''}`}
                                >
                                    <div
                                        className={styles.exerciseHeader}
                                        onClick={() => handleToggleExercise(exercise.id)}
                                    >
                                        <div className={styles.exerciseInfo}>
                                            <span className={styles.exerciseName}>{exercise.name}</span>
                                            <span className={styles.muscleGroup}>{exercise.muscle_group}</span>
                                        </div>
                                        <div className={styles.checkIcon}>
                                            {isSelected ? '✅' : '⚪'}
                                        </div>
                                    </div>

                                    {isSelected && (
                                        <div className={styles.exerciseDetails} onClick={e => e.stopPropagation()}>
                                            <Input
                                                id={`sets-${exercise.id}`}
                                                label="Series (Sets)"
                                                value={selectedData.sets || ''}
                                                onChange={(e) => handleExerciseDetailChange(exercise.id, 'sets', e.target.value)}
                                                placeholder="Ej: 4"
                                                small
                                            />
                                            <Input
                                                id={`reps-${exercise.id}`}
                                                label="Repeticiones"
                                                value={selectedData.reps || ''}
                                                onChange={(e) => handleExerciseDetailChange(exercise.id, 'reps', e.target.value)}
                                                placeholder="Ej: 10-12"
                                                small
                                            />
                                            <Input
                                                id={`weight-${exercise.id}`}
                                                label="Peso (Opcional)"
                                                value={selectedData.weight || ''}
                                                onChange={(e) => handleExerciseDetailChange(exercise.id, 'weight', e.target.value)}
                                                placeholder="Ej: 20kg"
                                                small
                                            />
                                            <Input
                                                id={`rest-${exercise.id}`}
                                                label="Descanso"
                                                value={selectedData.rest_time || ''}
                                                onChange={(e) => handleExerciseDetailChange(exercise.id, 'rest_time', e.target.value)}
                                                placeholder="Ej: 90s"
                                                small
                                            />
                                            <div className={styles.notesField}>
                                                <label className={styles.label} style={{ marginBottom: '0.5rem', display: 'block' }}>Notas / Método</label>
                                                <textarea
                                                    id={`notes-${exercise.id}`}
                                                    className={styles.notesInput}
                                                    value={selectedData.notes || ''}
                                                    onChange={(e) => handleExerciseDetailChange(exercise.id, 'notes', e.target.value)}
                                                    placeholder="Ej: Drop set en la última serie. Controlar la excéntrica."
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            <div className={styles.footer}>
                <Button variant="ghost" onClick={() => router.back()}>Cancelar</Button>
                <Button type="submit" form="planForm" variant="primary">Guardar Cambios</Button>
            </div>
        </div>
    );
}
