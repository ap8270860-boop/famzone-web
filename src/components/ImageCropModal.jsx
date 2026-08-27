import React, { useState, useRef } from 'react';
import './ImageCropModal.css';

export default function ImageCropModal({ isOpen, imageSrc, title = 'Crop Photo', onClose, onSave }) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [aspect, setAspect] = useState('1:1'); // '1:1', '4:3', '16:9', 'circle'
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const canvasRef = useRef(null);

  if (!isOpen || !imageSrc) return null;

  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleRotateLeft = () => setRotation(r => (r - 90) % 360);
  const handleRotateRight = () => setRotation(r => (r + 90) % 360);
  const handleFlipHorizontal = () => setRotation(r => (r + 180) % 360);

  const handleSaveCrop = () => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const size = 300;
      canvas.width = size;
      canvas.height = size;

      ctx.save();
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);
      ctx.drawImage(
        img,
        -size / 2 + position.x / zoom,
        -size / 2 + position.y / zoom,
        size,
        size
      );
      ctx.restore();

      const croppedUrl = canvas.toDataURL('image/jpeg', 0.9);
      onSave(croppedUrl);
      onClose();
    };
  };

  return (
    <div className="crop-modal-overlay" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
      <div className="crop-modal-container">
        <div className="crop-modal-header">
          <h3>{title}</h3>
          <button className="crop-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="crop-viewport-wrapper" onMouseMove={handleMouseMove}>
          <div 
            className={`crop-preview-box aspect-${aspect.replace(':', '-')}`}
            onMouseDown={handleMouseDown}
          >
            <img 
              src={imageSrc} 
              alt="Crop target" 
              className="crop-image-element"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`
              }}
              draggable={false}
            />
            <div className="crop-grid-overlay">
              <div className="grid-line h1" />
              <div className="grid-line h2" />
              <div className="grid-line v1" />
              <div className="grid-line v2" />
            </div>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="crop-controls-panel">
          {/* Aspect Ratio Options */}
          <div className="crop-control-group">
            <label className="crop-label">Aspect Ratio</label>
            <div className="crop-pill-row">
              {['1:1', '4:3', '16:9', 'circle'].map(ratio => (
                <button
                  key={ratio}
                  type="button"
                  className={`crop-pill-btn ${aspect === ratio ? 'active' : ''}`}
                  onClick={() => setAspect(ratio)}
                >
                  {ratio === 'circle' ? 'Circle' : ratio}
                </button>
              ))}
            </div>
          </div>

          {/* Zoom Slider */}
          <div className="crop-control-group">
            <div className="crop-label-row">
              <label className="crop-label">Zoom</label>
              <span className="crop-value-label">{Math.round(zoom * 100)}%</span>
            </div>
            <input 
              type="range" 
              min="0.5" 
              max="3" 
              step="0.05"
              value={zoom} 
              onChange={(e) => setZoom(parseFloat(e.target.value))}
              className="crop-slider"
            />
          </div>

          {/* Transform Buttons */}
          <div className="crop-control-group">
            <label className="crop-label">Transform</label>
            <div className="crop-tools-row">
              <button type="button" className="crop-tool-btn" onClick={handleRotateLeft} title="Rotate Left 90°">
                🔄 90° Left
              </button>
              <button type="button" className="crop-tool-btn" onClick={handleRotateRight} title="Rotate Right 90°">
                🔁 90° Right
              </button>
              <button type="button" className="crop-tool-btn" onClick={handleFlipHorizontal} title="Flip 180°">
                ⇄ Flip 180°
              </button>
              <button type="button" className="crop-tool-btn danger" onClick={() => { setZoom(1); setRotation(0); setPosition({x:0, y:0}); }} title="Reset">
                ↺ Reset
              </button>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="crop-modal-footer">
          <button type="button" className="crop-cancel-btn" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="crop-save-btn" onClick={handleSaveCrop}>
            Apply & Save Photo
          </button>
        </div>
      </div>
    </div>
  );
}
