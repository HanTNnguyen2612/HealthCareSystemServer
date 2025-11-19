// AI Chat functionality
let isTyping = false;

// Đảm bảo các biến global (API_BASE_URL, CURRENT_USER_ID) đã được định nghĩa trong Razor View
// const API_BASE_URL = "https://localhost:7293"; 
// const CURRENT_USER_ID = 4; 

document.addEventListener("DOMContentLoaded", () => {
    // Sử dụng biến đã được định nghĩa trên View để an toàn hơn
    if (typeof CURRENT_USER_ID !== 'undefined' && CURRENT_USER_ID > 0) {
        getMessages(CURRENT_USER_ID);
    } else {
        console.warn("User ID not found or is 0. Cannot load chat history.");
    }

    // Ẩn khung bác sĩ ban đầu
    const recommendedDoctorsCard = document.getElementById("recommendedDoctorsCard");
    if (recommendedDoctorsCard) {
        recommendedDoctorsCard.style.display = "none";
    }
});

// Hàm lấy Token từ Session Storage
function getAccessToken() {
    // Lưu ý: Bạn cần đảm bảo đã lưu AccessToken vào Session Storage
    // nếu bạn muốn sử dụng nó ở đây. LoginController của bạn lưu vào HttpContext.Session,
    // bạn cần chuyển nó vào Session Storage (hoặc Local Storage) trong quá trình login.
    // Nếu không, bạn cần tạo Endpoint mới để lấy Token từ HttpContext.Session.
    // TẠM THỜI GIẢ ĐỊNH BẠN ĐÃ LƯU TOKEN VÀO sessionStorage.
    return sessionStorage.getItem("AccessToken");
}

// Gửi tin nhắn lên API
function sendAIMessage(e) {
    e.preventDefault();
    const input = document.getElementById("aiMessageInput");
    const text = input.value.trim();
    if (!text || isTyping) return;

    addMessage("user", text);
    input.value = "";
    showTypingIndicator();

    // Sử dụng biến đã định nghĩa trên View
    const userId = CURRENT_USER_ID;
    const token = getAccessToken();

    // 📢 SỬA LỖI 404 & THÊM TOKEN
    fetch(`${API_BASE_URL}/api/chatbox/message`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // THÊM JWT TOKEN
        },
        body: JSON.stringify({ UserId: userId, Message: text })
    })
        .then(r => {
            // 📢 XỬ LÝ LỖI PHẢN HỒI (như 500 Internal Server Error)
            if (!r.ok) {
                // Cố gắng đọc nội dung lỗi dưới dạng text (có thể là HTML hoặc JSON lỗi)
                return r.text().then(text => {
                    throw new Error(`API Error: ${r.status} ${r.statusText}. Response: ${text.substring(0, 100)}...`);
                });
            }
            return r.json();
        })
        .then(data => {
            hideTypingIndicator();
            addMessage("ai", data.aiReply);

            // Nếu có danh sách bác sĩ gợi ý
            if (data.recommendedDoctors && data.recommendedDoctors.length) {
                renderRecommendedDoctors(data.recommendedDoctors);
            } else {
                const recommendedDoctorsCard = document.getElementById("recommendedDoctorsCard");
                if (recommendedDoctorsCard) {
                    recommendedDoctorsCard.style.display = "none";
                }
            }
            // Cuộn xuống cuối
            document.getElementById("aiChatMessages").scrollTop = document.getElementById("aiChatMessages").scrollHeight;
        })
        .catch(err => {
            hideTypingIndicator();
            console.error("Lỗi khi gửi/nhận tin nhắn:", err);
            addMessage("ai", `Xin lỗi, có lỗi hệ thống. Vui lòng kiểm tra console. (${err.message})`);
        });
}

// Render khung bác sĩ
function renderRecommendedDoctors(doctors) {
    const card = document.getElementById("recommendedDoctorsCard");
    const grid = document.getElementById("recommendedDoctors");
    if (!card || !grid) return;

    grid.innerHTML = doctors.map(d => `
    <div class="recommended-doctor-card">
        <div class="doctor-card-header">
            <img src="${d.avatar}"
                 alt="${d.fullName}" class="doctor-card-avatar">
            <div class="doctor-card-info">
                <h6>${d.fullName}</h6>
                <p>${d.specialty}</p>
                <span class="doctor-experience">${d.experience}</span>
            </div>
        </div>
        <div class="doctor-card-footer">
            <a href="/User/Appointments?doctorId=${d.userId}&specialtyId=${d.specialtyId}" class="btn btn-sm btn-primary">
                Đặt lịch
            </a>
        </div>
    </div>
    `).join("");
    card.style.display = "block";
}

