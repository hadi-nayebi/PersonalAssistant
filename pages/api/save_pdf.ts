import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { pdfData, sessionTimestamp } = req.body;
    const buffer = Buffer.from(pdfData, 'base64');
    // define a file name for chat history: chat_history_<timestamp>.pdf
    const fileName = `chat_history_${sessionTimestamp}.pdf`;
    const filePath = path.join(process.cwd(), 'memory', 'docs_lm', fileName);

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
