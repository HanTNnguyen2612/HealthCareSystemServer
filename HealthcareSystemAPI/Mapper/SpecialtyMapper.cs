using System.Collections.Generic;
using System.Linq;

namespace HealthCareSystemAPI.Mapper
{
    public static class SpecialtyMapper
    {
        // Dictionary lưu trữ tên chuyên khoa tiếng Việt (dùng để trả về) và danh sách các từ khóa liên quan (Tiếng Việt, Tiếng Anh, Trung, Nhật, Pháp)
        private static readonly Dictionary<string, List<string>> SpecialtyKeywords = new Dictionary<string, List<string>>
        {
            // Tên tiếng Việt - Danh sách từ khóa (Việt/Anh/Trung/Nhật/Pháp)
            {
                "Tim mạch", new List<string> {
                    "tim", "huyết áp", "tăng huyết áp", "mạch máu", "nhồi máu cơ tim", "cơn đau ngực", // Vietnamese
                    "cardiology", "cardio", "heart", "vascular", // English
                    "心脏科", "心血管", // Chinese: xīnzàngkē, xīnxiěguǎn
                    "循環器科", "心臓", // Japanese: junkan-kika, shinzō
                    "cardiologie", "cœur" // French
                }
            },
            {
                "Da liễu", new List<string> {
                    "da", "mụn", "nám", "chàm", "eczema", "viêm da", "bệnh vảy nến", "bỏng",
                    "dermatology", "skin", "rash",
                    "皮肤科", "皮炎", // Chinese: pífūkē, píyán
                    "皮膚科", "湿疹", // Japanese: hifuka, shisshin
                    "dermatologie", "peau" // French
                }
            },
            {
                "Nhi khoa", new List<string> {
                    "trẻ em", "sốt", "ho", "hen suyễn", "viêm họng", "bệnh sởi", "bạch hầu", "bệnh tay chân miệng",
                    "pediatrics", "child", "infant",
                    "儿科", "小儿", // Chinese: érkē, xiǎo'ér
                    "小児科", "子供", // Japanese: shōnika, kodomo
                    "pédiatrie", "enfant" // French
                }
            },
            
            // Các chuyên khoa đã được thêm vào trước đó
            {
                "Nội khoa", new List<string> {
                    "tiểu đường", "bệnh tim mạch", "hô hấp", "thận", "viêm gan", "xơ gan", "tổng quát", "nội tổng quát",
                    "internal medicine", "diagnosis", "general practitioner",
                    "内科", "诊断", // Chinese: nèikē, zhěnduàn
                    "内科", "総合診療", // Japanese: naika, sōgō shinryō
                    "médecine interne", "généraliste" // French
                }
            },
            {
                "Chấn thương chỉnh hình", new List<string> {
                    "xương", "khớp", "cổ tay", "gãy xương", "thoái hóa khớp", "viêm khớp", "bệnh gút", "chấn thương",
                    "orthopedics", "bone", "joint", "fracture",
                    "骨科", "关节", // Chinese: gǔkē, guānjié
                    "整形外科", "骨折", // Japanese: seikei-geka, kossetsu
                    "orthopédie", "os", "fracture" // French
                }
            },
            {
                "Thần kinh", new List<string> {
                    "đau đầu", "tai biến", "đột quỵ", "chóng mặt", "suy giảm trí nhớ", "bệnh Parkinson", "động kinh", "thần kinh",
                    "neurology", "brain", "nerve", "stroke",
                    "神经科", "大脑", // Chinese: shénjīngkē, dà'nǎo
                    "神経科", "脳卒中", // Japanese: shinkei-ka, nōsotchū
                    "neurologie", "cerveau", "AVC" // French
                }
            },
            {
                "Tâm thần học", new List<string> {
                    "trầm cảm", "lo âu", "stress", "rối loạn lo âu", "hưng phấn", "rối loạn tâm thần", "tâm lý", "tâm thần",
                    "psychiatry", "mental health", "anxiety",
                    "精神病学", "心理健康", // Chinese: jīngshénbìngxué, xīnlǐ jiànkāng
                    "精神科", "不安", // Japanese: seishin-ka, fuan
                    "psychiatrie", "santé mentale" // French
                }
            },
            {
                "Mắt", new List<string> {
                    "mắt", "cận thị", "loạn thị", "đau mắt", "nhìn mờ", "tật khúc xạ", "thoái hóa điểm vàng",
                    "ophthalmology", "eye", "vision",
                    "眼科", "视力", // Chinese: yǎnkē, shìlì
                    "眼科", "視力", // Japanese: ganka, shiryoku
                    "ophtalmologie", "œil", "vision" // French
                }
            },
            {
                "Tiêu hóa", new List<string> {
                    "dạ dày", "ruột", "tiêu hóa", "ợ nóng", "trào ngược dạ dày thực quản", "viêm đại tràng", "bệnh gan", "gan",
                    "gastroenterology", "stomach", "digestive",
                    "胃肠病学", "消化", // Chinese: wèichángbìngxué, xiāohuà
                    "消化器科", "胃", // Japanese: shōkaki-ka, i
                    "gastro-entérologie", "estomac" // French
                }
            },
            {
                "Nội tiết", new List<string> {
                    "tuyến giáp", "hormon", "đái tháo đường", "cường giáp", "suy giáp", "hạ đường huyết", "buồng trứng đa nang",
                    "endocrinology", "diabetes", "hormone",
                    "内分泌科", "糖尿病", // Chinese: nèifēnmìkē, tángniàobìng
                    "内分泌科", "ホルモン", // Japanese: naibunpitsu-ka, horumon
                    "endocrinologie", "diabète" // French
                }
            },
            {
                "Tiết niệu", new List<string> {
                    "tiết niệu", "sỏi thận", "đái dầm", "rối loạn tiểu tiện", "bàng quang", "suy thận",
                    "urology", "kidney", "urinary",
                    "泌尿科", "肾脏", // Chinese: mìniàokē, shènzàng
                    "泌尿器科", "腎臓", // Japanese: hinyōki-ka, jinzō
                    "urologie", "rein", "urinaire" // French
                }
            },
            {
                "Ung thư", new List<string> {
                    "ung thư", "khối u", "mầm bệnh", "di căn", "ung thư vú", "ung thư phổi", "ung thư đại trực tràng",
                    "oncology", "cancer", "tumor",
                    "肿瘤科", "癌症", // Chinese: zhǒngliúkē, áizhèng
                    "腫瘍科", "癌", // Japanese: shuyō-ka, gan
                    "oncologie", "cancer", "tumeur" // French
                }
            },
        };

