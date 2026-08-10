import { PDFParse } from "pdf-parse";
import { bucket } from "../config/firebase.js";
import { groq, resumeMainProp } from "../config/promp.js";
import ResumeScan from "../models/chat.js";

const startChat = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No PDF file found" });
    }
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Only PDF files are allowed" });
    }

    let pdfText = "";
    try {
      const pdfData = new PDFParse({ data: req.file.buffer });
      const result = await pdfData.getText();
      pdfText = result.text;
    } catch (error) {
      console.error("Failed to parse PDF:", error);
      return res
        .status(500)
        .json({ error: "Could not extract text from the PDF." });
    }

    const response = await resumeReviewFirst(pdfText);

    if (!response || response === 0) {
      return res.status(500).json({ error: "AI processing failed." });
    }

    if (response.isResume === false) {
      return res.status(400).json({
        error: response.errorCode || "wrong_resume_error",
        message: "The uploaded document does not 'appear to be a valid resume.",
      });
    }

    const safeOriginalName = req.file.originalname.replace(/\s+/g, "_");
    const fileName = `uploads/${Date.now()}_${safeOriginalName}`;
    const file = bucket.file(fileName);

    let publicUrl = "";
    try {
      publicUrl = await new Promise((resolve, reject) => {
        const stream = file.createWriteStream({
          metadata: { contentType: req.file.mimetype },
        });

        stream.on("error", (error) => {
          console.error(`Firebase Storage error:`, error);
          reject(new Error("Failed to upload file to Firebase"));
        });

        stream.on("finish", async () => {
          try {
            await file.makePublic();
            const url = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
            resolve(url);
          } catch (err) {
            reject(err);
          }
        });

        stream.end(req.file.buffer);
      });
    } catch (firebaseError) {
      console.error("Firebase upload failed:", firebaseError);
      return res.status(500).json({ error: "Failed to upload file to cloud storage." });
    }

    const newScan = await ResumeScan.create({
      userId: req.user._id,
      resumeUrl: publicUrl,
      context: response.context || "No context provided.",
      score: response.score || 0,
      highlights: response.highlights || [],
      improvements: response.improvements || [],
      title: response.title || "Untitled Resume Scan",
      role: response.role || "Unknown Role",
      text: pdfText
    });

    return res.status(200).json({
      message: "Successfully analyzed resume",
      id: newScan._id,
      resumeUrl: publicUrl,
      score: newScan.score,
      context: newScan.context,
      highlights: newScan.highlights,
      improvements: newScan.improvements,
      title: newScan.title,
      role: newScan.role,
    });
  } catch (error) {
    console.error("Server Error in startChat:", error);
    return res
      .status(500)
      .json({ error: error.message || "Internal server error" });
  }
};

const resumeReviewFirst = async (resumeText) => {
  if (!resumeText) return 0;

  try {
    const chatCompletion = await groq.chat.completions.create({
      model: "openai/gpt-oss-20b",
      messages: [
        { role: "system", content: resumeMainProp },
        {
          role: "user",
          content: `Here is the extracted resume text to review:\n\n${resumeText}`,
        },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    let content = chatCompletion.choices[0].message.content;
    content = content.replace(/```json/gi, "").replace(/```/g, "").trim();

    const jsonResponse = JSON.parse(content);
    return jsonResponse;
  } catch (error) {
    console.error("Error during AI resume review:", error);
    return 0;
  }
};

export default startChat;