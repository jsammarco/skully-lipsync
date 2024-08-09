const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const pitchDataPath = "C:/Users/Joe/Projects/skully-lipsync/output5stem/why georgia john mayer/pitch.csv";
const vocalPath = "C:/Users/Joe/Projects/skully-lipsync/output5stem/why georgia john mayer/vocals.wav";
let pitchData = [];

// Ensure the directory for the pitch data file exists
const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};

// Extract pitch data and write to CSV
// if (!fs.existsSync(pitchDataPath)) {
  console.log('Extracting pitch data...');
  ensureDirectoryExistence(pitchDataPath);
  const aubioPitchCmd = spawn('aubio', ['pitch', vocalPath]);

  const writeStream = fs.createWriteStream(pitchDataPath);
  aubioPitchCmd.stdout.on('data', (data) => {
    console.log(data.toString());
    data = data.toString().split('\n').map(line => {
      const match = line.match(/(\d+\.\d+)\s+(\d+\.\d+)/); // Extract timestamp and pitch
      return match ? `${match[1]},${match[2]}` : null;
    }).filter(line => line).join('\n') + '\n';
    writeStream.write(data);
  });

  aubioPitchCmd.on('close', (code) => {
    writeStream.end();
    console.log('Pitch data extraction completed.');

    // Read the pitch data after extraction
    const rl = readline.createInterface({
      input: fs.createReadStream(pitchDataPath),
      crlfDelay: Infinity
    });

    rl.on('line', (line) => {
      const [timestamp, pitch] = line.split(',').map(parseFloat);
      pitchData.push({ timestamp, pitch });
    });

    rl.on('close', () => {
      console.log('Pitch data loaded', pitchData);
      // startFFplay(path, vocalPath, drumPath, otherPath, pitchData); // Uncomment and implement this function as needed
    });
  });
// } else {
//   // Read the pitch data if it already exists
//   const rl = readline.createInterface({
//     input: fs.createReadStream(pitchDataPath),
//     crlfDelay: Infinity
//   });

//   rl.on('line', (line) => {
//     const [timestamp, pitch] = line.split(',').map(parseFloat);
//     pitchData.push({ timestamp, pitch });
//   });

//   rl.on('close', () => {
//     console.log('Pitch data loaded', pitchData);
//     // startFFplay(path, vocalPath, drumPath, otherPath, pitchData); // Uncomment and implement this function as needed
//   });
// }
