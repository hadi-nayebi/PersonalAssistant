import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import util from 'util';

const writeFile = util.promisify(fs.writeFile);

function formatDate(timestamp: number) {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // months are 0-based in JavaScript
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${year}${month}${day}${hours}${minutes}`;
}


export default async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { pdfData, sessionTimestamp } = req.body;
    const buffer = Buffer.from(pdfData, 'base64');
    // define a file name for chat history: chat_history_<timestamp>.pdf
    const fileName = `chat_history_${formatDate(sessionTimestamp)}.pdf`;
    const filePath = path.join(process.cwd(), 'memory', 'docs_lm', fileName);

    try {
      await writeFile(filePath, buffer);
      res.status(200).json({ message: 'PDF file saved successfully.' });
    } catch (err) {
      res.status(500).json({ message: 'Error writing PDF file.' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed.' });
  }
};
