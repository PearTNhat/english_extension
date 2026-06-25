import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || "";

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-flash-lite-latest" });

const POS_MAP: Record<string, string> = {
  "noun": "Noun",
  "verb": "Verb",
  "adjective": "Adjective",
  "adverb": "Adverb",
  "pronoun": "Pronoun",
  "preposition": "Preposition",
  "conjunction": "Conjunction",
  "interjection": "Interjection",
  "abbreviation": "Abbreviation",
  "phrase": "Phrase",
  "prefix": "Prefix",
  "suffix": "Suffix"
};

export async function translateText(text: string): Promise<{text: string, pos: string}> {
  try {
    // dt=t (translation), dt=bd (dictionary/part of speech)
    const googleTranslateUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=vi&dt=t&dt=bd&q=${encodeURIComponent(text)}`;
    const res = await fetch(googleTranslateUrl);
    const data = await res.json();
    
    // Lấy câu dịch chính
    const translation = data[0].map((item: any) => item[0]).join("");
    
    // Lấy chi tiết từ loại nếu có
    let dictResult = "";
    let primaryPos = "";
    if (data[1] && data[1].length > 0) {
      const firstPos = data[1][0][0] ? data[1][0][0].toLowerCase() : "";
      primaryPos = POS_MAP[firstPos] || data[1][0][0] || "";
      
      dictResult = data[1].map((posGroup: any) => {
        const pos = posGroup[0] ? posGroup[0].toLowerCase() : "";
        const translatedPos = POS_MAP[pos] || posGroup[0]; // Dịch sang tiếng Việt
        const words = posGroup[1].slice(0, 5).join(", "); // Lấy top 5 nghĩa
        return `- [${translatedPos}] ${words}`;
      }).join("\n");
    }

    let resultText = translation;
    if (dictResult) {
      resultText = `🎯 Nghĩa chính: ${translation}\n\n📚 Chi tiết các loại từ:\n${dictResult}`;
    }
    
    return { text: resultText, pos: primaryPos };
  } catch (error) {
    console.error("Translation Error:", error);
    return { text: "Đã xảy ra lỗi khi dịch. Vui lòng thử lại sau.", pos: "" };
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

export interface QuizItem {
  wordId: string;
  options: string[];
}

export async function generateQuizBatch(words: {id: string, word: string, meaning: string}[]): Promise<QuizItem[]> {
  try {
    const wordData = words.map(w => ({ id: w.id, word: w.word, meaning: w.meaning }));
    
    const prompt = `Bạn đang tạo các bài trắc nghiệm từ vựng tiếng Anh.
Dưới đây là danh sách các từ vựng và nghĩa đúng của chúng (định dạng JSON):
${JSON.stringify(wordData, null, 2)}

Nhiệm vụ: Với MỖI từ vựng, tạo ra 3 nghĩa tiếng Việt SAI nhưng có vẻ hợp lý để làm đáp án gây nhiễu. Sau đó trộn chung với nghĩa đúng để ra 4 đáp án.
Yêu cầu CỰC KỲ QUAN TRỌNG: Trả về kết quả CHỈ là một mảng JSON (Array) có cấu trúc chính xác như sau:
[
  {
    "id": "id của từ vựng",
    "options": ["nghĩa sai 1", "nghĩa đúng", "nghĩa sai 2", "nghĩa sai 3"]
  }
]
Không giải thích, không thêm chữ nào ngoài JSON hợp lệ. Các options phải được xáo trộn ngẫu nhiên.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    const jsonStr = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(jsonStr);
    
    if (Array.isArray(parsed)) {
      return parsed.map((p: any) => ({
        wordId: p.id,
        options: Array.isArray(p.options) && p.options.length === 4 
          ? p.options 
          : [
              words.find(w => w.id === p.id)?.meaning || "Đúng", 
              "Sai 1", "Sai 2", "Sai 3"
            ].sort(() => Math.random() - 0.5)
      }));
    }
    throw new Error("Invalid format");
  } catch (error) {
    console.error("Gemini Quiz Batch Error:", error);
    // Fallback: tự sinh ngẫu nhiên
    return words.map(w => ({
      wordId: w.id,
      options: [
        w.meaning,
        "Một loại trái cây",
        "Hành động chạy nhảy",
        "Đồ vật trong nhà"
      ].sort(() => Math.random() - 0.5)
    }));
  }
}
