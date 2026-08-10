import api from "./axios";

export const pastChatList = (data) =>
  api.post("/chat/pastchatlist", data)
    .then((res) => res.data);

export const uploadResumeAndStartChat = (formData) =>
  api.post("/chat/startChat", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  })
    .then((res) => res.data);

export const getChatDetails = (id) =>
  api.get(`/chat/${id}`)
    .then((res) => res.data);

export const sendMessageApi = (id, data) =>
  api.post(`/chat/${id}/message`, data)
    .then((res) => res.data);