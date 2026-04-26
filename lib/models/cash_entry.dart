enum CashEntryType { cashIn, cashOut }

class CashEntry {
  final String id;
  final String label;
  final double amount;
  final CashEntryType type;
  final DateTime timestamp;

  CashEntry({
    required this.id,
    required this.label,
    required this.amount,
    required this.type,
    required this.timestamp,
  });
}
