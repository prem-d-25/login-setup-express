import AppRoutes from "@/routes/AppRoutes";
import Loader from "@/components/common/Loader";
import useAuthStore from "@/features/auth/authStore";
import useAuthInit from "@/features/auth/useAuthInit";

function App() {

  const isInitializing = useAuthStore(state=> state.isInitializing)
  useAuthInit()

  if(isInitializing){
    return <Loader/>
  }

  return <AppRoutes />;
}

export default App;