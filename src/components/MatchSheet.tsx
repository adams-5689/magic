"use client";
interface MatchSheetProps {
  isAdmin: boolean;
}

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../configs/firebase";

interface MatchSheet {
  id: string;
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  date: string;
  score: string;
  events: MatchEvent[];
}

interface MatchEvent {
  type: "goal" | "yellowCard" | "redCard" | "substitution";
  player: string;
  minute: number;
  details?: string;
}

export default function MatchSheetManagement({ isAdmin }: MatchSheetProps) {
  const [matchSheets, setMatchSheets] = useState<MatchSheet[]>([]);
  const [matches, setMatches] = useState<
    { id: string; opponent: string; date: string }[]
  >([]);
  const [selectedMatch, setSelectedMatch] = useState("");
  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [score, setScore] = useState("");
  const [events, setEvents] = useState<MatchEvent[]>([]);

  useEffect(() => {
    fetchMatchSheets();
    fetchMatches();
  }, []);

  const fetchMatchSheets = async () => {
    const querySnapshot = await getDocs(collection(db, "matchSheets"));
    const fetchedMatchSheets: MatchSheet[] = [];
    querySnapshot.forEach((doc) => {
      fetchedMatchSheets.push({ id: doc.id, ...doc.data() } as MatchSheet);
    });
    setMatchSheets(fetchedMatchSheets);
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

  const handleAddEvent = (event: MatchEvent) => {
    setEvents([...events, event]);
  };

  const handleRemoveEvent = (index: number) => {
    setEvents(events.filter((_, i) => i !== index));
  };

  const handleAddMatchSheet = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "matchSheets"), {
      matchId: selectedMatch,
      homeTeam,
      awayTeam,
      date: matches.find((m) => m.id === selectedMatch)?.date,
      score,
      events,
    });
    setSelectedMatch("");
    setHomeTeam("");
    setAwayTeam("");
    setScore("");
    setEvents([]);
    fetchMatchSheets();
  };

  const handleUpdateMatchSheet = async (
    id: string,
    updatedData: Partial<MatchSheet>
  ) => {
    await updateDoc(doc(db, "matchSheets", id), updatedData);
    fetchMatchSheets();
  };

  const handleDeleteMatchSheet = async (id: string) => {
    await deleteDoc(doc(db, "matchSheets", id));
    fetchMatchSheets();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Feuilles de match</h2>
      <form onSubmit={handleAddMatchSheet} className="mb-4">
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
        <input
          type="text"
          placeholder="Équipe à domicile"
          value={homeTeam}
          onChange={(e) => setHomeTeam(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Équipe à l'extérieur"
          value={awayTeam}
          onChange={(e) => setAwayTeam(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Score (ex: 2-1)"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Ajouter la feuille de match
        </button>
      </form>
      <div className="mb-4">
        <h3 className="text-xl font-bold mb-2">Événements du match</h3>
        {events.map((event, index) => (
          <div key={index} className="mb-2">
            {event.type} - {event.player} - {event.minute}'
            {event.details && ` - ${event.details}`}
            <button
              onClick={() => handleRemoveEvent(index)}
              className="ml-2 bg-red-500 text-white p-1 rounded"
            >
              Supprimer
            </button>
          </div>
        ))}
        <button
          onClick={() =>
            handleAddEvent({
              type: "goal",
              player: prompt("Nom du joueur:") || "",
              minute: parseInt(prompt("Minute:") || "0"),
              details: prompt("Détails (optionnel):") || undefined,
            })
          }
          className="mr-2 bg-blue-500 text-white p-2 rounded"
        >
          Ajouter un but
        </button>
        <button
          onClick={() =>
            handleAddEvent({
              type: "yellowCard",
              player: prompt("Nom du joueur:") || "",
              minute: parseInt(prompt("Minute:") || "0"),
            })
          }
          className="mr-2 bg-yellow-500 text-white p-2 rounded"
        >
          Ajouter un carton jaune
        </button>
        <button
          onClick={() =>
            handleAddEvent({
              type: "redCard",
              player: prompt("Nom du joueur:") || "",
              minute: parseInt(prompt("Minute:") || "0"),
            })
          }
          className="mr-2 bg-red-500 text-white p-2 rounded"
        >
          Ajouter un carton rouge
        </button>
        <button
          onClick={() =>
            handleAddEvent({
              type: "substitution",
              player: prompt("Joueur sortant:") || "",
              minute: parseInt(prompt("Minute:") || "0"),
              details: prompt("Joueur entrant:") || "",
            })
          }
          className="bg-purple-500 text-white p-2 rounded"
        >
          Ajouter une substitution
        </button>
      </div>
      <ul>
        {matchSheets.map((sheet) => (
          <li key={sheet.id} className="mb-2">
            {sheet.homeTeam} vs {sheet.awayTeam} - {sheet.date} - Score:{" "}
            {sheet.score}
            <button
              onClick={() =>
                handleUpdateMatchSheet(sheet.id, {
                  score: prompt("Nouveau score:") || sheet.score,
                })
              }
              className="ml-2 bg-yellow-500 text-white p-1 rounded"
            >
              Modifier le score
            </button>
            <button
              onClick={() => handleDeleteMatchSheet(sheet.id)}
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
