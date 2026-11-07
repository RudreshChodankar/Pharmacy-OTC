import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Medicine } from '../models/inventory.models';

@Component({ selector: 'app-inventory-section', templateUrl: './inventory-section.component.html' })
export class InventorySectionComponent implements OnChanges {
  @Input() medicines: Medicine[] = [];
  @Input() initialStockFilter = 'All stock';
  @Output() addMedicine = new EventEmitter<void>();
  @Output() editMedicine = new EventEmitter<Medicine>();
  @Output() removeMedicine = new EventEmitter<Medicine>();

  search = '';
  categoryFilter = 'All categories';
  stockFilter = 'All stock';
  categories = ['Pain relief', 'Antibiotics', 'Allergy', 'Vitamins', 'Digestive health', 'First aid', 'Other'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.initialStockFilter) { this.stockFilter = this.initialStockFilter; }
  }

  get filtered(): Medicine[] {
    const query = this.search.trim().toLowerCase();
    return this.medicines.filter(medicine =>
      (!query || [medicine.name, medicine.generic, medicine.sku, medicine.supplier].some(value => value.toLowerCase().includes(query))) &&
      (this.categoryFilter === 'All categories' || medicine.category === this.categoryFilter) &&
      (this.stockFilter === 'All stock' ||
        (this.stockFilter === 'Low stock' ? medicine.stock > 0 && medicine.stock <= 20 :
          this.stockFilter === 'Out of stock' ? medicine.stock === 0 : medicine.stock > 20)));
  }

  get lowCount(): number { return this.medicines.filter(medicine => medicine.stock > 0 && medicine.stock <= 20).length; }
  get outCount(): number { return this.medicines.filter(medicine => medicine.stock === 0).length; }
  get stockValue(): number { return this.medicines.reduce((sum, medicine) => sum + medicine.stock * medicine.price, 0); }
  get expiringCount(): number {
    const limit = new Date();
    limit.setDate(limit.getDate() + 90);
    return this.medicines.filter(medicine => medicine.expiry && new Date(medicine.expiry) <= limit).length;
  }
  stockStatus(medicine: Medicine): string { return medicine.stock === 0 ? 'Out of stock' : medicine.stock <= 20 ? 'Low stock' : 'In stock'; }
  statusClass(medicine: Medicine): string { return medicine.stock === 0 ? 'out' : medicine.stock <= 20 ? 'low' : 'good'; }
  expiryClass(medicine: Medicine): string {
    const days = (new Date(medicine.expiry).getTime() - Date.now()) / 86400000;
    return days < 0 ? 'expired' : days <= 90 ? 'soon' : '';
  }
  formatDate(date: string): string {
    return date ? new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  }
  resetFilters(): void { this.search = ''; this.categoryFilter = 'All categories'; this.stockFilter = 'All stock'; }
}
