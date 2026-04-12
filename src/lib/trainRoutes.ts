export interface TrainRoute {
  trainNumber: string;
  trainName: string;
  stations: string[];
}

// Mock train routes database
export const trainRoutes: TrainRoute[] = [
  {
    trainNumber: '12301',
    trainName: 'Rajdhani Express (HWH-NDLS)',
    stations: ['Howrah', 'Dhanbad', 'Gaya', 'Mughal Sarai', 'Allahabad', 'Kanpur', 'New Delhi'],
  },
  {
    trainNumber: '12951',
    trainName: 'Mumbai Rajdhani Express',
    stations: ['Mumbai Central', 'Vadodara', 'Ratlam', 'Kota', 'Sawai Madhopur', 'New Delhi'],
  },
  {
    trainNumber: '12259',
    trainName: 'Sealdah Duronto Express',
    stations: ['Sealdah', 'Durgapur', 'Asansol', 'Dhanbad', 'Gaya', 'New Delhi'],
  },
  {
    trainNumber: '12627',
    trainName: 'Karnataka Express',
    stations: ['Bangalore', 'Guntakal', 'Kurnool', 'Raichur', 'Solapur', 'Pune', 'Daund', 'New Delhi'],
  },
  {
    trainNumber: '12723',
    trainName: 'Telangana Express',
    stations: ['Hyderabad', 'Kazipet', 'Balharshah', 'Nagpur', 'Bhopal', 'Jhansi', 'Agra', 'New Delhi'],
  },
  {
    trainNumber: '12561',
    trainName: 'Swatantrata Senani Express',
    stations: ['Jaynagar', 'Darbhanga', 'Samastipur', 'Barauni', 'Patna', 'Mughal Sarai', 'Allahabad', 'New Delhi'],
  },
];

export function findTrainByPnr(pnr: string): TrainRoute | null {
  // Mock: use last 4 digits of PNR to deterministically pick a route
  const idx = parseInt(pnr.slice(-4)) % trainRoutes.length;
  return trainRoutes[idx];
}

export function getNextStations(route: TrainRoute, currentStationIndex: number): string[] {
  return route.stations.slice(currentStationIndex + 1);
}
