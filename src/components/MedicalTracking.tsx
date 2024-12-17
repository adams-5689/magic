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

interface MedicalRecord {
  id: string;
  playerId: string;
  playerName: string;
  date: string;
  type: "injury" | "treatment" | "checkup";
  description: string;
  status: "ongoing" | "resolved";
}

export default function MedicalTracking() {
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<"injury" | "treatment" | "checkup">(
    "injury"
  );
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"ongoing" | "resolved">("ongoing");

  useEffect(() => {
    fetchMedicalRecords();
    fetchPlayers();
  }, []);

  const fetchMedicalRecords = async () => {
    const querySnapshot = await getDocs(collection(db, "medicalRecords"));
    const fetchedRecords: MedicalRecord[] = [];
    querySnapshot.forEach((doc) => {
      fetchedRecords.push({ id: doc.id, ...doc.data() } as MedicalRecord);
    });
    setMedicalRecords(fetchedRecords);
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

  const handleAddMedicalRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    const playerName = players.find((p) => p.id === selectedPlayer)?.name || "";
    await addDoc(collection(db, "medicalRecords"), {
      playerId: selectedPlayer,
      playerName,
      date,
      type,
      description,
      status,
    });
    setSelectedPlayer("");
    setDate("");
    setType("injury");
    setDescription("");
    setStatus("ongoing");
    fetchMedicalRecords();
  };

  const handleUpdateMedicalRecord = async (
    id: string,
    updatedData: Partial<MedicalRecord>
  ) => {
    await updateDoc(doc(db, "medicalRecords", id), updatedData);
    fetchMedicalRecords();
  };

  const handleDeleteMedicalRecord = async (id: string) => {
    await deleteDoc(doc(db, "medicalRecords", id));
    fetchMedicalRecords();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Suivi médical</h2>
      <form onSubmit={handleAddMedicalRecord} className="mb-4">
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
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value as "injury" | "treatment" | "checkup")
          }
          className="mr-2 p-2 border rounded"
          required
        >
          <option value="injury">Blessure</option>
          <option value="treatment">Traitement</option>
          <option value="checkup">Contrôle</option>
        </select>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as "ongoing" | "resolved")}
          className="mr-2 p-2 border rounded"
          required
        >
          <option value="ongoing">En cours</option>
          <option value="resolved">Résolu</option>
        </select>
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Ajouter un dossier médical
        </button>
      </form>
      <ul>
        {medicalRecords.map((record) => (
          <li key={record.id} className="mb-2">
            {record.playerName} - {record.date} - {record.type} -{" "}
            {record.description} - {record.status}
            <button
              onClick={() =>
                handleUpdateMedicalRecord(record.id, {
                  status: record.status === "ongoing" ? "resolved" : "ongoing",
                })
              }
              className="ml-2 bg-yellow-500 text-white p-1 rounded"
            >
              Changer le statut
            </button>
            <button
              onClick={() => handleDeleteMedicalRecord(record.id)}
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
