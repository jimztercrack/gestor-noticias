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

// ✅ Listeners mínimos: no usan capture ni stopPropagation.
//    Permiten a react-dnd manejar el drop. Solo evitamos que
//    soltar ARCHIVOS externos abra el navegador.
window.addEventListener('dragover', (e) => {
  e.preventDefault();
}, false);

window.addEventListener('drop', (e) => {
  const types = e.dataTransfer ? Array.from(e.dataTransfer.types || []) : [];
  if (types.includes('Files')) {
    e.preventDefault();
  }
}, false);

// Configuración del cliente de Socket.IO
const socket = io(switch_url); // Asegúrate de que esta URL coincide con tu servidor
// Opcional, para evitar warning si no lo usas aún:
// window.__socket = socket;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DndProvider backend={HTML5Backend}>
      {/* ❌ Sin wrapper con onDragOver/onDrop que bloquee eventos */}
      <App />
      <ToastContainer autoClose={1500} />
    </DndProvider>
  </React.StrictMode>
);

reportWebVitals();
