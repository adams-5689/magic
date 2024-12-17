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

interface Performance {
  id: string;
  playerId: string;
  playerName: string;
  date: string;
  goals: number;
  assists: number;
  minutesPlayed: number;
}

export default function PerformanceTracking() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [date, setDate] = useState("");
  const [goals, setGoals] = useState("");
  const [assists, setAssists] = useState("");
  const [minutesPlayed, setMinutesPlayed] = useState("");

  useEffect(() => {
    fetchPerformances();
    fetchPlayers();
  }, []);

  const fetchPerformances = async () => {
    const querySnapshot = await getDocs(collection(db, "performances"));
    const fetchedPerformances: Performance[] = [];
    querySnapshot.forEach((doc) => {
      fetchedPerformances.push({ id: doc.id, ...doc.data() } as Performance);
    });
    setPerformances(fetchedPerformances);
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

  const handleAddPerformance = async (e: React.FormEvent) => {
    e.preventDefault();
    const playerName = players.find((p) => p.id === selectedPlayer)?.name || "";
    await addDoc(collection(db, "performances"), {
      playerId: selectedPlayer,
      playerName,
      date,
      goals: parseInt(goals),
      assists: parseInt(assists),
      minutesPlayed: parseInt(minutesPlayed),
    });
    setSelectedPlayer("");
    setDate("");
    setGoals("");
    setAssists("");
    setMinutesPlayed("");
    fetchPerformances();
  };

  const handleUpdatePerformance = async (
    id: string,
    updatedData: Partial<Performance>
  ) => {
    await updateDoc(doc(db, "performances", id), updatedData);
    fetchPerformances();
  };

  const handleDeletePerformance = async (id: string) => {
    await deleteDoc(doc(db, "performances", id));
    fetchPerformances();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Suivi des performances</h2>
      <form onSubmit={handleAddPerformance} className="mb-4">
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
        <input
          type="number"
          placeholder="Buts"
          value={goals}
          onChange={(e) => setGoals(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Passes décisives"
          value={assists}
          onChange={(e) => setAssists(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Minutes jouées"
          value={minutesPlayed}
          onChange={(e) => setMinutesPlayed(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Ajouter une performance
        </button>
      </form>
      <ul>
        {performances.map((performance) => (
          <li key={performance.id} className="mb-2">
            {performance.date} - {performance.playerName} - Buts:{" "}
            {performance.goals}, Passes: {performance.assists}, Minutes:{" "}
            {performance.minutesPlayed}
            <button
              onClick={() =>
                handleUpdatePerformance(performance.id, {
                  goals: parseInt(
                    prompt("Nouveau nombre de buts:") ||
                      performance.goals.toString()
                  ),
                })
              }
              className="ml-2 bg-yellow-500 text-white p-1 rounded"
            >
              Modifier les buts
            </button>
            <button
              onClick={() => handleDeletePerformance(performance.id)}
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
