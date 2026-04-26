import 'package:railpantry/models/inventory_item.dart';

enum OrderStatus { pending, preparing, ready, outForDelivery, delivered }

class Order {
  final String id;
  final String pnr;
  final String seatInfo;
  final Map<InventoryItem, int> items;
  final double total;
  final OrderStatus status;
  final String otp;
  final DateTime timestamp;

  Order({
    required this.id,
    required this.pnr,
    required this.seatInfo,
    required this.items,
    required this.total,
    this.status = OrderStatus.pending,
    required this.otp,
    required this.timestamp,
  });
}
