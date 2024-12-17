"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";
import { db } from "../config/firebase";

interface Notification {
  id: string;
  message: string;
  timestamp: any;
  read: boolean;
}

export default function Notifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const q = query(
      collection(db, "notifications"),
      orderBy("timestamp", "desc"),
      limit(20)
    );
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedNotifications: Notification[] = [];
      querySnapshot.forEach((doc) => {
        fetchedNotifications.push({
          id: doc.id,
          ...doc.data(),
        } as Notification);
      });
      setNotifications(fetchedNotifications);
    });

    return () => unsubscribe();
  }, []);

  const markAsRead = async (id: string) => {
    const notificationRef = doc(db, "notifications", id);
    await updateDoc(notificationRef, { read: true });
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Notifications</h2>
      <ul className="space-y-2">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className={`p-2 rounded ${
              notification.read ? "bg-gray-100" : "bg-blue-100"
            }`}
            onClick={() => markAsRead(notification.id)}
          >
            <p>{notification.message}</p>
            <small>
              {new Date(notification.timestamp.toDate()).toLocaleString()}
            </small>
          </li>
        ))}
      </ul>
    </div>
  );
}
