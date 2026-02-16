export const queryKeys = {
  products: {
    activeCount: (storeId: string) => ['products', 'active-count', storeId] as const,
    byBarcode: (barcode: string) => ['products', 'by-barcode', barcode] as const,
  },
  inventory: {
    current: (storeId: string) => ['inventory/current', storeId] as const,
    lowStock: (storeId: string) => ['inventory/low-stock', storeId] as const,
  },
  alerts: (storeId: string) => ['alerts', storeId] as const,
};
