"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, auth } from "../config/firebase";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: any;
}

export default function InternalMessaging() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    const q = query(
      collection(db, "messages"),
      orderBy("timestamp", "desc"),
      limit(50)
    );
    const querySnapshot = await getDocs(q);
    const fetchedMessages: Message[] = [];
    querySnapshot.forEach((doc) => {
      fetchedMessages.push({ id: doc.id, ...doc.data() } as Message);
    });
    setMessages(fetchedMessages.reverse());
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !auth.currentUser) return;

    await addDoc(collection(db, "messages"), {
      senderId: auth.currentUser.uid,
      senderName: auth.currentUser.displayName || "Utilisateur anonyme",
      content: newMessage,
      timestamp: new Date(),
    });

    setNewMessage("");
    fetchMessages();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Messagerie interne</h2>
      <div className="bg-white shadow-md rounded p-4 mb-4 h-64 overflow-y-auto">
        {messages.map((message) => (
          <div key={message.id} className="mb-2">
            <span className="font-bold">{message.senderName}: </span>
            <span>{message.content}</span>
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className="flex">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="flex-grow mr-2 p-2 border rounded"
          placeholder="Tapez votre message..."
          required
        />
        <button type="submit" className="bg-blue-500 text-white p-2 rounded">
          Envoyer
        </button>
      </form>
    </div>
  );
}
