import React, { useRef, useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import './App.css';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Switch } from "@mui/material";
import DarkModeSwitch from './component/DarkModeSwitch';

function App() {
    const canvasRef = useRef(null);
    const contextRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [fileName, setFileName] = useState('drawing');
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [currentTool, setCurrentTool] = useState('brush');
    const [toggleDarkMode, setToggleDarkMode] = useState(true);
    const [startX, setStartX] = useState(0);
    const [startY, setStartY] = useState(0);
    const [canvasData, setCanvasData] = useState(null);

    // function to toggle the dark mode as true or false

    const toggleDarkTheme = () => {
        setToggleDarkMode(!toggleDarkMode);
    };

    //   Apply The Primary and Secondary Theme Colors 

    const darkTheme = createTheme({
        palette: {
            mode: toggleDarkMode ? 'dark' : 'light', // handle the dark mode state on toggle
            primary: {
                main: '#90caf9',
            },
            secondary: {
                main: '#131052',
            },
        },
    });

    // Unified state for tool properties (color, size)
    const [toolProperties, setToolProperties] = useState({
        brush: { color: '#000000', size: 5 },
        rectangle: { color: '#000000', size: 5 },
        circle: { color: '#000000', size: 5 },
        line: { color: '#000000', size: 5 }
    });

    useEffect(() => {
        const savedToolProperties = localStorage.getItem('toolProperties');
        if (savedToolProperties) {
            setToolProperties(JSON.parse(savedToolProperties));
        }
        const canvas = canvasRef.current;
        canvas.width = window.innerWidth * 2;
        canvas.height = window.innerHeight * 2;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;

        const context = canvas.getContext('2d');
        context.scale(2, 2);
        context.lineCap = 'round';
        contextRef.current = context;

        loadCanvasData();
        loadFileName();

        window.addEventListener('storage', syncCanvasAcrossTabs);

        return () => {
            window.removeEventListener('storage', syncCanvasAcrossTabs);
        };
    }, []);

    useEffect(() => {
        if (contextRef.current) {
            const { color, size } = toolProperties[currentTool];
            contextRef.current.strokeStyle = color;
            contextRef.current.lineWidth = size;
        }
    }, [currentTool, toolProperties]);

    const updateToolProperties = (tool, property, value) => {
        setToolProperties((prevProperties) => {
            const newProperties = {
                ...prevProperties,
                [tool]: { ...prevProperties[tool], [property]: value },
            };
            localStorage.setItem('toolProperties', JSON.stringify(newProperties));
            return newProperties;
        });
    };


    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        setStartX(offsetX);
        setStartY(offsetY);
        setIsDrawing(true);

        setCanvasData(canvasRef.current.toDataURL());
        if (currentTool === 'brush') {
            contextRef.current.beginPath();
            contextRef.current.moveTo(offsetX, offsetY);
        }
    };

    const drawShape = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;

        if (currentTool === 'brush') {
            contextRef.current.lineTo(offsetX, offsetY);
            contextRef.current.stroke();
            return;
        }

        const image = new Image();
        image.src = canvasData;
        image.onload = () => {
            contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            contextRef.current.drawImage(image, 0, 0, canvasRef.current.width / 2, canvasRef.current.height / 2);

            switch (currentTool) {
                case 'rectangle':
                    drawRectangle(startX, startY, offsetX, offsetY);
                    break;
                case 'circle':
                    drawCircle(startX, startY, offsetX, offsetY);
                    break;
                case 'line':
                    drawLine(startX, startY, offsetX, offsetY);
                    break;
                default:
                    break;
            }
        };
    };

    const finishDrawing = () => {
        setIsDrawing(false);
        saveCanvasData();
        if (currentTool === 'brush') {
            contextRef.current.closePath();
        }
    };

    const drawRectangle = (x1, y1, x2, y2) => {
        const width = x2 - x1;
        const height = y2 - y1;
        contextRef.current.beginPath();
        contextRef.current.rect(x1, y1, width, height);
        contextRef.current.stroke();
        contextRef.current.closePath();
    };

    const drawCircle = (x1, y1, x2, y2) => {
        const radius = Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        contextRef.current.beginPath();
        contextRef.current.arc(x1, y1, radius, 0, 2 * Math.PI);
        contextRef.current.stroke();
        contextRef.current.closePath();
    };

    const drawLine = (x1, y1, x2, y2) => {
        contextRef.current.beginPath();
        contextRef.current.moveTo(x1, y1);
        contextRef.current.lineTo(x2, y2);
        contextRef.current.stroke();
        contextRef.current.closePath();
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
            orientation: 'landscape',
            unit: 'px',
            format: [canvas.width, canvas.height],
            putOnlyUsedFonts: true,
            floatPrecision: 16,
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

    const saveCanvasData = () => {
        const canvas = canvasRef.current;
        const canvasData = canvas.toDataURL();
        localStorage.setItem('savedCanvas', canvasData);
        localStorage.setItem('canvasUpdateTime', Date.now());
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

    const saveFileName = (newFileName) => {
        localStorage.setItem('fileName', newFileName);
    };

    const loadFileName = () => {
        const savedFileName = localStorage.getItem('fileName');
        if (savedFileName) {
            setFileName(savedFileName);
        }
    };

    const syncCanvasAcrossTabs = (event) => {
        if (event.key === 'savedCanvas') {
            loadCanvasData();
        }
    };

    if (toggleDarkMode) {
        return (
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />
                <div className="App">
                    <h1>Collaborative Drawing Canvas</h1>
                    <div className="toolbar">

                        <button
                            className={`tool-button ${currentTool === 'brush' ? 'selected' : ''} selected-dark`}
                            onClick={() => setCurrentTool('brush')}
                        >
                            Brush
                        </button>

                        <button
                            className={`tool-button ${currentTool === 'rectangle' ? 'selected' : ''} selected-dark`}
                            onClick={() => setCurrentTool('rectangle')}
                        >
                            Rectangle
                        </button>
                        <button
                            className={`tool-button ${currentTool === 'circle' ? 'selected' : ''} selected-dark`}

                            onClick={() => setCurrentTool('circle')}
                        >
                            Circle
                        </button>
                        <button
                            className={`tool-button ${currentTool === 'line' ? 'selected' : ''} selected-dark`}
                            onClick={() => setCurrentTool('line')}
                        >
                            Line
                        </button>

                        <label>
                            Color:
                            <input
                                type="color"
                                value={toolProperties[currentTool].color}
                                onChange={(e) => updateToolProperties(currentTool, 'color', e.target.value)}
                            />
                        </label>
                        <label>
                            Size:
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={toolProperties[currentTool].size}
                                onChange={(e) => updateToolProperties(currentTool, 'size', e.target.value)}
                            />
                        </label>
                        <button className='selected-dark' onClick={clearCanvas}>Clear Canvas</button>
                        <input
                            type="text"
                            placeholder="File name"
                            value={fileName}
                            onChange={(e) => {
                                setFileName(e.target.value);
                                saveFileName(e.target.value);
                            }}
                        />
                        <div className="dropdown">
                            <button className='selected-dark' onClick={() => setIsDropdownOpen(!isDropdownOpen)}>Download</button>
                            {isDropdownOpen && (
                                <ul className="dropdown-menu">
                                    <li onClick={() => handleDownload('png')}>Download PNG</li>
                                    <li onClick={() => handleDownload('jpeg')}>Download JPEG</li>
                                    <li onClick={() => handleDownload('pdf')}>Download PDF</li>
                                </ul>
                            )}
                        </div>


                        <DarkModeSwitch checked={toggleDarkMode} onChange={toggleDarkTheme} />
                    </div>
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={drawShape}
                        onMouseUp={finishDrawing}
                        onMouseLeave={finishDrawing}
                    />
                </div>
            </ThemeProvider>

        );
    }

    else {
        return (
            <ThemeProvider theme={darkTheme}>
                <CssBaseline />

                <div className="App">
                    <h1>Collaborative Drawing Canvas</h1>
                    <div className="toolbar">

                        <button
                            className={`tool-button ${currentTool === 'brush' ? 'selected' : ''} selected-light`}
                            onClick={() => setCurrentTool('brush')}
                        >
                            Brush
                        </button>

                        <button
                            className={`tool-button ${currentTool === 'rectangle' ? 'selected' : ''} selected-light`}
                            onClick={() => setCurrentTool('rectangle')}
                        >
                            Rectangle
                        </button>
                        <button
                            className={`tool-button ${currentTool === 'circle' ? 'selected' : ''} selected-light`}

                            onClick={() => setCurrentTool('circle')}
                        >
                            Circle
                        </button>
                        <button
                            className={`tool-button ${currentTool === 'line' ? 'selected' : ''} selected-light`}
                            onClick={() => setCurrentTool('line')}
                        >
                            Line
                        </button>

                        <label>
                            Color:
                            <input
                                type="color"
                                value={toolProperties[currentTool].color}
                                onChange={(e) => updateToolProperties(currentTool, 'color', e.target.value)}
                            />
                        </label>
                        <label>
                            Size:
                            <input
                                type="range"
                                min="1"
                                max="50"
                                value={toolProperties[currentTool].size}
                                onChange={(e) => updateToolProperties(currentTool, 'size', e.target.value)}
                            />
                        </label>
                        <button className='selected-light' onClick={clearCanvas}>Clear Canvas</button>
                        <input
                            type="text"
                            placeholder="File name"
                            value={fileName}
                            onChange={(e) => {
                                setFileName(e.target.value);
                                saveFileName(e.target.value);
                            }}
                        />
                        <div className="dropdown">
                            <button className='selected-light' onClick={() => setIsDropdownOpen(!isDropdownOpen)}>Download</button>
                            {isDropdownOpen && (
                                <ul className="dropdown-menu">
                                    <li onClick={() => handleDownload('png')}>Download PNG</li>
                                    <li onClick={() => handleDownload('jpeg')}>Download JPEG</li>
                                    <li onClick={() => handleDownload('pdf')}>Download PDF</li>
                                </ul>
                            )}
                        </div>
                        <DarkModeSwitch checked={toggleDarkMode} onChange={toggleDarkTheme} />


                    </div>
                    <canvas
                        ref={canvasRef}
                        onMouseDown={startDrawing}
                        onMouseMove={drawShape}
                        onMouseUp={finishDrawing}
                        onMouseLeave={finishDrawing}
                    />
                </div>



            </ThemeProvider>
        );
    }
}


export default App;
