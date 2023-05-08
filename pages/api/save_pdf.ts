import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const pdfData = req.body.pdfData;
    const buffer = Buffer.from(pdfData, 'base64');
    const filePath = path.join(process.cwd(), 'docs', 'chat_history.pdf');

    fs.writeFile(filePath, buffer, (err) => {
      if (err) {
        res.status(500).json({ message: 'Error writing PDF file.' });
      } else {
        res.status(200).json({ message: 'PDF file saved successfully.' });
      }
    });
  } else {
    res.status(405).json({ message: 'Method not allowed.' });
  }
};
