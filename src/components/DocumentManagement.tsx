"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { db, storage } from "../config/firebase";

interface Document {
  id: string;
  playerId: string;
  playerName: string;
  fileName: string;
  fileUrl: string;
  uploadDate: string;
}

export default function DocumentManagement() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchDocuments();
    fetchPlayers();
  }, []);

  const fetchDocuments = async () => {
    const querySnapshot = await getDocs(collection(db, "documents"));
    const fetchedDocuments: Document[] = [];
    querySnapshot.forEach((doc) => {
      fetchedDocuments.push({ id: doc.id, ...doc.data() } as Document);
    });
    setDocuments(fetchedDocuments);
  };

  const fetchPlayers = async () => {
    const querySnapshot = await getDocs(collection(db, "players"));
    const fetchedPlayers: { id: string; name: string }[] = [];
    querySnapshot.forEach((doc) => {
      const playerData = doc.data();
      fetchedPlayers.push({ id: doc.id, name: playerData.name });
    });
    setPlayers(fetchedPlayers);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !selectedPlayer) return;

    const playerName = players.find((p) => p.id === selectedPlayer)?.name || "";
    const storageRef = ref(storage, `documents/${selectedPlayer}/${file.name}`);

    try {
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await addDoc(collection(db, "documents"), {
        playerId: selectedPlayer,
        playerName,
        fileName: file.name,
        fileUrl: downloadURL,
        uploadDate: new Date().toISOString(),
      });

      setSelectedPlayer("");
      setFile(null);
      fetchDocuments();
    } catch (error) {
      console.error("Error uploading file: ", error);
    }
  };

  const handleDeleteDocument = async (document: Document) => {
    try {
      await deleteDoc(doc(db, "documents", document.id));
      const storageRef = ref(
        storage,
        `documents/${document.playerId}/${document.fileName}`
      );
      await deleteObject(storageRef);
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document: ", error);
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Gestion des documents</h2>
      <form onSubmit={handleUpload} className="mb-4">
        <select
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        >
          <option value="">Sélectionner un joueur</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name}
            </option>
          ))}
        </select>
        <input
          type="file"
          onChange={handleFileChange}
          className="mr-2 p-2 border rounded"
          required
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Télécharger le document
        </button>
      </form>
      <ul>
        {documents.map((document) => (
          <li key={document.id} className="mb-2">
            {document.playerName} - {document.fileName} (Téléchargé le{" "}
            {new Date(document.uploadDate).toLocaleDateString()})
            <a
              href={document.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-2 text-blue-500"
            >
              Voir
            </a>
            <button
              onClick={() => handleDeleteDocument(document)}
              className="ml-2 bg-red-500 text-white p-1 rounded"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
