import fs from 'fs';
import path from 'path';
import EPub from "epub";

export default function extractTextFromEpub(file, name) {
    return new Promise((resolve, reject) => {
        // Create a temporary directory to store the epub file
        const tempDir = path.join(process.cwd(), 'temp');
        if (!fs.existsSync(tempDir)) {
            fs.mkdirSync(tempDir);
        }

        // Write the base64 epub to a file
        const epubPath = path.join(tempDir, name);
        fs.writeFileSync(epubPath, Buffer.from(file, 'base64'));

        const epub = new EPub(epubPath);
        let text = '';

        epub.on("end", () => {
            const chapterPromises = epub.flow.map((chapter) => {
                return new Promise((resolveChapter) => {
                    epub.getChapter(chapter.id, (error, chapterText) => {
                        if (error) {
                            console.error(error);
                            resolveChapter();
                            return;
                        }
                        text += `${chapterText}\n`;
                        resolveChapter();
                    });
                });
            });

            Promise.all(chapterPromises).then(() => {
                fs.unlinkSync(epubPath);
                resolve(text);
            });
        });

        epub.on("error", reject);
        epub.parse();
    });
}
