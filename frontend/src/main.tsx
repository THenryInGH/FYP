import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import './index.css';
import App from './App.tsx';
import Dashboard from './components/dashboard/Dashboard.tsx';
import Docs from './components/pages/Docs.tsx';
import Login from './components/pages/Login.tsx';

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        {/* All these routes share the same layout */}
        <Route path="/" element={<App />}>
          <Route index element={<Dashboard />} />
          <Route path="docs" element={<Docs />} />
          <Route path="login" element={<Login />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
