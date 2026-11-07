import { Component, OnInit } from '@angular/core';
import { Medicine, SalesBill, StockReceipt } from './models/inventory.models';

const SEED: Medicine[] = [
  { id: 1, name: 'Paracetamol 500mg', generic: 'Acetaminophen', category: 'Pain relief', sku: 'MED-00124', stock: 248, unit: 'tablets', price: 0.45, expiry: '2026-12-18', supplier: 'Cipla Ltd.' },
  { id: 2, name: 'Amoxicillin 250mg', generic: 'Amoxicillin trihydrate', category: 'Antibiotics', sku: 'MED-00118', stock: 18, unit: 'capsules', price: 2.8, expiry: '2026-08-24', supplier: 'Sun Pharma' },
  { id: 3, name: 'Cetirizine 10mg', generic: 'Cetirizine hydrochloride', category: 'Allergy', sku: 'MED-00097', stock: 132, unit: 'tablets', price: 0.85, expiry: '2027-03-12', supplier: 'Dr. Reddy’s' },
  { id: 4, name: 'Vitamin C 500mg', generic: 'Ascorbic acid', category: 'Vitamins', sku: 'MED-00156', stock: 86, unit: 'tablets', price: 1.2, expiry: '2026-11-08', supplier: 'Zydus Life' },
  { id: 5, name: 'Omeprazole 20mg', generic: 'Omeprazole', category: 'Digestive health', sku: 'MED-00083', stock: 9, unit: 'capsules', price: 1.65, expiry: '2026-10-05', supplier: 'Alkem Labs' },
  { id: 6, name: 'ORS Sachet', generic: 'Oral rehydration salts', category: 'First aid', sku: 'MED-00172', stock: 64, unit: 'sachets', price: 8.5, expiry: '2027-06-20', supplier: 'Cipla Ltd.' },
  { id: 7, name: 'Ibuprofen 200mg', generic: 'Ibuprofen', category: 'Pain relief', sku: 'MED-00103', stock: 0, unit: 'tablets', price: 0.75, expiry: '2026-09-15', supplier: 'Sun Pharma' },
  { id: 8, name: 'Vitamin D3 60K', generic: 'Cholecalciferol', category: 'Vitamins', sku: 'MED-00191', stock: 42, unit: 'capsules', price: 12, expiry: '2027-01-30', supplier: 'Mankind Pharma' }
];

@Component({ selector: 'app-root', templateUrl: './app.component.html' })
export class AppComponent implements OnInit {
  medicines: Medicine[] = [];
  receipts: StockReceipt[] = [];
  sales: SalesBill[] = [];
  activeNav = 'Inventory';
  showModal = false;
  editingId: number | null = null;
  toast = '';
  form: Medicine = this.emptyMedicine();
  categories = ['Pain relief', 'Antibiotics', 'Allergy', 'Vitamins', 'Digestive health', 'First aid', 'Other'];

  ngOnInit(): void {
    const saved = localStorage.getItem('medistock-inventory');
    this.medicines = saved ? JSON.parse(saved) as Medicine[] : SEED.map(medicine => ({ ...medicine }));
    this.saveInventory();
    const savedReceipts = localStorage.getItem('medistock-stock-receipts');
    this.receipts = savedReceipts ? JSON.parse(savedReceipts) as StockReceipt[] : [];
    const savedSales = localStorage.getItem('medistock-sales');
    this.sales = savedSales ? JSON.parse(savedSales) as SalesBill[] : [];
  }

  get lowCount(): number { return this.medicines.filter(medicine => medicine.stock > 0 && medicine.stock <= 20).length; }
  private emptyMedicine(): Medicine { return { id: 0, name: '', generic: '', category: 'Pain relief', sku: '', stock: 0, unit: 'tablets', price: 0, expiry: '', supplier: '' }; }
  openAdd(): void {
    this.editingId = null;
    this.form = this.emptyMedicine();
    this.form.id = Date.now();
    this.form.sku = 'MED-' + String(Math.floor(10000 + Math.random() * 89999));
    this.showModal = true;
  }
  edit(medicine: Medicine): void { this.editingId = medicine.id; this.form = { ...medicine }; this.showModal = true; }
  closeModal(): void { this.showModal = false; }
  submit(): void {
    if (this.editingId !== null) {
      this.medicines = this.medicines.map(medicine => medicine.id === this.editingId ? { ...this.form } : medicine);
      this.notify('Medicine details updated');
    } else {
      this.medicines = [{ ...this.form }, ...this.medicines];
      this.notify('Medicine added to inventory');
    }
    this.saveInventory();
    this.closeModal();
  }
  remove(medicine: Medicine): void {
    if (window.confirm('Remove ' + medicine.name + ' from inventory?')) {
      this.medicines = this.medicines.filter(item => item.id !== medicine.id);
      this.saveInventory();
      this.notify('Medicine removed');
    }
  }
  receiveStock(receipt: StockReceipt): void {
    const medicine = this.medicines.find(item => item.id === receipt.medicineId);
    if (!medicine) { return; }
    medicine.stock += receipt.quantity;
    this.receipts = [receipt, ...this.receipts];
    this.saveInventory();
    localStorage.setItem('medistock-stock-receipts', JSON.stringify(this.receipts));
    this.notify(receipt.quantity + ' ' + receipt.unit + ' received for ' + receipt.medicineName);
  }
  completeSale(bill: SalesBill): void {
    const canFulfill = bill.items.every(line => {
      const medicine = this.medicines.find(item => item.id === line.medicineId);
      return medicine && medicine.stock >= line.quantity;
    });
    if (!canFulfill) { this.notify('Sale could not be completed because stock changed.'); return; }
    bill.items.forEach(line => {
      const medicine = this.medicines.find(item => item.id === line.medicineId);
      if (medicine) { medicine.stock -= line.quantity; }
    });
    this.sales = [bill, ...this.sales];
    this.saveInventory();
    localStorage.setItem('medistock-sales', JSON.stringify(this.sales));
    this.notify('Bill ' + bill.invoiceNumber + ' generated');
  }
  private saveInventory(): void { localStorage.setItem('medistock-inventory', JSON.stringify(this.medicines)); }
  notify(message: string): void { this.toast = message; setTimeout(() => this.toast = '', 2600); }
  notifyExport(count: number): void { this.notify(count ? `Exported ${count} medicines to Excel.` : 'No medicines to export for the current filters.'); }
  setNav(name: string): void { this.activeNav = name; }
}
