import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
    const directoryPath = path.join(process.cwd(), 'public/assets');

    fs.readdir(directoryPath, (err, files) => {
        if (err) {
            return res.status(500).json({ error: "Gagal membaca folder" });
        }

        const songs = files
            .filter(file => file.endsWith('.mp3'))
            .map(file => ({
                path: `/assets/${file}`,
                displayName: file.replace('.mp3', ''),
                cover: `/assets/default.jpg`, // Bisa diganti sesuai kebutuhan
                artist: 'Unknown Artist'
            }));

        res.status(200).json(songs);
    });
}
