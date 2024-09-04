import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';

const execAsync = promisify(exec);

const extractTextFromPDF = async (pdfFile, name) => {
    // Create a temporary directory to store the PDF file
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir);
    }

    // Write the base64 PDF to a file
    const pdfPath = path.join(tempDir, name);
    fs.writeFileSync(pdfPath, Buffer.from(pdfFile, 'base64'));

    // Use pdftotext to extract text
    // Create a unique temporary path using name and current timestamp
    const timestamp = Date.now();
    const tempPath = path.join(`temp/${name}_${timestamp}.txt`);
    try {
      await execAsync(`pdftotext -enc UTF-8 -q "${pdfPath}" "${tempPath}"`);
    } catch (error) {
      console.error('Error executing pdftotext:', error);
    }

    const text = fs.readFileSync(tempPath, 'utf8');

    // Clean up: remove the temporary PDF file
    fs.unlinkSync(pdfPath);
    fs.unlinkSync(tempPath);

    return text;
};

export default extractTextFromPDF;