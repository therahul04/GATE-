const fs = require('fs');
const readline = require('readline');
const { playlistInfo } = require('youtube-ext');

async function processLineByLine() {
  const fileStream = fs.createReadStream('../GATE CSE Free Resourcs - Anjali (AIR13) - Resources.csv');

  const rl = readline.createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  const subjects = [];
  let currentSubject = null;
  let currentCategory = null;

  for await (const line of rl) {
    if (line.trim() === '') continue;

    // Naively splitting by comma, keeping quotes in mind. 
    // We can use a regex or just simple split since most are simple URLs.
    // Regex for CSV split: /,(?=(?:(?:[^"]*"){2})*[^"]*$)/
    const cols = line.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);

    // Clean up quotes
    const cleanCols = cols.map(c => c.replace(/^"(.*)"$/, '$1').trim());

    if (cleanCols.length < 2) continue;

    const col1 = cleanCols[0];
    const col2 = cleanCols[1];
    const col3 = cleanCols[2] || '';

    // Ignore intro lines
    if (line.includes('GATE CSE FREE RESOURCES') || line.includes('Anjali (GATE AIR 13)')) continue;

    // Ignore contacts and credits
    if (col2 && (col2.includes('Linkedin:') || col2.includes('Youtube :') || col2.includes('Credits for'))) continue;

    // Check if it's a new subject 
    // Usually if col2 is present and col3 is empty, and it doesn't sound like a resource category
    if (col2 && !col3 && !['FREE MOCK TESTS', 'GATE exam', 'Notes  '].includes(col2) && !col2.includes('Relavant Chapters')) {
      // It's likely a subject header
      currentSubject = {
        name: col2,
        categories: {}
      };
      subjects.push(currentSubject);
      currentCategory = null;
    } else if (col2 && col3) {
      // New category and first item
      currentCategory = col2.trim();
      if (currentSubject) {
        if (!currentSubject.categories[currentCategory]) {
          currentSubject.categories[currentCategory] = [];
        }
        if (col2 === 'Standard Textbook') {
          // Might be text, not URL
          currentSubject.categories[currentCategory].push({ text: col3 });
        } else {
          currentSubject.categories[currentCategory].push({ url: col3 });
        }
      }
    } else if (!col2 && col3 && currentSubject && currentCategory) {
      // Continuation of previous category
      if (currentCategory === 'Standard Textbook') {
        currentSubject.categories[currentCategory].push({ text: col3 });
      } else {
        currentSubject.categories[currentCategory].push({ url: col3 });
      }
    }
    // Fallbacks for special rows like Relavant Chapters
    else if (!col2 && col3 && currentSubject && currentCategory === 'Standard Textbook') {
    }
  }

  // SECOND PASS: Expanding YouTube Playlists
  console.log('Finished CSV Parsing. Starting YouTube Playlist extraction...');
  for (const subject of subjects) {
    for (const category of Object.keys(subject.categories)) {
      const items = subject.categories[category];
      const expandedItems = [];

      for (const item of items) {
        if (item.url && (item.url.includes('youtube.com/playlist') || item.url.includes('&list='))) {
          console.log(`Extracting playlist: ${item.url}`);
          try {
            const playlist = await playlistInfo(item.url);
            if (playlist && playlist.videos) {
              for (const video of playlist.videos) {
                // Extract video ID safely
                let videoId = video.id;
                if (!videoId && video.url) {
                  const match = video.url.match(/v=([^&]+)/);
                  if (match) videoId = match[1];
                }
                const videoUrl = videoId ? `https://www.youtube.com/watch?v=${videoId}` : video.url;

                expandedItems.push({
                  url: videoUrl,
                  text: video.title || 'Untitled Video'
                });
              }
            } else {
              expandedItems.push(item);
            }
          } catch (err) {
            console.error(`Error fetching playlist ${item.url}:`, err.message);
            expandedItems.push(item); // Fallback
          }
        } else {
          expandedItems.push(item);
        }
      }
      subject.categories[category] = expandedItems;
    }
  }

  // Ensure output directory exists
  if (!fs.existsSync('src/data')) {
    fs.mkdirSync('src/data', { recursive: true });
  }

  fs.writeFileSync('src/data/resources.json', JSON.stringify(subjects, null, 2));
  console.log('Successfully saved expanded data to src/data/resources.json');
}

processLineByLine();
