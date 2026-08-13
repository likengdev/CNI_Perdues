import React, { useState, useRef, useEffect } from 'react';

export default function RecadragePhoto({ src, onValider, onAnnuler }) {
  const imageRef = useRef(null);
  const canvasRef = useRef(null);
  
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });

  const onMouseDown = (e) => {
    e.preventDefault();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setStartPos({ x, y });
    setCrop({ x, y, width: 0, height: 0 });
    setIsDragging(true);
  };

  const onMouseMove = (e) => {
    if (!isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    setCrop({
      x: Math.min(startPos.x, currentX),
      y: Math.min(startPos.y, currentY),
      width: Math.abs(currentX - startPos.x),
      height: Math.abs(currentY - startPos.y),
    });
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const valider = () => {
    if (!imageRef.current || !canvasRef.current || crop.width === 0 || crop.height === 0) return;
    const img = imageRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    const scaleX = img.naturalWidth / img.clientWidth;
    const scaleY = img.naturalHeight / img.clientHeight;
    
    canvas.width = crop.width * scaleX;
    canvas.height = crop.height * scaleY;
    
    ctx.drawImage(
      img,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      canvas.width,
      canvas.height
    );
    
    const base64 = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
    onValider(base64);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl p-6 shadow-2xl max-w-3xl w-full flex flex-col max-h-[90vh]">
        <div className="mb-4 text-center">
          <h2 className="text-xl font-bold text-slate-800">Recadrer la photo</h2>
          <p className="text-sm text-slate-500">Tracez un rectangle autour du visage pour le sélectionner.</p>
        </div>
        
        <div className="flex-grow flex items-center justify-center bg-slate-50 rounded-2xl p-2 overflow-auto">
          <div 
            className="relative cursor-crosshair select-none inline-block shadow-sm bg-white"
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              const rect = e.currentTarget.getBoundingClientRect();
              onMouseDown({ preventDefault: () => {}, currentTarget: e.currentTarget, clientX: touch.clientX, clientY: touch.clientY, left: rect.left, top: rect.top });
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              const rect = e.currentTarget.getBoundingClientRect();
              onMouseMove({ currentTarget: e.currentTarget, clientX: touch.clientX, clientY: touch.clientY, left: rect.left, top: rect.top });
            }}
            onTouchEnd={onMouseUp}
          >
            <img 
              ref={imageRef} 
              src={src} 
              alt="Source" 
              className="max-w-full max-h-[55vh] block pointer-events-none" 
              draggable={false}
              onLoad={(e) => {
                 const img = e.target;
                 const w = img.clientWidth;
                 const h = img.clientHeight;
                 setCrop({
                   x: w * 0.25,
                   y: h * 0.25,
                   width: w * 0.5,
                   height: h * 0.5
                 });
              }}
            />
            
            {crop.width > 0 && crop.height > 0 && (
              <div 
                className="absolute border-2 border-brand-500 bg-brand-500/20 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pointer-events-none transition-none"
                style={{
                  left: crop.x,
                  top: crop.y,
                  width: crop.width,
                  height: crop.height,
                }}
              >
                  <div className="absolute top-0 left-0 w-2 h-2 bg-white border border-brand-500 -mt-1 -ml-1"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 bg-white border border-brand-500 -mt-1 -mr-1"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 bg-white border border-brand-500 -mb-1 -ml-1"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-white border border-brand-500 -mb-1 -mr-1"></div>
              </div>
            )}
          </div>
        </div>
        
        <canvas ref={canvasRef} className="hidden" />
        
        <div className="mt-6 flex justify-end gap-3">
          <button 
            type="button" 
            onClick={onAnnuler}
            className="px-5 py-2.5 rounded-full font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Annuler
          </button>
          <button 
            type="button" 
            onClick={valider}
            disabled={crop.width === 0 || crop.height === 0}
            className="px-5 py-2.5 rounded-full font-medium text-white bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-700 hover:to-brand-600 disabled:opacity-50 transition-colors"
          >
            Valider le recadrage
          </button>
        </div>
      </div>
    </div>
  );
}
