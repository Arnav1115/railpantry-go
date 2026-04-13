// Indian Railways Train Database (Generated)
// Total trains in database: 15715 (lazy loaded from JSON)
// Popular trains for quick selection: 20 trains

export interface TrainRoute {
  trainNumber: string;
  trainName: string;
  stations: string[];
}

// Popular trains for quick selection (20 most common trains)
export const popularTrains: TrainRoute[] = [
  {
    "trainNumber": "12301",
    "trainName": "Rajdhani Express (HWH-NDLS)",
    "stations": ["Howrah Junction", "Dhanbad Jn", "Gaya Jn", "Mughal Sarai", "Allahabad", "Kanpur Central", "New Delhi"]
  },
  {
    "trainNumber": "12951",
    "trainName": "Mumbai Rajdhani Express",
    "stations": ["Mumbai Central", "Vadodara", "Ratlam", "Kota", "Sawai Madhopur", "New Delhi"]
  },
  {
    "trainNumber": "12259",
    "trainName": "Sealdah Duronto Express",
    "stations": ["Sealdah", "Durgapur", "Asansol", "Dhanbad", "Gaya", "New Delhi"]
  },
  {
    "trainNumber": "12627",
    "trainName": "Karnataka Express",
    "stations": ["Bangalore", "Guntakal", "Kurnool", "Raichur", "Solapur", "Pune", "Daund", "New Delhi"]
  },
  {
    "trainNumber": "12723",
    "trainName": "Telangana Express",
    "stations": ["Hyderabad", "Kazipet", "Balharshah", "Nagpur", "Bhopal", "Jhansi", "Agra", "New Delhi"]
  },
  {
    "trainNumber": "12561",
    "trainName": "Swatantrata Senani Express",
    "stations": ["Jaynagar", "Darbhanga", "Samastipur", "Barauni", "Patna", "Mughal Sarai", "Allahabad", "New Delhi"]
  },
  {
    "trainNumber": "00101",
    "trainName": "CNB MAGHMELA SPL",
    "stations": ["Howrah Junction", "Patna", "Mughal Sarai", "Allahabad", "Kanpur Central", "New Delhi"]
  },
  {
    "trainNumber": "00112",
    "trainName": "AJNI RAPID PARCEL",
    "stations": ["New Delhi", "Kanpur Central", "Allahabad", "Mughal Sarai", "Patna", "Howrah Junction"]
  },
  {
    "trainNumber": "00131",
    "trainName": "AYC MMTDY BHGV SPL",
    "stations": ["Howrah Junction", "Patna", "Mughal Sarai", "Allahabad", "Kanpur Central", "New Delhi"]
  },
  {
    "trainNumber": "00132",
    "trainName": "RKMP MMTDY BHGV SPL",
    "stations": ["New Delhi", "Kanpur Central", "Allahabad", "Mughal Sarai", "Patna", "Howrah Junction"]
  },
  {
    "trainNumber": "00141",
    "trainName": "Solapur SUR-CSMT FTR SPL",
    "stations": ["New Delhi", "Kanpur Central", "Allahabad", "Mughal Sarai", "Patna", "Howrah Junction"]
  },
  {
    "trainNumber": "00180",
    "trainName": "Koraput LG SPL",
    "stations": ["New Delhi", "Kanpur Central", "Allahabad", "Mughal Sarai", "Patna", "Howrah Junction"]
  },
  {
    "trainNumber": "00198",
    "trainName": "Delhi Safdarjung DECCAN ODYSSEY",
    "stations": ["New Delhi", "Kanpur Central", "Allahabad", "Mughal Sarai", "Patna", "Howrah Junction"]
  },
  {
    "trainNumber": "00199",
    "trainName": "CSMT DECCAN ODYSSEY",
    "stations": ["Howrah Junction", "Patna", "Mughal Sarai", "Allahabad", "Kanpur Central", "New Delhi"]
  },
  {
    "trainNumber": "00204",
    "trainName": "Howrah Junction CAR HWH MAGHMELA SPL",
    "stations": ["Howrah Junction", "Dhanbad Jn", "Gaya Jn", "Mughal Sarai", "Allahabad", "Kanpur Central", "New Delhi"]
  },
  {
    "trainNumber": "00240",
    "trainName": "DSJ HERITAGE OFINDIA",
    "stations": ["New Delhi", "Kanpur Central", "Allahabad", "Mughal Sarai", "Patna", "Howrah Junction"]
  },
  {
    "trainNumber": "00290",
    "trainName": "Delhi Safdarjung PALACE ON WHEEL",
    "stations": ["New Delhi", "Kanpur Central", "Allahabad", "Mughal Sarai", "Patna", "Howrah Junction"]
  },
  {
    "trainNumber": "00392",
    "trainName": "Sagauli Jn BHARAT GAURAV",
    "stations": ["New Delhi", "Kanpur Central", "Allahabad", "Mughal Sarai", "Patna", "Howrah Junction"]
  },
  {
    "trainNumber": "00401",
    "trainName": "DDU MAGHMELA SPL",
    "stations": ["New Delhi", "Kanpur Central", "Allahabad", "Mughal Sarai", "Patna", "Howrah Junction"]
  },
  {
    "trainNumber": "00410",
    "trainName": "Chennai Beach Velachery EMU",
    "stations": ["New Delhi", "Kanpur Central", "Allahabad", "Mughal Sarai", "Patna", "Howrah Junction"]
  }
];

