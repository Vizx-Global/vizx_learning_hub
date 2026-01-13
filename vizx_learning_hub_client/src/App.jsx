import React from "react";
import Routes from "./Routes";
import { ThemeProvider } from "./components/ThemeProvider"; 

function App() {
  return (
    <ThemeProvider>
      <Routes />
    </ThemeProvider>
  );
}

export default App;