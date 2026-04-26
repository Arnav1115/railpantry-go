import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:railpantry/providers/inventory_provider.dart';

class InventorySnapshotTab extends StatelessWidget {
  const InventorySnapshotTab({super.key});

  @override
  Widget build(BuildContext context) {
    return Consumer<InventoryProvider>(
      builder: (context, inventory, _) {
        final summary = inventory.items.map((item) {
          String status = item.isCritical ? '❌ OUT' : (item.isWarning ? '⚠️ LOW' : '✅ OK');
          return '${item.name.padRight(24)} ${item.stock.toString().padLeft(4)} units  $status';
        }).join('\n');

        final fullText = '=== RailPantry Inventory Snapshot ===\n${DateTime.now().toString().substring(0, 16)}\n\n$summary\n\n====================================';

        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('Inventory Snapshot', style: GoogleFonts.lora(fontSize: 28, fontWeight: FontWeight.bold, color: const Color(0xFF2D2D2D))),
                ElevatedButton.icon(
                  onPressed: () {
                    Clipboard.setData(ClipboardData(text: fullText));
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(content: Text('Snapshot copied to clipboard!'), backgroundColor: Color(0xFF00A19B)),
                    );
                  },
                  icon: const Icon(Icons.copy, size: 16),
                  label: const Text('Copy Snapshot'),
                  style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00A19B), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                ),
              ],
            ),
            const SizedBox(height: 24),
            // Summary Stats Row
            Row(children: [
              _statCard('Total Items', '${inventory.items.length}', Colors.blue),
              _statCard('In Stock', '${inventory.items.where((i) => i.isHealthy).length}', Colors.green),
              _statCard('Low Stock', '${inventory.items.where((i) => i.isWarning).length}', Colors.orange),
              _statCard('Out of Stock', '${inventory.items.where((i) => i.isCritical).length}', Colors.red),
            ]),
            const SizedBox(height: 24),
            // Snapshot Table
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: Colors.white.withOpacity(0.7), borderRadius: BorderRadius.circular(16)),
                child: Column(
                  children: [
                    // Header
                    Padding(
                      padding: const EdgeInsets.only(bottom: 12),
                      child: Row(children: [
                        Expanded(flex: 3, child: Text('ITEM', style: GoogleFonts.spaceMono(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold))),
                        Expanded(child: Text('CATEGORY', style: GoogleFonts.spaceMono(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold))),
                        Expanded(child: Text('STOCK', style: GoogleFonts.spaceMono(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold))),
                        SizedBox(width: 80, child: Text('STATUS', style: GoogleFonts.spaceMono(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.bold))),
                        const SizedBox(width: 100),
                      ]),
                    ),
                    const Divider(),
                    // Rows
                    Expanded(
                      child: ListView.builder(
                        itemCount: inventory.items.length,
                        itemBuilder: (context, i) {
                          final item = inventory.items[i];
                          Color statusColor = item.isCritical ? Colors.red : (item.isWarning ? Colors.orange : Colors.green);
                          String statusLabel = item.isCritical ? 'OUT' : (item.isWarning ? 'LOW' : 'OK');
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 8),
                            child: Row(children: [
                              Expanded(flex: 3, child: Text(item.name, style: GoogleFonts.lora(fontWeight: FontWeight.w600, fontSize: 13))),
                              Expanded(child: Text(item.category, style: GoogleFonts.spaceMono(fontSize: 11, color: Colors.grey))),
                              Expanded(child: Text('${item.stock}', style: GoogleFonts.spaceMono(fontSize: 13, fontWeight: FontWeight.bold))),
                              SizedBox(
                                width: 80,
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                                  decoration: BoxDecoration(color: statusColor.withOpacity(0.1), borderRadius: BorderRadius.circular(10), border: Border.all(color: statusColor.withOpacity(0.3))),
                                  child: Text(statusLabel, textAlign: TextAlign.center, style: GoogleFonts.spaceMono(fontSize: 10, color: statusColor, fontWeight: FontWeight.bold)),
                                ),
                              ),
                              // Quick restock
                              SizedBox(
                                width: 100,
                                child: Row(children: [
                                  const SizedBox(width: 8),
                                  ...[10, 25, 50].map((qty) => GestureDetector(
                                    onTap: () {
                                      inventory.restockItem(item.id, qty);
                                      ScaffoldMessenger.of(context).showSnackBar(
                                        SnackBar(content: Text('+$qty ${item.name}'), backgroundColor: const Color(0xFF00A19B), duration: const Duration(seconds: 1)),
                                      );
                                    },
                                    child: Container(
                                      margin: const EdgeInsets.only(right: 4),
                                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                      decoration: BoxDecoration(color: const Color(0xFF00A19B).withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                                      child: Text('+$qty', style: GoogleFonts.spaceMono(fontSize: 9, color: const Color(0xFF00A19B), fontWeight: FontWeight.bold)),
                                    ),
                                  )),
                                ]),
                              ),
                            ]),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        );
      },
    );
  }

  Widget _statCard(String label, String value, Color color) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.only(right: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(color: color.withOpacity(0.08), borderRadius: BorderRadius.circular(12), border: Border.all(color: color.withOpacity(0.2))),
        child: Column(children: [
          Text(value, style: GoogleFonts.lora(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
          Text(label, style: GoogleFonts.spaceMono(fontSize: 10, color: Colors.grey)),
        ]),
      ),
    );
  }
}
