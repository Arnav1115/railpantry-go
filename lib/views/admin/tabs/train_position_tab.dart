import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:railpantry/models/train_journey.dart';

class TrainPositionTab extends StatelessWidget {
  const TrainPositionTab({super.key});

  @override
  Widget build(BuildContext context) {
    final journey = kMockJourney;
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('Train Position', style: GoogleFonts.lora(fontSize: 28, fontWeight: FontWeight.bold, color: const Color(0xFF2D2D2D))),
          const SizedBox(height: 8),
          Text('${journey.trainName} • #${journey.trainNumber}', style: GoogleFonts.spaceMono(fontSize: 13, color: const Color(0xFF00A19B))),
          const SizedBox(height: 32),
          // Main progress card
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              color: Colors.white.withOpacity(0.7),
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: const Color(0xFF00A19B).withOpacity(0.2)),
            ),
            child: Column(
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    _stationLabel(journey.stations.first.name, isStart: true),
                    _stationLabel(journey.stations.last.name, isEnd: true),
                  ],
                ),
                const SizedBox(height: 12),
                // Progress track
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(
                    value: journey.progressFraction,
                    backgroundColor: const Color(0xFF00A19B).withOpacity(0.12),
                    color: const Color(0xFF00A19B),
                    minHeight: 12,
                  ),
                ),
                const SizedBox(height: 20),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceAround,
                  children: [
                    _infoChip('Current', journey.currentStation.name, Icons.location_on, const Color(0xFF00A19B)),
                    if (journey.nextStation != null)
                      _infoChip('Next Stop', journey.nextStation!.name, Icons.navigate_next, Colors.orange),
                    _infoChip('ETA', journey.nextStation?.arrivalTime ?? '—', Icons.access_time, Colors.blue),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 32),
          Text('All Stations', style: GoogleFonts.lora(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 16),
          ...journey.stations.asMap().entries.map((entry) {
            final i = entry.key;
            final station = entry.value;
            final isCurrent = i == journey.currentStationIndex;
            return _buildStationRow(station, isCurrent, i < journey.currentStationIndex);
          }),
        ],
      ),
    );
  }

  Widget _stationLabel(String name, {bool isStart = false, bool isEnd = false}) {
    return Column(
      crossAxisAlignment: isEnd ? CrossAxisAlignment.end : CrossAxisAlignment.start,
      children: [
        Text(isStart ? 'FROM' : 'TO', style: GoogleFonts.spaceMono(fontSize: 10, color: Colors.grey)),
        Text(name, style: GoogleFonts.lora(fontWeight: FontWeight.bold, fontSize: 13)),
      ],
    );
  }

  Widget _infoChip(String label, String value, IconData icon, Color color) {
    return Column(
      children: [
        Icon(icon, color: color, size: 20),
        const SizedBox(height: 4),
        Text(value, style: GoogleFonts.lora(fontWeight: FontWeight.bold, fontSize: 13)),
        Text(label, style: GoogleFonts.spaceMono(fontSize: 10, color: Colors.grey)),
      ],
    );
  }

  Widget _buildStationRow(TrainStation station, bool isCurrent, bool isPassed) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            width: 14,
            height: 14,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isCurrent ? const Color(0xFF00A19B) : (isPassed ? const Color(0xFF00A19B).withOpacity(0.4) : Colors.grey.shade300),
              border: isCurrent ? Border.all(color: const Color(0xFF00A19B), width: 3) : null,
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Text(
              station.name,
              style: GoogleFonts.lora(
                fontWeight: isCurrent ? FontWeight.bold : FontWeight.normal,
                color: isCurrent ? const Color(0xFF00A19B) : (isPassed ? Colors.grey : const Color(0xFF2D2D2D)),
              ),
            ),
          ),
          Text(station.arrivalTime, style: GoogleFonts.spaceMono(fontSize: 12, color: Colors.grey)),
          if (isCurrent) ...[
            const SizedBox(width: 8),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
              decoration: BoxDecoration(color: const Color(0xFF00A19B), borderRadius: BorderRadius.circular(8)),
              child: Text('NOW', style: GoogleFonts.spaceMono(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold)),
            ),
          ],
        ],
      ),
    );
  }
}
