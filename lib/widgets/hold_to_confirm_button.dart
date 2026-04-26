import 'package:flutter/material.dart';

class HoldToConfirmButton extends StatefulWidget {
  final String label;
  final VoidCallback onConfirmed;
  final Color color;

  const HoldToConfirmButton({
    super.key,
    required this.label,
    required this.onConfirmed,
    this.color = Colors.indigo,
  });

  @override
  State<HoldToConfirmButton> createState() => _HoldToConfirmButtonState();
}

class _HoldToConfirmButtonState extends State<HoldToConfirmButton> with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  bool _isHolding = false;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    );
    _controller.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        widget.onConfirmed();
        _controller.reset();
        setState(() => _isHolding = false);
      }
    });
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onLongPressStart: (_) {
        setState(() => _isHolding = true);
        _controller.forward();
      },
      onLongPressEnd: (_) {
        setState(() => _isHolding = false);
        _controller.reverse();
      },
      child: Stack(
        alignment: Alignment.center,
        children: [
          Container(
            height: 56,
            width: double.infinity,
            decoration: BoxDecoration(
              color: widget.color.withOpacity(0.2),
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: widget.color),
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(12),
              child: AnimatedBuilder(
                animation: _controller,
                builder: (context, child) {
                  return FractionallySizedBox(
                    alignment: Alignment.centerLeft,
                    widthFactor: _controller.value,
                    child: Container(color: widget.color),
                  );
                },
              ),
            ),
          ),
          Text(
            _isHolding ? 'HOLDING...' : widget.label,
            style: TextStyle(
              color: _isHolding ? Colors.white : widget.color,
              fontWeight: FontWeight.bold,
              fontSize: 16,
            ),
          ),
        ],
      ),
    );
  }
}
