import { useState, useRef, useEffect } from "react";
import "./App.css";
import ReactMarkdown from "react-markdown";
import bots from "./bots.json";

function App() {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([
    {
      role: "assistant",
      content: `
Xin chào 👋, tôi là **trợ lý phát triển khoa học và đổi mới sáng tạo** của BV Răng Hàm Mặt TPHCM.  
Bạn có thể hỏi tôi về quy trình nghiên cứu khoa học, sáng kiến cải tiến và xét duyệt y đức.

**Một số gợi ý để bắt đầu:**
- "Quy trình nộp đề tài nghiên cứu như thế nào?"
- "Cần biểu mẫu gì khi đăng ký sáng kiến?"

*Lưu ý: Câu trả lời có thể mất từ 1 đến 2 phút để hiển thị đầy đủ.*
`,
    },
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // load chatbot list from JSON
  const otherBots = bots ?? [];

  const chatHistoryRef = useRef(null);

  // useEffect(() => {
  //   if (chatHistoryRef.current) {
  //     chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
  //   }
  // }, [chats, isTyping]);

  // typing effect
  const typeReply = (text, msgs) => {
    let index = 0;
    const newMsg = { role: "assistant", content: "" };
    msgs.push(newMsg);
    setChats([...msgs]);

    const interval = setInterval(() => {
      if (index < text.length) {
        newMsg.content += text[index];
        setChats([...msgs]);
        index++;
      } else {
        clearInterval(interval);
        setIsTyping(false);
      }
    }, 30);
  };

  const chat = async (e, message) => {
    e.preventDefault();
    if (!message) return;

    setIsTyping(true);

    let msgs = [...chats, { role: "user", content: message }];
    setChats(msgs);
    setMessage("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "gpt-5.4",
          input: [{
            role: "system",
            content: "Bạn là chuyên viên quản lý nghiên cứu khoa học BV Răng Hàm Mặt TPHCM. Trả lời bằng tiếng Việt.",
          },
          {
            role: "system",
            content: "Nếu người dùng hỏi câu không liên quan thì trả lời: Bạn có câu hỏi gì về quy trình nghiên cứu khoa học, sáng kiến cải tiến và xét duyệt y đức của BV Răng Hàm Mặt TPHCM?",
          },
          {
            role: "system",
            content: "Chỉ trả lời dựa trên tài liệu nội bộ của BV Răng Hàm Mặt TPHCM. Nếu không có trong tài liệu thì trả lời rằng tôi không thể trả lời câu hỏi này.",
          },
          { role: "user", content: message },
          ],
          tools: [
            {
              type: "file_search",
              vector_store_ids: ["vs_68c2368283788191b4eeabe7c26b40d3"],
            },
          ],
        }),
      });

      const data = await res.json();
  

      const assistantMessage = data.output?.find(
        (item) => item.type === "message" && item.role === "assistant"
      );

      let reply = "Xin lỗi, tôi không thể trả lời câu hỏi này.";
      if (assistantMessage?.content?.[0]?.text) {
        reply = assistantMessage.content[0].text;
      }

      typeReply(reply, msgs);
    } catch (err) {
      console.error(err);
      setIsTyping(false);
    }
  };

  return (
    <div className="app-layout">
      {/* Backdrop để đóng sidebar khi click bên ngoài trên mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-backdrop" 
          onClick={() => setSidebarOpen(false)}
          aria-label="Đóng sidebar"
        />
      )}

      <aside className={`sidebar ${!sidebarOpen ? "collapsed" : ""}`}>
        <div className="sidebar-inner">
          <div className="sidebar-header">
            <h3 className="sidebar-title">Các chatbot khác mà bạn có thể quan tâm</h3>
            <button
              className="sidebar-hide-btn"
              aria-label="Ẩn sidebar"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>
          <ul className="bot-list">
              {otherBots.map((bot, index) => (
              <li key={bot.id} className="bot-item">
                <a href={bot.url} target="_blank" rel="noopener noreferrer" className="bot-link">
                    <span className="bot-order">{String(index + 1).padStart(2, "0")}</span>
                  <span className="bot-content-wrap">
                    {bot.icon ? (
                      <img src={bot.icon} alt="bot" className="bot-icon-img" />
                    ) : (
                      <span className="bot-icon">🤖</span>
                    )}
                    <span className="bot-title">{bot.title}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </aside>

      {!sidebarOpen && (
        <button
          className="show-sidebar-btn"
          aria-label="Hiện sidebar"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>
      )}

      <main className="chat-container">
      <h1 className="chat-title">
        QUY TRÌNH NGHIÊN CỨU KHOA HỌC VÀ SÁNG KIẾN CẢI TIẾN
        <br />
        <span className="subtitle">BỆNH VIỆN RĂNG HÀM MẶT TPHCM</span>
      </h1>

      <section className="chat-history" ref={chatHistoryRef}>
        {chats.map((chat, index) => (
          <div
            key={index}
            className={`chat-bubble ${chat.role === "user" ? "user" : "assistant"
              }`}
          >
            <span className="chat-role">
              {chat.role === "user" ? "Bạn" : "P.KHTH"}:
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
          disabled={isTyping}
        />
        <button type="submit" className="send-btn" disabled={isTyping}>
          Gửi
        </button>
      </form>
      </main>
    </div>
  );
}

export default App;
