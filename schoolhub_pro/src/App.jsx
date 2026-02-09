import React from "react";
import Routes from "./Routes";
import { SchoolSettingsProvider } from "./contexts/SchoolSettingsContext";

function App() {
  return (
    <SchoolSettingsProvider>
      <Routes />
    </SchoolSettingsProvider>
  );
}

export default App;
