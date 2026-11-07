import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Medicine, StockReceipt } from '../models/inventory.models';

@Component({ selector: 'app-incoming-stock-section', templateUrl: './incoming-stock-section.component.html' })
export class IncomingStockSectionComponent implements OnChanges {
  @Input() medicines: Medicine[] = [];
  @Input() receipts: StockReceipt[] = [];
  @Output() stockReceived = new EventEmitter<StockReceipt>();

  form = { medicineId: 0, quantity: 1, supplier: '', reference: '', receivedDate: new Date().toISOString().slice(0, 10) };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.medicines && this.medicines.length && !this.medicines.some(medicine => medicine.id === Number(this.form.medicineId))) {
      this.form.medicineId = this.medicines[0].id;
    }
  }

  receiveStock(): void {
    const medicine = this.medicines.find(item => item.id === Number(this.form.medicineId));
    const quantity = Number(this.form.quantity);
    if (!medicine || !Number.isInteger(quantity) || quantity < 1 || !this.form.receivedDate) { return; }
    this.stockReceived.emit({
      id: Date.now(), medicineId: medicine.id, medicineName: medicine.name, quantity,
      supplier: this.form.supplier.trim() || medicine.supplier, reference: this.form.reference.trim(),
      receivedDate: this.form.receivedDate, unit: medicine.unit
    });
    this.form = { medicineId: medicine.id, quantity: 1, supplier: '', reference: '', receivedDate: new Date().toISOString().slice(0, 10) };
  }

  formatDate(date: string): string {
    return date ? new Date(date + 'T00:00:00').toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
  }
}
