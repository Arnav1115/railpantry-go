import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:railpantry/providers/admin_provider.dart';

class ShiftHandoverTab extends StatefulWidget {
  const ShiftHandoverTab({super.key});
  @override
  State<ShiftHandoverTab> createState() => _ShiftHandoverTabState();
}

class _ShiftHandoverTabState extends State<ShiftHandoverTab> {
  final _notesController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Consumer<AdminProvider>(
      builder: (context, admin, _) {
        if (admin.shiftSubmitted) {
          return Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.check_circle, color: Color(0xFF00A19B), size: 80),
                const SizedBox(height: 16),
                Text('Shift Handed Over', style: GoogleFonts.lora(fontSize: 24, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('Notes saved successfully.', style: GoogleFonts.spaceMono(color: Colors.grey)),
                const SizedBox(height: 32),
                OutlinedButton(
                  onPressed: admin.resetShift,
                  style: OutlinedButton.styleFrom(foregroundColor: const Color(0xFF00A19B), side: const BorderSide(color: Color(0xFF00A19B))),
                  child: const Text('Start New Shift'),
                ),
              ],
            ),
          );
        }

        return SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Shift Handover', style: GoogleFonts.lora(fontSize: 28, fontWeight: FontWeight.bold, color: const Color(0xFF2D2D2D))),
              const SizedBox(height: 8),
              Text('Complete this form before handing over to the next operator.', style: GoogleFonts.spaceMono(fontSize: 12, color: Colors.grey)),
              const SizedBox(height: 32),
              _buildSummaryCard(admin),
              const SizedBox(height: 24),
              Text('Handover Notes', style: GoogleFonts.lora(fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(color: Colors.white.withOpacity(0.7), borderRadius: BorderRadius.circular(16)),
                child: Column(
                  children: [
                    TextField(
                      controller: _notesController,
                      maxLines: 6,
                      decoration: InputDecoration(
                        hintText: 'e.g. 3 units of Chai spilled, Biryani very popular today, Samosa stock critically low...',
                        filled: true,
                        fillColor: Colors.white,
                        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      ),
                    ),
                    const SizedBox(height: 16),
                    ElevatedButton.icon(
                      onPressed: () {
                        admin.submitShiftHandover(_notesController.text.trim().isNotEmpty ? _notesController.text.trim() : 'No notes added.');
                      },
                      icon: const Icon(Icons.send),
                      label: Text('Submit Handover', style: GoogleFonts.lora(fontWeight: FontWeight.bold)),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF00A19B),
                        foregroundColor: Colors.white,
                        minimumSize: const Size(double.infinity, 52),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildSummaryCard(AdminProvider admin) {
    final totalRevenue = admin.cashEntries
        .where((e) => e.type.name == 'cashIn')
        .fold(0.0, (sum, e) => sum + e.amount);
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: Colors.white.withOpacity(0.7),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF00A19B).withOpacity(0.2)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Shift Summary', style: GoogleFonts.lora(fontWeight: FontWeight.bold, fontSize: 18)),
          const Divider(height: 24),
          _summaryRow('Total Revenue', '₹${totalRevenue.toStringAsFixed(0)}'),
          _summaryRow('Wastage Cost', '₹${admin.totalWastageCost.toStringAsFixed(0)}'),
          _summaryRow('Cash Balance', '₹${admin.cashBalance.toStringAsFixed(0)}'),
          _summaryRow('Orders Processed', '${admin.orders.where((o) => o.status.name == 'confirmed').length}'),
        ],
      ),
    );
  }

  Widget _summaryRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: GoogleFonts.spaceMono(fontSize: 13, color: Colors.grey)),
          Text(value, style: GoogleFonts.lora(fontWeight: FontWeight.bold, fontSize: 15)),
        ],
      ),
    );
  }
}
