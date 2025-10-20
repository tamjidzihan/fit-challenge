import { AppRouter } from "./AppRouter";
import ChallengeRequestHandler from "./components/challenges/ChallengeRequestHandler";
import { AuthProvider } from "./context/AuthProvider";

function App() {

  return (
    <AuthProvider>
      <ChallengeRequestHandler />
      <AppRouter />
    </AuthProvider>
  )
}

export default App
