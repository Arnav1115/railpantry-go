import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:railpantry/models/station.dart';
import 'package:railpantry/models/inventory_item.dart';

class StationSupplyModal extends StatefulWidget {
  final List<InventoryItem> itemsToRestock;
  const StationSupplyModal({super.key, required this.itemsToRestock});

  @override
  State<StationSupplyModal> createState() => _StationSupplyModalState();
}

class _StationSupplyModalState extends State<StationSupplyModal> {
  Station? _selectedStation;
  bool _isGeneratingQR = false;
  String? _digitalIndent;

  void _generateIndent() {
    setState(() {
      _isGeneratingQR = true;
      // Mock Digital Indent summary
      String indent = 'INDENT-2026-0412\n';
      indent += 'Station: ${_selectedStation!.name} (${_selectedStation!.code})\n';
      indent += 'Items: ${widget.itemsToRestock.length}\n';
      for (var item in widget.itemsToRestock) {
        indent += '- ${item.name}: 50 units\n';
      }
      _digitalIndent = indent;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: const BoxDecoration(
        color: Color(0xFF1E1E1E),
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('Order Ration at Next Station', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: Colors.white)),
          const SizedBox(height: 16),
          const Text('Select Upcoming Station', style: TextStyle(color: Colors.white70)),
          const SizedBox(height: 12),
          // Station List Mock
          SizedBox(
            height: 120,
            child: ListView(
              scrollDirection: Axis.horizontal,
              children: Station.mockStations().map((station) {
                bool isSelected = _selectedStation?.id == station.id;
                return GestureDetector(
                  onTap: () => setState(() => _selectedStation = station),
                  child: Container(
                    width: 160,
                    margin: const EdgeInsets.only(right: 12),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: isSelected ? Colors.indigo : Colors.white10,
                      borderRadius: BorderRadius.circular(12),
                      border: isSelected ? Border.all(color: Colors.white, width: 2) : null,
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(station.name, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                        Text(station.code, style: const TextStyle(color: Colors.white54, fontSize: 12)),
                        const SizedBox(height: 8),
                        Text('ETA: ${station.timeToArrival.inMinutes}m', style: const TextStyle(color: Colors.greenAccent, fontSize: 10)),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 24),
          if (_selectedStation != null && !_isGeneratingQR)
            ElevatedButton(
              onPressed: _generateIndent,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 50),
              ),
              child: const Text('GENERATE DIGITAL INDENT & QR'),
            ),
          if (_isGeneratingQR)
            Column(
              children: [
                const Text('Digital Indent Generated!', style: TextStyle(color: Colors.greenAccent, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
                    child: QrImageView(
                      data: _digitalIndent ?? '',
                      version: QrVersions.auto,
                      size: 200.0,
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Vendor scans this QR to confirm delivery',
                  style: TextStyle(color: Colors.white54, fontSize: 12),
                ),
                const SizedBox(height: 16),
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: const Text('CLOSE', style: TextStyle(color: Colors.white)),
                ),
              ],
            ),
        ],
      ),
    );
  }
}
