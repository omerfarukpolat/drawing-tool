import React, { useState, useEffect, useRef } from 'react';

const DrawingTool = ({ imageUrl }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [brushSize, setBrushSize] = useState(10); // Initial brush size
  const [brushAlpha, setBrushAlpha] = useState(0.5); // Initial brush alpha (transparency)
  const [brushedAreas, setBrushedAreas] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    setContext(ctx);
  }, []);

  useEffect(() => {
    if (imageUrl && context) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        context.drawImage(img, 0, 0, window.innerWidth, window.innerHeight);
      };
    }
  }, [imageUrl, context]);

  const startDrawing = (event) => {
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    context.beginPath();
    context.moveTo(offsetX, offsetY);
  };

  const draw = (event) => {
    if (!isDrawing) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    context.lineTo(offsetX, offsetY);
    context.strokeStyle = `rgba(100, 0, 0, ${0.03})`; // Set brush color with alpha
    context.lineWidth = brushSize;
    context.stroke();
  };

  const endDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    context.closePath();
    // Save the brushed area
    setBrushedAreas([...brushedAreas, { alpha: brushAlpha, size: brushSize }]);
  };

  return (
      <div style={{ position: 'relative' }}>
        <canvas
            ref={canvasRef}
            width={window.innerWidth}
            height={window.innerHeight}
            style={{ border: '1px solid #ccc', position: 'absolute', top: 0, left: 0 }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
        />
      </div>
  );
};

export default DrawingTool;
