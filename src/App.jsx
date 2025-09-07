import { useState, useEffect } from "react";
import * as pdfjsLib from "pdfjs-dist";

import similarity from "compute-cosine-similarity"; // npm install compute-cosine-similarity
import "./App.css";

// Cấu hình worker cho pdf.js
pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/5.4.149/pdf.worker.min.mjs";

function App() {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [chunks, setChunks] = useState([]); // các đoạn text + embedding

  // Đọc PDF và xử lý thành chunks + embeddings
  const loadPdfFiles = async () => {
    const pdfFiles = [
      "huong_dan_01.pdf",
      "huong_dan_02.pdf",
      "huong_dan_03.pdf",
      "huong_dan_04.pdf",
      "huong_dan_05.pdf",
    ];
    let allText = "";

    for (const fileName of pdfFiles) {
      const response = await fetch(`/pdf/${fileName}`);
      const arrayBuffer = await response.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const pageText = content.items.map((item) => item.str).join(" ");
        allText += pageText + "\n";
      }
    }

    // Chia text thành chunks nhỏ
    const chunkSize = 500;
    const regex = new RegExp(`.{1,${chunkSize}}`, "g");
    const splitChunks = allText.match(regex) || [];

    // Tạo embeddings cho từng chunk
    const embeddings = await Promise.all(
      splitChunks.map(async (chunk) => {
        const response = await fetch("https://api.openai.com/v1/embeddings", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "text-embedding-3-small",
            input: chunk,
          }),
        });
        const data = await response.json();
        return { text: chunk, embedding: data.data[0].embedding };
      })
    );

    setChunks(embeddings);
    alert("PDF loaded & processed successfully!");
  };

  useEffect(() => {
    loadPdfFiles();
  }, []);

  // Hàm tìm K chunks liên quan nhất
  const getRelevantContext = async (question, k = 3) => {
    const response = await fetch("https://api.openai.com/v1/embeddings", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "text-embedding-3-small",
        input: question,
      }),
    });
    const data = await response.json();
    const qEmb = data.data[0].embedding;

    const scored = chunks.map((c) => ({
      ...c,
      score: similarity(qEmb, c.embedding),
    }));

    return scored
      .sort((a, b) => b.score - a.score)
      .slice(0, k)
      .map((c) => c.text);
  };

  // Hàm chat
  const chat = async (e, message) => {
    e.preventDefault();
    if (!message) return;

    setIsTyping(true);

    let msgs = [...chats, { role: "user", content: message }];
    setChats(msgs);
    setMessage("");

    try {
      const context = await getRelevantContext(message, 3);
      console.log("Context:", context);
      
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "system",
              content: `Bạn là chuyên viên quản lý nghiên cứu khoa học tại BV Răng Hàm Mặt TPHCM.`
              // Chỉ trả lời dựa trên nội dung sau:\n${context.join(
              //   "\n"
              // )}\n".`,
            },
            ...msgs,
          ],
        }),
      });

      const data = await res.json();
      msgs.push(data.choices[0].message);
      setChats(msgs);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <main className="chat-container">
      <h1 className="chat-title">
        QUY TRÌNH NGHIÊN CỨU KHOA HỌC VÀ SÁNG KIẾN CẢI TIẾN<br />
        <span className="subtitle">BỆNH VIỆN RĂNG HÀM MẶT TPHCM</span>
      </h1>

      <section className="chat-history">
        {chats.length
          ? chats.map((chat, index) => (
            <div
              key={index}
              className={`chat-bubble ${chat.role === "user" ? "user" : "assistant"}`}
            >
              <span className="chat-role">{chat.role === "user" ? "Bạn" : "GPT"}:</span>
              <span className="chat-content">{chat.content}</span>
            </div>
          ))
          : <div className="empty-chat">Hãy nhập câu hỏi để bắt đầu!</div>}
      </section>

      {isTyping && (
        <div className="typing-indicator">
          <span className="dot"></span>
          <span className="dot"></span>
          <span className="dot"></span>
        </div>
      )}

      <form className="chat-form" onSubmit={(e) => chat(e, message)}>
        <input
          type="text"
          value={message}
          className="chat-input"
          placeholder="Nhập câu hỏi và nhấn Enter..."
          onChange={(e) => setMessage(e.target.value)}
          autoFocus
        />
        <button type="submit" className="send-btn">Gửi</button>
      </form>
    </main>
  );
}

export default App;
