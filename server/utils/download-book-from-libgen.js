import libgen from 'libgen';
import minioClient from '../db/minio-client';

import { JSDOM } from 'jsdom';

export default async function downloadBook(md5, minioBookPath) {
    const url = await libgen.utils.check.canDownload(md5)
    const response = await $fetch(url)
    const dom = new JSDOM(response);

    const document = dom.window.document;
    const links = document.getElementsByTagName('a');
    let downloadLink = null;

    for (let link of links) {
        if (link.textContent.trim().toUpperCase() === 'GET') {
            downloadLink = link.href;
            break;
        }
    }

    if (!downloadLink) {
        throw new Error('Download link not found');
    }

    const downloadResponse = await $fetch(downloadLink, { responseType: 'arrayBuffer' });
    // TODO: add metadata
    const metadata = null;
    await minioClient.uploadFile('illuminovel', minioBookPath, downloadResponse, metadata)
    
    return downloadResponse
}