import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import Dashboard from './pages/Dashboard';
import PropertyList from './pages/PropertyList';
import PropertyForm from './pages/PropertyForm';
import Copywriting from './pages/Copywriting';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="properties" element={<PropertyList />} />
          <Route path="properties/new" element={<PropertyForm />} />
          <Route path="properties/:id" element={<PropertyForm />} />
          <Route path="generate/:id" element={<Copywriting />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
