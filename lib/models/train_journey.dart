class TrainStation {
  final String name;
  final String arrivalTime;
  final bool isPassed;

  const TrainStation({required this.name, required this.arrivalTime, required this.isPassed});
}

class TrainJourney {
  final String trainName;
  final String trainNumber;
  final List<TrainStation> stations;
  final int currentStationIndex;

  const TrainJourney({
    required this.trainName,
    required this.trainNumber,
    required this.stations,
    required this.currentStationIndex,
  });

  TrainStation get currentStation => stations[currentStationIndex];
  TrainStation? get nextStation =>
      currentStationIndex < stations.length - 1 ? stations[currentStationIndex + 1] : null;

  double get progressFraction =>
      currentStationIndex / (stations.length - 1).clamp(1, stations.length);
}

final kMockJourney = TrainJourney(
  trainName: 'Rajdhani Express',
  trainNumber: '12301',
  currentStationIndex: 3,
  stations: const [
    TrainStation(name: 'New Delhi', arrivalTime: '06:00', isPassed: true),
    TrainStation(name: 'Kanpur Central', arrivalTime: '09:50', isPassed: true),
    TrainStation(name: 'Prayagraj Jn', arrivalTime: '11:45', isPassed: true),
    TrainStation(name: 'Mughal Sarai', arrivalTime: '13:15', isPassed: false),
    TrainStation(name: 'Patna Jn', arrivalTime: '15:40', isPassed: false),
    TrainStation(name: 'Dhanbad', arrivalTime: '18:10', isPassed: false),
    TrainStation(name: 'Kolkata Howrah', arrivalTime: '21:30', isPassed: false),
  ],
);
