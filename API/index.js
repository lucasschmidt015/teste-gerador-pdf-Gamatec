import express from 'express';
import fs from 'fs';
import pdfMake from 'pdfmake';

const app = express();
const PORT = process.env.PORT || 4000;

app.get('/', (req, res) => {
    res.send('Hello, Express with ES Modules!');
});

app.get('/gerarPdf', (req, res, next)  => {
    const fonts = {
        Roboto: {
            normal: 'node_modules/pdfmake/examples/fonts/Roboto-Regular.ttf',
            bold: 'node_modules/pdfmake/examples/fonts/Roboto-Medium.ttf',
            italics: 'node_modules/pdfmake/examples/fonts/Roboto-Italic.ttf',
            bolditalics: 'node_modules/pdfmake/examples/fonts/Roboto-MediumItalic.ttf'
        }
    };
    
    // Create a pdfMake instance with fonts
    const printer = new pdfMake(fonts);
    
    // Define the document content
    const docDefinition = {
        content: [
            { text: 'Hello, Lucas!', style: 'header' },
            { text: 'This is a PDF document generated using pdfMake in Node.js.', style: 'body' }
        ],
        styles: {
            header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
            body: { fontSize: 12 }
        }
    };
    
    // Create a PDF document
    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    
    // Save the PDF file
    pdfDoc.pipe(fs.createWriteStream('output.pdf'));
    pdfDoc.end();

    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});