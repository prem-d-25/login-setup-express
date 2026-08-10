import ResumeScan from "../models/chat.js";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime.js";
import { resumeQAPromp, groq } from "../config/promp.js";

dayjs.extend(relativeTime);

const formatChats = (chats) => {
    return chats.map((chat) => {
        const obj = chat.toObject();

        delete obj.createdAt;

        return {
            ...obj,
            timeAgo: dayjs(chat.createdAt).fromNow(),
        };
    });
};

const getPastChatList = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access. User not authenticated."
            });
        }

        const data = await ResumeScan.find({ userId: req.user._id })
            .select("title createdAt score _id")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success: true,
            message: data.length
                ? "Past chats retrieved successfully."
                : "No past chats found for this user.",
            data: formatChats(data),
        });

    } catch (error) {
        console.error("Error fetching past chat list:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching chats.",
            error: error.message,
        });
    }
};
export const getChatById = async (req, res) => {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access."
            });
        }

        const chatId = req.params.id;
        const chat = await ResumeScan.findOne({ _id: chatId, userId: req.user._id });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found or access denied."
            });
        }

        return res.status(200).json({
            success: true,
            data: chat
        });

    } catch (error) {
        console.error("Error fetching chat by ID:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching chat.",
            error: error.message
        });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { message } = req.body;

        if (!message) {
            return res.status(400).json({
                success: false,
                message: "Message is required."
            });
        }

        const chatId = req.params.id;

        // Fetch chat using ID and verify user ownership
        const chatData = await ResumeScan.find(
            { _id: chatId, userId: req.user._id },
            {
                text: 1,
                score: 1,
                improvements: 1,
                context: 1,
                highlights: 1,
                chat: { $slice: -5 }
            }
        );

        if (!chatData) {
            return res.status(404).json({
                success: false,
                message: "Chat not found or access denied."
            });
        }
        delete chatData[0]._id;
        const aiResp = await qaLLmCall(message, chatData[0]);

        let responseText = aiResp.ans;
        let responseType = aiResp.ansType;

        if (aiResp.isResumeQuestion === false) {
            responseText = "Only ask question related to resume";
            responseType = "string";
        }

        // Push the user's message and AI's response to chat history
        const userMsg = { role: 'user', content: message };
        const aiMsg = {
            role: 'assistant',
            content: typeof responseText === 'string' ? responseText : JSON.stringify(responseText)
        };

        await ResumeScan.updateOne(
            { _id: chatId, userId: req.user._id },
            { $push: { chat: { $each: [userMsg, aiMsg] } } }
        );

        return res.status(200).json({
            success: true,
            data: {
                question: message,
                response: responseText,
                type: responseType
            }
        });
    } catch (error) {
        console.error("Error sending message:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to process message."
        });
    }
};

const qaLLmCall = async (question, context) => {

    if (!question || !context) return 0;

    try {
        const chatCompletion = await groq.chat.completions.create({
            model: "openai/gpt-oss-20b",
            messages: [
                { role: "system", content: resumeQAPromp },
                {
                    role: "user",
                    content: `Here is the context about the resume:\n\n${JSON.stringify(context)}\n\nThis is the question user is asking about their resume, the question is \n\n : ${question}`,
                },
            ],
            response_format: { type: "json_object" },
            temperature: 0.3,
        });

        let content = chatCompletion.choices[0].message.content;
        content = content.replace(/```json/gi, "").replace(/```/g, "").trim();

        const jsonResponse = JSON.parse(content);
        console.log(jsonResponse)
        return jsonResponse;
    } catch (error) {
        console.error("Error during AI api call:", error);
        return 0;
    }
}


export default getPastChatList;