// Thêm tin nhắn vào giao diện
function addMessage(sender, text) {
    const messagesContainer = document.getElementById("aiChatMessages");
    const time = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    const messageElement = document.createElement("div");
    messageElement.className = `message ${sender === "user" ? "user-message" : "ai-message"}`;

    // Format tin nhắn trước khi hiển thị
    const formattedText = formatMessageText(text);

    messageElement.innerHTML = `
    <div class="message-avatar">
        ${sender === "user"
            ? `<img src="/images/default-avatar.png" alt="You">` // Sửa placeholder bằng ảnh mặc định (hoặc ảnh của user)
            : '<div class="ai-avatar-small"><i class="fas fa-robot"></i></div>'}
    </div>
    <div class="message-content">
        <div class="message-header">
            <span class="message-sender">${sender === "user" ? "You" : "AI Assistant"}</span>
            <span class="message-time">${time}</span>
        </div>
        <div class="message-text">${formattedText}</div>
        ${sender === "ai" ? `
            <div class="ai-disclaimer">
                <i class="fas fa-exclamation-triangle"></i>
                Đây là thông tin tổng quát, không thay thế ý kiến chuyên môn.
            </div>
        ` : ""}
    </div>
    `;
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Hàm định dạng tin nhắn và xóa các ký tự Markdown
function formatMessageText(responseText) {
    if (!responseText) return "";

    // 📢 CẢI THIỆN XỬ LÝ MARKDOWN: Xóa các ký tự định dạng Markdown phổ biến
    let clean = responseText.replace(/(\*\*\*|###|##|\*|---)/g, "");

    // Xử lý các mục danh sách (nếu có)
    const listRegex = /(\d+\.\s+.*|\-\s+.*)/g;

    // Chia và chuyển mỗi dòng thành <p>
    return clean
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map(line => {
            // Giữ nguyên format nếu là danh sách, nếu không thì bọc trong <p>
            return listRegex.test(line) ? line : `<p>${line}</p>`;
        })
        .join("");
}

// Hiển thị biểu tượng đang gõ
function showTypingIndicator() {
    if (isTyping) return;
    isTyping = true;
    const container = document.getElementById("aiChatMessages");
    const el = document.createElement("div");
    el.className = "ai-typing-indicator";
    el.id = "typingIndicator";
    el.innerHTML = `
    <div class="message-avatar">
        <div class="ai-avatar-small"><i class="fas fa-robot"></i></div>
    </div>
    <div class="typing-content">
        <span class="typing-text">AI đang gõ…</span>
        <div class="typing-dots"><span></span><span></span><span></span></div>
    </div>`;
    container.appendChild(el);
    container.scrollTop = container.scrollHeight;
}

// Ẩn biểu tượng đang gõ
function hideTypingIndicator() {
    isTyping = false;
    const el = document.getElementById("typingIndicator");
    if (el) el.remove();
}

// Lấy lịch sử tin nhắn từ API
function getMessages(userId) {
    const token = getAccessToken();

    // 📢 SỬ DỤNG BASE URL & THÊM TOKEN
    fetch(`${API_BASE_URL}/api/chatbox/messages/${userId}`, {
        headers: {
            "Authorization": `Bearer ${token}` // THÊM JWT TOKEN
        }
    })
        .then(res => {
            if (!res.ok) {
                console.error(`Failed to fetch history: ${res.status} ${res.statusText}`);
                // Không ném lỗi ở đây, chỉ log, để UI không bị treo
                return [];
            }
            return res.json();
        })
        .then(data => {
            if (Array.isArray(data)) {
                data.forEach(msg => {
                    addMessage(msg.sender.toLowerCase(), msg.content);
                });
            }
        })
        .catch(err => console.error("Error fetching messages:", err));
}

// Đặt lịch với bác sĩ
function bookWithDoctor(doctorId) {
    // Hàm này không còn được dùng trực tiếp từ Render, nhưng giữ lại
    localStorage.setItem("selectedDoctorId", doctorId);
    window.location.href = "/appointments"; // hoặc route tương ứng
}