import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:railpantry/providers/inventory_provider.dart';
import 'package:railpantry/providers/admin_provider.dart';
import 'package:railpantry/models/train_journey.dart';
import 'package:railpantry/models/order_reply.dart';
import 'package:google_fonts/google_fonts.dart';

class PantryMenu extends StatefulWidget {
  const PantryMenu({super.key});

  @override
  State<PantryMenu> createState() => _PantryMenuState();
}

class _PantryMenuState extends State<PantryMenu> {
  bool _isCheckoutOpen = false;
  String _selectedCategory = 'All';
  final Set<String> _selectedDietary = {};
  final List<String> _cart = [];

  void _showCallPantryDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFFE4DDD3),
        title: Text('Call Pantry Staff', style: GoogleFonts.lora(fontWeight: FontWeight.bold)),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            _serviceOption('Water Refill', Icons.local_drink),
            _serviceOption('Clear Tray', Icons.cleaning_services),
            _serviceOption('Custom Request', Icons.person_add),
          ],
        ),
      ),
    );
  }

  Widget _serviceOption(String type, IconData icon) {
    return ListTile(
      leading: Icon(icon, color: const Color(0xFF00A19B)),
      title: Text(type, style: GoogleFonts.lora()),
      onTap: () {
        context.read<AdminProvider>().submitServiceRequest(type, 'B4', '42');
        Navigator.pop(context);
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Request for $type sent!'), backgroundColor: const Color(0xFF00A19B)),
        );
      },
    );
  }

  void _showFeedbackDialog(String orderId) {
    int rating = 0;
    showDialog(
      context: context,
      barrierDismissible: false,
      builder: (context) => StatefulBuilder(
        builder: (context, setDialogState) => AlertDialog(
          backgroundColor: const Color(0xFFE4DDD3),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(24)),
          title: Text('How was your meal?', textAlign: TextAlign.center, style: GoogleFonts.lora(fontWeight: FontWeight.bold)),
          content: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(5, (index) => IconButton(
                  icon: Icon(index < rating ? Icons.star : Icons.star_border, color: Colors.orange, size: 32),
                  onPressed: () => setDialogState(() => rating = index + 1),
                )),
              ),
              const SizedBox(height: 16),
              TextField(
                decoration: InputDecoration(
                  hintText: 'Any comments?',
                  filled: true, fillColor: Colors.white.withOpacity(0.5),
                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                ),
                maxLines: 2,
              ),
            ],
          ),
          actions: [
            TextButton(
              onPressed: () {
                context.read<AdminProvider>().acknowledgeDelivery(orderId);
                Navigator.pop(context);
              },
              child: const Text('Skip', style: TextStyle(color: Colors.grey)),
            ),
            ElevatedButton(
              onPressed: rating == 0 ? null : () {
                context.read<AdminProvider>().submitFeedback(orderId, rating, '');
                context.read<AdminProvider>().acknowledgeDelivery(orderId);
                Navigator.pop(context);
              },
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00A19B)),
              child: const Text('Submit', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final admin = context.watch<AdminProvider>();
    final activeOrder = admin.myActiveOrder;

    // Trigger feedback if delivered
    if (activeOrder != null && activeOrder.status == OrderReplyStatus.delivered) {
      WidgetsBinding.instance.addPostFrameCallback((_) => _showFeedbackDialog(activeOrder.id));
    }

    return Scaffold(
      backgroundColor: const Color(0xFFE4DDD3),
      body: Stack(
        children: [
          Positioned.fill(child: Image.asset('assets/images/abstract_background.png', fit: BoxFit.cover)),
          SafeArea(
            child: CustomScrollView(
              slivers: [
                SliverToBoxAdapter(child: _buildSleekAppBar()),
                SliverToBoxAdapter(child: _buildJourneyTimeline()),
                if (activeOrder != null && activeOrder.status != OrderReplyStatus.delivered)
                  SliverToBoxAdapter(child: _buildLiveOrderTracker(activeOrder)),
                SliverToBoxAdapter(child: _buildQuickReorder()),
                SliverToBoxAdapter(child: _buildStationPrebooking()),
                SliverToBoxAdapter(child: const SizedBox(height: 16)),
                SliverToBoxAdapter(child: _buildFilters()),
                SliverPadding(
                  padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
                  sliver: Consumer<InventoryProvider>(
                    builder: (context, provider, _) {
                      final filteredItems = provider.items.where((item) {
                        final catMatch = _selectedCategory == 'All' || item.category == _selectedCategory;
                        final dietMatch = _selectedDietary.isEmpty || _selectedDietary.every((tag) => item.dietaryTags.contains(tag));
                        return catMatch && dietMatch;
                      }).toList();

                      return SliverGrid(
                        gridDelegate: const SliverGridDelegateWithMaxCrossAxisExtent(
                          maxCrossAxisExtent: 200,
                          childAspectRatio: 0.75,
                          crossAxisSpacing: 24,
                          mainAxisSpacing: 24,
                        ),
                        delegate: SliverChildBuilderDelegate(
                          (context, index) {
                            final item = filteredItems[index];
                            return _WeightlessMenuItem(
                              item: item,
                              onAdd: () {
                                setState(() => _cart.add(item.name));
                                ScaffoldMessenger.of(context).showSnackBar(
                                  SnackBar(content: Text('${item.name} added!'), backgroundColor: const Color(0xFF00A19B), duration: const Duration(seconds: 1)),
                                );
                              },
                            );
                          },
                          childCount: filteredItems.length,
                        ),
                      );
                    },
                  ),
                ),
                const SliverToBoxAdapter(child: SizedBox(height: 100)),
              ],
            ),
          ),
          if (_isCheckoutOpen) _buildGlassCheckout(admin),
        ],
      ),
      floatingActionButton: !_isCheckoutOpen
          ? FloatingActionButton.extended(
              onPressed: () => setState(() => _isCheckoutOpen = true),
              backgroundColor: const Color(0xFF00A19B),
              icon: const Icon(Icons.shopping_bag_outlined, color: Colors.white),
              label: Text('View Cart (${_cart.length})', style: GoogleFonts.spaceMono(color: Colors.white, fontWeight: FontWeight.bold)),
            )
          : null,
    );
  }

  Widget _buildSleekAppBar() {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text('Live Menu', style: GoogleFonts.lora(fontSize: 24, fontWeight: FontWeight.bold, color: const Color(0xFF2D2D2D))),
              Text('Rajdhani Exp • B4, Seat 42', style: GoogleFonts.spaceMono(fontSize: 11, color: const Color(0xFF00A19B))),
            ],
          ),
          Row(
            children: [
              IconButton(onPressed: _showCallPantryDialog, icon: const Icon(Icons.person_add_alt_1_outlined, color: Color(0xFF00A19B))),
              const SizedBox(width: 8),
              Container(
                decoration: BoxDecoration(color: Colors.white.withOpacity(0.5), borderRadius: BorderRadius.circular(20)),
                padding: const EdgeInsets.all(8),
                child: const Icon(Icons.search, color: Color(0xFF2D2D2D)),
              ),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildJourneyTimeline() {
    final journey = kMockJourney;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.4), borderRadius: BorderRadius.circular(16), border: Border.all(color: Colors.white.withOpacity(0.5))),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(journey.currentStation.name, style: GoogleFonts.lora(fontWeight: FontWeight.bold, fontSize: 12)),
              Text('Next: ${journey.nextStation?.name ?? 'End'}', style: GoogleFonts.spaceMono(fontSize: 10, color: const Color(0xFF00A19B))),
            ],
          ),
          const SizedBox(height: 8),
          LinearProgressIndicator(value: journey.progressFraction, backgroundColor: const Color(0xFF00A19B).withOpacity(0.1), color: const Color(0xFF00A19B), minHeight: 4),
          const SizedBox(height: 4),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Passed', style: GoogleFonts.spaceMono(fontSize: 9, color: Colors.grey)),
              Text('ETA: ${journey.nextStation?.arrivalTime ?? '--:--'}', style: GoogleFonts.spaceMono(fontSize: 9, color: Colors.grey)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _buildLiveOrderTracker(OrderReply order) {
    final isDelayed = order.status == OrderReplyStatus.delayed;
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 24, vertical: 8),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(color: (isDelayed ? Colors.orange : const Color(0xFF00A19B)).withOpacity(0.1), borderRadius: BorderRadius.circular(16), border: Border.all(color: (isDelayed ? Colors.orange : const Color(0xFF00A19B)).withOpacity(0.3))),
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text('Order Status', style: GoogleFonts.lora(fontWeight: FontWeight.bold)),
              Text(order.status.name.toUpperCase(), style: GoogleFonts.spaceMono(fontSize: 11, fontWeight: FontWeight.bold, color: isDelayed ? Colors.orange : const Color(0xFF00A19B))),
            ],
          ),
          const SizedBox(height: 12),
          Row(
            children: List.generate(3, (i) => Expanded(
              child: Container(
                height: 4, margin: const EdgeInsets.symmetric(horizontal: 2),
                decoration: BoxDecoration(color: i <= (order.status == OrderReplyStatus.pending ? 0 : 1) ? (isDelayed ? Colors.orange : const Color(0xFF00A19B)) : Colors.grey.withOpacity(0.2), borderRadius: BorderRadius.circular(2)),
              ),
            )),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickReorder() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8), child: Text('Order Again', style: GoogleFonts.lora(fontWeight: FontWeight.bold, fontSize: 16))),
        SizedBox(
          height: 60,
          child: ListView(
            scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 24),
            children: ['Masala Chai', 'Deluxe Thali'].map((name) => Container(
              margin: const EdgeInsets.only(right: 12),
              child: ActionChip(
                label: Text(name, style: GoogleFonts.spaceMono(fontSize: 11)),
                avatar: const Icon(Icons.history, size: 14),
                onPressed: () => setState(() => _cart.add(name)),
              ),
            )).toList(),
          ),
        ),
      ],
    );
  }

  Widget _buildStationPrebooking() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Padding(padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 8), child: Text('Station Pre-booking', style: GoogleFonts.lora(fontWeight: FontWeight.bold, fontSize: 16))),
        SizedBox(
          height: 100,
          child: ListView(
            scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 24),
            children: [
              _vendorCard('KFC', 'Kanpur Central', Colors.red),
              _vendorCard('Haldiram', 'Prayagraj Jn', Colors.orange),
            ],
          ),
        ),
      ],
    );
  }

  Widget _vendorCard(String name, String station, Color color) {
    return Container(
      width: 160, margin: const EdgeInsets.only(right: 12),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(color: Colors.white.withOpacity(0.5), borderRadius: BorderRadius.circular(16), border: Border.all(color: color.withOpacity(0.2))),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(name, style: GoogleFonts.lora(fontWeight: FontWeight.bold, color: color)),
          Text(station, style: GoogleFonts.spaceMono(fontSize: 9, color: Colors.grey)),
          const Spacer(),
          Text('PRE-BOOK →', style: GoogleFonts.spaceMono(fontSize: 9, fontWeight: FontWeight.bold, color: const Color(0xFF00A19B))),
        ],
      ),
    );
  }

  Widget _buildFilters() {
    return Column(
      children: [
        _buildScrollRow(['All', 'Meals', 'Snacks', 'Beverages'], (cat) => setState(() => _selectedCategory = cat), (cat) => cat == _selectedCategory),
        const SizedBox(height: 8),
        _buildScrollRow(['Pure Veg', 'Vegan', 'Jain Option', 'Non-Veg'], (tag) {
          setState(() => _selectedDietary.contains(tag) ? _selectedDietary.remove(tag) : _selectedDietary.add(tag));
        }, (tag) => _selectedDietary.contains(tag), isTag: true),
      ],
    );
  }

  Widget _buildScrollRow(List<String> items, Function(String) onTap, Function(String) isSelected, {bool isTag = false}) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal, padding: const EdgeInsets.symmetric(horizontal: 24),
      child: Row(
        children: items.map((item) {
          bool selected = isSelected(item);
          return GestureDetector(
            onTap: () => onTap(item),
            child: Container(
              margin: const EdgeInsets.only(right: 8),
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              decoration: BoxDecoration(
                color: selected ? const Color(0xFF00A19B) : (isTag ? Colors.transparent : Colors.white.withOpacity(0.5)),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF00A19B).withOpacity(selected ? 0 : 0.2)),
              ),
              child: Text(item, style: TextStyle(color: selected ? Colors.white : const Color(0xFF2D2D2D), fontSize: 11, fontWeight: selected ? FontWeight.bold : FontWeight.normal)),
            ),
          );
        }).toList(),
      ),
    );
  }

  Widget _buildGlassCheckout(AdminProvider admin) {
    double total = _cart.length * 100.0; // Mock price
    return Positioned.fill(
      child: Stack(
        children: [
          GestureDetector(onTap: () => setState(() => _isCheckoutOpen = false), child: Container(color: Colors.black26)),
          Align(
            alignment: Alignment.bottomCenter,
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
              child: BackdropFilter(
                filter: ImageFilter.blur(sigmaX: 30, sigmaY: 30),
                child: Container(
                  height: MediaQuery.of(context).size.height * 0.6, width: double.infinity,
                  padding: const EdgeInsets.all(32),
                  decoration: BoxDecoration(color: Colors.white.withOpacity(0.5), borderRadius: const BorderRadius.vertical(top: Radius.circular(32))),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text('Checkout', style: GoogleFonts.lora(fontSize: 28, fontWeight: FontWeight.bold)),
                          IconButton(icon: const Icon(Icons.close), onPressed: () => setState(() => _isCheckoutOpen = false)),
                        ],
                      ),
                      const SizedBox(height: 24),
                      Expanded(child: ListView(children: _cart.map((i) => ListTile(title: Text(i, style: GoogleFonts.spaceMono()), trailing: const Text('₹100'))).toList())),
                      const Divider(),
                      Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [Text('Total', style: GoogleFonts.lora(fontWeight: FontWeight.bold)), Text('₹${total.toInt()}', style: GoogleFonts.spaceMono(fontWeight: FontWeight.bold))]),
                      const SizedBox(height: 24),
                      ElevatedButton(
                        onPressed: _cart.isEmpty ? null : () {
                          admin.placePassengerOrder('B4', '42', _cart, total);
                          setState(() { _cart.clear(); _isCheckoutOpen = false; });
                          ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Order Placed!'), backgroundColor: Color(0xFF00A19B)));
                        },
                        style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF00A19B), foregroundColor: Colors.white, minimumSize: const Size(double.infinity, 56), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16))),
                        child: const Text('CONFIRM ORDER'),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _WeightlessMenuItem extends StatefulWidget {
  final dynamic item;
  final VoidCallback onAdd;
  const _WeightlessMenuItem({required this.item, required this.onAdd});
  @override
  State<_WeightlessMenuItem> createState() => _WeightlessMenuItemState();
}

class _WeightlessMenuItemState extends State<_WeightlessMenuItem> {
  bool _isHovered = false;
  String _getImageForNameAndCategory(String name, String cat) {
    final lowerName = name.toLowerCase();
    if (lowerName.contains('thali')) return 'assets/images/food_thali.png';
    if (lowerName.contains('biryani')) return 'assets/images/food_biryani.png';
    if (lowerName.contains('water')) return 'assets/images/food_water.png';
    if (cat.toLowerCase() == 'meals') return 'assets/images/food_biryani.png';
    if (cat.toLowerCase() == 'beverages') return 'assets/images/food_chai.png';
    return 'assets/images/food_snack.png';
  }

  @override
  Widget build(BuildContext context) {
    return MouseRegion(
      onEnter: (_) => setState(() => _isHovered = true),
      onExit: (_) => setState(() => _isHovered = false),
      child: GestureDetector(
        onTapDown: (_) => setState(() => _isHovered = true),
        onTapUp: (_) { setState(() => _isHovered = false); widget.onAdd(); },
        onTapCancel: () => setState(() => _isHovered = false),
        child: ClipRRect(
          borderRadius: BorderRadius.circular(32),
          child: BackdropFilter(
            filter: ImageFilter.blur(sigmaX: 10, sigmaY: 10),
            child: Container(
              decoration: BoxDecoration(color: Colors.white.withOpacity(0.5), borderRadius: BorderRadius.circular(32), border: Border.all(color: const Color(0xFF00A19B).withOpacity(0.1))),
              child: Stack(
                children: [
                  AnimatedPositioned(duration: const Duration(milliseconds: 400), curve: Curves.easeOutCubic, bottom: _isHovered ? 0 : -300, left: 0, right: 0, height: 300, child: Container(decoration: BoxDecoration(color: const Color(0xFF00A19B).withOpacity(0.9)))),
                  Padding(
                    padding: const EdgeInsets.all(12),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Expanded(child: ClipRRect(borderRadius: BorderRadius.circular(20), child: Image.asset(_getImageForNameAndCategory(widget.item.name, widget.item.category), fit: BoxFit.cover))),
                        const SizedBox(height: 8),
                        Text(widget.item.name, textAlign: TextAlign.center, maxLines: 1, overflow: TextOverflow.ellipsis, style: GoogleFonts.lora(fontWeight: FontWeight.bold, fontSize: 12, color: _isHovered ? Colors.white : const Color(0xFF2D2D2D))),
                        Text('₹${widget.item.price.toInt()}', style: GoogleFonts.spaceMono(fontWeight: FontWeight.bold, fontSize: 11, color: _isHovered ? Colors.white70 : const Color(0xFF00A19B))),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
