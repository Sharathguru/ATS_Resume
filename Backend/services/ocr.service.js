import Tesseract from "tesseract.js";

class OCRService {
  async extractText(filePath) {
    const result = await Tesseract.recognize(filePath, "eng", {
      logger: (m) => console.log(m),
    });
    return result.data.text;
  }
}

export default new OCRService();
