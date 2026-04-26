enum OrderReplyStatus { pending, confirmed, delayed, delivered }

class OrderReply {
  final String id;
  final String seat;
  final String coach;
  final List<String> items;
  final double total;
  final DateTime placedAt;
  OrderReplyStatus status;

  OrderReply({
    required this.id,
    required this.seat,
    required this.coach,
    required this.items,
    required this.total,
    required this.placedAt,
    this.status = OrderReplyStatus.pending,
  });
}
