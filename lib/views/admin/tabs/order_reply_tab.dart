import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:railpantry/providers/admin_provider.dart';
import 'package:railpantry/models/order_reply.dart';

class OrderReplyTab extends StatelessWidget {
  const OrderReplyTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<AdminProvider>(
      builder: (context, admin, _) {
        final pending = admin.orders.where((o) => o.status == OrderReplyStatus.pending).toList();
        final confirmed = admin.orders.where((o) => o.status == OrderReplyStatus.confirmed).toList();
        final delayed = admin.orders.where((o) => o.status == OrderReplyStatus.delayed).toList();
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Text('Order Inbox', style: GoogleFonts.lora(fontSize: 28, fontWeight: FontWeight.bold, color: const Color(0xFF2D2D2D))),
              const SizedBox(width: 12),
              if (admin.pendingOrderCount > 0)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(20)),
                  child: Text('${admin.pendingOrderCount} NEW', style: GoogleFonts.spaceMono(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                ),
            ]),
            const SizedBox(height: 24),
            Expanded(
              child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
                _buildColumn(context, admin, 'New', pending, Colors.orange),
                _buildColumn(context, admin, 'Confirmed', confirmed, const Color(0xFF00A19B)),
                _buildColumn(context, admin, 'Delayed', delayed, Colors.red),
              ]),
            ),
          ],
        );
      },
    );
  }

  Widget _buildColumn(BuildContext context, AdminProvider admin, String title, List<OrderReply> orders, Color color) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.only(right: 12),
        decoration: BoxDecoration(color: color.withOpacity(0.05), borderRadius: BorderRadius.circular(16), border: Border.all(color: color.withOpacity(0.2))),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(children: [
              Container(width: 10, height: 10, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
              const SizedBox(width: 8),
              Text(title, style: GoogleFonts.lora(fontWeight: FontWeight.bold, color: color)),
              const Spacer(),
              Text('${orders.length}', style: GoogleFonts.spaceMono(color: color, fontWeight: FontWeight.bold)),
            ]),
          ),
          Expanded(
            child: ListView(
              padding: const EdgeInsets.fromLTRB(10, 0, 10, 10),
              children: orders.map((order) {
                final isPending = order.status == OrderReplyStatus.pending;
                final ago = DateTime.now().difference(order.placedAt);
                final agoStr = '${ago.inMinutes}m ago';
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
                      Text('Coach ${order.coach} • Seat ${order.seat}', style: GoogleFonts.lora(fontWeight: FontWeight.bold, fontSize: 12)),
                      Text(agoStr, style: GoogleFonts.spaceMono(fontSize: 10, color: Colors.grey)),
                    ]),
                    const SizedBox(height: 4),
                    ...order.items.map((item) => Text('• $item', style: GoogleFonts.spaceMono(fontSize: 10, color: const Color(0xFF2D2D2D)))),
                    const SizedBox(height: 4),
                    Text('₹${order.total.toStringAsFixed(0)}', style: GoogleFonts.lora(fontWeight: FontWeight.bold, color: const Color(0xFF00A19B), fontSize: 13)),
                    if (isPending) ...[
                      const SizedBox(height: 8),
                      Row(children: [
                        Expanded(
                          child: OutlinedButton(
                            onPressed: () => admin.updateOrderStatus(order.id, OrderReplyStatus.delayed),
                            style: OutlinedButton.styleFrom(foregroundColor: Colors.orange, side: const BorderSide(color: Colors.orange), padding: EdgeInsets.zero, minimumSize: const Size(0, 30), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                            child: Text('Delay', style: GoogleFonts.spaceMono(fontSize: 10)),
                          ),
                        ),
                        const SizedBox(width: 6),
                        Expanded(
                          child: ElevatedButton(
                            onPressed: () => admin.updateOrderStatus(order.id, OrderReplyStatus.confirmed),
                            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00A19B), foregroundColor: Colors.white, padding: EdgeInsets.zero, minimumSize: const Size(0, 30), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                            child: Text('Confirm', style: GoogleFonts.spaceMono(fontSize: 10)),
                          ),
                        ),
                      ]),
                    ] else if (order.status == OrderReplyStatus.confirmed || order.status == OrderReplyStatus.delayed) ...[
                      const SizedBox(height: 8),
                      ElevatedButton(
                        onPressed: () => admin.updateOrderStatus(order.id, OrderReplyStatus.delivered),
                        style: ElevatedButton.styleFrom(backgroundColor: Colors.green, foregroundColor: Colors.white, padding: EdgeInsets.zero, minimumSize: const Size(double.infinity, 30), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8))),
                        child: Text('Mark Delivered', style: GoogleFonts.spaceMono(fontSize: 10)),
                      ),
                    ],
                  ]),
                );
              }).toList(),
            ),
          ),
        ]),
      ),
    );
  }
}
