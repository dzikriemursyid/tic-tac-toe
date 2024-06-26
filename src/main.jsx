import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <div className="container">
      <header>
        <h1 className="title">Tic Tac Toe</h1>
      </header>
      <main>
        <App />
      </main>
    </div>
  </React.StrictMode>
);
