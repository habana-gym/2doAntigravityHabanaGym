'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/layout/PageHeader';
import { getClients, getSettings } from '@/services/api';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function ClientsPage() {
    const router = useRouter();
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);
    const [graceDays, setGraceDays] = useState(5);

    useEffect(() => {
        const loadClients = async () => {
            try {
                const [data, settings] = await Promise.all([
                    getClients(),
                    getSettings()
                ]);
                setClients(data);
                if (settings && settings.inactive_grace_days) {
                    setGraceDays(parseInt(settings.inactive_grace_days, 10));
                }
            } catch (error) {
                console.error('Error loading clients:', error);
            } finally {
                setLoading(false);
            }
        };
        loadClients();
    }, []);

    const filteredClients = clients.filter(client => {
        const matchesFilter = filter === 'all' || client.status === filter;
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
            client.first_name.toLowerCase().includes(searchLower) ||
            client.last_name.toLowerCase().includes(searchLower) ||
            client.email.toLowerCase().includes(searchLower);

        return matchesFilter && matchesSearch;
    });

    if (loading) return <div className={styles.container}>Cargando...</div>;

    return (
        <div className={styles.container}>
            <PageHeader
                title="Clientes"
                subtitle="Gestión de socios y membresías"
                actions={
                    <Link href="/clients/new">
                        <Button variant="primary">
                            + Nuevo Cliente
                        </Button>
                    </Link>
                }
            />

            <Card className={styles.filterCard}>
                <div className={styles.filters}>
                    <div className={styles.searchBox}>
                        <input
                            type="text"
                            placeholder="Buscar por nombre o ID..."
                            className={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className={styles.statusFilters}>
                        <button
                            className={`${styles.filterBtn} ${filter === 'all' ? styles.activeFilter : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Todos ({clients.length})
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filter === 'active' ? styles.activeFilter : ''}`}
                            onClick={() => setFilter('active')}
                        >
                            Activos ({clients.filter(c => c.status === 'active').length})
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filter === 'debtor' ? styles.activeFilter : ''}`}
                            onClick={() => setFilter('debtor')}
                        >
                            Deudores ({clients.filter(c => c.status === 'debtor').length})
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filter === 'inactive' ? styles.activeFilter : ''}`}
                            onClick={() => setFilter('inactive')}
                        >
                            Inactivos ({clients.filter(c => c.status === 'inactive').length})
                        </button>
                    </div>
                </div>
            </Card>

            <Card className={styles.tableCard}>
                <div className={styles.tableWrapper}>
                    <table className={styles.table}>
                        <thead>
                            <tr>
                                <th>Nombre</th>
                                <th>Estado</th>
                                <th>Membresía</th>
                                <th>Plan</th>
                                <th>Vencimiento</th>
                                <th>Deuda</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredClients.map((client) => (
                                <tr
                                    key={client.id}
                                    className={styles.row}
                                    onDoubleClick={() => router.push(`/clients/${client.id}`)}
                                    title="Doble click para ver detalles"
                                    style={{ cursor: 'pointer' }}
                                >
                                    <td>
                                        <div className={styles.clientName}>
                                            <div className={styles.avatar}>
                                                {client.first_name[0]}{client.last_name[0]}
                                            </div>
                                            <div>
                                                <div className={styles.name}>{client.first_name} {client.last_name}</div>
                                                <div className={styles.email}>{client.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`${styles.statusBadge} ${styles[client.status]}`}>
                                            {(() => {
                                                if (client.status === 'debtor') return 'Deudor';
                                                if (client.status === 'inactive') return 'Inactivo';

                                                const endDate = new Date(client.end_date);
                                                const today = new Date();
                                                today.setHours(0, 0, 0, 0);
                                                endDate.setHours(0, 0, 0, 0);
                                                const diffTime = today - endDate;
                                                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                                                if (diffDays <= 0) return 'Activo';
                                                if (diffDays <= graceDays) return 'Gracia';
                                                return 'Vencido';
                                            })()}
                                        </span>
                                    </td>
                                    <td>{client.membership_type}</td>
                                    <td>{client.plans ? client.plans.name : <span className={styles.textMuted}>-</span>}</td>
                                    <td>{client.end_date}</td>
                                    <td>
                                        {client.debt > 0 ? (
                                            <span className={styles.textDanger}>${client.debt}</span>
                                        ) : (
                                            <span className={styles.textSuccess}>-</span>
                                        )}
                                    </td>
                                    <td>
                                        <div className={styles.actions}>
                                            <Button
                                                variant="ghost"
                                                className={styles.actionBtn}
                                                onClick={() => {
                                                    // Format phone: remove non-numeric, ensure 598 prefix if missing
                                                    let phone = client.phone.replace(/\D/g, '');
                                                    if (phone.startsWith('09')) phone = '598' + phone.substring(1);
                                                    if (!phone.startsWith('598') && phone.length === 8) phone = '598' + phone;

                                                    // Custom message based on status
                                                    let text = `Hola ${client.first_name}, te escribimos de Habana Gym.`;
                                                    if (client.status === 'debtor') {
                                                        text += ` Te recordamos que tu mensualidad venció el ${new Date(client.end_date).toLocaleDateString()}. Por favor, regulariza tu pago cuando puedas. ¡Gracias!`;
                                                    } else if (client.status === 'inactive') {
                                                        text += ` Hace tiempo no te vemos. ¿Te gustaría reactivar tu entrenamiento?`;
                                                    }

                                                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
                                                }}
                                                title="Enviar WhatsApp"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    viewBox="0 0 24 24"
                                                    width="28"
                                                    height="28"
                                                    style={{ display: 'block', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.2))' }}
                                                >
                                                    <path fill="#25D366" d="M12.04 2c-5.522 0-9.999 4.477-9.999 9.999 0 2.15.697 4.148 1.876 5.792L2 22l4.288-1.896c1.597 1.129 3.528 1.896 5.752 1.896 5.522 0 10-4.477 10-9.999S17.562 2 12.04 2z" />
                                                    <path fill="#fff" d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.592 2.654-.696c1.005.572 1.903.887 2.806.887l.001-.001c3.181-.001 5.767-2.587 5.767-5.766.001-3.185-2.585-5.77-5.768-5.77zm0 10.155c-.812 0-1.608-.262-2.308-.669l-.168-.1-.956.255.254-.93-.105-.172c-.443-.706-.708-1.517-.707-2.772 0-2.457 2.001-4.455 4.455-4.455 2.453 0 4.454 1.999 4.454 4.455.001 2.46-2.001 4.458-4.919 4.388zm2.465-3.32c-.135-.067-.798-.387-.923-.432-.124-.044-.213-.067-.302.068-.089.134-.344.433-.422.522-.078.089-.156.1-.289.034-.134-.067-.565-.208-1.077-.663-.402-.357-.674-.799-.752-.933-.079-.134-.008-.206.059-.273.061-.061.134-.156.201-.234.067-.078.089-.133.134-.223.045-.089.022-.167-.011-.233-.033-.067-.302-.727-.413-1.002-.109-.267-.219-.231-.302-.235l-.257-.005c-.089 0-.234.034-.356.167-.123.133-.467.455-.467 1.111 0 .656.478 1.289.544 1.378.067.089 1.884 2.866 4.545 4.026.634.276 1.13.441 1.516.564.646.205 1.234.175 1.696.107.514-.076 1.574-.643 1.796-1.264.223-.621.223-1.154.156-1.265-.067-.111-.245-.178-.38-.245z" />
                                                </svg>
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
