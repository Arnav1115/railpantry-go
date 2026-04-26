import 'package:flutter/material.dart';
import 'package:railpantry/models/cash_entry.dart';
import 'package:railpantry/models/order_reply.dart';
import 'package:railpantry/models/wastage_entry.dart';

class AdminProvider extends ChangeNotifier {
  // Cash Register
  final List<CashEntry> _cashEntries = [
    CashEntry(id: 'c1', label: 'Opening Balance', amount: 500, type: CashEntryType.cashIn, timestamp: DateTime.now().subtract(const Duration(hours: 8))),
    CashEntry(id: 'c2', label: '12x Thali Sales', amount: 3000, type: CashEntryType.cashIn, timestamp: DateTime.now().subtract(const Duration(hours: 5))),
    CashEntry(id: 'c3', label: 'Pantry Supplies', amount: 800, type: CashEntryType.cashOut, timestamp: DateTime.now().subtract(const Duration(hours: 3))),
  ];

  List<CashEntry> get cashEntries => List.unmodifiable(_cashEntries);

  double get cashBalance => _cashEntries.fold(0.0, (sum, e) =>
      e.type == CashEntryType.cashIn ? sum + e.amount : sum - e.amount);

  void addCashEntry(String label, double amount, CashEntryType type) {
    _cashEntries.add(CashEntry(
      id: 'c${DateTime.now().millisecondsSinceEpoch}',
      label: label,
      amount: amount,
      type: type,
      timestamp: DateTime.now(),
    ));
    notifyListeners();
  }

  // Wastage Tracker
  final List<WastageEntry> _wastageEntries = [
    WastageEntry(id: 'w1', itemName: 'Railway Kulhad Chai', quantity: 3, costPerUnit: 20, reason: 'Expired', timestamp: DateTime.now().subtract(const Duration(hours: 6))),
  ];

  List<WastageEntry> get wastageEntries => List.unmodifiable(_wastageEntries);

  double get totalWastageCost => _wastageEntries.fold(0.0, (sum, e) => sum + e.totalCost);

  void addWastageEntry(String itemName, int quantity, double costPerUnit, String reason) {
    _wastageEntries.add(WastageEntry(
      id: 'w${DateTime.now().millisecondsSinceEpoch}',
      itemName: itemName,
      quantity: quantity,
      costPerUnit: costPerUnit,
      reason: reason,
      timestamp: DateTime.now(),
    ));
    notifyListeners();
  }

  // Order Reply System
  final List<OrderReply> _orders = [
    OrderReply(id: 'o1', seat: '42', coach: 'B4', items: ['2x Veg Biryani', '1x Chai'], total: 280, placedAt: DateTime.now().subtract(const Duration(minutes: 5))),
    OrderReply(id: 'o2', seat: '12', coach: 'A1', items: ['1x Samosa', '1x Water'], total: 80, placedAt: DateTime.now().subtract(const Duration(minutes: 12))),
    OrderReply(id: 'o3', seat: '05', coach: 'C2', items: ['3x Deluxe Veg Thali'], total: 750, placedAt: DateTime.now().subtract(const Duration(minutes: 20)), status: OrderReplyStatus.confirmed),
    OrderReply(id: 'o4', seat: '33', coach: 'D1', items: ['2x Sandwich'], total: 120, placedAt: DateTime.now().subtract(const Duration(minutes: 28)), status: OrderReplyStatus.delayed),
  ];

  List<OrderReply> get orders => List.unmodifiable(_orders);

  int get pendingOrderCount => _orders.where((o) => o.status == OrderReplyStatus.pending).length;

  void updateOrderStatus(String orderId, OrderReplyStatus status) {
    final idx = _orders.indexWhere((o) => o.id == orderId);
    if (idx != -1) {
      _orders[idx].status = status;
      notifyListeners();
    }
  }

  // Feedback
  final List<Map<String, dynamic>> _feedbacks = [];
  void submitFeedback(String orderId, int rating, String comment) {
    _feedbacks.add({'orderId': orderId, 'rating': rating, 'comment': comment, 'timestamp': DateTime.now()});
    notifyListeners();
  }

  // Active Order for Passenger View (Mock)
  String? _myActiveOrderId;
  String? get myActiveOrderId => _myActiveOrderId;
  OrderReply? get myActiveOrder => _myActiveOrderId != null ? _orders.firstWhere((o) => o.id == _myActiveOrderId, orElse: () => _orders.first) : null;

  void placePassengerOrder(String coach, String seat, List<String> items, double total) {
    final order = OrderReply(
      id: 'o${DateTime.now().millisecondsSinceEpoch}',
      seat: seat,
      coach: coach,
      items: items,
      total: total,
      placedAt: DateTime.now(),
    );
    _orders.insert(0, order); // Add to top
    _myActiveOrderId = order.id;
    notifyListeners();
  }

  void submitServiceRequest(String type, String coach, String seat) {
    final order = OrderReply(
      id: 'o${DateTime.now().millisecondsSinceEpoch}',
      seat: seat,
      coach: coach,
      items: ['Service Request: $type'],
      total: 0,
      placedAt: DateTime.now(),
    );
    _orders.insert(0, order);
    notifyListeners();
  }

  void acknowledgeDelivery(String orderId) {
    if (_myActiveOrderId == orderId) {
      _myActiveOrderId = null;
      notifyListeners();
    }
  }

  // Shift Handover
  String _shiftNotes = '';
  bool _shiftSubmitted = false;

  String get shiftNotes => _shiftNotes;
  bool get shiftSubmitted => _shiftSubmitted;

  void submitShiftHandover(String notes) {
    _shiftNotes = notes;
    _shiftSubmitted = true;
    notifyListeners();
  }

  void resetShift() {
    _shiftNotes = '';
    _shiftSubmitted = false;
    notifyListeners();
  }
}
