'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';
import PageHeader from '@/components/layout/PageHeader';
import { getClients } from '@/services/api';
import styles from './page.module.css';

export default function ClientsPage() {
    const [clients, setClients] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadClients = async () => {
            try {
                const data = await getClients();
                setClients(data);
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
                            Todos
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filter === 'active' ? styles.activeFilter : ''}`}
                            onClick={() => setFilter('active')}
                        >
                            Activos
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filter === 'debtor' ? styles.activeFilter : ''}`}
                            onClick={() => setFilter('debtor')}
                        >
                            Deudores
                        </button>
                        <button
                            className={`${styles.filterBtn} ${filter === 'inactive' ? styles.activeFilter : ''}`}
                            onClick={() => setFilter('inactive')}
                        >
                            Inactivos
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
                                <tr key={client.id} className={styles.row}>
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
                                            {client.status === 'active' ? 'Activo' :
                                                client.status === 'debtor' ? 'Deudor' : 'Inactivo'}
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
                                            <Link href={`/clients/${client.id}`}>
                                                <Button variant="ghost" className={styles.actionBtn}>Ver</Button>
                                            </Link>
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
