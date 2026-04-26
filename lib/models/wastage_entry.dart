class WastageEntry {
  final String id;
  final String itemName;
  final int quantity;
  final double costPerUnit;
  final String reason;
  final DateTime timestamp;

  WastageEntry({
    required this.id,
    required this.itemName,
    required this.quantity,
    required this.costPerUnit,
    required this.reason,
    required this.timestamp,
  });

  double get totalCost => quantity * costPerUnit;
}
