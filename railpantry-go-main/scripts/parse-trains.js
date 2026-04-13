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

// Major Indian Railway stations and their routes
const majorStations = {
  'HWH': 'Howrah Junction',
  'NDLS': 'New Delhi',
  'CST': 'Chhatrapati Shivaji Terminus',
  'CSMT': 'Chhatrapati Shivaji Terminus',
  'SRC': 'Sealdah',
  'BZA': 'Vijayawada Junction',
  'MAS': 'Chennai Central',
  'BRC': 'Vadodara',
  'LTT': 'Lokmanya Tilak Terminus',
  'PUNE': 'Pune Junction',
  'NGP': 'Nagpur Junction',
  'GZB': 'Ghaziabad Junction',
  'AGC': 'Agra Cantt',
  'NK': 'Nankana',
  'CNB': 'Kanpur Central'
};

const commonRoutes = {
  'HWH-NDLS': ['Howrah Junction', 'Dhanbad Jn', 'Gaya Jn', 'Mughal Sarai', 'Allahabad', 'Kanpur Central', 'New Delhi'],
  'NDLS-HWH': ['New Delhi', 'Kanpur Central', 'Allahabad', 'Mughal Sarai', 'Gaya Jn', 'Dhanbad Jn', 'Howrah Junction'],
  'CST-NDLS': ['Chhatrapati Shivaji Terminus', 'Pune Junction', 'Aurangabad', 'Parbhani', 'Parli Vaijnath', 'Bhopal', 'New Delhi'],
  'NDLS-CST': ['New Delhi', 'Bhopal', 'Parli Vaijnath', 'Parbhani', 'Aurangabad', 'Pune Junction', 'Chhatrapati Shivaji Terminus'],
  'HWH-CST': ['Howrah Junction', 'Jharsuguda', 'Raipur', 'Nagpur Junction', 'Wardha', 'Akola', 'Chhatrapati Shivaji Terminus'],
  'NDLS-MAS': ['New Delhi', 'Kanpur Central', 'Chitrakoot', 'Jabalpur', 'Nagpur Junction', 'Warangal', 'Chennai Central'],
  'HWH-BZA': ['Howrah Junction', 'Kharagpur', 'Berhampur', 'Visakhapatnam', 'Vijayawada Junction'],
  'NDLS-BRC': ['New Delhi', 'Mathura', 'Agra', 'Gwalior', 'Vadodara'],
  'SRC-HWH': ['Sealdah', 'Howrah Junction'],
  'LTT-NGP': ['Lokmanya Tilak Terminus', 'Akola', 'Nagpur Junction'],
};

// Generate realistic routes for each train
function generateRoute(trainNumber, trainName) {
  const stations = [];
  
  // Check if train name contains route information
  const nameUpper = trainName.toUpperCase();
  
  // Look for known route patterns in train name
  for (const [route, stationList] of Object.entries(commonRoutes)) {
    const routeParts = route.split('-');
    if (routeParts.some(part => nameUpper.includes(part))) {
      return stationList;
    }
  }
  
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

// Write the processed data
const outputPath = path.join(__dirname, '../src/lib/indianRailwaysData.ts');
const content = `// Indian Railways Train Database (Generated)
// Total trains in database: ${trainsData.length}
// Extracted sample: ${trainRoutes.length} trains

export interface TrainRoute {
  trainNumber: string;
  trainName: string;
  stations: string[];
}

export const indianRailwaysTrains: TrainRoute[] = ${JSON.stringify(trainRoutes, null, 2)};

export function findTrainByNumber(number: string): TrainRoute | null {
  return indianRailwaysTrains.find(t => t.trainNumber === number) || null;
}

export function findTrainByName(name: string): TrainRoute[] {
  const searchTerm = name.toLowerCase();
  return indianRailwaysTrains.filter(t => t.trainName.toLowerCase().includes(searchTerm));
}

export function searchTrains(query: string): TrainRoute[] {
  const q = query.toLowerCase();
  return indianRailwaysTrains.filter(t => 
    t.trainNumber.includes(q) || 
    t.trainName.toLowerCase().includes(q)
  ).slice(0, 20);
}
`;

fs.writeFileSync(outputPath, content);
console.log(`✓ Generated indianRailwaysData.ts with ${trainRoutes.length} trains`);
console.log(`✓ Location: ${outputPath}`);
