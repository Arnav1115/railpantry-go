import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:railpantry/providers/admin_provider.dart';
import 'package:railpantry/models/cash_entry.dart';

class CashRegisterTab extends StatefulWidget {
  const CashRegisterTab({super.key});
  @override
  State<CashRegisterTab> createState() => _CashRegisterTabState();
}

class _CashRegisterTabState extends State<CashRegisterTab> {
  final _labelController = TextEditingController();
  final _amountController = TextEditingController();
  CashEntryType _selectedType = CashEntryType.cashIn;

  void _addEntry() {
    final label = _labelController.text.trim();
    final amount = double.tryParse(_amountController.text.trim());
    if (label.isEmpty || amount == null || amount <= 0) return;
    Provider.of<AdminProvider>(context, listen: false).addCashEntry(label, amount, _selectedType);
    _labelController.clear();
    _amountController.clear();
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<AdminProvider>(
      builder: (context, admin, _) {
        return Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Cash Register', style: GoogleFonts.lora(fontSize: 28, fontWeight: FontWeight.bold, color: const Color(0xFF2D2D2D))),
            const SizedBox(height: 24),
            // Balance Hero
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(28),
              decoration: BoxDecoration(
                color: const Color(0xFF00A19B),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [BoxShadow(color: const Color(0xFF00A19B).withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 10))],
              ),
              child: Column(
                children: [
                  Text('CURRENT BALANCE', style: GoogleFonts.spaceMono(color: Colors.white70, fontSize: 12, letterSpacing: 1)),
                  const SizedBox(height: 8),
                  Text('₹${admin.cashBalance.toStringAsFixed(2)}',
                      style: GoogleFonts.lora(color: Colors.white, fontSize: 40, fontWeight: FontWeight.bold)),
                ],
              ),
            ),
            const SizedBox(height: 24),
            // Add Entry Form
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.7),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Add Entry', style: GoogleFonts.lora(fontWeight: FontWeight.bold, fontSize: 16)),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      Expanded(
                        flex: 3,
                        child: TextField(
                          controller: _labelController,
                          decoration: InputDecoration(hintText: 'Description', filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none)),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        flex: 2,
                        child: TextField(
                          controller: _amountController,
                          keyboardType: TextInputType.number,
                          decoration: InputDecoration(prefixText: '₹', hintText: 'Amount', filled: true, fillColor: Colors.white, border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none)),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _typeChip('Cash In', CashEntryType.cashIn, Colors.green),
                      const SizedBox(width: 8),
                      _typeChip('Cash Out', CashEntryType.cashOut, Colors.red),
                      const Spacer(),
                      ElevatedButton(
                        onPressed: _addEntry,
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00A19B), foregroundColor: Colors.white, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10))),
                        child: const Text('Add'),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            Text('Transactions', style: GoogleFonts.lora(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Expanded(
              child: ListView.builder(
                itemCount: admin.cashEntries.length,
                itemBuilder: (context, i) {
                  final entry = admin.cashEntries.reversed.toList()[i];
                  final isIn = entry.type == CashEntryType.cashIn;
                  return Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: Colors.white.withOpacity(0.7), borderRadius: BorderRadius.circular(12)),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(color: (isIn ? Colors.green : Colors.red).withOpacity(0.1), shape: BoxShape.circle),
                          child: Icon(isIn ? Icons.arrow_downward : Icons.arrow_upward, color: isIn ? Colors.green : Colors.red, size: 16),
                        ),
                        const SizedBox(width: 12),
                        Expanded(child: Text(entry.label, style: GoogleFonts.lora(fontWeight: FontWeight.w600))),
                        Text('${isIn ? '+' : '-'}₹${entry.amount.toStringAsFixed(0)}',
                            style: GoogleFonts.spaceMono(color: isIn ? Colors.green : Colors.red, fontWeight: FontWeight.bold)),
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

  Widget _typeChip(String label, CashEntryType type, Color color) {
    final selected = _selectedType == type;
    return GestureDetector(
      onTap: () => setState(() => _selectedType = type),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? color.withOpacity(0.15) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: selected ? color : Colors.grey.shade300),
        ),
        child: Text(label, style: TextStyle(color: selected ? color : Colors.grey, fontWeight: selected ? FontWeight.bold : FontWeight.normal, fontSize: 13)),
      ),
    );
  }
}
