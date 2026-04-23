import { useAuth } from './contexts/AuthContext';
import { AuthPage } from './pages/AuthPage';
import { Dashboard } from './pages/Dashboard';
import './styles/globals.css';

function App() {
  const { user } = useAuth();

  // If not logged in, show AuthPage
  if (!user) {
    return <AuthPage />;
  }

  // If logged in but not verified, the AuthPage handles the OTP step 
  // during the registration flow. However, if they refresh or log in 
  // without verifying, we might want to force them to verify.
  // For now, let's let the AuthPage handle the flow transitions.
  
  return (
    <div className="App">
      <Dashboard />
    </div>
  );
}

export default App;
