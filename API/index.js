import express from 'express';
import pdfMake from 'pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 4000;

const fonts = {
    Roboto: {
        normal: Buffer.from(pdfFonts.pdfMake.vfs['Roboto-Regular.ttf'], 'base64'),
        bold: Buffer.from(pdfFonts.pdfMake.vfs['Roboto-Medium.ttf'], 'base64'),
        italics: Buffer.from(pdfFonts.pdfMake.vfs['Roboto-Italic.ttf'], 'base64'),
        bolditalics: Buffer.from(pdfFonts.pdfMake.vfs['Roboto-MediumItalic.ttf'], 'base64'),
    }
};

const printer = new pdfMake(fonts);

app.get('/', (req, res) => {
    res.send('Hello, Express with ES Modules!');
});

app.get('/gerarPdfSimples', (req, res) => {
    const docDefinition = {
        content: [
            { text: 'Hello, Lucas!', style: 'header' },
            { text: 'This is a test PDF generated using pdfMake in Node.js.', style: 'body' }
        ],
        styles: {
            header: { fontSize: 18, bold: true, margin: [0, 0, 0, 10] },
            body: { fontSize: 12 }
        }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    
    // Stream the PDF to the response
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="test.pdf"');

    pdfDoc.pipe(res);
    pdfDoc.end();
});

app.get('/gerarPdfComplexo', (req, res) => {
    const order = {
        id: 'ORD-12345',
        date: '06/02/2025',
        status: 'Completed',
        customer: {
            name: 'Lucas Schmidt',
            email: 'lucas@example.com',
            phone: '+55 49 99999-9999',
            address: 'Rua dos Devs, 42, Chapecó, SC, Brazil'
        },
        items: [
            { name: 'Gaming Mouse', quantity: 1, price: 250.00 },
            { name: 'Mechanical Keyboard', quantity: 1, price: 450.00 },
            { name: 'Headset', quantity: 2, price: 150.00 }
        ],
        total: 1000.00
    };

    const docDefinition = {
        content: [
            { text: 'Company Name', style: 'companyName' },
            { text: 'Order Invoice', style: 'header' },
            { text: `Order ID: ${order.id}`, style: 'subheader' },
            { text: `Date: ${order.date}`, style: 'subheader' },
            { text: `Status: ${order.status}`, style: 'subheader' },

            { text: 'Customer Details', style: 'sectionHeader' },
            {
                columns: [
                    { text: `Name: ${order.customer.name}` },
                    { text: `Email: ${order.customer.email}` }
                ]
            },
            {
                columns: [
                    { text: `Phone: ${order.customer.phone}` },
                    { text: `Address: ${order.customer.address}` }
                ]
            },

            { text: 'Order Items', style: 'sectionHeader', margin: [0, 10, 0, 5] },
            {
                table: {
                    widths: ['*', 'auto', 'auto', 'auto'],
                    body: [
                        [
                            { text: 'Item', style: 'tableHeader' },
                            { text: 'Quantity', style: 'tableHeader' },
                            { text: 'Price', style: 'tableHeader' },
                            { text: 'Total', style: 'tableHeader' }
                        ],
                        ...order.items.map(item => [
                            item.name,
                            item.quantity,
                            `R$ ${item.price.toFixed(2)}`,
                            `R$ ${(item.quantity * item.price).toFixed(2)}`
                        ]),
                        [
                            { text: 'Total', colSpan: 3, alignment: 'right', bold: true },
                            {},
                            {},
                            { text: `R$ ${order.total.toFixed(2)}`, bold: true }
                        ]
                    ]
                }
            },

            { text: 'Thank you for your purchase!', style: 'footer', margin: [0, 20, 0, 0] }
        ],
        styles: {
            companyName: { fontSize: 22, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
            header: { fontSize: 18, bold: true, alignment: 'center', margin: [0, 0, 0, 10] },
            subheader: { fontSize: 14, margin: [0, 5, 0, 5] },
            sectionHeader: { fontSize: 14, bold: true, margin: [0, 10, 0, 5] },
            tableHeader: { bold: true, fontSize: 12, fillColor: '#eeeeee' },
            footer: { fontSize: 12, italics: true, alignment: 'center' }
        }
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename="order_invoice.pdf"');

    pdfDoc.pipe(res);
    pdfDoc.end();
});


app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});