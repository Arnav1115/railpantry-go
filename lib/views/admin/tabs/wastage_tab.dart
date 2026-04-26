import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:railpantry/providers/admin_provider.dart';
import 'package:railpantry/providers/inventory_provider.dart';

class WastageTab extends StatefulWidget {
  const WastageTab({super.key});
  @override
  State<WastageTab> createState() => _WastageTabState();
}

class _WastageTabState extends State<WastageTab> {
  final _quantityController = TextEditingController();
  final _reasonController = TextEditingController();
  String? _selectedItem;

  @override
  Widget build(BuildContext context) {
    return Consumer2<AdminProvider, InventoryProvider>(
      builder: (context, admin, inventory, _) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Wastage Tracker', style: GoogleFonts.lora(fontSize: 28, fontWeight: FontWeight.bold, color: const Color(0xFF2D2D2D))),
            const SizedBox(height: 24),
            // Wastage Hero
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(24),
              decoration: BoxDecoration(
                color: Colors.red.shade50,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: Colors.red.shade200),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Column(children: [
                    Text('TODAY\'S WASTAGE', style: GoogleFonts.spaceMono(fontSize: 11, color: Colors.red)),
                    const SizedBox(height: 4),
                    Text('₹${admin.totalWastageCost.toStringAsFixed(0)}', style: GoogleFonts.lora(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.red.shade800)),
                  ]),
                  Column(children: [
                    Text('ENTRIES', style: GoogleFonts.spaceMono(fontSize: 11, color: Colors.red)),
                    const SizedBox(height: 4),
                    Text('${admin.wastageEntries.length}', style: GoogleFonts.lora(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.red.shade800)),
                  ]),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Log Form
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: Colors.white.withOpacity(0.7), borderRadius: BorderRadius.circular(16)),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Log Wastage', style: GoogleFonts.lora(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: _selectedItem,
                    hint: const Text('Select Item'),
                    decoration: InputDecoration(filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none)),
                    items: inventory.items.map((item) => DropdownMenuItem(value: item.name, child: Text(item.name))).toList(),
                    onChanged: (val) => setState(() => _selectedItem = val),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: [
                      Expanded(
                        child: TextField(
                          controller: _quantityController,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(hintText: 'Qty', filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none)),
                        ),
                      ),
                      const SizedBox(width: 10),
                      Expanded(
                        flex: 2,
                        child: TextField(
                          controller: _reasonController,
                          decoration: InputDecoration(hintText: 'Reason (Expired, Spilled…)', filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  ElevatedButton(
                    onPressed: () {
                      if (_selectedItem == null) return;
                      final qty = int.tryParse(_quantityController.text) ?? 0;
                      if (qty <= 0) return;
                      final item = inventory.items.firstWhere((i) => i.name == _selectedItem);
                      admin.addWastageEntry(_selectedItem!, qty, item.price, _reasonController.text.trim().isNotEmpty ? _reasonController.text.trim() : 'No reason given');
                      setState(() => _selectedItem = null);
                      _quantityController.clear();
                      _reasonController.clear();
                    },
                    style: ElevatedButton.styleFrom(backgroundColor: Colors.red.shade700, foregroundColor: Colors.white, minimumSize: const Size(double.infinity, 48), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                    child: const Text('Log Wastage'),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text('Log History', style: GoogleFonts.lora(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Expanded(
              child: ListView.builder(
                itemCount: admin.wastageEntries.length,
                itemBuilder: (context, i) {
                  final entry = admin.wastageEntries.reversed.toList()[i];
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.7), borderRadius: BorderRadius.circular(12)),
                    child: Row(
                      children: [
                        const Icon(Icons.delete_outline, color: Colors.red, size: 20),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                            Text('${entry.itemName} × ${entry.quantity}', style: GoogleFonts.lora(fontWeight: FontWeight.bold)),
                            Text(entry.reason, style: GoogleFonts.spaceMono(fontSize: 11, color: Colors.grey)),
                          ]),
                        ),
                        Text('-₹${entry.totalCost.toStringAsFixed(0)}', style: GoogleFonts.spaceMono(color: Colors.red, fontWeight: FontWeight.bold)),
                      ],
                    ),
                  );
                },
              ),
            ),
          ],
        );
      },
    );
  }
}
