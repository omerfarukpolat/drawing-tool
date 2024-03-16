import React, { useState, useEffect, useRef } from 'react';

const DrawingTool = ({ imageUrl, selectedTool }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [brushSize, setBrushSize] = useState(10); // Initial brush size
  const [brushAlpha, setBrushAlpha] = useState(0.01); // Initial brush alpha (transparency)
  const [brushedAreas, setBrushedAreas] = useState([]);
  const [penColor, setPenColor] = useState('#000000'); // Initial pen color

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
        context.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);
      };
    }
  }, [imageUrl, context]);

  const startDrawing = (event) => {
    if(!(selectedTool === 'pen' || selectedTool === 'brush')) return
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left);
    const offsetY = (event.clientY - rect.top);
    context.beginPath();
    context.moveTo(offsetX, offsetY);
  };

  const draw = (event) => {
    if (!isDrawing) return;
    if(!(selectedTool === 'pen' || selectedTool === 'brush')) return
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = (event.clientX - rect.left);
    const offsetY = (event.clientY - rect.top);
    context.lineTo(offsetX, offsetY);
    context.strokeStyle = selectedTool === 'brush' ? `rgba(0, 0, 0, ${brushAlpha})` : penColor;
    context.lineWidth = selectedTool === 'brush' ? brushSize : 1;
    context.stroke();
  };

  const endDrawing = () => {
    if(!(selectedTool === 'pen' || selectedTool === 'brush')) return
    if (!isDrawing) return;
    setIsDrawing(false);
    context.closePath();
    if (selectedTool === 'brush') {
      // Save the brushed area
      setBrushedAreas([...brushedAreas, { alpha: brushAlpha, size: brushSize }]);
    }
  };

  const lockBrushedArea = () => {
    // Lock the brushed area, prevent further editing
    // This could involve rendering the brushed area differently or disabling interaction with it
    console.log('Brushed area locked:', brushedAreas);
  };


  return (
      <div>
        <canvas
            ref={canvasRef}
            width={window.innerWidth / 1.5}
            height={window.innerHeight / 1.5}
            style={{ border: '1px solid #ccc' }}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={endDrawing}
            onMouseLeave={endDrawing}
        />

        <div style={{  bottom: 10, left: 10 }}>
        {
          selectedTool === 'brush' && (
              <>
                <label>Brush Size: </label>
                <input
                    type="range"
                    min="1"
                    max="50"
                    value={brushSize}
                    onChange={(e) => setBrushSize(parseInt(e.target.value))}
                />
                <label>Brush Transparency: </label>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={brushAlpha}
                    onChange={(e) => setBrushAlpha(parseFloat(e.target.value))}
                />
              </>
            )
        }
          {selectedTool === 'pen' && (
              <>
                <label>Pen Color: </label>
                <input
                    type="color"
                    value={penColor}
                    onChange={(e) => setPenColor(e.target.value)}
                />
              </>
          )}
        </div>
      </div>
  );
};

export default DrawingTool;
