import { useNavigate } from 'react-router-dom';
import { initialStockSkippedKey } from '../../lib/storageKeys';

interface InitialStockPromptModalProps {
  storeId: string;
  productCount: number;
  open: boolean;
  onClose: () => void;
}

export function InitialStockPromptModal({
  storeId,
  productCount,
  open,
  onClose,
}: InitialStockPromptModalProps) {
  const navigate = useNavigate();

  if (!open) return null;

  const handleSkip = () => {
    localStorage.setItem(initialStockSkippedKey(storeId), 'true');
    onClose();
  };

  const handleConfirm = () => {
    onClose();
    navigate('/app/onboarding/initial-stock');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end bg-black/50 p-4 md:items-center md:justify-center">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-lg font-semibold">Начальные остатки</h2>
        <p className="mt-2 text-sm text-slate-600">
          Вы добавили {productCount} товаров. Хотите указать начальные остатки?
        </p>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            className="h-12 rounded-xl border border-slate-300 font-medium"
            onClick={handleSkip}
            type="button"
          >
            Пропустить
          </button>
          <button
            className="h-12 rounded-xl bg-blue-600 font-medium text-white"
            onClick={handleConfirm}
            type="button"
          >
            Да
          </button>
        </div>
      </div>
    </div>
  );
}
