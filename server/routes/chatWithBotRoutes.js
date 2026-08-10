import express from 'express'
import multer from 'multer'
import startChat from '../controllers/uploadController.js';
import upload from '../middleware/multer.js';
import { protect } from '../middleware/authMiddleware.js';
import getPastChatList, { getChatById, sendMessage } from '../controllers/chatDataController.js';

const router = express.Router();

// router.post('/startChat', upload.single('resume'), startChat);
router.post('/startChat', protect, upload.single('resume'), startChat);
router.post('/pastchatlist', protect, getPastChatList);
router.get('/:id', protect, getChatById);
router.post('/:id/message', protect, sendMessage);

export default router;