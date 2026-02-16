import { Navigate, Route, Routes } from 'react-router-dom';
import { InitialStockPage } from '../pages/onboarding/InitialStockPage';

interface AppRoutesProps {
  storeId: string;
  role: 'ADMIN' | 'WAREHOUSE' | 'CASHIER';
}

export function AppRoutes({ storeId, role }: AppRoutesProps) {
  return (
    <Routes>
      <Route element={<InitialStockPage role={role} storeId={storeId} />} path="/app/onboarding/initial-stock" />
      <Route element={<Navigate replace to="/app/pos" />} path="*" />
    </Routes>
  );
}
