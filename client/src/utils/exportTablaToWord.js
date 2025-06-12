import { Document, Packer, Paragraph, TextRun, Table, TableCell, TableRow, WidthType, AlignmentType, ShadingType } from 'docx';
import { saveAs } from 'file-saver';

const createParagraph = (text, bold = false, size = 10, alignment = AlignmentType.CENTER) => {
  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        bold: bold,
        font: "Arial",
        size: size * 2, // Tamaño en half-points
      }),
    ],
    alignment: alignment,
  });
};

export const exportTablaToWord = (containerName, items) => {
  // Contar ocurrencias de cada firstName
  const firstNameCounts = items.reduce((acc, item) => {
    if (item.type === 'Note' && item.item.createdBy?.firstName) {
      acc[item.item.createdBy.firstName] = (acc[item.item.createdBy.firstName] || 0) + 1;
    }
    return acc;
  }, {});

  const noteRows = items.map((item, index) => {
    const isNote = item.type === 'Note';

    if (isNote) {
      const firstName = item.item.createdBy?.firstName || 'Admin';
      const lastName = item.item.createdBy?.lastName || '';
      const displayName = firstNameCounts[firstName] > 1 ? `${firstName} ${lastName}` : firstName;

      const row = new TableRow({
        children: [
          new TableCell({
            children: [createParagraph((index + 1).toString(), false, 10)],
            width: { size: 5, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [createParagraph(item.item.titulo, false, 10)],
            width: { size: 45, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [createParagraph('', false, 10)],
            width: { size: 10, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [createParagraph('', false, 10)],
            width: { size: 10, type: WidthType.PERCENTAGE }
          }),
          new TableCell({
            children: [createParagraph(displayName, false, 10)], // Usar el nombre del periodista con apellido si es necesario
            width: { size: 30, type: WidthType.PERCENTAGE }
          }),
        ],
      });
      return row;
    } else if (item.type === 'Corte') {
      const row = new TableRow({
        children: [
          new TableCell({
            children: [createParagraph('CORTE COMERCIAL', true, 10, AlignmentType.CENTER)],
            columnSpan: 5,
            width: { size: 100, type: WidthType.PERCENTAGE },
            shading: {
              type: ShadingType.CLEAR,
              fill: "9fc5e8"
            },
          }),
        ],
      });
      return row;
    }
    console.log('Item is of unknown type, skipping.');
    return null;  // Ensure we always return a valid TableRow or null
  }).filter(row => row !== null);  // Filtrar filas no válidas

  // Add predefined rows for CORTINA and SALUDO
  const predefinedRows = [
    new TableRow({
      children: [
        new TableCell({
          children: [createParagraph('', false, 10)],
          width: { size: 5, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [createParagraph('CORTINA', false, 10)],
          width: { size: 45, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [createParagraph('', false, 10)],
          width: { size: 10, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [createParagraph('', false, 10)],
          width: { size: 10, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [createParagraph('', false, 10)],
          width: { size: 30, type: WidthType.PERCENTAGE }
        }),
      ],
    }),
    new TableRow({
      children: [
        new TableCell({
          children: [createParagraph('', false, 10)],
          width: { size: 5, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [createParagraph('SALUDO', false, 10)],
          width: { size: 45, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [createParagraph('', false, 10)],
          width: { size: 10, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [createParagraph('', false, 10)],
          width: { size: 10, type: WidthType.PERCENTAGE }
        }),
        new TableCell({
          children: [createParagraph('', false, 10)],
          width: { size: 30, type: WidthType.PERCENTAGE }
        }),
      ],
    }),
  ];

  // Adjust the sequence number for noteRows
  let sequenceNumber = 1;

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          createParagraph(containerName.toUpperCase(), true, 14, AlignmentType.CENTER), // Add container title in uppercase
          createParagraph('', false, 10), // Add an empty paragraph for spacing
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    children: [createParagraph('No.', true, 10)],
                    width: { size: 5, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [createParagraph('NOTA', true, 10)],
                    width: { size: 45, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [createParagraph('', true, 10)],
                    width: { size: 10, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [createParagraph('', true, 10)],
                    width: { size: 10, type: WidthType.PERCENTAGE }
                  }),
                  new TableCell({
                    children: [createParagraph('PERIODISTA', true, 10)],
                    width: { size: 30, type: WidthType.PERCENTAGE }
                  }),
                ],
              }),
              ...predefinedRows,
              ...noteRows.map((row) => {
                // Adjust the row number for notes
                if (row.children && row.children.length > 0 && row.children[0]) {
                  row.children[0] = new TableCell({
                    children: [createParagraph(sequenceNumber.toString(), false, 10)],
                    width: { size: 10, type: WidthType.PERCENTAGE }
                  });
                  sequenceNumber += 1;
                }
                return row;
              }),
            ],
          }),
        ],
      },
    ],
  });

  console.log('Created Document:', doc);

  Packer.toBlob(doc).then(blob => {
    saveAs(blob, `TABLA ${containerName.toUpperCase()}.docx`);
  }).catch(error => {
    console.error('Error generating blob:', error);
  });
};
