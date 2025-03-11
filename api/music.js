const fs = require("fs");
const path = require("path");

export default function handler(req, res) {
    const musicDir = path.join(process.cwd(), "public/assets");
    const files = fs.readdirSync(musicDir);
    
    const songs = files
        .filter(file => file.endsWith(".mp3"))
        .map(file => ({
            path: `/assets/${encodeURIComponent(file)}`,
            displayName: file.replace(".mp3", ""),
            cover: "/assets/default.jpg",
            artist: "Unknown Artist"
        }));

    res.status(200).json(songs);
}
