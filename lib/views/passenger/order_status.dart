import 'package:flutter/material.dart';
import 'package:railpantry/widgets/hold_to_confirm_button.dart';

class OrderStatusPage extends StatefulWidget {
  const OrderStatusPage({super.key});

  @override
  State<OrderStatusPage> createState() => _OrderStatusPageState();
}

class _OrderStatusPageState extends State<OrderStatusPage> {
  final List<String> _otp = ['', '', '', ''];
  final List<FocusNode> _focusNodes = List.generate(4, (_) => FocusNode());

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Track Order'),
        leading: IconButton(icon: const Icon(Icons.arrow_back), onPressed: () => Navigator.pop(context)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Order Status Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.05), blurRadius: 10)],
              ),
              child: Column(
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text('Preparing', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                          Text('Arriving at your seat in approx. 15 mins', style: TextStyle(fontSize: 12, color: Colors.grey)),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(color: Colors.grey[100], borderRadius: BorderRadius.circular(8)),
                        child: const Text('12:45PM', style: TextStyle(fontWeight: FontWeight.bold)),
                      ),
                    ],
                  ),
                  const Divider(height: 32),
                  // Delivery Verification Section
                  const Text(
                    'Delivery Verification',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const Text(
                    'Share this code with the server only after receiving your complete order.',
                    textAlign: TextAlign.center,
                    style: TextStyle(fontSize: 10, color: Colors.grey),
                  ),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildOTPBox('8'),
                      _buildOTPBox('4'),
                      _buildOTPBox('9'),
                      _buildOTPBox('2'),
                    ],
                  ),
                  const SizedBox(height: 16),
                  OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.copy, size: 16),
                    label: const Text('Copy'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Track Order Timeline
            const Text('Track Order', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
            const SizedBox(height: 16),
            _buildTimelineStep('Order Confirmed', 'Kitchen accepted your order at 12:15 PM', true, true),
            _buildTimelineStep('Preparing Order', 'Your food is being freshly prepared', true, true),
            _buildTimelineStep('Out for Delivery', 'Server will bring it to your seat', false, false),
            _buildTimelineStep('Delivered', 'Enjoy your meal!', false, false),
            
            const SizedBox(height: 32),
            // Hold to Confirm Action (e.g., Report Issue or Cancel)
            HoldToConfirmButton(
              label: 'HOLD TO REPORT ISSUE / SOS',
              color: Colors.red,
              onConfirmed: () {
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Emergency Alert Sent to Train Manager!')),
                );
              },
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildOTPBox(String digit) {
    return Container(
      width: 50,
      height: 60,
      margin: const EdgeInsets.symmetric(horizontal: 4),
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: Center(
        child: Text(
          digit,
          style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }

  Widget _buildTimelineStep(String title, String subtitle, bool isDone, bool isLast) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Column(
          children: [
            Icon(
              isDone ? Icons.check_circle : Icons.radio_button_unchecked,
              color: isDone ? Colors.green : Colors.grey,
            ),
            if (!isLast)
              Container(
                width: 2,
                height: 40,
                color: isDone ? Colors.green : Colors.grey[300],
              ),
          ],
        ),
        const SizedBox(width: 16),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: TextStyle(fontWeight: FontWeight.bold, color: isDone ? Colors.black : Colors.grey)),
            Text(subtitle, style: const TextStyle(fontSize: 12, color: Colors.grey)),
          ],
        ),
      ],
    );
  }
}
