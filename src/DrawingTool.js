import React, { useState, useEffect, useRef } from 'react';
import {Button, Input, Space} from "antd";

const DrawingTool = ({ imageUrl, selectedTool }) => {
  const canvasRef = useRef(null);
  const inputRef = useRef(null); // Ref for the input element
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [drawnArea, setDrawnArea] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [areaValue, setAreaValue] = useState('');
  const [brushSize, setBrushSize] = useState(10);
  const [brushAlpha, setBrushAlpha] = useState(0.01);
  const [brushedAreas, setBrushedAreas] = useState([]);
  const [penColor, setPenColor] = useState('#000000');
  const [zoomLevel, setZoomLevel] = useState(1);
  const [canvasWidth, setCanvasWidth] = useState(window.innerWidth / 1.5);
  const [canvasHeight, setCanvasHeight] = useState(window.innerHeight / 1.5);
  const [isFirstPointAfterZoom, setIsFirstPointAfterZoom] = useState(true);
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
        context.drawImage(img, 0, 0, canvasWidth, canvasHeight);
      };
    }
  }, [imageUrl, context, canvasWidth, canvasHeight]);

  const startDrawing = (event) => {
    if (!(selectedTool === 'pen' || selectedTool === 'brush')) return;
    setIsDrawing(true);
    const rect = canvasRef.current.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    context.beginPath();
    context.moveTo(offsetX, offsetY);
  };

  const draw = (event) => {
    if (!isDrawing || !(selectedTool === 'pen' || selectedTool === 'brush')) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current.width / rect.width;
    const scaleY = canvasRef.current.height / rect.height;
    const offsetX = (event.clientX - rect.left) * scaleX;
    const offsetY = (event.clientY - rect.top) * scaleY;

    // Check if it's the first point being drawn after a zoom event
    if (isFirstPointAfterZoom) {
      context.beginPath();
      context.moveTo(offsetX, offsetY);
      setIsFirstPointAfterZoom(false);
    } else {
      context.lineTo(offsetX, offsetY);
      context.strokeStyle = selectedTool === 'brush' ? `rgba(0, 0, 0, ${brushAlpha})` : penColor;
      context.lineWidth = selectedTool === 'brush' ? brushSize : 1;
      context.stroke();
    }
  };

  const handleZoom = (event) => {
    event.preventDefault();
    const zoomFactor = 0.1;
    if (event.deltaY < 0) {
      setZoomLevel(Math.min(3, zoomLevel + zoomFactor));
    } else {
      setZoomLevel(Math.max(1, zoomLevel - zoomFactor));
    }
    setIsFirstPointAfterZoom(true); // Set isFirstPointAfterZoom to true after handling zoom
  };


  const endDrawing = () => {
    if (!(selectedTool === 'pen' || selectedTool === 'brush')) return;
    if (!isDrawing) return;
    setIsDrawing(false);
    context.closePath();
    if (selectedTool === 'pen') {
      context.fillStyle = `rgba(${parseInt(penColor.slice(-6, -4), 16)}, ${parseInt(penColor.slice(-4, -2), 16)}, ${parseInt(penColor.slice(-2), 16)}, 0.5)`;
      context.fill();
    }

    const area = canvasRef.current.toDataURL();
    setDrawnArea(area);
    setModalVisible(true);
  };

  const handleModalSubmit = (event) => {
    event.preventDefault();
    if (!areaValue || !drawnArea) return;
    const newArea = { value: areaValue, coordinates: drawnArea };
    setBrushedAreas([...brushedAreas, newArea]);
    setModalVisible(false);
  };

  useEffect(() => {
    // Focus on the input element when the modal becomes visible
    if (modalVisible) {
      inputRef.current.focus();
    }
  }, [modalVisible]);


  useEffect(() => {
    setCanvasWidth(window.innerWidth / 1.5);
    setCanvasHeight(window.innerHeight / 1.5);
  }, [zoomLevel]);

  return (
      <div>
        <div style={{
          overflow: 'hidden'
        }}>
          <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              style={{ border: '1px solid #ccc', transform: `scale(${zoomLevel})` }}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={endDrawing}
              onMouseLeave={endDrawing}
              onWheel={handleZoom}
          />
        </div>
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
        {modalVisible && (
            <div className="modal">
              <p>Enter the label value of selected area: </p>
              <form
                  onSubmit={handleModalSubmit}
                  className={'modal'}
                  style={{ flexDirection: 'row' }}>
                <Space style={{ width: '100%' }}>
                  <Input
                      defaultValue="Combine input and button"
                      value={areaValue}
                      ref={inputRef}
                      onChange={(e) => setAreaValue(e.target.value)}
                  />
                  <Button type="primary">Submit</Button>
                </Space>

              </form>
            </div>
        )}
      </div>
  );
};

export default DrawingTool;
