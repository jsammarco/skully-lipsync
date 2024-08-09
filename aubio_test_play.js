const spawn = require('child_process').spawn;
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const pitchDataPath = "C:/Users/Joe/Projects/skully-lipsync/output5stem/why georgia john mayer/pitch.csv";
const vocalPath = "C:/Users/Joe/Projects/skully-lipsync/output5stem/why georgia john mayer/vocals.wav";
let pitchData = [];
let rmsValue = null;
let ptsTime = null;

// Define min and max RMS values for normalization
const RMS_MIN = -30;
const RMS_MAX = 0;

const normalizeRMS = (rms) => {
  if (isNaN(rms)) return 0;
  let normalized = Math.max(0, Math.min(10, (rms - RMS_MIN) / (RMS_MAX - RMS_MIN) * 10));
  return (normalized === 1) ? 0 : normalized;
};

// Ensure the directory for the pitch data file exists
const ensureDirectoryExistence = (filePath) => {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  ensureDirectoryExistence(dirname);
  fs.mkdirSync(dirname);
};

const extractPitchData = (vocalPath, pitchDataPath, callback) => {
  console.log('Extracting pitch data...');
  ensureDirectoryExistence(pitchDataPath);
  const aubioPitchCmd = spawn('aubio', ['pitch', vocalPath]);

  const writeStream = fs.createWriteStream(pitchDataPath);
  aubioPitchCmd.stdout.on('data', (data) => {
    data = data.toString().split('\n').map(line => {
      const match = line.match(/(\d+\.\d+)\s+(\d+\.\d+)/); // Extract timestamp and pitch
      return match ? `${match[1]},${match[2]}` : null;
    }).filter(line => line).join('\n') + '\n';
    writeStream.write(data);
  });

  aubioPitchCmd.on('close', (code) => {
    writeStream.end();
    console.log('Pitch data extraction completed.');
    callback();
  });

  aubioPitchCmd.on('error', (err) => {
    console.error('Error with aubio command:', err);
  });
};

const readPitchData = (pitchDataPath, callback) => {
  console.log('Reading pitch data...');
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
    callback();
  });

  rl.on('error', (err) => {
    console.error('Error reading pitch data:', err);
  });
};

const startFFplay = (vocalPath) => {
  console.log("Starting ffplay for RMS values...");
  const ffplayVocalsCmd = spawn('ffplay', ['-autoexit', '-volume', '50', '-af', 'astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level', '-nodisp', '-i', vocalPath]);

  ffplayVocalsCmd.stderr.on('data', (data) => {
    data = data.toString();

    // Match and store RMS value
    const rmsMatch = data.match(/lavfi\.astats\.Overall\.RMS_level=([-\d.]+)/);
    if (rmsMatch) {
      rmsValue = parseFloat(rmsMatch[1]);
      if (isNaN(rmsValue)) rmsValue = 0; // Ensure RMS is 0 if NaN
    }

    // Match and store pts_time
    const timeMatch = data.match(/pts_time:([-\d.]+)/);
    if (timeMatch) {
      ptsTime = parseFloat(timeMatch[1]);
      if (isNaN(ptsTime)) ptsTime = 0; // Ensure pts_time is 0 if NaN
    }

    // If both RMS and pts_time are available, process and print them
    if (rmsValue !== null && ptsTime !== null) {
      let normalizedRMS = Math.round(normalizeRMS(rmsValue));
      if (normalizedRMS === 1) normalizedRMS = 0; // Prevent RMS from being 1
      const closestPitch = pitchData.reduce((prev, curr) => Math.abs(curr.timestamp - ptsTime) < Math.abs(prev.timestamp - ptsTime) ? curr : prev);
      var pitch = Math.round(closestPitch.pitch);
      if (isNaN(pitch)) pitch = 0; // Ensure pitch is 0 if NaN
      console.log(`Normalized RMS: ${normalizedRMS}, Pitch: ${pitch}`);
      rmsValue = null;  // Reset after processing
      ptsTime = null;  // Reset after processing
    }
  });

  ffplayVocalsCmd.on('close', (code) => {
    console.log('ffplayVocalsCmd closing code:', code);
  });

  ffplayVocalsCmd.on('error', (err) => {
    console.error('ffplayVocalsCmd error:', err);
  });
};

const processPitchData = () => {
  if (!fs.existsSync(pitchDataPath)) {
    extractPitchData(vocalPath, pitchDataPath, () => {
      readPitchData(pitchDataPath, () => {
        startFFplay(vocalPath);
      });
    });
  } else {
    readPitchData(pitchDataPath, () => {
      startFFplay(vocalPath);
    });
  }
};

processPitchData();
