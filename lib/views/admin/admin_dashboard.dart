import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:railpantry/providers/inventory_provider.dart';
import 'package:railpantry/providers/admin_provider.dart';
import 'package:railpantry/widgets/station_supply_modal.dart';
import 'package:railpantry/views/landing_page.dart';
import 'package:railpantry/providers/auth_provider.dart';
import 'package:railpantry/views/admin/tabs/train_position_tab.dart';
import 'package:railpantry/views/admin/tabs/expiry_alerts_tab.dart';
import 'package:railpantry/views/admin/tabs/cash_register_tab.dart';
import 'package:railpantry/views/admin/tabs/wastage_tab.dart';
import 'package:railpantry/views/admin/tabs/order_reply_tab.dart';
import 'package:railpantry/views/admin/tabs/shift_handover_tab.dart';
import 'package:railpantry/views/admin/tabs/analytics_tab.dart';
import 'package:railpantry/views/admin/tabs/inventory_snapshot_tab.dart';
import 'package:railpantry/widgets/traffic_light_indicator.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});
  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  int _selectedIndex = 0;
  bool _sosActivated = false;

  // Sidebar items: (icon, label, badge fn)
  final List<_SidebarItem> _items = const [
    _SidebarItem(Icons.train, 'Train Position'),
    _SidebarItem(Icons.inbox, 'Order Inbox', hasBadge: true),
    _SidebarItem(Icons.inventory_2, 'Inventory'),
    _SidebarItem(Icons.table_chart, 'Snapshot & Restock'),
    _SidebarItem(Icons.timer_off, 'Expiry Alerts', hasAlert: true),
    _SidebarItem(Icons.analytics, 'Analytics'),
    _SidebarItem(Icons.point_of_sale, 'Cash Register'),
    _SidebarItem(Icons.delete_sweep, 'Wastage Tracker'),
    _SidebarItem(Icons.swap_horiz, 'Shift Handover'),
  ];

  void _showBroadcastDialog() {
    final controller = TextEditingController();
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFFE4DDD3),
        title: Text('Broadcast to Train', style: GoogleFonts.lora(fontWeight: FontWeight.bold)),
        content: TextField(
          controller: controller,
          decoration: InputDecoration(
            hintText: 'e.g., Pantry closing in 30 mins',
            filled: true, fillColor: Colors.white.withOpacity(0.5),
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
          ),
          maxLines: 3,
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Cancel', style: TextStyle(color: Colors.grey))),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Broadcast sent to all passengers!'), backgroundColor: Color(0xFF00A19B)),
              );
            },
            style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00A19B)),
            child: const Text('Send', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  void _showSOSDialog() {
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: const Color(0xFFE4DDD3),
        title: Row(children: [
          const Icon(Icons.emergency, color: Colors.red, size: 28),
          const SizedBox(width: 8),
          Text('SOS — Emergency', style: GoogleFonts.lora(fontWeight: FontWeight.bold, color: Colors.red)),
        ]),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text('Select emergency type:', style: GoogleFonts.spaceMono(fontSize: 13)),
            const SizedBox(height: 16),
            ...[
              ('Medical Emergency', Icons.medical_services, Colors.red),
              ('Fire / Smoke', Icons.local_fire_department, Colors.orange),
              ('Food Spill / Hazard', Icons.warning, Colors.amber),
            ].map((e) => ListTile(
              leading: Icon(e.$2, color: e.$3),
              title: Text(e.$1, style: GoogleFonts.lora()),
              onTap: () {
                Navigator.pop(ctx);
                setState(() => _sosActivated = true);
                ScaffoldMessenger.of(context).showSnackBar(
                  SnackBar(
                    content: Text('🚨 SOS Sent to Train Manager: ${e.$1}'),
                    backgroundColor: Colors.red.shade700,
                    duration: const Duration(seconds: 5),
                  ),
                );
              },
            )),
          ],
        ),
        actions: [
          TextButton(onPressed: () => Navigator.pop(ctx), child: const Text('Cancel', style: TextStyle(color: Colors.grey))),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Consumer<InventoryProvider>(
      builder: (context, inventory, _) {
        final hasLowStock = inventory.items.any((i) => i.isWarning || i.isCritical);

        return Scaffold(
          backgroundColor: const Color(0xFFE4DDD3),
          appBar: AppBar(
            title: Text('RailPantry Admin', style: GoogleFonts.lora(color: const Color(0xFF2D2D2D), fontWeight: FontWeight.bold)),
            backgroundColor: Colors.white.withOpacity(0.5),
            elevation: 0,
            actions: [
              // SOS Button
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 8.0),
                child: ElevatedButton.icon(
                  onPressed: _showSOSDialog,
                  icon: const Icon(Icons.emergency, size: 16),
                  label: Text('SOS', style: GoogleFonts.spaceMono(fontWeight: FontWeight.bold, fontSize: 12)),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: _sosActivated ? Colors.red.shade900 : Colors.red,
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                  ),
                ),
              ),
              const SizedBox(width: 8),
              IconButton(icon: const Icon(Icons.campaign, color: Color(0xFF00A19B)), tooltip: 'Broadcast', onPressed: _showBroadcastDialog),
              IconButton(
                icon: const Icon(Icons.logout, color: Colors.grey),
                onPressed: () {
                  Provider.of<AuthProvider>(context, listen: false).logout();
                  Navigator.pushReplacement(context, MaterialPageRoute(builder: (_) => const LandingPage()));
                },
              ),
              const SizedBox(width: 8),
            ],
          ),
          body: Column(
            children: [
              // Low Stock Auto-Alert Banner
              if (hasLowStock)
                Container(
                  width: double.infinity,
                  color: Colors.orange.shade100,
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 10),
                  child: Row(children: [
                    const Icon(Icons.warning_amber, color: Colors.orange, size: 18),
                    const SizedBox(width: 8),
                    Expanded(child: Text('Low stock detected on ${inventory.items.where((i) => i.isWarning || i.isCritical).length} item(s). Consider ordering ration at the next station.', style: GoogleFonts.spaceMono(fontSize: 11, color: Colors.orange.shade800))),
                    TextButton(
                      onPressed: () {
                        final itemsToRestock = inventory.items.where((i) => i.stock < 20).toList();
                        showModalBottomSheet(
                          context: context,
                          isScrollControlled: true,
                          backgroundColor: Colors.transparent,
                          builder: (_) => StationSupplyModal(itemsToRestock: itemsToRestock),
                        );
                      },
                      child: Text('Order Now →', style: GoogleFonts.spaceMono(fontSize: 11, color: Colors.orange.shade800, fontWeight: FontWeight.bold)),
                    ),
                  ]),
                ),
              Expanded(
                child: Row(children: [
                  // Sidebar
                  Consumer<AdminProvider>(
                    builder: (context, admin, _) => Container(
                      width: 220,
                      decoration: BoxDecoration(
                        color: Colors.white.withOpacity(0.6),
                        border: Border(right: BorderSide(color: const Color(0xFF00A19B).withOpacity(0.1))),
                      ),
                      child: ListView(children: [
                        const SizedBox(height: 8),
                        ..._items.asMap().entries.map((entry) {
                          final i = entry.key;
                          final item = entry.value;
                          bool isSelected = _selectedIndex == i;
                          final showBadge = item.hasBadge && admin.pendingOrderCount > 0;
                          return ListTile(
                            leading: Stack(
                              clipBehavior: Clip.none,
                              children: [
                                Icon(item.icon, color: isSelected ? const Color(0xFF00A19B) : Colors.grey, size: 20),
                                if (showBadge)
                                  Positioned(
                                    right: -4, top: -4,
                                    child: Container(
                                      width: 12, height: 12,
                                      decoration: const BoxDecoration(color: Colors.red, shape: BoxShape.circle),
                                    ),
                                  ),
                                if (item.hasAlert)
                                  Positioned(
                                    right: -4, top: -4,
                                    child: Container(
                                      width: 12, height: 12,
                                      decoration: const BoxDecoration(color: Colors.orange, shape: BoxShape.circle),
                                    ),
                                  ),
                              ],
                            ),
                            title: Text(item.label, style: GoogleFonts.lora(
                              color: isSelected ? const Color(0xFF00A19B) : const Color(0xFF2D2D2D),
                              fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                              fontSize: 13,
                            )),
                            selected: isSelected,
                            tileColor: isSelected ? const Color(0xFF00A19B).withOpacity(0.07) : null,
                            onTap: () => setState(() => _selectedIndex = i),
                          );
                        }),
                      ]),
                    ),
                  ),
                  // Main Content
                  Expanded(
                    child: Padding(
                      padding: const EdgeInsets.all(24),
                      child: _buildMainContent(inventory),
                    ),
                  ),
                ]),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildMainContent(InventoryProvider inventory) {
    switch (_selectedIndex) {
      case 0: return const TrainPositionTab();
      case 1: return const OrderReplyTab();
      case 2: return _buildInventoryView(inventory);
      case 3: return const InventorySnapshotTab();
      case 4: return const ExpiryAlertsTab();
      case 5: return const AnalyticsTab();
      case 6: return const CashRegisterTab();
      case 7: return const WastageTab();
      case 8: return const ShiftHandoverTab();
      default: return const TrainPositionTab();
    }
  }

  Widget _buildInventoryView(InventoryProvider provider) {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      Text('Inventory ERP', style: GoogleFonts.lora(fontSize: 28, fontWeight: FontWeight.bold, color: const Color(0xFF2D2D2D))),
      const SizedBox(height: 24),
      Row(children: [
        _buildStatCard('Active SKUs', '${provider.items.length}', Icons.inventory, const Color(0xFF00A19B)),
        _buildStatCard('Low Stock', '${provider.items.where((i) => i.isWarning).length}', Icons.warning, Colors.orange),
        _buildStatCard('Out of Stock', '${provider.items.where((i) => i.isCritical).length}', Icons.block, Colors.red),
      ]),
      const SizedBox(height: 24),
      Text('All Items', style: GoogleFonts.lora(fontSize: 18, fontWeight: FontWeight.bold)),
      const SizedBox(height: 12),
      Expanded(
        child: ListView.builder(
          itemCount: provider.items.length,
          itemBuilder: (context, index) {
            final item = provider.items[index];
            return Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white.withOpacity(0.7),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: const Color(0xFF00A19B).withOpacity(0.1)),
              ),
              child: Row(children: [
                Container(
                  width: 40, height: 40,
                  decoration: BoxDecoration(color: const Color(0xFF00A19B).withOpacity(0.1), borderRadius: BorderRadius.circular(8)),
                  child: const Icon(Icons.fastfood, color: Color(0xFF00A19B), size: 20),
                ),
                const SizedBox(width: 14),
                Expanded(flex: 3, child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(item.name, style: GoogleFonts.lora(fontWeight: FontWeight.bold, fontSize: 13)),
                  Text(item.category, style: GoogleFonts.spaceMono(color: Colors.grey, fontSize: 11)),
                ])),
                Expanded(child: Text('${item.stock} units', style: GoogleFonts.spaceMono(fontSize: 12))),
                TrafficLightIndicator(item: item, onRestock: () => provider.restockItem(item.id, 50)),
                const SizedBox(width: 12),
                // Quick restock buttons
                Row(children: [10, 25, 50].map((qty) => GestureDetector(
                  onTap: () {
                    provider.restockItem(item.id, qty);
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text('+$qty ${item.name}'), backgroundColor: const Color(0xFF00A19B), duration: const Duration(seconds: 1)),
                    );
                  },
                  child: Container(
                    margin: const EdgeInsets.only(left: 4),
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: const Color(0xFF00A19B).withOpacity(0.1), borderRadius: BorderRadius.circular(6)),
                    child: Text('+$qty', style: GoogleFonts.spaceMono(fontSize: 10, color: const Color(0xFF00A19B), fontWeight: FontWeight.bold)),
                  ),
                )).toList()),
              ]),
            );
          },
        ),
      ),
      Padding(
        padding: const EdgeInsets.only(top: 12),
        child: ElevatedButton.icon(
          onPressed: () {
            final itemsToRestock = provider.items.where((i) => i.stock < 20).toList();
            showModalBottomSheet(
              context: context, isScrollControlled: true, backgroundColor: Colors.transparent,
              builder: (_) => StationSupplyModal(itemsToRestock: itemsToRestock),
            );
          },
          icon: const Icon(Icons.local_shipping),
          label: Text('Order Ration at Next Station', style: GoogleFonts.lora(fontWeight: FontWeight.bold)),
          style: ElevatedButton.styleFrom(
            backgroundColor: const Color(0xFF00A19B), foregroundColor: Colors.white,
            minimumSize: const Size(double.infinity, 52),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          ),
        ),
      ),
    ]);
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color) {
    return Expanded(
      child: Container(
        margin: const EdgeInsets.only(right: 16),
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(color: Colors.white.withOpacity(0.7), borderRadius: BorderRadius.circular(14), border: Border.all(color: color.withOpacity(0.2))),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(icon, color: color, size: 24),
          const SizedBox(height: 10),
          Text(value, style: GoogleFonts.lora(fontSize: 22, fontWeight: FontWeight.bold, color: const Color(0xFF2D2D2D))),
          Text(title, style: GoogleFonts.spaceMono(color: Colors.grey, fontSize: 11)),
        ]),
      ),
    );
  }
}

class _SidebarItem {
  final IconData icon;
  final String label;
  final bool hasBadge;
  final bool hasAlert;
  const _SidebarItem(this.icon, this.label, {this.hasBadge = false, this.hasAlert = false});
}
