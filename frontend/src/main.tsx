import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import App from './App.tsx';
import Dashboard from './components/dashboard/Dashboard.tsx';
import ConfigLibrary from './components/pages/ConfigLibrary.tsx';
import Devices from './components/pages/Devices.tsx';
import Login from './components/pages/Login.tsx';
import Tests from './components/pages/Tests.tsx';
import { AuthProvider } from "./auth/AuthContext";
import DocsLayout from "./components/pages/docs/DocsLayout";
import DocsHome from "./components/pages/docs/DocsHome";
import DocsIntroduction from "./components/pages/docs/DocsIntroduction";
import DocsFeatures from "./components/pages/docs/DocsFeatures";
import DocsGettingStarted from "./components/pages/docs/DocsGettingStarted";
import DocsTopology from "./components/pages/docs/DocsTopology";
import DocsTroubleshooting from "./components/pages/docs/DocsTroubleshooting";
import DocsEvaluation from "./components/pages/docs/DocsEvaluation";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* All these routes share the same layout */}
          <Route path="/" element={<App />}>
            <Route index element={<Dashboard />} />
            <Route path="docs" element={<DocsLayout />}>
              <Route index element={<DocsHome />} />
              <Route path="introduction" element={<DocsIntroduction />} />
              <Route path="features" element={<DocsFeatures />} />
              <Route path="getting-started" element={<DocsGettingStarted />} />
              <Route path="topology" element={<DocsTopology />} />
              <Route path="troubleshooting" element={<DocsTroubleshooting />} />
              <Route path="evaluation" element={<DocsEvaluation />} />
            </Route>
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