        // Ánh xạ tên tiếng Việt (đã tìm thấy) sang tên tiếng Anh (Tên DB) - Dùng khi cần bỏ qua bước AI dịch
        // Tuy nhiên, trong luồng hiện tại, chúng ta vẫn dùng AI để dịch nhằm đảm bảo độ chính xác
        private static readonly Dictionary<string, string> VietnameseToEnglishMap = new Dictionary<string, string>
        {
            { "Tim mạch", "Cardiology" },
            { "Da liễu", "Dermatology" },
            { "Nhi khoa", "Pediatrics" },
            { "Nội khoa", "Internal Medicine" },
            { "Chấn thương chỉnh hình", "Orthopedics" },
            { "Thần kinh", "Neurology" },
            { "Tâm thần học", "Psychiatry" },
            { "Mắt", "Ophthalmology" },
            { "Tiêu hóa", "Gastroenterology" },
            { "Nội tiết", "Endocrinology" },
            { "Tiết niệu", "Urology" },
            { "Ung thư", "Oncology" }
        };

        /// <summary>
        /// Phân tích tin nhắn của người dùng và trả về tên chuyên khoa (tiếng Việt) nếu có từ khóa khớp.
        /// </summary>
        /// <param name="message">Tin nhắn của người dùng.</param>
        /// <returns>Tên chuyên khoa tiếng Việt hoặc null nếu không tìm thấy.</returns>
        public static string? GetSpecialty(string message)
        {
            if (string.IsNullOrWhiteSpace(message))
            {
                return null;
            }

            // Chuyển sang chữ thường để so sánh, vì các từ khóa tiếng nước ngoài có thể có chữ hoa
            var lowerMessage = message.ToLowerInvariant();

            foreach (var kvp in SpecialtyKeywords)
            {
                var specialtyVietnamese = kvp.Key;
                var keywords = kvp.Value;

                // Kiểm tra xem tin nhắn có chứa bất kỳ từ khóa nào không
                if (keywords.Any(keyword => lowerMessage.Contains(keyword.ToLowerInvariant())))
                {
                    // Trả về tên tiếng Việt để chuyển qua AI dịch thuật
                    return specialtyVietnamese;
                }
            }

            return null;
        }
    }
}