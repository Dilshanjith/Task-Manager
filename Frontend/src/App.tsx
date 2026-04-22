import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import './styles/globals.css';

function App() {
  const { user } = useAuth();

  return (
    <div className="App">
      {user ? <Dashboard /> : <AuthPage />}
    </div>
  );
}

export default App;
