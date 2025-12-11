'use client';

import { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function FingerprintManager({ value, onChange }) {
    const [showModal, setShowModal] = useState(false);

    const handleSuccess = (code) => {
        onChange(code);
        setShowModal(false);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', alignItems: 'center', width: '100%', height: '100%' }}>
            <label style={{
                fontSize: '0.9rem',
                fontWeight: '900',
                color: '#10b981',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                marginBottom: '0.25rem'
            }}>
                HUELLA
            </label>

            <div
                onClick={() => setShowModal(true)}
                title={value ? "Huella Registrada (Click para cambiar)" : "Registrar Huella"}
                style={{
                    width: '100%',
                    height: '220px',
                    border: value ? '3px solid #ccff00' : '2px dashed #4b5563',
                    backgroundColor: value ? 'rgba(0, 0, 0, 0.5)' : 'rgba(75, 85, 99, 0.2)',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: value ? '0 0 20px rgba(204, 255, 0, 0.15)' : 'initial'
                }}
            >
                {/* Generated Image "fingerprint.png" */}
                <img
                    src="/fingerprint.png"
                    alt="Fingerprint Scan"
                    style={{
                        width: '80%',
                        height: '80%',
                        objectFit: 'contain',
                        opacity: value ? 1 : 0.4,
                        filter: value ? 'drop-shadow(0 0 8px #ccff00)' : 'grayscale(100%)',
                        mixBlendMode: 'screen',
                        transition: 'all 0.3s ease'
                    }}
                />

                {!value && (
                    <span style={{
                        position: 'absolute',
                        bottom: '20px',
                        color: '#9ca3af',
                        fontSize: '0.9rem',
                        fontWeight: '500',
                        zIndex: 10
                    }}>
                        Click para capturar
                    </span>
                )}

                {/* Status Dot */}
                <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    width: '16px',
                    height: '16px',
                    borderRadius: '50%',
                    backgroundColor: value ? '#10b981' : '#ef4444',
                    border: '3px solid #1f2937',
                    boxShadow: '0 0 5px rgba(0,0,0,0.5)',
                    zIndex: 20
                }} />
            </div>

            {showModal && (
                <FingerprintWizard
                    onClose={() => setShowModal(false)}
                    onSuccess={handleSuccess}
                />
            )}
        </div>
    );
}

function FingerprintWizard({ onClose, onSuccess }) {
    const [step, setStep] = useState(0); // 0 to 4
    const [scans, setScans] = useState([]);
    const [error, setError] = useState('');
    const [inputBuffer, setInputBuffer] = useState('');
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Enter') {
                processScan(inputBuffer);
                setInputBuffer('');
            } else if (e.key.length === 1) {
                setIsScanning(true);
                setTimeout(() => setIsScanning(false), 100);
                setInputBuffer(prev => prev + e.key);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [inputBuffer, scans]);

    const processScan = (code) => {
        if (!code) return;

        if (scans.length === 0) {
            setScans([code]);
            setStep(1);
            setError('');
        } else {
            if (code === scans[0]) {
                const newScans = [...scans, code];
                setScans(newScans);
                setStep(newScans.length);
                setError('');

                if (newScans.length === 4) {
                    setTimeout(() => onSuccess(code), 600);
                }
            } else {
                setError('¡No coincide! Intenta de nuevo.');
            }
        }
    };

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            zIndex: 9999
        }}>
            <div style={{
                width: '100%', maxWidth: '500px', textAlign: 'center',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '2rem'
            }}>
                <h2 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#fff', fontWeight: 'bold' }}>
                    {step === 4 ? '¡HUELA CAPTURADA!' : 'Coloca el dedo'}
                </h2>

                <p style={{ color: '#9ca3af', marginBottom: '3rem', fontSize: '1.2rem' }}>
                    {step === 4 ? 'Proceso finalizado con éxito' : `Escaneo ${step + 1} de 4 para verificar`}
                </p>

                <div style={{
                    position: 'relative',
                    width: '180px',
                    height: '240px',
                    marginBottom: '3rem',
                    transition: 'transform 0.1s',
                    transform: isScanning ? 'scale(0.98)' : 'scale(1)'
                }}>
                    <FingerprintIcon size={180} color="#374151" style={{ position: 'absolute', top: 0, left: 0 }} />
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        overflow: 'hidden',
                        clipPath: `inset(${100 - (step * 25)}% 0 0 0)`,
                        transition: 'clip-path 0.5s ease-out'
                    }}>
                        <FingerprintIcon size={180} color={error ? '#ef4444' : '#10b981'} />
                    </div>
                </div>

                {error && (
                    <div style={{
                        color: '#ef4444',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: '2rem',
                        fontWeight: 'bold',
                        animation: 'shake 0.5s'
                    }}>
                        ⚠ {error}
                    </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{
                            width: '12px', height: '12px', borderRadius: '50%',
                            backgroundColor: i <= step ? '#10b981' : '#374151',
                            boxShadow: i <= step ? '0 0 10px #10b981' : 'none',
                            transition: 'all 0.3s'
                        }} />
                    ))}
                </div>

                <Button variant="ghost" onClick={onClose} style={{ marginTop: '3rem', fontSize: '1.1rem' }}>
                    Cancelar
                </Button>
            </div>

            <style jsx>{`
                @keyframes shake {
                    0% { transform: translateX(0); }
                    25% { transform: translateX(-10px); }
                    50% { transform: translateX(10px); }
                    75% { transform: translateX(-10px); }
                    100% { transform: translateX(0); }
                }
            `}</style>
        </div>
    );
}

const FingerprintIcon = ({ size = 24, color = "currentColor", style = {} }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={style}
    >
        <path d="M12 12c.5-1 2-1 2.5 0" />
        <path d="M12 10a4 4 0 0 1 4 4" />
        <path d="M16 10a2 2 0 0 0-2-2" />
        <path d="M8 10.5c.5-1 2-1.5 2.5-.5" />
        <path d="M12 17.5c-2.5 0-4-3-4-3" />
        <path d="M12 19c-4 0-6.5-4-6.5-6.5a2.5 2.5 0 0 1 5 0c0 1.5 1 2 1.5 2s1.5-.5 1.5-2a2.5 2.5 0 0 1 5 0c0 3-4 6.5-6.5 6.5z" />
        <path d="M9 13s2-2 2 .5" />
        <path d="M7 15c-1 0-1.5-.5-1.5-1" />
        <path d="M16.5 16c.4.6.4 1.4-.2 1.8" />
    </svg>
);
