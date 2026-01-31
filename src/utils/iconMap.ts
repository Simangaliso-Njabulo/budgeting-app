import { Home, ShoppingBag, Car, Utensils, Film, Briefcase, Heart, Gift, Plane, Smartphone, Zap, DollarSign } from 'lucide-react';

export const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  home: Home,
  shopping: ShoppingBag,
  car: Car,
  food: Utensils,
  entertainment: Film,
  work: Briefcase,
  health: Heart,
  gift: Gift,
  travel: Plane,
  tech: Smartphone,
  utilities: Zap,
  income: DollarSign,
};
