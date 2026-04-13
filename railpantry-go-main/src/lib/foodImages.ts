import thali from '@/assets/food/thali.jpg';
import biryani from '@/assets/food/biryani.jpg';
import chai from '@/assets/food/chai.jpg';
import samosa from '@/assets/food/samosa.jpg';
import coffee from '@/assets/food/coffee.jpg';
import biscuits from '@/assets/food/biscuits.jpg';
import water from '@/assets/food/water.jpg';
import sandwich from '@/assets/food/sandwich.jpg';

// Maps item name keywords to images
const foodImageMap: Record<string, string> = {
  'thali': thali,
  'rice': thali,
  'dal': thali,
  'meal': thali,
  'biryani': biryani,
  'pulao': biryani,
  'chai': chai,
  'tea': chai,
  'samosa': samosa,
  'pakora': samosa,
  'coffee': coffee,
  'cold coffee': coffee,
  'biscuit': biscuits,
  'cookie': biscuits,
  'namkeen': biscuits,
  'chips': biscuits,
  'water': water,
  'juice': water,
  'mineral': water,
  'sandwich': sandwich,
  'bread': sandwich,
  'toast': sandwich,
};

export function getFoodImage(name: string): string {
  const lower = name.toLowerCase();
  for (const [keyword, img] of Object.entries(foodImageMap)) {
    if (lower.includes(keyword)) return img;
  }
  // Fallback by category
  return thali;
}

export function getFoodImageByCategory(category: string): string {
  switch (category) {
    case 'Meals': return thali;
    case 'Beverages': return chai;
    case 'Snacks': return samosa;
    default: return thali;
  }
}
