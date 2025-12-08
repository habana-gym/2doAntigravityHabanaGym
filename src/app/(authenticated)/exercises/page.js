'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { addExercise, getExercises } from '@/services/api';
import styles from './page.module.css';

export default function ExercisesPage() {
    const [exercises, setExercises] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        muscleGroup: '',
        videoUrl: ''
    });

    const loadExercises = async () => {
        try {
            const data = await getExercises();
            setExercises(data);
        } catch (error) {
            console.error('Error loading exercises:', error);
        }
    };

    useEffect(() => {
        loadExercises();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const exerciseData = {
                name: formData.name,
                muscle_group: formData.muscleGroup,
                video_url: formData.videoUrl
            };

            if (editingId) {
                await import('@/services/api').then(mod => mod.updateExercise(editingId, exerciseData));
                alert('Ejercicio actualizado');
            } else {
                await import('@/services/api').then(mod => mod.addExercise(exerciseData));
                alert('Ejercicio agregado');
            }

            setFormData({ name: '', muscleGroup: '', videoUrl: '' });
            setEditingId(null);
            setShowForm(false);
            loadExercises();
        } catch (error) {
            console.error('Error saving exercise:', error);
            alert('Error al guardar ejercicio');
        }
    };

    const handleEdit = (exercise) => {
        setFormData({
            name: exercise.name,
            muscleGroup: exercise.muscle_group,
            videoUrl: exercise.video_url || ''
        });
        setEditingId(exercise.id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Seguro que deseas eliminar este ejercicio?')) return;
        try {
            await import('@/services/api').then(mod => mod.deleteExercise(id));
            loadExercises();
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Error al eliminar');
        }
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({ name: '', muscleGroup: '', videoUrl: '' });
    };

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <div>
                    <h1 className={styles.title}>Ejercicios</h1>
                    <p className={styles.subtitle}>Gestiona los ejercicios disponibles para los planes</p>
                </div>
                {!showForm && (
                    <Button variant="primary" onClick={() => setShowForm(true)}>
                        + Nuevo Ejercicio
                    </Button>
                )}
            </header>

            {showForm && (
                <Card className={styles.formCard}>
                    <h3 className={styles.formTitle}>{editingId ? 'Editar Ejercicio' : 'Agregar Nuevo Ejercicio'}</h3>
                    <form onSubmit={handleSubmit} className={styles.form}>
                        <div className={styles.formGrid}>
                            <Input
                                label="Nombre del Ejercicio"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Ej: Sentadilla"
                                required
                            />
                            <Input
                                label="Grupo Muscular"
                                value={formData.muscleGroup}
                                onChange={(e) => setFormData({ ...formData, muscleGroup: e.target.value })}
                                placeholder="Ej: Piernas"
                                required
                            />
                            <Input
                                label="URL de Video (Opcional)"
                                value={formData.videoUrl}
                                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                                placeholder="https://youtube.com/..."
                            />
                        </div>
                        <div className={styles.formActions}>
                            <Button type="button" variant="ghost" onClick={handleCancel}>Cancelar</Button>
                            <Button type="submit" variant="primary">Guardar</Button>
                        </div>
                    </form>
                </Card>
            )}

            <div className={styles.grid}>
                {exercises.map((exercise) => (
                    <Card key={exercise.id} className={styles.exerciseCard}>
                        <div className={styles.exerciseHeader}>
                            <h3 className={styles.exerciseName}>{exercise.name}</h3>
                            <span className={styles.muscleBadge}>{exercise.muscle_group}</span>
                        </div>
                        {exercise.video_url && (
                            <a href={exercise.video_url} target="_blank" rel="noopener noreferrer" className={styles.videoLink}>
                                Ver Video 📺
                            </a>
                        )}
                        <div className={styles.cardActions} style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                            <Button variant="secondary" onClick={() => handleEdit(exercise)} small>Editar</Button>
                            <Button variant="danger" onClick={() => handleDelete(exercise.id)} small>Eliminar</Button>
                        </div>
                    </Card>
                ))}
            </div>
        </div>
    );
}
