import { Provider } from "jotai";
import { AppShell } from "@/components/Layout/AppShell";

function App() {
  return (
    <Provider>
      <AppShell />
    </Provider>
  );
}

export default App;
