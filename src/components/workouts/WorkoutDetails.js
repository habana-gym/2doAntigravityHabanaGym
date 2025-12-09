import styles from './WorkoutDetails.module.css';

export default function WorkoutDetails({ plan }) {
    if (!plan) return null;

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.planName}>{plan.name}</h3>
                <div className={styles.meta}>
                    <span className={styles.badge}>{plan.level || 'Sin nivel'}</span>
                    <span className={styles.badge}>{plan.duration || 'Sin duración'}</span>
                </div>
            </div>

            {plan.description && (
                <div style={{ padding: '1rem', backgroundColor: '#000', color: '#FFD700', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #333' }}>
                    <strong style={{ display: 'block', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '1px' }}>Instrucciones / Método</strong>
                    <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{plan.description}</p>
                </div>
            )}

            <div className={styles.exercisesList}>
                {plan.plan_exercises && plan.plan_exercises.length > 0 ? (
                    plan.plan_exercises.map((pe) => (
                        <div key={pe.exercise.id} className={styles.exerciseItem}>
                            <div className={styles.exerciseHeader}>
                                <span className={styles.exerciseName}>{pe.exercise.name}</span>
                                <span className={styles.muscleBadge}>{pe.exercise.muscle_group}</span>
                            </div>

                            <div className={styles.statsGrid}>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>SERIES</span>
                                    <span className={styles.statValue}>{pe.sets || '-'}</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>REPS</span>
                                    <span className={styles.statValue}>{pe.reps || '-'}</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>PESO</span>
                                    <span className={styles.statValue}>{pe.weight || '-'}</span>
                                </div>
                                <div className={styles.stat}>
                                    <span className={styles.statLabel}>DESCANSO</span>
                                    <span className={styles.statValue}>{pe.rest_time || '-'}</span>
                                </div>
                            </div>

                            {pe.notes && (
                                <div className={styles.notes}>
                                    📝 {pe.notes}
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>Este plan no tiene ejercicios configurados.</p>
                )}
            </div>
        </div>
    );
}
