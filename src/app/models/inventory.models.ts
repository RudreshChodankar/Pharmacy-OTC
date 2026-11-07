export interface Medicine {
  id: number;
  name: string;
  generic: string;
  category: string;
  sku: string;
  stock: number;
  unit: string;
  price: number;
  expiry: string;
  supplier: string;
}

export interface StockReceipt {
  id: number;
  medicineId: number;
  medicineName: string;
  quantity: number;
  supplier: string;
  reference: string;
  receivedDate: string;
  unit: string;
}

export interface SaleLine {
  medicineId: number;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

export interface SalesBill {
  id: number;
  invoiceNumber: string;
  issuedAt: string;
  customerName: string;
  customerPhone: string;
  paymentMethod: string;
  items: SaleLine[];
  subtotal: number;
  total: number;
}
