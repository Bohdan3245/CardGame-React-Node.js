import { useState } from "react";
import "./css/App.css";
import { Registration } from "./Registration";
import { Main } from "./Main";
import { ManyToOneMove } from "./ClickMove";
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
      {/* <ManyToOneMove /> */}
    </div>
  );
}

export default App;
