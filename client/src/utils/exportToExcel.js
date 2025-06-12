import * as XLSX from 'xlsx';
import { toast } from 'react-toastify';
import axios from 'axios';
import switch_url from '../switch';

export const exportCintillosToExcel = async (notes, containerName) => {
  if (!notes || !Array.isArray(notes)) {
    console.error('Invalid notes data');
    return;
  }

  // Obtener los valores de compra y venta del backend
  let compra, venta;
  try {
    const response = await axios.get(`${switch_url}/api/dolars`);
    const dolars = response.data;
    console.log('Dolar data fetched:', dolars);
    if (dolars.length > 0) {
      const latestDolar = dolars[dolars.length - 1];
      compra = latestDolar.compra;
      venta = latestDolar.venta;
      console.log('Compra:', compra, 'Venta:', venta);
    } else {
      console.error('No data received from backend');
      toast.error('No se recibieron datos del backend');
      return;
    }
  } catch (error) {
    console.error('Error fetching dolar data:', error);
    toast.error('Error al obtener los datos del dólar');
    return;
  }

  const cintillosData = [];

  notes.forEach(note => {
    if (!note.cintillos || !Array.isArray(note.cintillos)) {
      console.error(`Invalid cintillos for note: ${note.titulo}`);
      return;
    }

    let isFirstCintillo = true;

    note.cintillos.forEach(cintillo => {
      cintillosData.push({
        NOTA: isFirstCintillo ? note.titulo || "Sin título" : "",
        NOMBRE: cintillo.nombre || "",
        CARGO: cintillo.cargo || "",
        INFO: cintillo.informacion || ""
      });
      isFirstCintillo = false;
    });

    // Añadir una fila vacía después de cada nota
    cintillosData.push({
      NOTA: "",
      NOMBRE: "",
      CARGO: "",
      INFO: ""
    });
  });

  if (cintillosData.length === 0) {
    console.error('No cintillos data to export');
    toast.error('No hay cintillos para exportar');
    return;
  }

  // Añadir fila de encabezados y fila de valores de compra y venta

  const headers = {
    NOTA: "",
    NOMBRE: "",
    CARGO: "",
    INFO: "",
    COMPRA: compra || "",
    VENTA: venta || ""
  };

  const exportData = [headers, ...cintillosData];

  // Convertir los datos a una hoja de cálculo
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Cintillos");

  // Aplicar estilo de negrita a los títulos de la primera fila (encabezados)
  const range = XLSX.utils.decode_range(worksheet['!ref']);
  for (let col = range.s.c; col <= range.e.c; col++) {
    const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
    const cell = worksheet[cellAddress];
    if (cell) {
      if (!cell.s) cell.s = {};
      if (!cell.s.font) cell.s.font = {};
      cell.s.font.bold = true;
    }
  }

  const fileName = `CINTILLOS - ${containerName.toUpperCase()}.xlsx`;
  XLSX.writeFile(workbook, fileName);
};
