const JSZip = require("jszip");
const fs = require("fs");

const verifyDocx = async (filePath) => {
  const data = fs.readFileSync(filePath);
  const zip = new JSZip();
  
  try {
    await zip.loadAsync(data);
    if (zip.files["word/document.xml"]) {
      console.log("The file is a valid DOCX file and contains word/document.xml.");
    } else {
      console.error("The file does not contain word/document.xml.");
    }
  } catch (error) {
    console.error("The file is not a valid ZIP file or DOCX file.");
  }
};

verifyDocx("./TEMPLATE.docx");
