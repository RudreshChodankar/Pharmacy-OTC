import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Medicine } from '../models/inventory.models';
import * as XLSX from 'xlsx';

@Component({ selector: 'app-inventory-section', templateUrl: './inventory-section.component.html' })
export class InventorySectionComponent implements OnChanges {
  @Input() medicines: Medicine[] = [];
  @Input() initialStockFilter = 'All stock';
  @Output() addMedicine = new EventEmitter<void>();
  @Output() editMedicine = new EventEmitter<Medicine>();
  @Output() removeMedicine = new EventEmitter<Medicine>();
  @Output() exported = new EventEmitter<number>();

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

  exportInventory(): void {
    const rows = this.filtered;
    if (!rows.length) { this.exported.emit(0); return; }
    const data: (string | number)[][] = [
      ['SKU', 'Medicine', 'Generic name', 'Category', 'Quantity', 'Unit', 'Stock status', 'Unit price (INR)', 'Stock value (INR)', 'Expiry date', 'Expiry status', 'Supplier'],
      ...rows.map(medicine => [
        medicine.sku,
        medicine.name,
        medicine.generic,
        medicine.category,
        medicine.stock,
        medicine.unit,
        this.stockStatus(medicine),
        medicine.price,
        medicine.stock * medicine.price,
        medicine.expiry,
        this.expiryClass(medicine) === 'expired' ? 'Expired' : this.expiryClass(medicine) === 'soon' ? 'Expiring soon' : 'OK',
        medicine.supplier
      ])
    ];
    const sheet: XLSX.WorkSheet = XLSX.utils.aoa_to_sheet(data);
    sheet['!cols'] = [
      { wch: 14 }, { wch: 26 }, { wch: 27 }, { wch: 20 }, { wch: 12 }, { wch: 14 },
      { wch: 17 }, { wch: 18 }, { wch: 19 }, { wch: 16 }, { wch: 17 }, { wch: 22 }
    ];
    sheet['!autofilter'] = { ref: `A1:L${data.length}` };
    const workbook: XLSX.WorkBook = XLSX.utils.book_new();
    workbook.Props = { Title: 'Pharmacy inventory', Subject: 'Current pharmacy inventory', Author: 'MediStock' };
    XLSX.utils.book_append_sheet(workbook, sheet, 'Inventory');
    const date = new Date();
    const datePart = [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
    XLSX.writeFile(workbook, `pharmacy-inventory-${datePart}.xlsx`);
    this.exported.emit(rows.length);
  }
}
