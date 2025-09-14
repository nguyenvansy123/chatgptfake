import { useState } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";

function App() {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([
    {
      role: "assistant",
      content: `
Xin chào 👋, tôi là **trợ lý nghiên cứu khoa học** của BV Răng Hàm Mặt TPHCM.  
Bạn có thể hỏi tôi về quy trình nghiên cứu khoa học và sáng kiến cải tiến.

**Một số gợi ý để bắt đầu:**
- "Quy trình nộp đề tài nghiên cứu như thế nào?"
- "Cần biểu mẫu gì khi đăng ký sáng kiến?"
- "Các bước xét duyệt đề tài?"
- "Ai là người phụ trách hội đồng khoa học?"
`,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);

  // Hàm chat (dùng Responses API + File Search)
  const chat = async (e, message) => {
    e.preventDefault();
    if (!message) return;

    setIsTyping(true);

    let msgs = [...chats, { role: "user", content: message }];
    setChats(msgs);
    setMessage("");

    try {
      const res = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          input: [
            {
              role: "system",
              content:
                "Bạn là chuyên viên quản lý nghiên cứu khoa học BV Răng Hàm Mặt TPHCM. Trả lời bằng tiếng Việt.",
            },
             {
              role: "system",
              content:
                "nếu người dùng những câu không liên quan thì trả lời bạn có câu hỏi gì về quy trình nghiên cứu khoa học và sáng kiến cải tiến của BV Răng Hàm Mặt TPHCM.",
            },
            {
              role: "system",
              content:
                "Chỉ trả lời dựa trên tài liệu nội bộ của BV Răng Hàm Mặt TPHCM, nếu không có trong tài liệu thì trả lời rằng tôi không thể trả lời câu hỏi này.",
            },
            { role: "user", content: message },
          ],
          tools: [
            {
              type: "file_search",
              vector_store_ids: ["vs_68c2368283788191b4eeabe7c26b40d3"], // thay bằng ID thật
            },
          ],
        }),
      });

      const data = await res.json();
      console.log("API response:", data);

      const assistantMessage = data.output.find(
        (item) => item.type === "message" && item.role === "assistant"
      );

      let reply = "Xin lỗi, tôi không thể trả lời câu hỏi này.";
      if (assistantMessage?.content?.[0]?.text) {
        reply = assistantMessage.content[0].text;
      }

      msgs.push({
        role: "assistant",
        content: reply,
      });

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
        QUY TRÌNH NGHIÊN CỨU KHOA HỌC VÀ SÁNG KIẾN CẢI TIẾN
        <br />
        <span className="subtitle">BỆNH VIỆN RĂNG HÀM MẶT TPHCM</span>
      </h1>

      <section className="chat-history">
        {chats.map((chat, index) => (
          <div
            key={index}
            className={`chat-bubble ${
              chat.role === "user" ? "user" : "assistant"
            }`}
          >
            <span className="chat-role">
              {chat.role === "user" ? "Bạn" : "NCKH"}:
            </span>
            <ReactMarkdown className="chat-content">
              {chat.content}
            </ReactMarkdown>
          </div>
        ))}
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
        <button type="submit" className="send-btn">
          Gửi
        </button>
      </form>
    </main>
  );
}

export default App;
