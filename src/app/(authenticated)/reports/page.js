'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import PageHeader from '@/components/layout/PageHeader'; // Assuming PageHeader exists now
import Card from '@/components/ui/Card';
import { getMonthlyPayments } from '@/services/api';
import styles from './page.module.css';

export default function ReportsPage() {
    const [monthlyData, setMonthlyData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [totalIncome, setTotalIncome] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            try {
                const data = await getMonthlyPayments();
                setMonthlyData(data);

                // Calculate total for current month (last item in data usually, or filter by date)
                // For simplicity, sum of all data shown or just specifically current month if we had it separately.
                // Let's sum the last 12 months for "Annual Revenue" or just showing the chart.
                const total = data.reduce((acc, curr) => acc + curr.total, 0);
                setTotalIncome(total);
            } catch (error) {
                console.error('Error loading reports:', error);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    if (loading) return <div>Cargando reportes...</div>;

    return (
        <div className={styles.container}>
            <PageHeader
                title="Reportes Financieros"
                subtitle="Vista general de ingresos y rendimiento"
            />

            {/* Revenue Goal Card */}
            <Card className={styles.goalCard} style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: 'white' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Meta Mensual</h2>
                        <p style={{ opacity: 0.8, margin: 0 }}>Objetivo: $150,000</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                            {Math.min(100, (totalIncome / 150000) * 100).toFixed(1)}%
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div style={{ width: '100%', height: '24px', background: 'rgba(255,255,255,0.1)', borderRadius: '12px', overflow: 'hidden', position: 'relative' }}>
                    <div
                        style={{
                            width: `${Math.min(100, (totalIncome / 150000) * 100)}%`,
                            height: '100%',
                            background: totalIncome >= 150000 ? '#4ade80' : '#3b82f6',
                            transition: 'width 1s ease-in-out',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            paddingRight: '10px'
                        }}
                    >
                    </div>
                </div>

                {totalIncome >= 150000 && (
                    <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(74, 222, 128, 0.2)', borderRadius: '8px', border: '1px solid #4ade80', textAlign: 'center' }}>
                        <span style={{ fontSize: '1.2rem' }}>🎉 ¡FELICITACIONES! Has alcanzado tu meta mensual. 🎉</span>
                    </div>
                )}
            </Card>

            <div className={styles.kpiGrid}>
                <div className={styles.kpiCard}>
                    <span className={styles.kpiLabel}>Ingresos Totales (Año)</span>
                    <span className={styles.kpiValue}>${totalIncome.toLocaleString()}</span>
                </div>
                {/* Placeholder for future KPIs like "Active Members", "Debtors" */}
            </div>

            <div className={styles.chartCard}>
                <h2 className={styles.chartTitle}>Evolución de Ingresos Mensuales</h2>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tick={{ fill: '#888', fontSize: 12 }}
                            />
                            <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(value) => `$${value}`}
                                tick={{ fill: '#888', fontSize: 12 }}
                            />
                            <Tooltip
                                cursor={{ fill: 'transparent' }}
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                            />
                            <Bar dataKey="total" fill="#4ade80" radius={[4, 4, 0, 0]} barSize={40} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
