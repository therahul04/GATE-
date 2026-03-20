const { playlistInfo } = require('youtube-ext');
const fs = require('fs');

async function test() {
    try {
        const url = 'https://youtube.com/playlist?list=PLG9aCp4uE-s17rFjWM8KchGlffXgOzzVP';
        const playlist = await playlistInfo(url);
        fs.writeFileSync('out.json', JSON.stringify({ success: true, count: playlist.videos.length, first: playlist.videos[0].title }, null, 2));
    } catch (err) {
        fs.writeFileSync('out.json', JSON.stringify({ success: false, error: err.message, stack: err.stack }));
    }
}

test();

test();
