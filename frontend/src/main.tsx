import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import App from './App.tsx';
import Dashboard from './components/dashboard/Dashboard.tsx';
import ConfigLibrary from './components/pages/ConfigLibrary.tsx';
import Docs from './components/pages/Docs.tsx';
import Devices from './components/pages/Devices.tsx';
import Login from './components/pages/Login.tsx';
import Tests from './components/pages/Tests.tsx';
import { AuthProvider } from "./auth/AuthContext";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* All these routes share the same layout */}
          <Route path="/" element={<App />}>
            <Route index element={<Dashboard />} />
            <Route path="docs" element={<Docs />} />
            <Route path="devices" element={<Devices />} />
            <Route path="config-library" element={<ConfigLibrary />} />
            <Route path="tests" element={<Tests />} />
            <Route path="login" element={<Login />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>
);
