import { AlarmProvider } from '@/contexts/AlarmContext';
import { MainLayout } from '@/components/Layout/MainLayout';

function App() {
  return (
    <AlarmProvider>
      <MainLayout />
    </AlarmProvider>
  );
}

export default App;
