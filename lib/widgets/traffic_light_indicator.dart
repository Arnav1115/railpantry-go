import 'package:flutter/material.dart';
import 'package:railpantry/models/inventory_item.dart';

class TrafficLightIndicator extends StatefulWidget {
  final InventoryItem item;
  final VoidCallback onRestock;

  const TrafficLightIndicator({
    super.key,
    required this.item,
    required this.onRestock,
  });

  @override
  State<TrafficLightIndicator> createState() => _TrafficLightIndicatorState();
}

class _TrafficLightIndicatorState extends State<TrafficLightIndicator> with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    )..repeat(reverse: true);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.item.isCritical) {
      // Intrusive "Red" Logic: Pulsing Red Card
      return FadeTransition(
        opacity: _controller,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          decoration: BoxDecoration(
            color: Colors.red,
            borderRadius: BorderRadius.circular(8),
          ),
          child: Row(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Icon(Icons.warning, color: Colors.white, size: 16),
              const SizedBox(width: 8),
              const Text(
                'STOCK EMPTY!',
                style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
              ),
              const SizedBox(width: 12),
              ElevatedButton(
                onPressed: widget.onRestock,
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.white,
                  foregroundColor: Colors.red,
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 0),
                  minimumSize: const Size(60, 24),
                ),
                child: const Text('RESTOCK', style: TextStyle(fontSize: 10)),
              ),
            ],
          ),
        ),
      );
    } else if (widget.item.isWarning) {
      // Orange State
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.orange.withOpacity(0.2),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.orange),
        ),
        child: const Text(
          'Low Stock',
          style: TextStyle(color: Colors.orange, fontWeight: FontWeight.bold),
        ),
      );
    } else {
      // Green State
      return Container(
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
        decoration: BoxDecoration(
          color: Colors.green.withOpacity(0.2),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(color: Colors.green),
        ),
        child: const Text(
          'Healthy',
          style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold),
        ),
      );
    }
  }
}
