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

// Configuración del cliente de Socket.IO
const socket = io(switch_url);  // Asegúrate de que esta URL coincide con la configuración del servidor

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <DndProvider backend={HTML5Backend}>
      <App />
      <ToastContainer autoClose={1500}/>    
    </DndProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
