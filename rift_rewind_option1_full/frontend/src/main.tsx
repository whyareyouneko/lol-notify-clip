import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./global.css";

function Root() {
  return (
    <React.StrictMode>
      <div className="min-h-screen bg-[#010A13] text-white p-4">
        <App />
        <div className="mt-10">
          <h2 className="text-xl font-bold mb-2 text-white">
            Backend / Bedrock live demo
          </h2>
          <p className="text-white/60 text-sm mb-4">
            Hardcoded test player PUUID. Replace with real one.
          </p>
          {/* @ts-ignore */}
          <div className="max-w-xl">
            {/* You can swap 'demo-puuid-here' with a real PUUID */}
            {React.createElement(require("./BackendDemoPanel").BackendDemoPanel, { puuid: "demo-puuid-here" })}
          </div>
        </div>
      </div>
    </React.StrictMode>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(<Root />);
