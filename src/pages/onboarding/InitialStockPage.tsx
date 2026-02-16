import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { BarcodeScanner } from '../../components/scanner/BarcodeScanner';
import { getProductByBarcode, submitInitialStock } from '../../api/client';
import { initialStockDoneKey } from '../../lib/storageKeys';
import { queryKeys } from '../../lib/queryKeys';
import type { Product } from '../../types/inventory';

const qtySchema = z.number().positive();

type CartItem = Product & { quantity: number };

interface InitialStockPageProps {
  storeId: string;
  role: 'ADMIN' | 'WAREHOUSE' | 'CASHIER';
}

export function InitialStockPage({ storeId, role }: InitialStockPageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [barcodeInput, setBarcodeInput] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  const canEdit = role === 'ADMIN' || role === 'WAREHOUSE';

  const addOrIncreaseItem = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.barcode === product.barcode);
      if (existing) {
        return prev.map((item) =>
          item.barcode === product.barcode ? { ...item, quantity: Number((item.quantity + 1).toFixed(3)) } : item,
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const lookupMutation = useMutation({
    mutationFn: getProductByBarcode,
    onSuccess: addOrIncreaseItem,
    onError: () => {
      toast.error('Товар не найден в каталоге');
      if (canEdit && barcodeInput) {
        toast(
          <button
            className="rounded-lg bg-blue-600 px-3 py-2 text-white"
            onClick={() => navigate(`/app/products/new?barcode=${barcodeInput}`)}
            type="button"
          >
            Создать товар
          </button>,
        );
      }
    },
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      submitInitialStock(storeId, {
        reason: 'INITIAL_STOCK',
        items: cart.map((item) => ({ barcode: item.barcode, quantity: item.quantity })),
      }),
    onSuccess: async () => {
      localStorage.setItem(initialStockDoneKey(storeId), 'true');
      toast.success('Остатки сохранены');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.inventory.current(storeId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.inventory.lowStock(storeId) }),
        queryClient.invalidateQueries({ queryKey: queryKeys.alerts(storeId) }),
      ]);
      navigate('/app/inventory');
    },
    onError: (error: any) => {
      const status = error?.response?.status;
      if (status === 400 || status === 422) {
        toast.error(error?.response?.data?.error ?? 'Проверьте количество в позициях');
        return;
      }
      toast.error('Не удалось сохранить остатки');
    },
  });

  if (!canEdit) {
    return <div className="p-6 text-lg font-semibold">403: Нет доступа к этому экрану</div>;
  }

  const totalItems = useMemo(() => cart.length, [cart.length]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-4">
      <h1 className="text-2xl font-semibold">Начальные остатки</h1>

      <BarcodeScanner
        onDetected={(code) => {
          setBarcodeInput(code);
          lookupMutation.mutate(code);
        }}
      />

      <div className="flex gap-2">
        <input
          className="h-12 w-full rounded-xl border px-3"
          onChange={(e) => setBarcodeInput(e.target.value)}
          placeholder="Введите штрихкод"
          value={barcodeInput}
        />
        <button
          className="h-12 rounded-xl bg-slate-900 px-5 text-white"
          onClick={() => lookupMutation.mutate(barcodeInput)}
          type="button"
        >
          Добавить
        </button>
      </div>

      <ul className="space-y-2">
        {cart.map((item) => (
          <li className="rounded-xl border p-3" key={item.barcode}>
            <div className="font-medium">{item.name}</div>
            <div className="text-xs text-slate-500">{item.barcode}</div>
            <div className="mt-2 flex items-center gap-2">
              {!item.isWeighted &&
                [1, 5, 10].map((step) => (
                  <button
                    className="rounded-lg border px-3 py-1"
                    key={step}
                    onClick={() =>
                      setCart((prev) =>
                        prev.map((i) =>
                          i.barcode === item.barcode
                            ? { ...i, quantity: Number((i.quantity + step).toFixed(3)) }
                            : i,
                        ),
                      )
                    }
                    type="button"
                  >
                    +{step}
                  </button>
                ))}
              <input
                className="h-10 w-28 rounded-lg border px-2"
                min="0"
                onChange={(e) => {
                  const next = Number(e.target.value);
                  const parsed = qtySchema.safeParse(next);
                  if (!parsed.success && e.target.value !== '') return;
                  setCart((prev) =>
                    prev.map((i) => (i.barcode === item.barcode ? { ...i, quantity: next } : i)),
                  );
                }}
                step="0.001"
                type="number"
                value={item.quantity}
              />
              <span className="text-sm text-slate-500">{item.unit}</span>
              <button
                className="ml-auto text-sm text-red-600"
                onClick={() => setCart((prev) => prev.filter((i) => i.barcode !== item.barcode))}
                type="button"
              >
                Удалить
              </button>
            </div>
          </li>
        ))}
      </ul>

      <button
        className="h-12 rounded-xl bg-blue-600 font-medium text-white disabled:opacity-50"
        disabled={submitMutation.isPending || totalItems === 0}
        onClick={() => submitMutation.mutate()}
        type="button"
      >
        {submitMutation.isPending ? 'Сохраняем...' : 'Сохранить начальные остатки'}
      </button>
    </div>
  );
}
