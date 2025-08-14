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

// --- FIX: prevenir navegación del navegador en drag/drop global ---
const prevent = (e) => {
  // Si estás usando uploads por drop en algún lugar, quita este prevent
  // o cambia la condición para permitir drop en targets específicos.
  e.preventDefault();
};
window.addEventListener('dragover', prevent);
window.addEventListener('drop', prevent);
// ------------------------------------------------------------------

// Configuración del cliente de Socket.IO
// (si no usas 'socket' en ningún sitio, podrías comentar esta línea para evitar warning)
const socket = io(switch_url);  // Asegúrate de que esta URL coincide con la configuración del servidor
// opcional: usarlo para evitar warning de variable no usada
// window.__socket = socket;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DndProvider backend={HTML5Backend}>
      <App />
      <ToastContainer autoClose={1500}/>    
    </DndProvider>
  </React.StrictMode>
);

reportWebVitals();
