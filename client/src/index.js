import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import reportWebVitals from './reportWebVitals';
import Modal from 'react-modal';
import { io } from 'socket.io-client';
import switch_url from './switch';

Modal.setAppElement('#root');

// --- FIX navegador: prevenir navegación en drag & drop a nivel global ---
const preventDragNav = (e) => {
  e.preventDefault();
  e.stopPropagation();
  try {
    if (e.dataTransfer) e.dataTransfer.dropEffect = 'none';
  } catch {}
};
window.addEventListener('dragover', preventDragNav, { capture: true, passive: false });
window.addEventListener('drop', preventDragNav, { capture: true, passive: false });
// ------------------------------------------------------------------------

// Configuración del cliente de Socket.IO
const socket = io(switch_url);  // Asegúrate de que esta URL coincide con la configuración del servidor
// Opcional: evita warning si no usas 'socket' en ningún lado
// window.__socket = socket;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DndProvider backend={HTML5Backend}>
      {/* Wrapper que también bloquea drag/drop por si cae dentro del árbol React */}
      <div
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); }}
        style={{ height: '100%' }}
      >
        <App />
        <ToastContainer autoClose={1500} />
      </div>
    </DndProvider>
  </React.StrictMode>
);

reportWebVitals();
