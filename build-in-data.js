const fs = require('fs');
const { playlistInfo } = require('youtube-ext');

// GATE IN (Instrumentation Engineering) subjects with resources from ilide.info-best and syllabus
const subjects = [
  {
    name: "Engineering Mathematics",
    categories: {
      "Youtube Videos": [
        // Playlists to expand
        { playlist: "https://www.youtube.com/playlist?list=PLCRkxr-xpkfYeSoxm7BurehfXvgodtkR3", label: "Complete Maths (Hindi)" },
        { playlist: "https://www.youtube.com/playlist?list=PLb2wGSuEdRG_yZkx4r7vmePDx-AqTCuTF", label: "Complete Maths (English)" },
        { playlist: "https://www.youtube.com/playlist?list=PLPvaSRcEQh4lykk65o_hVsgMooedWucW5", label: "Linear Algebra & Differential Calculus (English)" },
        { playlist: "https://www.youtube.com/playlist?list=PLPvaSRcEQh4kkiiUYgmprbor5BcT5_PPW", label: "Integral Calculus (English)" },
        { playlist: "https://www.youtube.com/playlist?list=PLhLZ_zxDsyOIKbQfKFM05BLYRhUZ7JP-M", label: "Probability (English)" },
      ],
      "Standard Textbook": [
        { text: "Higher Engineering Mathematics, B.S. Grewal" },
        { text: "Advanced Engineering Mathematics, Erwin Kreyszig" },
      ],
      "Topicwise PYQs": [
        { url: "https://practicepaper.in/engineering-mathematics-full-course", text: "Practice Paper - Engineering Mathematics Full Course" },
      ],
    }
  },
  {
    name: "Electricity and Magnetism",
    categories: {
      "Youtube Videos": [
        { playlist: "https://www.youtube.com/playlist?list=PLs5_Rtf2P2r7V6SAHIh95m3hP1bQ1OXor", label: "EMFT (Electromagnetic Field Theory)" },
      ],
      "Standard Textbook": [
        { text: "Principles of Electromagnetics, Matthew N.O. Sadiku" },
      ],
      "Topicwise PYQs": [
        { url: "https://practicepaper.in/", text: "Practice Paper - Previous Year Questions" },
      ],
    }
  },
  {
    name: "Electrical Circuits and Machines",
    categories: {
      "Youtube Videos": [
        { playlist: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRgLR-hMp7wem-bdVN1iEhsh", label: "Network Theory #1" },
        { playlist: "https://www.youtube.com/playlist?list=PLgzsL8klq6DJ6fwXWK4TN9T0flIRuVsAb", label: "Network Theory #2" },
      ],
      "Standard Textbook": [
        { text: "Fundamentals of Electric Circuits, Alexander & Sadiku" },
        { text: "Electrical Machinery, Dr. P.S. Bimbhra" },
      ],
      "Topicwise PYQs": [
        { url: "https://practicepaper.in/", text: "Practice Paper - Previous Year Questions" },
      ],
    }
  },
  {
    name: "Signals and Systems",
    categories: {
      "Youtube Videos": [
        { playlist: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRhG6s3jYIU48CqsT5cyiDTO", label: "Signals and Systems" },
      ],
      "Standard Textbook": [
        { text: "Signals and Systems, P. Ramesh Babu" },
        { text: "Signals and Systems, Alan V. Oppenheim" },
      ],
      "Topicwise PYQs": [
        { url: "https://practicepaper.in/", text: "Practice Paper - Previous Year Questions" },
      ],
    }
  },
  {
    name: "Control Systems",
    categories: {
      "Youtube Videos": [
        { playlist: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRhqzJT87LsdQKYZBC93ezDo", label: "Control Systems" },
      ],
      "Standard Textbook": [
        { text: "Modern Control Engineering, Katsuhiko Ogata" },
        { text: "Automatic Control Systems, Benjamin C. Kuo" },
      ],
      "Topicwise PYQs": [
        { url: "https://practicepaper.in/", text: "Practice Paper - Previous Year Questions" },
      ],
    }
  },
  {
    name: "Analog Electronics",
    categories: {
      "Youtube Videos": [
        { playlist: "https://www.youtube.com/playlist?list=PLs5_Rtf2P2r75okkE2V9oXbwJI-8m-63Q", label: "Electronic Devices & Circuits (EDC)" },
        { playlist: "https://www.youtube.com/playlist?list=PLs5_Rtf2P2r5MplAOADz3fTWIyBZTkGbB", label: "Analog Electronics" },
      ],
      "Standard Textbook": [
        { text: "Microelectronic Circuits, Adel S. Sedra & Kenneth C. Smith" },
        { text: "Solid State Electronic Devices, Ben G. Streetman & Sanjay Kumar Banerjee" },
        { text: "Op-Amps and Linear Integrated Circuits, Ramakant A. Gayakwad" },
      ],
      "Topicwise PYQs": [
        { url: "https://practicepaper.in/", text: "Practice Paper - Previous Year Questions" },
      ],
    }
  },
  {
    name: "Digital Electronics",
    categories: {
      "Youtube Videos": [
        { playlist: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRjMH3mWf6kwqiTbT798eAOm", label: "Digital Electronics" },
      ],
      "Standard Textbook": [
        { text: "Digital Logic & Computer Design, M. Morris Mano" },
      ],
      "Topicwise PYQs": [
        { url: "https://practicepaper.in/", text: "Practice Paper - Previous Year Questions" },
      ],
    }
  },
  {
    name: "Measurements",
    categories: {
      "Youtube Videos": [
        // No specific playlist in ilide — using NPTEL
        { playlist: "https://www.youtube.com/playlist?list=PLbRMhDVUMngcFYRoVWJhWbDOgEFnNBIEe", label: "Measurements & Instrumentation (NPTEL)" },
      ],
      "Standard Textbook": [
        { text: "A Course in Electrical and Electronic Measurements and Instrumentation, A.K. Sawhney" },
      ],
      "Topicwise PYQs": [
        { url: "https://practicepaper.in/", text: "Practice Paper - Previous Year Questions" },
      ],
    }
  },
  {
    name: "Sensors and Industrial Instrumentation",
    categories: {
      "Youtube Videos": [
        { playlist: "https://www.youtube.com/playlist?list=PLbRMhDVUMngf6_s_2fJLM7nqL8jIOcBe-", label: "Transducers and Sensors (NPTEL)" },
      ],
      "Standard Textbook": [
        { text: "Measurement Systems: Application and Design, Ernest O. Doebelin" },
        { text: "Industrial Instrumentation, D. Patranabis" },
      ],
      "Topicwise PYQs": [
        { url: "https://practicepaper.in/", text: "Practice Paper - Previous Year Questions" },
      ],
    }
  },
  {
    name: "Communication and Optical Instrumentation",
    categories: {
      "Youtube Videos": [
        { playlist: "https://www.youtube.com/playlist?list=PLBlnK6fEyqRh-snRKEpVpNQ0JsHE7k3Hq", label: "Communication Systems" },
      ],
      "Standard Textbook": [
        { text: "Communication Systems Engineering, John G. Proakis" },
        { text: "Fiber Optic Communication Systems, Govind P. Agrawal" },
      ],
      "Topicwise PYQs": [
        { url: "https://practicepaper.in/", text: "Practice Paper - Previous Year Questions" },
      ],
    }
  },
];

// Also add the Aptitude section as a bonus subject (common for all GATE papers)
subjects.push({
  name: "General Aptitude",
  categories: {
    "Youtube Videos": [
      { playlist: "https://www.youtube.com/playlist?list=PLgF7lRh8Xb_WWuQ39i48DruAyzb_voYYD", label: "Complete Aptitude" },
      { playlist: "https://www.youtube.com/playlist?list=PLvTTv60o7qj_ZT2pXjgXxue0AlgkpH0ZO", label: "Aptitude (Hinglish)" },
    ],
    "Standard Textbook": [
      { text: "Quantitative Aptitude, R.S. Aggarwal" },
    ],
    "Free Tests": [
      { url: "https://practicepaper.in/", text: "Practice Paper - Free Tests" },
    ],
  }
});

// Common resources to append
const commonPYQ = {
  url: "https://drive.google.com/drive/folders/1Y8-Iek4nLgbF4DemWMyZ_NeXqcBEJUWz?usp=sharing",
  text: "GATE Previous Year Question Papers (2007-2025)"
};
const nptelPYQ = {
  url: "https://gate.nptel.ac.in/departments.php?c_id=2",
  text: "NPTEL GATE PYQ Video Solutions (2012-2021)"
};

async function expandPlaylists() {
  console.log(`Processing ${subjects.length} subjects...`);

  for (const subject of subjects) {
    console.log(`\n=== ${subject.name} ===`);

    for (const category of Object.keys(subject.categories)) {
      const items = subject.categories[category];
      const expandedItems = [];

      for (const item of items) {
        if (item.playlist) {
          console.log(`  Expanding: ${item.label} (${item.playlist})`);
          try {
            const playlist = await playlistInfo(item.playlist);
            if (playlist && playlist.videos && playlist.videos.length > 0) {
              console.log(`    → Found ${playlist.videos.length} videos`);
              for (const video of playlist.videos) {
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
              console.log(`    → No videos found, keeping as playlist link`);
              expandedItems.push({ url: item.playlist, text: item.label });
            }
          } catch (err) {
            console.error(`    → Error: ${err.message}`);
            expandedItems.push({ url: item.playlist, text: item.label });
          }
        } else {
          expandedItems.push(item);
        }
      }

      subject.categories[category] = expandedItems;
    }

    // Add common PYQ resources to the Topicwise PYQs category if it exists
    if (subject.categories["Topicwise PYQs"]) {
      subject.categories["Topicwise PYQs"].push(commonPYQ);
      subject.categories["Topicwise PYQs"].push(nptelPYQ);
    }
  }

  // Write output
  if (!fs.existsSync('src/data')) {
    fs.mkdirSync('src/data', { recursive: true });
  }

  fs.writeFileSync('src/data/resources.json', JSON.stringify(subjects, null, 2));
  console.log(`\nDone! Saved ${subjects.length} subjects to src/data/resources.json`);
}

expandPlaylists();
