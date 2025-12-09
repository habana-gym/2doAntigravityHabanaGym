'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import WorkoutDetails from '@/components/workouts/WorkoutDetails';
import { getClientById, updateClient, deleteClient, getWorkoutPlans, addPayment, getClientPayments, getWorkoutPlanById } from '@/services/api';
import styles from './page.module.css';

export default function ClientDetailPage({ params }) {
    const router = useRouter();
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const [client, setClient] = useState(null);
    const [plans, setPlans] = useState([]);
    const [payments, setPayments] = useState([]);
    const [fullPlan, setFullPlan] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedPlan, setSelectedPlan] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const [clientData, plansData, paymentsData] = await Promise.all([
                    getClientById(id),
                    getWorkoutPlans(),
                    getClientPayments(id)
                ]);
                setClient(clientData);
                setPlans(plansData);
                setPayments(paymentsData);
                if (clientData.plan_id) {
                    setSelectedPlan(clientData.plan_id);
                    // Fetch full plan details
                    const planDetails = await getWorkoutPlanById(clientData.plan_id);
                    setFullPlan(planDetails);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    const handleRenew = async () => {
        if (!confirm('¿Renovar membresía por 1 mes?')) return;

        const currentEnd = new Date(client.end_date);
        const newEnd = new Date(currentEnd.setMonth(currentEnd.getMonth() + 1));

        try {
            const updated = await updateClient(id, {
                status: 'active',
                end_date: newEnd.toISOString().split('T')[0],
                debt: 0
            });
            setClient({ ...client, ...updated });
            alert('Membresía renovada con éxito');
        } catch (error) {
            console.error('Error renewing:', error);
            alert('Error al renovar');
        }
    };

    const handleStatusChange = async (newStatus) => {
        try {
            const updated = await updateClient(id, { status: newStatus });
            setClient({ ...client, ...updated });
        } catch (error) {
            console.error('Error updating status:', error);
        }
    };

    const handleDelete = async () => {
        if (!confirm('⚠ ATENCIÓN ⚠\n\n¿Estás seguro de que deseas ELIMINAR DEFINITIVAMENTE a este cliente?\n\nEsta acción borrará:\n- Todos sus datos personales\n- Historial de pagos\n- Registros de asistencia\n- Rutinas asignadas\n\nESTA ACCIÓN NO SE PUEDE DESHACER.')) {
            return;
        }

        try {
            await deleteClient(id);
            alert('Cliente eliminado correctamente.');
            router.push('/clients');
        } catch (error) {
            console.error('Error deleting client:', error);
            alert('Error al eliminar: Asegúrate de ejecutado el script "enable_cascade_delete.sql" en Supabase si el cliente tiene historial.');
        }
    };

    const handleAssignPlan = async () => {
        try {
            const planIdToUpdate = selectedPlan || null;
            const updated = await updateClient(id, { plan_id: planIdToUpdate });

            let updatedFullPlan = null;
            if (planIdToUpdate) {
                updatedFullPlan = await getWorkoutPlanById(planIdToUpdate);
            }

            setClient({
                ...client,
                ...updated,
                plans: plans.find(p => p.id === selectedPlan) || null
            });
            setFullPlan(updatedFullPlan);

            alert('Plan asignado correctamente');
        } catch (error) {
            console.error('Error assigning plan:', error);
            alert('Error al asignar plan');
        }
    };

    const handlePayment = async () => {
        const amountStr = prompt('Ingrese el monto del pago:', '0');
        if (!amountStr) return;

        const amount = parseFloat(amountStr);
        if (isNaN(amount) || amount <= 0) {
            alert('Monto inválido');
            return;
        }

        const concept = prompt('Concepto (ej: Cuota Enero):', 'Pago parcial');

        const newDebt = Math.max(0, (client.debt || 0) - amount);

        try {
            // 1. Update Client Debt
            const updated = await updateClient(id, { debt: newDebt });

            // 2. Record Payment
            await addPayment({
                client_id: id,
                amount: amount,
                concept: concept || 'Pago',
                date: new Date().toISOString()
            });

            // 3. Refresh local state
            setClient({ ...client, ...updated });
            const freshPayments = await getClientPayments(id);
            setPayments(freshPayments);

            alert(`Pago registrado. Nueva deuda: $${newDebt}`);
        } catch (error) {
            console.error('Error registering payment:', error);
            alert('Error al registrar pago');
        }
    };

    const handleWhatsApp = () => {
        if (!client.phone) {
            alert('El cliente no tiene teléfono registrado.');
            return;
        }

        // Clean number
        let cleanPhone = client.phone.replace(/[^0-9]/g, '');

        // SMART DIALER: Auto-fix for Uruguay (Default)
        // If it doesn't start with 598, we assume it's a local number.
        if (!cleanPhone.startsWith('598')) {
            // If it starts with 09... (common in UY mobiles e.g. 099123456), remove the 0 and add 598
            if (cleanPhone.startsWith('09')) {
                cleanPhone = '598' + cleanPhone.substring(1);
            } else {
                // Fallback: just append 598
                cleanPhone = '598' + cleanPhone;
            }
        }

        // Log for collecting feedback if needed, or simple debug
        console.log("Opening WhatsApp for:", cleanPhone);

        let message = `Hola ${client.first_name}, te escribimos de Habana GYM.`;

        if (client.status === 'debtor') {
            message += ` Te recordamos que tienes un saldo pendiente de $${client.debt}. Por favor regulariza tu situación.`;
        } else if (new Date(client.end_date) <= new Date(new Date().setDate(new Date().getDate() + 3))) {
            message += ` Te recordamos que tu membresía vence el ${client.end_date}. ¡Te esperamos para renovar!`;
        } else {
            message += ` ¿En qué podemos ayudarte hoy?`;
        }

        const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(message)}`;

        // Open in new tab
        const win = window.open(url, '_blank');
        if (!win) {
            alert("El navegador bloqueó la ventana emergente. Por favor permite pop-ups para este sitio.");
        }
    };

    if (loading) return <div className={styles.container}>Cargando...</div>;
    if (!client) return <div className={styles.container}>Cliente no encontrado</div>;

    return (
        <div className={styles.container}>
            <header className={styles.header}>
                <Button variant="ghost" onClick={() => router.back()}>← Volver</Button>
                <div className={styles.headerActions}>
                    <Button
                        variant="primary"
                        onClick={handleWhatsApp}
                        style={{ backgroundColor: '#25D366', borderColor: '#25D366', color: '#fff' }}
                    >
                        📱 Enviar WhatsApp
                    </Button>
                    <Button variant="secondary" onClick={() => router.push(`/clients/${id}/edit`)}>✏️ Editar Cliente</Button>
                    <Button variant="danger" onClick={handleDelete}>Eliminar Cliente</Button>
                </div>
            </header>

            <div className={styles.grid}>
                <Card className={styles.profileCard}>
                    <div className={styles.avatarLarge}>
                        {client.first_name[0]}{client.last_name[0]}
                    </div>
                    <h1 className={styles.name}>{client.first_name} {client.last_name}</h1>
                    <p className={styles.email}>{client.email}</p>
                    <div className={`${styles.statusBadge} ${styles[client.status]}`}>
                        {client.status.toUpperCase()}
                    </div>

                    <div style={{ marginTop: '1.5rem', width: '100%', textAlign: 'left', backgroundColor: '#000', color: '#FFD700', padding: '1rem', borderRadius: '8px', border: '1px solid #333' }}>
                        <strong style={{ display: 'block', color: '#FFD700', marginBottom: '0.5rem', textTransform: 'uppercase', fontSize: '0.9rem' }}>⚠️ Observaciones Médicas</strong>
                        {client.medical_notes ? (
                            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{client.medical_notes}</p>
                        ) : (
                            <p style={{ margin: 0, fontStyle: 'italic', opacity: 0.7 }}>Sin observaciones registradas.</p>
                        )}
                    </div>
                </Card>

                <Card title="Membresía" className={styles.infoCard}>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Tipo:</span>
                        <span className={styles.value}>{client.membership_type}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Vencimiento:</span>
                        <span className={styles.value}>{client.end_date}</span>
                    </div>
                    <div className={styles.infoRow}>
                        <span className={styles.label}>Deuda:</span>
                        <span className={`${styles.value} ${client.debt > 0 ? styles.textDanger : ''}`}>
                            ${client.debt}
                        </span>
                    </div>
                    <div className={styles.actions}>
                        <Button variant="primary" className={styles.fullWidth} onClick={handleRenew}>
                            Renovar Membresía (+1 Mes)
                        </Button>
                        <Button variant="secondary" className={styles.fullWidth} onClick={handlePayment} style={{ marginTop: '0.5rem' }}>
                            Registrar Pago
                        </Button>
                    </div>
                </Card>

                <Card title="Plan de Entrenamiento" className={styles.planCard}>
                    <div className={styles.assignContainer}>
                        <label className={styles.assignLabel}>Asignar / Cambiar Plan</label>
                        <div className={styles.assignActions}>
                            <select
                                className={styles.select}
                                value={selectedPlan}
                                onChange={(e) => setSelectedPlan(e.target.value)}
                            >
                                <option value="">Sin plan asignado</option>
                                {plans.map(plan => (
                                    <option key={plan.id} value={plan.id}>{plan.name}</option>
                                ))}
                            </select>
                            <Button variant="secondary" onClick={handleAssignPlan}>Guardar</Button>
                        </div>
                    </div>

                    {fullPlan ? (
                        <WorkoutDetails plan={fullPlan} />
                    ) : (
                        <p className={styles.emptyText}>Selecciona y asigna un plan para ver los detalles de la rutina aqui.</p>
                    )}
                </Card>

                <Card title="Estadísticas" className={styles.statsCard}>
                    <div className={styles.statItem}>
                        <span className={styles.statNumber}>12</span>
                        <span className={styles.statLabel}>Asistencias este mes</span>
                    </div>
                </Card>

                <Card title="Historial de Pagos" className={styles.historyCard} style={{ gridColumn: '1 / -1' }}>
                    {payments.length === 0 ? (
                        <p className={styles.emptyText}>No hay pagos registrados.</p>
                    ) : (
                        <table className={styles.table} style={{ width: '100%', textAlign: 'left' }}>
                            <thead>
                                <tr>
                                    <th>Fecha</th>
                                    <th>Concepto</th>
                                    <th>Monto</th>
                                </tr>
                            </thead>
                            <tbody>
                                {payments.map(pay => (
                                    <tr key={pay.id} style={{ borderBottom: '1px solid #eee' }}>
                                        <td style={{ padding: '0.5rem' }}>{new Date(pay.date).toLocaleDateString()}</td>
                                        <td style={{ padding: '0.5rem' }}>{pay.concept}</td>
                                        <td style={{ padding: '0.5rem', fontWeight: 'bold', color: 'green' }}>${pay.amount}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </Card>
            </div>
        </div>
    );
}
