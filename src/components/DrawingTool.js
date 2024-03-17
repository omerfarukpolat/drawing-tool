import React, { useState, useEffect, useRef } from 'react';
import { Button, Input, Space } from "antd";
import {DeleteOutlined, EditOutlined} from "@ant-design/icons/lib/icons";
import JSZip from 'jszip';

const brushAlpha = 0.009;

const DrawingTool = ({
                       imageUrl,
                       selectedTool,
                       onAreaLabeled,
                       selectedArea,
                       labeledAreas,
                       onEditArea,
                       onDeleteArea,
                       onSave,
                     }) => {
  const canvasRef = useRef(null);
  const inputRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [context, setContext] = useState(null);
  const [drawnArea, setDrawnArea] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [areaValue, setAreaValue] = useState('');
  const [brushSize, setBrushSize] = useState(10);
  const [penColor, setPenColor] = useState('#000000');
  const [brushColor, setBrushColor] = useState('#000000');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

    if (isFirstPointAfterZoom) {
      context.beginPath();
      context.moveTo(offsetX, offsetY);
      setIsFirstPointAfterZoom(false);
    } else {
      context.lineTo(offsetX, offsetY);
      context.strokeStyle = selectedTool === 'brush' ? `rgba(${parseInt(brushColor.slice(-6, -4), 16)}, ${parseInt(brushColor.slice(-4, -2), 16)}, ${parseInt(brushColor.slice(-2), 16)}, ${brushAlpha})` : brushColor;
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
    setIsFirstPointAfterZoom(true);
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

    if(isEditing) {
        onEditArea(areaValue, selectedArea);
        setIsEditing(false);
        setModalVisible(false);
        return;
    }
    if (!areaValue || !drawnArea) return;

    const filledArea = getFilledAreaCoordinates(canvasRef.current, { red: 0, green: 0, blue: 0, alpha: 255 });
    const newArea = { value: areaValue, coordinates: filledArea, key: areaValue + Math.floor(Math.random() * 1000000) };
    onAreaLabeled(newArea);

    setAreaValue('');
    setModalVisible(false);
  };

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

        if (
            pixelColor.red === fillColor.red &&
            pixelColor.green === fillColor.green &&
            pixelColor.blue === fillColor.blue &&
            pixelColor.alpha === fillColor.alpha
        ) {
          filledCoordinates.push({ x, y });
        }
      }
    }

    return filledCoordinates;
  };

  const fillSelectedArea = () => {
    if (!context) return;

    context.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

    if (imageUrl) {
      const img = new Image();
      img.src = imageUrl;
      img.onload = () => {
        context.drawImage(img, 0, 0, canvasRef.current.width, canvasRef.current.height);

        labeledAreas.forEach(area => {
          context.fillStyle = brushColor;
          area.coordinates.forEach(coord => {
            if(selectedArea) {
              if (selectedArea.key === area.key) {
                context.fillStyle = 'rgba(255, 255, 0, 0.5)';
                context.fill();
              }
            }
            context.fillRect(coord.x, coord.y, 1, 1);
            context.fillStyle = `rgba(${parseInt(penColor.slice(-6, -4), 16)}, ${parseInt(penColor.slice(-4, -2), 16)}, ${parseInt(penColor.slice(-2), 16)}, 0.5)`;
          });
          context.fill();
        });

        if (selectedArea) {
          selectedArea.coordinates.forEach(coord => {
            context.fillStyle = 'rgba(255, 255, 0, 0.5)';
            context.fillRect(coord.x, coord.y, 2.5, 2.5);
          });
        }
      };
    }
  };

  const handleSave = () => {
    const zip = new JSZip();

    // Save modified image as PNG
    const canvas = canvasRef.current;
    const modifiedImage = canvas.toDataURL('image/png');
    zip.file('modified_image.png', modifiedImage.split('base64,')[1], { base64: true });

    // Save label file from labeledAreas
    const labelFileContent = JSON.stringify(labeledAreas, null, 2);
    zip.file('labels.json', labelFileContent);

    zip.generateAsync({ type: 'blob' }).then((blob) => {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'drawing_tool_data.zip';
      link.click();
    });
  };

  return (
      <div>
        <div style={{ overflow: 'hidden' }}>
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
        {(selectedTool === 'brush' && imageUrl)  && (
            <>
              <div>
              <label>Brush Size: </label>
              <input
                  type="range"
                  min="1"
                  step="1"
                  max="20"
                  value={brushSize}
                  onChange={(e) => setBrushSize(parseInt(e.target.value))}
              />
              </div>
              <div>
              <label>Brush Color: </label>
              <input
                  type="color"
                  value={brushColor}
                  onChange={(e) => setBrushColor(e.target.value)}
              />
              </div>
            </>
        )}
        {(selectedTool === 'pen' && imageUrl) && (
            <>
              <label>Pen Color: </label>
              <input
                  type="color"
                  value={penColor}
                  onChange={(e) => setPenColor(e.target.value)}
              />
            </>
        )}
        {selectedArea && (
            <div className={'row'}>
              <p>Labeling Tools: </p>
              <div className={'delete-area'}>
                <Button
                    onClick={() => {
                      onDeleteArea(selectedArea.key);
                      setModalVisible(false);
                    }}
                    icon={<DeleteOutlined />}
                >Delete Area</Button>
              </div>
              <div className={'delete-area'}>
                <Button
                    onClick={() => {
                        setIsEditing(true);
                        setModalVisible(true);
                    }}
                    icon={<EditOutlined />}
                >Edit Label</Button>
              </div>
            </div>
        )}
        {modalVisible && (
            <div className="modal">
              <p>Enter the label value of selected area: </p>
              <form
                  onSubmit={handleModalSubmit}
                  className={'modal'}
                  style={{ flexDirection: 'row' }}
              >
                <Space className={'full-width'}>
                  <Input
                      defaultValue="Combine input and button"
                      value={areaValue}
                      ref={inputRef}
                      onChange={(e) => {
                        setAreaValue(e.target.value);
                      }}
                  />
                  <Button
                      onClick={handleModalSubmit}
                      type="primary">Submit</Button>
                </Space>
              </form>
            </div>
        )}
        {
          imageUrl && (
                <Button
                  className={'save-image-button'}
                  type={'dashed'} onClick={handleSave}>Save</Button>
            )
        }
      </div>
  );
};

export default DrawingTool;
