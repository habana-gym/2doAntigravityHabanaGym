'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Button from '@/components/ui/Button';

export default function WebcamCapture({ onCapture, initialImage }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const containerRef = useRef(null);

    const [isStreaming, setIsStreaming] = useState(false);
    const [image, setImage] = useState(initialImage || null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Editing State
    const [scale, setScale] = useState(1);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const startCamera = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                setIsStreaming(true);
                setError(null);
            }
        } catch (err) {
            console.error("Error accessing camera:", err);
            setError(`Error: ${err.name} - ${err.message}. Verifique permisos o conexión.`);
        } finally {
            setIsLoading(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            videoRef.current.srcObject = null;
            setIsStreaming(false);
        }
    };

    const capture = useCallback(() => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0);

        // Initial capture, no transform yet
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setImage(dataUrl);
        setScale(1);
        setPosition({ x: 0, y: 0 });
        onCapture(dataUrl); // Allow robust saving of unedited version too
        stopCamera();
    }, [onCapture]);

    const retake = () => {
        setImage(null);
        startCamera();
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result);
                setScale(1);
                setPosition({ x: 0, y: 0 });
                onCapture(reader.result);
                setError(null);
            };
            reader.readAsDataURL(file);
        }
    };

    // --- Editing Logic ---

    const handleMouseDown = (e) => {
        e.preventDefault();
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const handleMouseMove = (e) => {
        if (isDragging) {
            setPosition({
                x: e.clientX - dragStart.x,
                y: e.clientY - dragStart.y
            });
        }
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const saveEdit = () => {
        if (!image || !containerRef.current) return; // Use containerRef to get dimensions

        const canvas = document.createElement('canvas');
        // Output size (320x240, matching the container's visible area)
        const containerWidth = containerRef.current.offsetWidth;
        const containerHeight = containerRef.current.offsetHeight;
        canvas.width = containerWidth;
        canvas.height = containerHeight;
        const ctx = canvas.getContext('2d');

        // Fill background black
        ctx.fillStyle = '#000';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const img = new Image();
        img.src = image;
        img.onload = () => {
            // Calculate the image's natural aspect ratio
            const imgAspectRatio = img.width / img.height;
            // Calculate the container's aspect ratio
            const containerAspectRatio = containerWidth / containerHeight;

            let drawWidth, drawHeight, offsetX, offsetY;

            // Determine how the original image would fit 'contain' in the container
            if (imgAspectRatio > containerAspectRatio) {
                // Image is wider than container, fit by width
                drawWidth = containerWidth;
                drawHeight = containerWidth / imgAspectRatio;
                offsetX = 0;
                offsetY = (containerHeight - drawHeight) / 2;
            } else {
                // Image is taller than container, fit by height
                drawHeight = containerHeight;
                drawWidth = containerHeight * imgAspectRatio;
                offsetX = (containerWidth - drawWidth) / 2;
                offsetY = 0;
            }

            // Apply transformations relative to the contained image
            // The image in the DOM is scaled and translated. We need to reverse these to draw correctly.
            // The DOM image has object-fit: contain, so we need to account for the initial scaling it applies.

            // First, translate to the center of the canvas
            ctx.translate(canvas.width / 2, canvas.height / 2);

            // Then, apply the user's pan and zoom
            // The position state is in pixels relative to the container.
            // The scale state is a multiplier.

            // Adjust position based on the actual contained size of the image
            const scaledDrawWidth = drawWidth * scale;
            const scaledDrawHeight = drawHeight * scale;

            // The position (x,y) is the offset of the image's center from the container's center.
            // When drawing, we need to shift the image's top-left corner.
            // The image's top-left corner in the transformed space would be:
            // (-scaledDrawWidth / 2 + position.x), (-scaledDrawHeight / 2 + position.y)

            // We need to draw the original image, scaled and translated.
            // The image is drawn from its top-left corner.
            // The transform origin is 'center' in CSS, so position.x/y are offsets from center.
            // To draw from top-left, we need to adjust.

            // The image's center in the canvas coordinates (before user transforms) is (0,0) due to ctx.translate.
            // User's position.x/y are offsets from this center.
            // So, the image's new center is (position.x, position.y).
            // Its top-left corner is (position.x - scaledDrawWidth / 2, position.y - scaledDrawHeight / 2).

            ctx.drawImage(
                img,
                position.x - scaledDrawWidth / 2,
                position.y - scaledDrawHeight / 2,
                scaledDrawWidth,
                scaledDrawHeight
            );

            const finalData = canvas.toDataURL('image/jpeg', 0.8);
            onCapture(finalData);
            alert("Edición guardada");
        };
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', border: '1px solid #374151', padding: '1rem', borderRadius: '8px', background: '#111827' }}>
            <label style={{ alignSelf: 'flex-start', fontWeight: '500' }}>Foto de Perfil</label>

            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!image ? (
                <div style={{ position: 'relative', width: '320px', height: '240px', background: '#000', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
                    {isStreaming ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    ) : (
                        <>
                            <span style={{ color: '#6b7280' }}>Cámara inactiva</span>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                                <label
                                    htmlFor="file-upload"
                                    style={{
                                        cursor: 'pointer',
                                        padding: '0.5rem 1rem',
                                        background: 'var(--color-bg-surface)',
                                        border: '1px solid var(--color-border)',
                                        borderRadius: '4px',
                                        fontSize: '0.9rem'
                                    }}
                                >
                                    📁 Subir Archivo
                                </label>
                                <input
                                    id="file-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                    style={{ display: 'none' }}
                                />
                            </div>
                        </>
                    )}
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '320px' }}>
                    <div
                        ref={containerRef}
                        style={{
                            position: 'relative',
                            width: '320px',
                            height: '240px',
                            borderRadius: '8px',
                            overflow: 'hidden',
                            cursor: isDragging ? 'grabbing' : 'grab',
                            background: '#000',
                            border: '2px solid var(--color-primary)'
                        }}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                    >
                        <img
                            src={image}
                            alt="Capture"
                            style={{
                                width: '100%',
                                height: '100%',
                                objectFit: 'contain', // Changed to contain so we can zoom effectively without initial crop
                                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
                                transformOrigin: 'center',
                                userSelect: 'none',
                                pointerEvents: 'none' // Let events bubble to container
                            }}
                        />
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '4px' }}>
                        <span style={{ fontSize: '0.8rem' }}>🔍 Zoom:</span>
                        <input
                            type="range"
                            min="1"
                            max="3"
                            step="0.1"
                            value={scale}
                            onChange={(e) => setScale(parseFloat(e.target.value))}
                            style={{ flex: 1 }}
                        />
                    </div>
                    <small style={{ color: '#9ca3af', textAlign: 'center' }}>Arrastra la imagen para moverla</small>
                </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                {!image && !isStreaming && (
                    <Button type="button" variant="secondary" onClick={startCamera} disabled={isLoading}>
                        {isLoading ? 'Iniciando...' : '📷 Encender Cámara'}
                    </Button>
                )}

                {!image && isStreaming && (
                    <>
                        <Button type="button" variant="danger" onClick={stopCamera}>Apagar</Button>
                        <Button type="button" variant="primary" onClick={capture}>📸 Tomar Foto</Button>
                    </>
                )}

                {image && (
                    <>
                        <Button type="button" variant="secondary" onClick={saveEdit}>💾 Confirmar Edición</Button>
                        <Button type="button" variant="ghost" onClick={() => setImage(null)} style={{ fontSize: '0.9rem' }}>❌ Descartar</Button>
                    </>
                )}
            </div>
        </div>
    );
}
