import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Use Routes
import { store } from "./components/ui/store.tsx";
import {App} from "./App.tsx";
import {AddNodeModal} from "./components/addNodeModal.tsx";
import {EditNodeModal} from "./components/editNodeModal.tsx";
import "./index.css";


const container = document.getElementById("root");
const root = createRoot(container!);

root.render(
  <React.StrictMode>
    <Provider store={store}>
        <Router>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/add-node/:parentId" element={<AddNodeModal />} />
            <Route path="/edit-node/:nodeId" element={<EditNodeModal />} />
          </Routes>
        </Router>
    </Provider>
  </React.StrictMode>
);
