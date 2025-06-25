import React, { useState } from "react";
import API from "../services/api";
import Sidebar from "../components/Sidebar";

export default function AiToolsPage() {
  const [mode, setMode] = useState("chatbot");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");

  const handleRun = async () => {
    if (mode === "chatbot") {
      const res = await API.post("/ai/chat", { query: input });
      setOutput(res.data.response);
    } else if (mode === "forecast") {
      // item_id should be input (or select dropdown in a real app)
      const res = await API.post("/ai/forecast", { item_id: input });
      setOutput(JSON.stringify(res.data, null, 2));
    }
  };

  return (
    <div>
      <Sidebar />
      <h2>AI Tools</h2>
      <select value={mode} onChange={e => setMode(e.target.value)}>
        <option value="chatbot">Supply Chain Chatbot</option>
        <option value="forecast">Demand Forecast</option>
      </select>
      <textarea value={input} onChange={e => setInput(e.target.value)} placeholder={mode === "chatbot" ? "Ask a supply chain question..." : "Enter Item ID"} />
      <button onClick={handleRun}>Run</button>
      <pre>{output}</pre>
    </div>
  );
}
