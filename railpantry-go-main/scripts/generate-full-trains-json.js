import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Read the Indian Railways database text file
const dbPath = 'C:/Users/ADYad/Downloads/indian_railways_trains_full.txt';
const rawData = fs.readFileSync(dbPath, 'utf8');
const rawLines = rawData.split(/\r?\n/).filter(line => line.trim().length > 0);

// Create a map to track unique trains and preserve the full list
const trainsMap = new Map();
rawLines.forEach(line => {
  const match = line.match(/^([0-9]{5})\s*-\s*(.+)$/);
  if (!match) return;
  const trainNumber = match[1].trim();
  const trainName = match[2].trim();
  if (!trainsMap.has(trainNumber)) {
    trainsMap.set(trainNumber, trainName);
  }
});

// Convert to array and sort
const uniqueTrains = Array.from(trainsMap.entries())
  .map(([number, name]) => ({ trainNumber: number, trainName: name }))
  .sort((a, b) => a.trainNumber.localeCompare(b.trainNumber));

// Generate routes for each train
function generateRoute(trainNumber, trainName) {
  const nameUpper = trainName.toUpperCase();

  // Default route based on train number (even/odd convention)
  const trainNum = parseInt(trainNumber);
  if (trainNum % 2 === 0) {
    return ['New Delhi', 'Kanpur Central', 'Allahabad', 'Mughal Sarai', 'Patna', 'Howrah Junction'];
  } else {
    return ['Howrah Junction', 'Patna', 'Mughal Sarai', 'Allahabad', 'Kanpur Central', 'New Delhi'];
  }
}

// Create train routes with stations
const trainRoutes = uniqueTrains.map(train => ({
  trainNumber: train.trainNumber,
  trainName: train.trainName,
  stations: generateRoute(train.trainNumber, train.trainName)
}));

// Write the JSON file
const outputPath = path.join(__dirname, '..', 'public/indian-railways-trains-full.json');
fs.writeFileSync(outputPath, JSON.stringify(trainRoutes, null, 2));
console.log(`✓ Generated indian-railways-trains-full.json with ${trainRoutes.length} trains`);
console.log(`✓ Location: ${outputPath}`);