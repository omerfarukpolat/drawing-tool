import React, { useState, useEffect, useRef } from 'react';
import {Button, Input, Space} from "antd";
import {DeleteOutlined} from "@ant-design/icons/lib/icons";


const brushAlpha = 0.01;

const DrawingTool = ({ imageUrl,
                       selectedTool,
                       onAreaLabeled,
                       selectedArea,
                       labeledAreas,
                       onEditArea,
                      onDeleteArea,
}) => {
  const canvasRef = useRef(null);
  const inputRef = useRef(null); // Ref for the input element
  const [isDrawing, setIsDrawing] = useState(false);
  const [context, setContext] = useState(null);
  const [drawnArea, setDrawnArea] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [areaValue, setAreaValue] = useState('');
  const [brushSize, setBrushSize] = useState(10);
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

  useEffect(() => {
    fillSelectedArea();
  }, [selectedArea, labeledAreas]);

  useEffect(() => {
    if (modalVisible) {
      inputRef.current.focus();
    }
  }, [modalVisible]);


  useEffect(() => {
    setCanvasWidth(window.innerWidth / 1.5);
    setCanvasHeight(window.innerHeight / 1.5);
  }, [zoomLevel]);

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

    // Capture the filled area coordinates
    const filledArea = getFilledAreaCoordinates(canvasRef.current, { red: 0, green: 0, blue: 0, alpha: 255 });

    // Save the label value and filled area coordinates to labeledAreas
    const newArea = { value: areaValue, coordinates: filledArea, key: areaValue + Math.floor(Math.random() * 1000000)};
    onAreaLabeled(newArea);

    // Reset the areaValue and close the modal
    setAreaValue('');
    setModalVisible(false);
  };

  // Function to get the coordinates of the filled area
  const getFilledAreaCoordinates = (canvas, fillColor) => {
    const ctx = canvas.getContext('2d');
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    const filledCoordinates = [];

    for (let y = 0; y < canvas.height; y++) {
      for (let x = 0; x < canvas.width; x++) {
        const index = (y * canvas.width + x) * 4;
        const pixelColor = {
          red: data[index],
          green: data[index + 1],
          blue: data[index + 2],
          alpha: data[index + 3]
        };

        // Check if the pixel color matches the fill color
        if (pixelColor.red === fillColor.red &&
            pixelColor.green === fillColor.green &&
            pixelColor.blue === fillColor.blue &&
            pixelColor.alpha === fillColor.alpha) {
          filledCoordinates.push({ x, y });
        }
      }
    }

    return filledCoordinates;
  };

  const fillSelectedArea = () => {
    if (!context) return;

    // Clear the canvas
    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    // Redraw the image
    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
      context.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);


      labeledAreas.forEach(area => {
          context.fillStyle = penColor;
          area.coordinates.forEach(coord => {
            context.fillRect(coord.x, coord.y, 1, 1);
            context.fillStyle = `rgba(${parseInt(penColor.slice(-6, -4), 16)}, ${parseInt(penColor.slice(-4, -2), 16)}, ${parseInt(penColor.slice(-2), 16)}, 0.5)`;
          });
          context.fill(); // Fill the area after setting the fillStyle
        });


        if(selectedArea) {
          // Fill the selected area with yellow color
          selectedArea.coordinates.forEach(coord => {
            context.fillStyle = 'rgba(255, 255, 0, 0.5)';
            context.fillRect(coord.x, coord.y, 2.5, 2.5);
          });
        }

        if (selectedTool === 'pen') {
          // Fill style is half transparent penColor
          context.fillStyle = `rgba(${parseInt(penColor.slice(-6, -4), 16)}, ${parseInt(penColor.slice(-4, -2), 16)}, ${parseInt(penColor.slice(-2), 16)}, 0.5)`;
          context.fill();
        }
      };
    }
  };

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
        {
          selectedArea && (
              // 3 buttons to delete, edit and save the selected area
                <div>
                    <Button
                        onClick={() => {
                          onDeleteArea(selectedArea.key);
                          setModalVisible(false);
                        }}
                        icon={<DeleteOutlined />}
                    />
                    <Button
                    >
                    Edit
                    </Button>
                </div>
            )
        }
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
