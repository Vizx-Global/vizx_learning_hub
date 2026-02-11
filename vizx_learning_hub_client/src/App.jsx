import React from "react";
import Routes from "./Routes";
import { ThemeProvider } from "./components/ThemeProvider"; 

import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <ThemeProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <Routes />
    </ThemeProvider>
  );
}

export default App;