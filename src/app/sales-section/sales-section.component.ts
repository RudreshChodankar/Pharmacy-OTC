import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { Medicine, SaleLine, SalesBill } from '../models/inventory.models';

@Component({ selector: 'app-sales-section', templateUrl: './sales-section.component.html' })
export class SalesSectionComponent implements OnChanges {
  @Input() medicines: Medicine[] = [];
  @Input() sales: SalesBill[] = [];
  @Output() billGenerated = new EventEmitter<SalesBill>();

  medicineId = 0;
  quantity = 1;
  customerName = '';
  customerPhone = '';
  paymentMethod = 'Cash';
  cart: SaleLine[] = [];
  error = '';
  currentBill: SalesBill | null = null;
  showBill = false;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.medicines && this.medicines.length && !this.medicines.some(medicine => medicine.id === Number(this.medicineId) && medicine.stock > 0)) {
      this.medicineId = this.medicines.find(medicine => medicine.stock > 0)?.id || this.medicines[0].id;
    }
  }

  get availableMedicines(): Medicine[] { return this.medicines.filter(medicine => medicine.stock > 0); }
  get selectedMedicine(): Medicine | undefined { return this.medicines.find(medicine => medicine.id === Number(this.medicineId)); }
  get cartTotal(): number { return this.cart.reduce((sum, line) => sum + line.lineTotal, 0); }
  get todaySales(): SalesBill[] {
    const today = new Date().toDateString();
    return this.sales.filter(sale => new Date(sale.issuedAt).toDateString() === today);
  }
  get todayTotal(): number { return this.todaySales.reduce((sum, sale) => sum + sale.total, 0); }
  get todayUnits(): number { return this.todaySales.reduce((sum, sale) => sum + sale.items.reduce((units, line) => units + line.quantity, 0), 0); }

  addToCart(): void {
    const medicine = this.selectedMedicine;
    const quantity = Number(this.quantity);
    if (!medicine || !Number.isInteger(quantity) || quantity < 1) { this.error = 'Choose a medicine and enter a valid quantity.'; return; }
    const alreadyAdded = this.cart.find(line => line.medicineId === medicine.id)?.quantity || 0;
    if (alreadyAdded + quantity > medicine.stock) { this.error = 'Only ' + (medicine.stock - alreadyAdded) + ' ' + medicine.unit + ' available to add.'; return; }
    const existing = this.cart.find(line => line.medicineId === medicine.id);
    if (existing) {
      existing.quantity += quantity;
      existing.lineTotal = existing.quantity * existing.unitPrice;
      this.cart = [...this.cart];
    } else {
      this.cart = [...this.cart, { medicineId: medicine.id, name: medicine.name, sku: medicine.sku, quantity, unit: medicine.unit, unitPrice: medicine.price, lineTotal: quantity * medicine.price }];
    }
    this.quantity = 1;
    this.error = '';
  }

  removeFromCart(line: SaleLine): void { this.cart = this.cart.filter(item => item.medicineId !== line.medicineId); this.error = ''; }

  generateBill(): void {
    if (!this.cart.length) { this.error = 'Add at least one medicine before generating a bill.'; return; }
    const unavailable = this.cart.find(line => {
      const medicine = this.medicines.find(item => item.id === line.medicineId);
      return !medicine || medicine.stock < line.quantity;
    });
    if (unavailable) { this.error = 'Stock changed for ' + unavailable.name + '. Update the cart and try again.'; return; }
    const now = new Date();
    const bill: SalesBill = {
      id: now.getTime(), invoiceNumber: 'INV-' + now.getTime(), issuedAt: now.toISOString(),
      customerName: this.customerName.trim() || 'Walk-in customer', customerPhone: this.customerPhone.trim(),
      paymentMethod: this.paymentMethod, items: this.cart.map(line => ({ ...line })), subtotal: this.cartTotal, total: this.cartTotal
    };
    this.billGenerated.emit(bill);
    this.currentBill = bill;
    this.showBill = true;
    this.cart = [];
    this.customerName = '';
    this.customerPhone = '';
    this.error = '';
  }

  openBill(bill: SalesBill): void { this.currentBill = bill; this.showBill = true; }
  closeBill(): void { this.showBill = false; }
  printBill(): void { window.print(); }
  formatDate(value: string): string { return new Date(value).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }); }
  formatTime(value: string): string { return new Date(value).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }
}
