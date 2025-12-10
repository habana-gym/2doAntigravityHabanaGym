'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import AccessPoint from '@/components/dashboard/AccessPoint';
import PageHeader from '@/components/layout/PageHeader';
import { getDashboardStats, getRecentActivity, getWeeklyAttendance } from '@/services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import styles from './page.module.css';

export default function DashboardPage() {
    const [stats, setStats] = useState({ activeClients: 0, debtorClients: 0, dailyAttendance: 0, monthlyRevenue: 0 });
    const [activity, setActivity] = useState([]);
    const [weeklyStats, setWeeklyStats] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [statsData, activityData, weeklyData] = await Promise.all([
                    getDashboardStats(),
                    getRecentActivity(),
                    getWeeklyAttendance()
                ]);
                setStats(statsData);
                setActivity(activityData);
                setWeeklyStats(weeklyData);
            } catch (error) {
                console.error('Error loading dashboard:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div className={styles.dashboard}>Cargando panel...</div>;

    return (
        <div className={styles.dashboard}>
            <PageHeader title="Dashboard" subtitle="Bienvenido a Habana GYM" />

            {/* Access Point Section */}
            <AccessPoint />

            {/* Stats Grid */}
            <div className={styles.statsGrid}>
                <Card className={styles.statCard}>
                    <div className={styles.statLabel}>Clientes Activos</div>
                    <div className={`${styles.statValue} text-primary`}>{stats.activeClients}</div>
                    <div className={styles.statTrend}>+5 esta semana</div>
                </Card>

                <Card className={`${styles.statCard} ${styles.debtorCard}`}>
                    <div className={styles.statLabel}>Deudores</div>
                    <div className={`${styles.statValue} ${styles.textDanger}`}>{stats.debtorClients}</div>
                    <div className={styles.statTrend}>Requieren atención</div>
                </Card>

                <Card className={styles.statCard}>
                    <div className={styles.statLabel}>Asistencia Hoy</div>
                    <div className={styles.statValue}>{stats.dailyAttendance}</div>
                    <div className={styles.statTrend}>En tiempo real</div>
                </Card>

                <Card className={styles.statCard}>
                    <div className={styles.statLabel}>Ingresos Mes</div>
                    <div className={`${styles.statValue} text-primary`}>${stats.monthlyRevenue.toLocaleString()}</div>
                    <div className={styles.statTrend}>+12% vs mes anterior</div>
                </Card>
            </div>

            <div className={styles.contentGrid}>
                {/* Recent Activity */}
                <Card title="Actividad Reciente" className={styles.activityCard}>
                    <div className={styles.activityList}>
                        {activity.length > 0 ? activity.map((item) => (
                            <div key={item.id} className={styles.activityItem}>
                                <div className={`${styles.activityIcon} ${item.type === 'checkin' ? styles.iconCheckin : styles.iconPayment}`}>
                                    {item.type === 'checkin' ? '📍' : '💰'}
                                </div>
                                <div className={styles.activityInfo}>
                                    <p className={styles.activityUser}>{item.user}</p>
                                    <p className={styles.activityMeta}>
                                        {item.type === 'checkin' ? 'Ingreso' : 'Pago'} • {item.time}
                                    </p>
                                </div>
                                {item.status === 'warning' && (
                                    <span className={styles.badgeWarning}>Deudor</span>
                                )}
                                {item.amount && (
                                    <span className={styles.amount}>+${item.amount}</span>
                                )}
                            </div>
                        )) : <p className={styles.emptyText}>No hay actividad reciente.</p>}
                    </div>
                </Card>

                {/* Chart */}
                <Card title="Asistencia (Últimos 7 días)" className={styles.chartCard}>
                    <div style={{ width: '100%', height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={weeklyStats}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                                <XAxis dataKey="name" stroke="#888" tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', borderRadius: '8px' }}
                                />
                                <Bar dataKey="asistencias" fill="#FFD700" radius={[4, 4, 0, 0]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </Card>
            </div>
        </div>
    );
}
