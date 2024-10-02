import React, { useRef, useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import './App.css';

function App() {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [lineWidth, setLineWidth] = useState(5);
  const [fileName, setFileName] = useState('drawing');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    canvas.width = window.innerWidth * 2;
    canvas.height = window.innerHeight * 2;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;

    const context = canvas.getContext('2d');
    context.scale(2, 2);
    context.lineCap = 'round';
    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    contextRef.current = context;

     loadCanvasData();
  }, [color, lineWidth]);

  const startDrawing = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.beginPath();
    contextRef.current.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const finishDrawing = () => {
    contextRef.current.closePath();
    setIsDrawing(false);

     saveCanvasData();
  };

  const draw = ({ nativeEvent }) => {
    if (!isDrawing) {
      return;
    }
    const { offsetX, offsetY } = nativeEvent;
    contextRef.current.lineTo(offsetX, offsetY);
    contextRef.current.stroke();
  };

  const clearCanvas = () => {
    contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    saveCanvasData();  
  };

  const exportCanvasAsImage = (format) => {
    const canvas = canvasRef.current;
    const image = canvas.toDataURL(`image/${format}`);
    const anchor = document.createElement('a');
    anchor.href = image;
    anchor.download = `${fileName}.${format}`;
    anchor.click();
    setIsDropdownOpen(false);
  };

  const downloadPDF = () => {
    const canvas = canvasRef.current;
    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [canvas.width, canvas.height],
      putOnlyUsedFonts: true,
      floatPrecision: 16
    });

    const imgData = canvas.toDataURL('image/jpeg');
    pdf.addImage(imgData, 'JPEG', 0, 0, canvas.width, canvas.height);
    pdf.save(`${fileName}.pdf`);
    setIsDropdownOpen(false);
  };

  const handleDownload = (format) => {
    if (format === 'pdf') {
      downloadPDF();
    } else {
      exportCanvasAsImage(format);
    }
  };

  // Saving functionality
  const saveCanvasData = () => {
    const canvas = canvasRef.current;
    const canvasData = canvas.toDataURL();
    localStorage.setItem('savedCanvas', canvasData);
  };

   const loadCanvasData = () => {
    const savedCanvas = localStorage.getItem('savedCanvas');
    if (savedCanvas) {
      const canvas = canvasRef.current;
      const context = contextRef.current;
      const image = new Image();
      image.src = savedCanvas;
      image.onload = () => {
        context.clearRect(0, 0, canvas.width, canvas.height); 
        context.drawImage(image, 0, 0, canvas.width / 2, canvas.height / 2);  
      };
    }
  };

  return (
      <div className="App">
        <h1>Collaborative Drawing Canvas</h1>
        <div className="toolbar">
          <label>
            Color:
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
          </label>
          <label>
            Brush Size:
            <input
                type="range"
                min="1"
                max="50"
                value={lineWidth}
                onChange={(e) => setLineWidth(e.target.value)}
            />
          </label>
          <button onClick={clearCanvas}>Clear Canvas</button>
          <label>
            File Name:
            <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
            />
          </label>
          <div className="dropdown">
            <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>
              Download
            </button>
            {isDropdownOpen && (
                <div className="dropdown-menu">
                  <button onClick={() => handleDownload('png')}>PNG</button>
                  <button onClick={() => handleDownload('jpeg')}>JPEG</button>
                  <button onClick={() => handleDownload('pdf')}>PDF</button>
                </div>
            )}
          </div>
        </div>
        <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={finishDrawing}
            onMouseMove={draw}
            className="drawing-canvas"
        />
      </div>
  );
}

export default App;
