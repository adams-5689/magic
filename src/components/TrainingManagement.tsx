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

interface TrainingSession {
  id: string;
  date: string;
  type: string;
  duration: number;
}

export default function TrainingManagement() {
  const [trainingSessions, setTrainingSessions] = useState<TrainingSession[]>(
    []
  );
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [duration, setDuration] = useState("");

  useEffect(() => {
    fetchTrainingSessions();
  }, []);

  const fetchTrainingSessions = async () => {
    const querySnapshot = await getDocs(collection(db, "training"));
    const fetchedSessions: TrainingSession[] = [];
    querySnapshot.forEach((doc) => {
      fetchedSessions.push({ id: doc.id, ...doc.data() } as TrainingSession);
    });
    setTrainingSessions(fetchedSessions);
  };

  const handleAddTrainingSession = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "training"), {
      date,
      type,
      duration: parseInt(duration),
    });
    setDate("");
    setType("");
    setDuration("");
    fetchTrainingSessions();
  };

  const handleUpdateTrainingSession = async (
    id: string,
    updatedData: Partial<TrainingSession>
  ) => {
    await updateDoc(doc(db, "training", id), updatedData);
    fetchTrainingSessions();
  };

  const handleDeleteTrainingSession = async (id: string) => {
    await deleteDoc(doc(db, "training", id));
    fetchTrainingSessions();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des entraînements</h2>
      <form onSubmit={handleAddTrainingSession} className="mb-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Type d'entraînement"
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Durée (minutes)"
          value={duration}
          onChange={(e) => setDuration(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Ajouter une séance d'entraînement
        </button>
      </form>
      <ul>
        {trainingSessions.map((session) => (
          <li key={session.id} className="mb-2">
            {session.date} - {session.type} - {session.duration} minutes
            <button
              onClick={() =>
                handleUpdateTrainingSession(session.id, {
                  duration: parseInt(
                    prompt("Nouvelle durée:") || session.duration.toString()
                  ),
                })
              }
              className="ml-2 bg-yellow-500 text-white p-1 rounded"
            >
              Modifier la durée
            </button>
            <button
              onClick={() => handleDeleteTrainingSession(session.id)}
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
