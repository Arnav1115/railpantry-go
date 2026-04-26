import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:railpantry/providers/inventory_provider.dart';

class ExpiryAlertsTab extends StatelessWidget {
  const ExpiryAlertsTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<InventoryProvider>(
      builder: (context, inventory, _) {
        // Mock items with expiry — in reality this would come from item metadata
        final expiringItems = [
          {'name': 'Railway Kulhad Chai', 'expiresIn': 2, 'units': 12},
          {'name': 'Fresh Veg Sandwich', 'expiresIn': 6, 'units': 5},
          {'name': 'Mineral Water', 'expiresIn': 48, 'units': 30},
        ];

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(children: [
              Text('Expiry Alerts', style: GoogleFonts.lora(fontSize: 28, fontWeight: FontWeight.bold, color: const Color(0xFF2D2D2D))),
              const SizedBox(width: 12),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(color: Colors.red, borderRadius: BorderRadius.circular(20)),
                child: Text('${expiringItems.length}', style: GoogleFonts.spaceMono(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
              ),
            ]),
            const SizedBox(height: 8),
            Text('Items expiring within 48 hours', style: GoogleFonts.spaceMono(fontSize: 12, color: Colors.grey)),
            const SizedBox(height: 24),
            ...expiringItems.map((item) {
              final hrs = item['expiresIn'] as int;
              final isUrgent = hrs <= 6;
              return Container(
                margin: const EdgeInsets.only(bottom: 16),
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: (isUrgent ? Colors.red : Colors.orange).withOpacity(0.07),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: (isUrgent ? Colors.red : Colors.orange).withOpacity(0.3)),
                ),
                child: Row(children: [
                  Icon(isUrgent ? Icons.warning_rounded : Icons.access_time, color: isUrgent ? Colors.red : Colors.orange, size: 32),
                  const SizedBox(width: 16),
                  Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(item['name'] as String, style: GoogleFonts.lora(fontWeight: FontWeight.bold, fontSize: 15)),
                    const SizedBox(height: 4),
                    Text('${item['units']} units • Expires in ${hrs}h', style: GoogleFonts.spaceMono(fontSize: 12, color: Colors.grey)),
                  ])),
                  ElevatedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('${item['name']} marked as discarded'), backgroundColor: Colors.red.shade700),
                      );
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: isUrgent ? Colors.red : Colors.orange,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    child: Text('Discard', style: GoogleFonts.spaceMono(fontSize: 11)),
                  ),
                ]),
              );
            }),
            const Spacer(),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.blue.withOpacity(0.08), borderRadius: BorderRadius.circular(12), border: Border.all(color: Colors.blue.withOpacity(0.2))),
              child: Row(children: [
                const Icon(Icons.info_outline, color: Colors.blue, size: 20),
                const SizedBox(width: 12),
                Expanded(child: Text('Tip: Items expiring within 6 hours are shown with a red alert. Discard them before they cause quality issues.', style: GoogleFonts.spaceMono(fontSize: 11, color: Colors.blue.shade700))),
              ]),
            ),
          ],
        );
      },
    );
  }
}
