import { useState } from 'react';
import { InitialStockPromptModal } from '../../components/onboarding/InitialStockPromptModal';
import { useInitialStockOnboarding } from '../../hooks/useInitialStockOnboarding';

interface ProductsPageProps {
  storeId: string;
}

export function ProductsPage({ storeId }: ProductsPageProps) {
  const [modalClosed, setModalClosed] = useState(false);
  const { activeProductsCount, shouldShowPrompt } = useInitialStockOnboarding(storeId);

  return (
    <>
      {/* Existing products content lives here. */}

      <InitialStockPromptModal
        onClose={() => setModalClosed(true)}
        open={shouldShowPrompt && !modalClosed}
        productCount={activeProductsCount}
        storeId={storeId}
      />
    </>
  );
}
