// frontend/src/App.tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Customer360View from './components/Customer360View';
import CustomerList from './components/CustomerList';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<CustomerList />} />
        <Route path="/customer/:customerId" element={<Customer360View />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;