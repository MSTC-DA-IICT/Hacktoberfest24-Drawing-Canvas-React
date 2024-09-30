# Collaborative Drawing Canvas 

### **Description**
A real-time, collaborative drawing canvas that allows users to draw, customize, and manage their artwork across multiple browser tabs without the need for a backend or WebSocket. The project demonstrates state persistence using **LocalStorage** and event listeners to simulate real-time collaboration across tabs. Users can save, load, and export their drawings, making the project fully functional even in offline mode.

This project is built with **React** and provides multiple drawing tools, undo/redo functionality, color selection, and more advanced features like canvas size adjustments and profile-based collaboration.

---

## **Features**
- **Freehand Drawing**: Users can draw on a canvas using a customizable pen tool.
- **Color and Brush Size Selection**: Pick different colors and brush sizes for drawing.
- **Undo/Redo Functionality**: Easily revert or restore previous drawing actions.
- **Multi-Tab Synchronization**: Drawings persist and sync across multiple tabs using `LocalStorage`.
- **Save/Load Drawings**: Save your canvas state locally and reload it anytime.
- **Export as Image**: Export the current drawing as a PNG or JPG image.
- **Shape Drawing**: Draw predefined shapes (rectangles, circles, lines) on the canvas.
- **Canvas Size Adjustment**: Dynamically resize the canvas while retaining the artwork.
- **Offline Mode**: Works fully offline, with no need for backend or internet connection.
