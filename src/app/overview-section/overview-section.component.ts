import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Medicine, StockReceipt } from '../models/inventory.models';

interface CategorySummary { name: string; count: number; units: number; share: number; }

@Component({ selector: 'app-overview-section', templateUrl: './overview-section.component.html' })
export class OverviewSectionComponent {
  @Input() medicines: Medicine[] = [];
  @Input() receipts: StockReceipt[] = [];
  @Output() navigate = new EventEmitter<string>();

  get greeting(): string {
    const hour = new Date().getHours();
    return hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  }
  get todayLabel(): string {
    return new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  }
  get totalUnits(): number { return this.medicines.reduce((sum, medicine) => sum + medicine.stock, 0); }
  get stockValue(): number { return this.medicines.reduce((sum, medicine) => sum + medicine.stock * medicine.price, 0); }
  get lowCount(): number { return this.medicines.filter(medicine => medicine.stock > 0 && medicine.stock <= 20).length; }
  get outCount(): number { return this.medicines.filter(medicine => medicine.stock === 0).length; }
  get expiringCount(): number {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const limit = new Date(today); limit.setDate(limit.getDate() + 90);
    return this.medicines.filter(medicine => {
      if (!medicine.expiry) { return false; }
      const expiry = new Date(medicine.expiry + 'T00:00:00');
      return expiry >= today && expiry <= limit;
    }).length;
  }
  get categorySummaries(): CategorySummary[] {
    const groups: { [name: string]: { count: number; units: number } } = {};
    this.medicines.forEach(medicine => {
      if (!groups[medicine.category]) { groups[medicine.category] = { count: 0, units: 0 }; }
      groups[medicine.category].count += 1;
      groups[medicine.category].units += medicine.stock;
    });
    const max = Math.max(1, ...Object.keys(groups).map(name => groups[name].units));
    return Object.keys(groups).map(name => ({ name, count: groups[name].count, units: groups[name].units, share: Math.max(5, groups[name].units / max * 100) }))
      .sort((a, b) => b.units - a.units);
  }
  get recentReceipts(): StockReceipt[] { return this.receipts.slice(0, 5); }
  formatDate(date: string): string {
    return date ? new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—';
  }
}
