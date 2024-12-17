"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";

interface SocialMediaPost {
  id: string;
  platform: "twitter" | "facebook" | "instagram";
  content: string;
  date: string;
  status: "draft" | "scheduled" | "published";
}

export default function SocialMediaIntegration() {
  const [posts, setPosts] = useState<SocialMediaPost[]>([]);
  const [platform, setPlatform] = useState<
    "twitter" | "facebook" | "instagram"
  >("twitter");
  const [content, setContent] = useState("");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState<"draft" | "scheduled" | "published">(
    "draft"
  );

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    const querySnapshot = await getDocs(collection(db, "socialMediaPosts"));
    const fetchedPosts: SocialMediaPost[] = [];
    querySnapshot.forEach((doc) => {
      fetchedPosts.push({ id: doc.id, ...doc.data() } as SocialMediaPost);
    });
    setPosts(fetchedPosts);
  };

  const handleAddPost = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "socialMediaPosts"), {
      platform,
      content,
      date,
      status,
    });
    setPlatform("twitter");
    setContent("");
    setDate("");
    setStatus("draft");
    fetchPosts();
  };

  const handleUpdatePost = async (
    id: string,
    updatedData: Partial<SocialMediaPost>
  ) => {
    await updateDoc(doc(db, "socialMediaPosts", id), updatedData);
    fetchPosts();
  };

  const handleDeletePost = async (id: string) => {
    await deleteDoc(doc(db, "socialMediaPosts", id));
    fetchPosts();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Intégration des médias sociaux
      </h2>
      <form onSubmit={handleAddPost} className="mb-4">
        <select
          value={platform}
          onChange={(e) =>
            setPlatform(e.target.value as "twitter" | "facebook" | "instagram")
          }
          className="mr-2 p-2 border rounded"
          required
        >
          <option value="twitter">Twitter</option>
          <option value="facebook">Facebook</option>
          <option value="instagram">Instagram</option>
        </select>
        <textarea
          placeholder="Contenu du post"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mr-2 p-2 border rounded w-full"
          required
        />
        <input
          type="datetime-local"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <select
          value={status}
          onChange={(e) =>
            setStatus(e.target.value as "draft" | "scheduled" | "published")
          }
          className="mr-2 p-2 border rounded"
          required
        >
          <option value="draft">Brouillon</option>
          <option value="scheduled">Programmé</option>
          <option value="published">Publié</option>
        </select>
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Ajouter un post
        </button>
      </form>
      <ul>
        {posts.map((post) => (
          <li key={post.id} className="mb-2 p-2 border rounded">
            <p>
              <strong>Plateforme:</strong> {post.platform}
            </p>
            <p>
              <strong>Contenu:</strong> {post.content}
            </p>
            <p>
              <strong>Date:</strong> {post.date}
            </p>
            <p>
              <strong>Statut:</strong> {post.status}
            </p>
            <button
              onClick={() =>
                handleUpdatePost(post.id, {
                  status: post.status === "draft" ? "scheduled" : "published",
                })
              }
              className="mr-2 bg-yellow-500 text-white p-1 rounded"
            >
              Changer le statut
            </button>
            <button
              onClick={() => handleDeletePost(post.id)}
              className="bg-red-500 text-white p-1 rounded"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
