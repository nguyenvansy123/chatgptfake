import { useState, useEffect } from "react";
import { PDFDocument } from "pdf-lib"; // Import thư viện pdf-lib
import "./App.css";
import { Configuration, OpenAIApi } from "openai";

function App() {
  const [message, setMessage] = useState("");
  const [chats, setChats] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [pdfContents, setPdfContents] = useState([]); // Lưu nội dung các file PDF

  // Hàm đọc nội dung từ file PDF
  const loadPdfFiles = async () => {
    const pdfFiles = ["huong_dan_01.pdf", "huong_dan_02.pdf", "huong_dan_03.pdf", "huong_dan_04.pdf", "huong_dan_05.pdf"]; // Tên các file PDF
    const contents = [];

    for (const fileName of pdfFiles) {
      const response = await fetch(`/pdf/${fileName}`); // Đường dẫn tới file PDF trong thư mục public
      const arrayBuffer = await response.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer); // Load file PDF
      const pages = pdfDoc.getPages();
      let text = "";

      // Lấy nội dung từ tất cả các trang
      for (const page of pages) {
        text += page.getTextContent ? await page.getTextContent() : "";
      }

      contents.push(text);
    }

    setPdfContents(contents);
    alert("PDFs loaded successfully!");
  };

  useEffect(() => {
    loadPdfFiles(); // Tự động tải các file PDF khi ứng dụng khởi chạy
  }, []);

  const chat = async (e, message) => {
    e.preventDefault();

    if (!message) return;
    setIsTyping(true);

    let msgs = [...chats, { role: "user", content: message }];
    setChats(msgs);
    setMessage("");

    try {
      const res = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1",
          messages: [
            { role: "system", content: "You are EbereGPT..." },
            { role: "system", content: `Here are the contents of the PDFs: ${pdfContents.join("\n")}` },
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
    <main>
      <h1>QUY TRÌNH NGHIÊN CỨU KHOA HỌC VÀ SÁNG KIẾN CẢI TIẾN TẠI BỆNH VIỆN RĂNG HÀM MẶT TPHCM</h1>

      <section>
        {chats && chats.length
          ? chats.map((chat, index) => (
            <p key={index} className={chat.role === "user" ? "user_msg" : ""}>
              <span>
                <b>{chat.role.toUpperCase()}</b>
              </span>
              <span>:</span>
              <span>{chat.content}</span>
            </p>
          ))
          : ""}
      </section>

      <div className={isTyping ? "" : "hide"}>
        <p>
          <i>{isTyping ? "Typing" : ""}</i>
        </p>
      </div>

      <form action="" onSubmit={(e) => chat(e, message)}>
        <input
          type="text"
          name="message"
          value={message}
          placeholder="Type a message here and hit Enter..."
          onChange={(e) => setMessage(e.target.value)}
        />
      </form>
    </main>
  );
}

export default App;
