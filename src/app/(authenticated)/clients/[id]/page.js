'use client';

import { supabase } from '@/lib/supabase';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import WorkoutDetails from '@/components/workouts/WorkoutDetails';
import { getClientById, updateClient, deleteClient, getWorkoutPlans, addPayment, getClientPayments, getWorkoutPlanById, getMemberships, getSettings } from '@/services/api';
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
    const [memberships, setMemberships] = useState([]);
    const [showRenewModal, setShowRenewModal] = useState(false);
    const [selectedMembershipId, setSelectedMembershipId] = useState('');
    const [renewalStartDate, setRenewalStartDate] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [previewEndDate, setPreviewEndDate] = useState(''); // Visual preview
    const [graceDays, setGraceDays] = useState(5);
    const [error, setError] = useState(''); // Error state for modal

    useEffect(() => {
        const loadData = async () => {
            try {
                const [clientData, plansData, paymentsData, membershipsData, settingsData] = await Promise.all([
                    getClientById(id),
                    getWorkoutPlans(),
                    getClientPayments(id),
                    getMemberships(),
                    getSettings()
                ]);
                setClient(clientData);
                setPlans(plansData);
                setPayments(paymentsData);
                setMemberships(membershipsData);
                if (settingsData && settingsData.inactive_grace_days) {
                    setGraceDays(parseInt(settingsData.inactive_grace_days));
                }

                if (clientData.plan_id) {
                    setSelectedPlan(clientData.plan_id);
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

    // Calculate Preview Date whenever inputs change
    useEffect(() => {
        if (!renewalStartDate || !selectedMembershipId || memberships.length === 0) {
            setPreviewEndDate('');
            return;
        }

        const selectedMem = memberships.find(m => m.id === selectedMembershipId);
        if (!selectedMem) return;

        const parts = renewalStartDate.split('-');
        const year = parseInt(parts[0], 10);
        const month = parseInt(parts[1], 10) - 1;
        const day = parseInt(parts[2], 10);

        const end = new Date(year, month, day);

        if (selectedMem.duration_days) {
            end.setDate(end.getDate() + selectedMem.duration_days);
        } else {
            end.setDate(end.getDate() + 30);
        }

        setPreviewEndDate(end.toISOString().split('T')[0]);

    }, [renewalStartDate, selectedMembershipId, memberships]);

    const handleRenewClick = () => {
        const currentEnd = new Date(client.end_date);
        const today = new Date();
        const baseDate = currentEnd > today ? currentEnd : today;

        setRenewalStartDate(baseDate.toISOString().split('T')[0]);
        setPaymentDate(today.toISOString().split('T')[0]);
        setShowRenewModal(true);
    };

    const confirmRenewal = async () => {
        setError('');
        console.log("Confirming renewal... STARTED");

        if (!selectedMembershipId) {
            setError('Por favor selecciona una membresía.');
            return;
        }

        if (!renewalStartDate || !paymentDate) {
            setError('Por favor completa ambas fechas (Inicio y Pago).');
            return;
        }

        const selectedMemDetail = memberships.find(m => m.id === selectedMembershipId);
        if (!selectedMemDetail) return;

        try {
            const parts = renewalStartDate.split('-');
            const year = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            const day = parseInt(parts[2], 10);

            let newEnd = new Date(year, month, day);

            if (selectedMemDetail.duration_days) {
                newEnd.setDate(newEnd.getDate() + selectedMemDetail.duration_days);
            } else {
                newEnd.setDate(newEnd.getDate() + 30);
            }

            const paymentDateObj = new Date(paymentDate);
            paymentDateObj.setHours(12, 0, 0, 0);

            if (isNaN(newEnd.getTime()) || isNaN(paymentDateObj.getTime())) {
                setError('Fechas inválidas. Por favor verifícalas.');
                return;
            }

            console.log("Values to save:", {
                client_id: id,
                amount: selectedMemDetail.price,
                concept: `Renovación: ${selectedMemDetail.name}`,
                date: paymentDateObj.toISOString(),
                new_end_date: newEnd.toISOString()
            });

            // REMOVED NATIVE CONFIRM DIALOG to prevent browser blocking issues

            // 1. Record Payment
            console.log("Attempting to insert payment...");
            const { error: paymentError } = await supabase
                .from('payments')
                .insert([{
                    client_id: id,
                    amount: selectedMemDetail.price,
                    concept: `Renovación: ${selectedMemDetail.name}`,
                    date: paymentDateObj.toISOString()
                }]);

            if (paymentError) {
                console.error("Payment Error:", paymentError);
                throw new Error(`Error en Pago: ${paymentError.message} (Code: ${paymentError.code})`);
            }
            console.log("Payment inserted successfully.");

            // 2. Update Client
            console.log("Attempting to update client...");
            const updated = await updateClient(id, {
                status: 'active',
                end_date: newEnd.toISOString().split('T')[0],
                debt: 0,
                membership_type: selectedMemDetail.name
            });
            console.log("Client updated successfully.");

            // 3. Refresh Payments List
            const freshPayments = await getClientPayments(id);
            setPayments(freshPayments);

            setClient({ ...client, ...updated });
            alert('¡Renovación exitosa!');
            setShowRenewModal(false);
            setSelectedMembershipId('');
        } catch (error) {
            console.error('CRITICAL Error renewing:', error);
            const msg = `Error al guardar: ${error.message || 'Desconocido'}`;
            setError(msg);
            alert(msg); // Force alert in case UI is stuck
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

            alert('Plan asignado correctamente');
        } catch (error) {
            console.error('Error assigning plan:', error);
            alert('Error al asignar plan');
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
                        {client.photo_url ? (
                            <img
                                src={client.photo_url}
                                alt={`${client.first_name} ${client.last_name}`}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        ) : (
                            `${client.first_name[0]}${client.last_name[0]}`
                        )}
                    </div>
                    <h1 className={styles.name}>{client.first_name} {client.last_name}</h1>
                    <p className={styles.email}>{client.email}</p>
                    <div className={`${styles.statusBadge} ${styles[client.status]}`}>
                        {(() => {
                            if (client.status === 'debtor') return 'DEUDOR';
                            if (client.status === 'inactive') return 'INACTIVO';

                            // Check expiration for Active/Grace
                            const endDate = new Date(client.end_date);
                            const today = new Date();
                            today.setHours(0, 0, 0, 0);
                            endDate.setHours(0, 0, 0, 0);

                            const diffTime = today - endDate;
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            if (diffDays <= 0) return 'ACTIVO';
                            if (diffDays <= graceDays) return 'PERIODO DE GRACIA';
                            return 'VENCIDO';
                        })()}

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
                        <Button variant="primary" className={styles.fullWidth} onClick={handleRenewClick}>
                            Renovar Membresía
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

            {/* Renewal Modal */}
            {showRenewModal && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <Card style={{ width: '90%', maxWidth: '400px' }}>
                        <h2 style={{ color: '#fff', marginBottom: '1rem', marginTop: 0 }}>Renovar Membresía</h2>

                        {error && (
                            <div style={{
                                backgroundColor: 'rgba(220, 38, 38, 0.2)',
                                border: '1px solid #ef4444',
                                color: '#fca5a5',
                                padding: '0.75rem',
                                borderRadius: '6px',
                                marginBottom: '1rem',
                                fontSize: '0.9rem'
                            }}>
                                ⚠ {error}
                            </div>
                        )}

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', color: '#aaa', marginBottom: '0.5rem' }}>Selecciona una opción:</label>
                            <select
                                value={selectedMembershipId}
                                onChange={(e) => setSelectedMembershipId(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    borderRadius: '8px',
                                    border: '1px solid #333',
                                    backgroundColor: '#111',
                                    color: '#fff'
                                }}
                            >
                                <option value="">-- Seleccionar --</option>
                                {memberships.map(m => (
                                    <option key={m.id} value={m.id}>
                                        {m.name} - ${m.price} ({m.duration_days} días)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <Input
                                label="Fecha de Inicio (Membresía)"
                                type="date"
                                value={renewalStartDate}
                                onChange={(e) => setRenewalStartDate(e.target.value)}
                                style={{ backgroundColor: '#111', color: '#fff', border: '1px solid #333' }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <Input
                                label="Fecha de PAGO (Registro Contable)"
                                type="date"
                                value={paymentDate}
                                onChange={(e) => setPaymentDate(e.target.value)}
                                style={{ backgroundColor: '#111', color: '#fff', border: '1px solid #333' }}
                            />
                        </div>

                        {previewEndDate && (
                            <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#333', borderRadius: '8px', border: '1px solid #444' }}>
                                <label style={{ display: 'block', color: '#aaa', fontSize: '0.8rem', marginBottom: '0.2rem' }}>Nueva Fecha de Vencimiento Estimada:</label>
                                <strong style={{ color: '#4ADE80', fontSize: '1.2rem' }}>
                                    {previewEndDate.split('-').reverse().join('/')}
                                </strong>
                            </div>
                        )}

                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <Button variant="secondary" onClick={() => setShowRenewModal(false)} style={{ flex: 1 }}>
                                Cancelar
                            </Button>
                            <Button variant="primary" onClick={confirmRenewal} style={{ flex: 1 }}>
                                Confirmar
                            </Button>
                        </div>
                    </Card>
                </div>
            )
            }
        </div >
    );
}
