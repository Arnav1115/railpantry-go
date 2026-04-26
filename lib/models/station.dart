class Station {
  final String id;
  final String name;
  final String code;
  final Duration timeToArrival;

  Station({
    required this.id,
    required this.name,
    required this.code,
    required this.timeToArrival,
  });

  static List<Station> mockStations() {
    return [
      Station(id: '1', name: 'New Delhi', code: 'NDLS', timeToArrival: Duration(minutes: 45)),
      Station(id: '2', name: 'Mathura Junction', code: 'MTJ', timeToArrival: Duration(hours: 2, minutes: 15)),
      Station(id: '3', name: 'Agra Cantt', code: 'AGC', timeToArrival: Duration(hours: 3, minutes: 30)),
      Station(id: '4', name: 'Gwalior Junction', code: 'GWL', timeToArrival: Duration(hours: 5, minutes: 10)),
    ];
  }
}
