import 'package:hive/hive.dart';

part 'inventory_item.g.dart';

@HiveType(typeId: 0)
class InventoryItem extends HiveObject {
  @HiveField(0)
  final String id;
  
  @HiveField(1)
  final String name;
  
  @HiveField(2)
  final String category;
  
  @HiveField(3)
  final double price;
  
  @HiveField(4)
  int stock;
  
  @HiveField(5)
  final int threshold;
  
  @HiveField(6)
  final String imageUrl;

  @HiveField(7)
  final List<String> dietaryTags;

  InventoryItem({
    required this.id,
    required this.name,
    required this.category,
    required this.price,
    required this.stock,
    required this.threshold,
    this.imageUrl = '',
    this.dietaryTags = const [],
  });

  // Traffic Light Logic
  bool get isHealthy => stock > threshold;
  bool get isWarning => stock <= threshold && stock > 0;
  bool get isCritical => stock == 0;
}
