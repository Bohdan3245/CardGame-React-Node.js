import { useState } from "react";
import "./css/App.css";
import { Registration } from "./Registration";
import { Main } from "./Main";

function App() {
  const [isAuttenticated, setIsAuttenticated] = useState(false);
  const [ownerName, setOwnerName] = useState("");

  return (
    <div className="App">
      {isAuttenticated ? (
        <Main ownerName={ownerName} />
      ) : (
        <Registration
          setOwnerName={setOwnerName}
          onLoginSuccess={() => setIsAuttenticated(true)}
        />
      )}
    </div>
  );
}

export default App;
