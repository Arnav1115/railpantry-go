import 'package:flutter/material.dart';
import 'package:railpantry/models/inventory_item.dart';

class InventoryProvider extends ChangeNotifier {
  List<InventoryItem> _items = [];
  bool _isLoading = false;

  List<InventoryItem> get items => _items;
  bool get isLoading => _isLoading;

  // Initialize with mock data for now
  InventoryProvider() {
    _items = [
      InventoryItem(id: '1', name: 'Deluxe Veg Thali', category: 'Meals', price: 250, stock: 15, threshold: 5, dietaryTags: ['Pure Veg', 'Jain Option']),
      InventoryItem(id: '2', name: 'Railway Kulhad Chai', category: 'Beverages', price: 20, stock: 2, threshold: 5, dietaryTags: ['Pure Veg']),
      InventoryItem(id: '3', name: 'Fresh Veg Sandwich', category: 'Snacks', price: 60, stock: 8, threshold: 5, dietaryTags: ['Pure Veg']),
      InventoryItem(id: '4', name: 'Chicken Biryani', category: 'Meals', price: 180, stock: 22, threshold: 10, dietaryTags: ['Non-Veg', 'High Protein']),
      InventoryItem(id: '5', name: 'Mineral Water', category: 'Beverages', price: 20, stock: 0, threshold: 10, dietaryTags: ['Vegan', 'Gluten-Free']),
    ];
  }

  void updateStock(String itemId, int change) {
    final index = _items.indexWhere((item) => item.id == itemId);
    if (index != -1) {
      _items[index].stock = (_items[index].stock + change).clamp(0, 9999);
      notifyListeners();
      // TODO: Sync with Hive and Backend (Supabase/Firebase)
    }
  }

  void sellItem(String itemId, int quantity) {
    updateStock(itemId, -quantity);
  }

  void restockItem(String itemId, int quantity) {
    updateStock(itemId, quantity);
  }

  List<InventoryItem> getByCategory(String category) {
    if (category == 'All') return _items;
    return _items.where((item) => item.category == category).toList();
  }
}
