import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

const POS_MAP: Record<string, string> = {
  "noun": "Danh từ",
  "verb": "Động từ",
  "adjective": "Tính từ",
  "adverb": "Trạng từ",
  "pronoun": "Đại từ",
  "preposition": "Giới từ",
  "conjunction": "Liên từ",
  "interjection": "Thán từ",
  "abbreviation": "Viết tắt",
  "phrase": "Cụm từ",
  "prefix": "Tiền tố",
  "suffix": "Hậu tố"
};

export async function translateText(text: string): Promise<string> {
  try {
    // dt=t (translation), dt=bd (dictionary/part of speech)
    const googleTranslateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&q=${encodeURIComponent(text)}`;
    const res = await fetch(googleTranslateUrl);
    const data = await res.json();
    
    // Lấy câu dịch chính
    const translation = data[0].map((item: any) => item[0]).join("");
    
    // Lấy chi tiết từ loại nếu có
    let dictResult = "";
    if (data[1] && data[1].length > 0) {
      dictResult = data[1].map((posGroup: any) => {
        const pos = posGroup[0] ? posGroup[0].toLowerCase() : "";
        const translatedPos = POS_MAP[pos] || posGroup[0]; // Dịch sang tiếng Việt
        const words = posGroup[1].slice(0, 5).join(", "); // Lấy top 5 nghĩa
        return `- [${translatedPos}] ${words}`;
      }).join("\n");
    }

    if (dictResult) {
      return `🎯 Nghĩa chính: ${translation}\n\n📚 Chi tiết các loại từ:\n${dictResult}`;
    }
    
    return translation;
  } catch (error) {
    console.error("Translation Error:", error);
    return "Đã xảy ra lỗi khi dịch. Vui lòng thử lại sau.";
  }
}

export async function generateExample(text: string): Promise<string> {
  try {
    const prompt = `Phân tích từ/cụm từ tiếng Anh "${text}":
1. Viết 1 câu ví dụ tiếng Anh thực tế và dịch câu đó sang tiếng Việt.
2. Liệt kê các dạng từ loại (Word Family) của nó nếu có.
Trả về đúng định dạng sau, không dài dòng:
Ví dụ: [câu tiếng Anh]
Dịch: [nghĩa tiếng Việt]
Word Family: [các dạng từ (nếu có)]`;
    
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini Example Error:", error);
    return "Đã xảy ra lỗi khi tạo ví dụ và từ loại.";
  }
}

export async function extractTextFromImage(base64Image: string): Promise<string> {
  try {
    const prompt = "Hãy trích xuất chính xác văn bản (tiếng Anh) trong hình ảnh này. Chỉ trả về văn bản được trích xuất, không thêm bất kỳ bình luận nào.";
    const imageParts = [
      {
        inlineData: {
          data: base64Image.split(",")[1],
          mimeType: "image/jpeg"
        }
      }
    ];
    
    const result = await model.generateContent([prompt, ...imageParts]);
    return result.response.text().trim();
  } catch (error) {
    console.error("Gemini OCR Error:", error);
    return "";
  }
}
