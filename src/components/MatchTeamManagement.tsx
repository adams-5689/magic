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

interface MatchTeam {
  id: string;
  matchId: string;
  players: string[];
  formation: string;
}

export default function MatchTeamManagement() {
  const [matchTeams, setMatchTeams] = useState<MatchTeam[]>([]);
  const [matches, setMatches] = useState<
    { id: string; opponent: string; date: string }[]
  >([]);
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
  const [selectedMatch, setSelectedMatch] = useState("");
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [formation, setFormation] = useState("");

  useEffect(() => {
    fetchMatchTeams();
    fetchMatches();
    fetchPlayers();
  }, []);

  const fetchMatchTeams = async () => {
    const querySnapshot = await getDocs(collection(db, "matchTeams"));
    const fetchedMatchTeams: MatchTeam[] = [];
    querySnapshot.forEach((doc) => {
      fetchedMatchTeams.push({ id: doc.id, ...doc.data() } as MatchTeam);
    });
    setMatchTeams(fetchedMatchTeams);
  };

  const fetchMatches = async () => {
    const querySnapshot = await getDocs(collection(db, "matches"));
    const fetchedMatches: { id: string; opponent: string; date: string }[] = [];
    querySnapshot.forEach((doc) => {
      const matchData = doc.data();
      fetchedMatches.push({
        id: doc.id,
        opponent: matchData.opponent,
        date: matchData.date,
      });
    });
    setMatches(fetchedMatches);
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

  const handleAddMatchTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "matchTeams"), {
      matchId: selectedMatch,
      players: selectedPlayers,
      formation,
    });
    setSelectedMatch("");
    setSelectedPlayers([]);
    setFormation("");
    fetchMatchTeams();
  };

  const handleUpdateMatchTeam = async (
    id: string,
    updatedData: Partial<MatchTeam>
  ) => {
    await updateDoc(doc(db, "matchTeams", id), updatedData);
    fetchMatchTeams();
  };

  const handleDeleteMatchTeam = async (id: string) => {
    await deleteDoc(doc(db, "matchTeams", id));
    fetchMatchTeams();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Gestion des équipes pour les matchs
      </h2>
      <form onSubmit={handleAddMatchTeam} className="mb-4">
        <select
          value={selectedMatch}
          onChange={(e) => setSelectedMatch(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        >
          <option value="">Sélectionner un match</option>
          {matches.map((match) => (
            <option key={match.id} value={match.id}>
              {match.opponent} - {match.date}
            </option>
          ))}
        </select>
        <select
          multiple
          value={selectedPlayers}
          onChange={(e) =>
            setSelectedPlayers(
              Array.from(e.target.selectedOptions, (option) => option.value)
            )
          }
          className="mr-2 p-2 border rounded"
          required
        >
          {players.map((player) => (
            <option key={player.id} value={player.id}>
              {player.name}
            </option>
          ))}
        </select>
        <input
          type="text"
          placeholder="Formation (ex: 4-4-2)"
          value={formation}
          onChange={(e) => setFormation(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Ajouter l'équipe du match
        </button>
      </form>
      <ul>
        {matchTeams.map((matchTeam) => (
          <li key={matchTeam.id} className="mb-2">
            Match: {matches.find((m) => m.id === matchTeam.matchId)?.opponent} -
            Joueurs:{" "}
            {matchTeam.players
              .map((p) => players.find((player) => player.id === p)?.name)
              .join(", ")}{" "}
            - Formation: {matchTeam.formation}
            <button
              onClick={() =>
                handleUpdateMatchTeam(matchTeam.id, {
                  formation:
                    prompt("Nouvelle formation:") || matchTeam.formation,
                })
              }
              className="ml-2 bg-yellow-500 text-white p-1 rounded"
            >
              Modifier la formation
            </button>
            <button
              onClick={() => handleDeleteMatchTeam(matchTeam.id)}
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
