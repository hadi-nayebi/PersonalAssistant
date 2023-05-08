import { jsPDF } from 'jspdf';
import { Message } from '@/types/chat';

export const saveChatHistory = (messages: Message[]) => {
    const pdf = new jsPDF();
    let yPos = 20;

    messages.forEach((message, index) => {
        const prefix = message.type === 'apiMessage' ? 'AI: ' : 'User: ';
        const text = `${prefix}${message.message}`;
        const wrappedText = pdf.splitTextToSize(text, 180);
        pdf.text(wrappedText, 20, yPos);
        yPos += wrappedText.length * 8;
    });

    const base64PDF = pdf.output('datauristring').split(',')[1];

    fetch('/api/save_pdf', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({ pdfData: base64PDF }),
    })
    .then((response) => response.json())
    .then((data) => {
        console.log(data.message);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
};