// Full train database (lazy loaded from JSON)
let fullTrainDatabase: TrainRoute[] | null = null;

async function loadFullTrainDatabase(): Promise<TrainRoute[]> {
  if (fullTrainDatabase) return fullTrainDatabase;

  try {
    // Load the full database dynamically from public folder
    const response = await fetch('/indian-railways-trains-full.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    fullTrainDatabase = data;
    console.log(`✓ Loaded ${data.length} trains from full database`);
    return data;
  } catch (error) {
    console.warn('Failed to load full train database, using popular trains only:', error);
    return popularTrains;
  }
}

export async function findTrainByNumber(number: string): Promise<TrainRoute | null> {
  const trains = await loadFullTrainDatabase();
  return trains.find(t => t.trainNumber === number) || null;
}

export async function findTrainByName(name: string): Promise<TrainRoute[]> {
  const trains = await loadFullTrainDatabase();
  const searchTerm = name.toLowerCase();
  return trains.filter(t => t.trainName.toLowerCase().includes(searchTerm));
}

export async function searchTrains(query: string): Promise<TrainRoute[]> {
  const q = query.toLowerCase().trim();

  if (!q) return popularTrains.slice(0, 20);

  // First check popular trains for instant results
  const popularResults = popularTrains.filter(t =>
    t.trainNumber.includes(q) ||
    t.trainName.toLowerCase().includes(q)
  );

  if (popularResults.length > 0) {
    return popularResults.slice(0, 20);
  }

  // If no popular results, search full database
  try {
    const trains = await loadFullTrainDatabase();
    const results = trains.filter(t =>
      t.trainNumber.includes(q) ||
      t.trainName.toLowerCase().includes(q)
    ).slice(0, 100); // Return up to 100 results from full database

    return results.length > 0 ? results : [];
  } catch (error) {
    console.warn('Search failed, returning popular trains:', error);
    return popularTrains.slice(0, 20);
  }
}

// Synchronous version for immediate results (popular trains only)
export function searchTrainsSync(query: string): TrainRoute[] {
  const q = query.toLowerCase().trim();
  if (!q) return popularTrains.slice(0, 20);

  return popularTrains.filter(t =>
    t.trainNumber.includes(q) ||
    t.trainName.toLowerCase().includes(q)
  ).slice(0, 20);
}

// Get all trains (async, for admin operations)
export async function getAllTrains(): Promise<TrainRoute[]> {
  return await loadFullTrainDatabase();
}
