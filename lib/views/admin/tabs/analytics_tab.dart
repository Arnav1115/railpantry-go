import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:provider/provider.dart';
import 'package:railpantry/providers/inventory_provider.dart';

class AnalyticsTab extends StatelessWidget {
  const AnalyticsTab({super.key});

  static const List<Map<String, dynamic>> _peakHourData = [
    {'hour': '6AM', 'volume': 0.2}, {'hour': '7AM', 'volume': 0.4},
    {'hour': '8AM', 'volume': 0.7}, {'hour': '9AM', 'volume': 0.9},
    {'hour': '10AM', 'volume': 0.6}, {'hour': '11AM', 'volume': 0.5},
    {'hour': '12PM', 'volume': 0.95}, {'hour': '1PM', 'volume': 1.0},
    {'hour': '2PM', 'volume': 0.7}, {'hour': '3PM', 'volume': 0.4},
    {'hour': '4PM', 'volume': 0.3}, {'hour': '5PM', 'volume': 0.5},
    {'hour': '6PM', 'volume': 0.85}, {'hour': '7PM', 'volume': 0.8},
    {'hour': '8PM', 'volume': 0.6}, {'hour': '9PM', 'volume': 0.3},
  ];

  static const List<Map<String, dynamic>> _coachData = [
    {'coach': 'B4', 'orders': 42}, {'coach': 'A1', 'orders': 35},
    {'coach': 'C2', 'orders': 28}, {'coach': 'D1', 'orders': 20},
    {'coach': 'E3', 'orders': 15},
  ];

  static const List<Map<String, dynamic>> _revenueTrend = [
    {'leg': 'Delhi-Kanpur', 'revenue': 4200},
    {'leg': 'Kanpur-Prayag', 'revenue': 5800},
    {'leg': 'Prayag-MGS', 'revenue': 7100},
    {'leg': 'MGS-Patna', 'revenue': 6300},
    {'leg': 'Patna-Dhanbad', 'revenue': 8900},
  ];

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Performance Analytics', style: GoogleFonts.lora(fontSize: 28, fontWeight: FontWeight.bold, color: const Color(0xFF2D2D2D))),
          const SizedBox(height: 24),
          // Metric Rings
          Row(children: [
            _buildRing('Revenue', '₹24,500', 0.78, Colors.green),
            _buildRing('Orders', '142', 0.62, const Color(0xFF00A19B)),
            _buildRing('Rating', '4.8/5', 0.96, Colors.orange),
            _buildRing('Waste %', '3.2%', 0.97, Colors.red),
          ]),
          const SizedBox(height: 32),
          Text('Peak Hour Heatmap', style: GoogleFonts.lora(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 4),
          Text('Order volume by hour of day', style: GoogleFonts.spaceMono(fontSize: 11, color: Colors.grey)),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(color: Colors.white.withOpacity(0.7), borderRadius: BorderRadius.circular(16)),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: _peakHourData.map((d) {
                final volume = d['volume'] as double;
                return Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 2),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.end,
                      children: [
                        Container(
                          height: 80 * volume,
                          decoration: BoxDecoration(
                            color: Color.lerp(const Color(0xFF00A19B).withOpacity(0.3), const Color(0xFF00A19B), volume),
                            borderRadius: BorderRadius.circular(4),
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(d['hour'], style: const TextStyle(fontSize: 7, color: Colors.grey)),
                      ],
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
          const SizedBox(height: 32),
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(child: _buildCoachSales()),
              const SizedBox(width: 24),
              Expanded(child: _buildRevenueTrend()),
            ],
          ),
          const SizedBox(height: 24),
          _buildTopItems(),
          const SizedBox(height: 24),
        ],
      ),
    );
  }

  Widget _buildRing(String label, String value, double progress, Color color) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.only(right: 16),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(color: Colors.white.withOpacity(0.7), borderRadius: BorderRadius.circular(16)),
        child: Column(children: [
          SizedBox(
            width: 70, height: 70,
            child: Stack(fit: StackFit.expand, children: [
              CircularProgressIndicator(value: progress, color: color, strokeWidth: 7, backgroundColor: color.withOpacity(0.1)),
              Center(child: Icon(Icons.show_chart, color: color, size: 18)),
            ]),
          ),
          const SizedBox(height: 10),
          Text(value, style: GoogleFonts.lora(fontSize: 17, fontWeight: FontWeight.bold)),
          Text(label, style: GoogleFonts.spaceMono(fontSize: 10, color: Colors.grey)),
        ]),
      ),
    );
  }

  Widget _buildCoachSales() {
    final maxOrders = _coachData.map((d) => d['orders'] as int).reduce((a, b) => a > b ? a : b);
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.7), borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Coach-wise Sales', style: GoogleFonts.lora(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 16),
          ..._coachData.map((d) {
            final frac = (d['orders'] as int) / maxOrders;
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(children: [
                SizedBox(width: 36, child: Text(d['coach'], style: GoogleFonts.spaceMono(fontSize: 12))),
                Expanded(
                  child: LinearProgressIndicator(
                    value: frac,
                    color: const Color(0xFF00A19B),
                    backgroundColor: const Color(0xFF00A19B).withOpacity(0.1),
                    minHeight: 8,
                    borderRadius: BorderRadius.circular(4),
                  ),
                ),
                const SizedBox(width: 8),
                Text('${d['orders']}', style: GoogleFonts.spaceMono(fontSize: 11, color: Colors.grey)),
              ]),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildRevenueTrend() {
    final maxRev = _revenueTrend.map((d) => d['revenue'] as int).reduce((a, b) => a > b ? a : b);
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.7), borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Revenue by Leg', style: GoogleFonts.lora(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 16),
          ..._revenueTrend.map((d) {
            final frac = (d['revenue'] as int) / maxRev;
            return Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(d['leg'], style: GoogleFonts.spaceMono(fontSize: 10, color: Colors.grey)),
                const SizedBox(height: 4),
                Row(children: [
                  Expanded(
                    child: LinearProgressIndicator(
                      value: frac,
                      color: Colors.green,
                      backgroundColor: Colors.green.withOpacity(0.1),
                      minHeight: 8,
                      borderRadius: BorderRadius.circular(4),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Text('₹${(d['revenue'] as int)}', style: GoogleFonts.spaceMono(fontSize: 10, color: Colors.grey)),
                ]),
              ]),
            );
          }),
        ],
      ),
    );
  }

  Widget _buildTopItems() {
    final topItems = [
      {'name': 'Veg Biryani', 'sales': 0.9},
      {'name': 'Masala Chai', 'sales': 0.8},
      {'name': 'Deluxe Thali', 'sales': 0.7},
      {'name': 'Samosa', 'sales': 0.5},
      {'name': 'Mineral Water', 'sales': 0.4},
    ];
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.7), borderRadius: BorderRadius.circular(16)),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Top Selling Items', style: GoogleFonts.lora(fontWeight: FontWeight.bold, fontSize: 16)),
          const SizedBox(height: 16),
          ...topItems.map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Row(children: [
              SizedBox(width: 120, child: Text(item['name']! as String, style: GoogleFonts.spaceMono(fontSize: 12))),
              Expanded(
                child: LinearProgressIndicator(
                  value: item['sales']! as double,
                  color: const Color(0xFF00A19B),
                  backgroundColor: const Color(0xFF00A19B).withOpacity(0.1),
                  minHeight: 8,
                  borderRadius: BorderRadius.circular(4),
                ),
              ),
            ]),
          )),
        ],
      ),
    );
  }
}
