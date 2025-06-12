import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";

const createDocumentFromTemplate = (container) => {
  try {
    // Función para crear un párrafo con texto en Arial 12 y en mayúsculas
    const createParagraph = (text, bold = false, size = 12) => new Paragraph({
      children: [
        new TextRun({
          text: text.toUpperCase(),
          bold,
          font: "Arial",
          size: size * 2, // Tamaño en half-points
        }),
      ],
    });

    // Función para crear un párrafo vacío
    const createEmptyParagraph = () => new Paragraph({
      children: [
        new TextRun({
          text: '',
          size: 12 * 2, // Tamaño en half-points
        }),
      ],
    });

    // Crear el párrafo del nombre del contenedor en mayúsculas
    const containerNameParagraph = createParagraph(container.name, true, 24);

    // Crear los párrafos de los elementos del contenedor
    const paragraphs = container.items.flatMap(item => {
      const itemTitle = createParagraph(`((((ENTRA Y PRESENTA ${item.type === 'Note' ? item.item.titulo : "CORTE COMERCIAL"}))))`, true);
      const itemContentLines = item.type === 'Note' ? item.item.contenido.split('\n') : [];
      const itemContentParagraphs = itemContentLines.map(line => createParagraph(line));
      const emptyParagraphMiddle = createEmptyParagraph(); // Párrafo vacío para el salto de línea
      const emptyParagraphsTop = Array(3).fill().map(() => createEmptyParagraph()); // Crear 3 párrafos vacíos arriba
      const emptyParagraphsBottom = Array(3).fill().map(() => createEmptyParagraph()); // Crear 3 párrafos vacíos abajo
      return [...emptyParagraphsTop, itemTitle, emptyParagraphMiddle, ...itemContentParagraphs, ...emptyParagraphsBottom];
    });

    // Crear el documento con una sección que contiene el nombre del contenedor y los elementos
    const doc = new Document({
      sections: [{
        properties: {},
        children: [containerNameParagraph, ...paragraphs],
      }],
    });
    return doc;
  } catch (error) {
    console.error("Error in createDocumentFromTemplate function:", error);
    throw error;
  }
};

export const exportToWord = async (container) => {
  try {
    const doc = createDocumentFromTemplate(container);

    Packer.toBlob(doc).then(blob => {
      saveAs(blob, `${container.name.toUpperCase()}.docx`);
    }).catch(error => {
      console.error("Error generating blob:", error);
    });
  } catch (error) {
    console.error("Error in exportToWord function:", error);
  }
};
