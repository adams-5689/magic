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

interface Match {
  id: string;
  date: string;
  opponent: string;
  location: string;
  result: string;
  score: string;
  topScorer: string;
  playerCards: { [key: string]: { yellow: number; red: number } };
  playerFouls: { [key: string]: number };
}

interface MatchManagementProps {
  isAdmin: boolean;
}

export default function MatchManagement({ isAdmin }: MatchManagementProps) {
  const [matches, setMatches] = useState<Match[]>([]);
  const [date, setDate] = useState("");
  const [opponent, setOpponent] = useState("");
  const [location, setLocation] = useState("");
  const [result, setResult] = useState("");
  const [score, setScore] = useState("");
  const [topScorer, setTopScorer] = useState("");
  const [playerCards, setPlayerCards] = useState<{
    [key: string]: { yellow: number; red: number };
  }>({});
  const [playerFouls, setPlayerFouls] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = async () => {
    const querySnapshot = await getDocs(collection(db, "matches"));
    const fetchedMatches: Match[] = [];
    querySnapshot.forEach((doc) => {
      fetchedMatches.push({ id: doc.id, ...doc.data() } as Match);
    });
    setMatches(fetchedMatches);
  };

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "matches"), {
      date,
      opponent,
      location,
      result,
      score,
      topScorer,
      playerCards,
      playerFouls,
    });
    setDate("");
    setOpponent("");
    setLocation("");
    setResult("");
    setScore("");
    setTopScorer("");
    setPlayerCards({});
    setPlayerFouls({});
    fetchMatches();
  };

  const handleUpdateMatch = async (id: string, updatedData: Partial<Match>) => {
    await updateDoc(doc(db, "matches", id), updatedData);
    fetchMatches();
  };

  const handleDeleteMatch = async (id: string) => {
    if (isAdmin) {
      await deleteDoc(doc(db, "matches", id));
      fetchMatches();
    } else {
      alert("Seul l'administrateur peut supprimer des matchs.");
    }
  };

  const handleAddPlayerCard = (
    playerName: string,
    cardType: "yellow" | "red"
  ) => {
    setPlayerCards((prev) => ({
      ...prev,
      [playerName]: {
        yellow:
          cardType === "yellow"
            ? (prev[playerName]?.yellow || 0) + 1
            : prev[playerName]?.yellow || 0,
        red:
          cardType === "red"
            ? (prev[playerName]?.red || 0) + 1
            : prev[playerName]?.red || 0,
      },
    }));
  };

  const handleAddPlayerFoul = (playerName: string) => {
    setPlayerFouls((prev) => ({
      ...prev,
      [playerName]: (prev[playerName] || 0) + 1,
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Gestion des matchs</h2>
      <form onSubmit={handleAddMatch} className="space-y-4">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          type="text"
          placeholder="Adversaire"
          value={opponent}
          onChange={(e) => setOpponent(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          type="text"
          placeholder="Lieu"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <select
          value={result}
          onChange={(e) => setResult(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        >
          <option value="">Résultat</option>
          <option value="Victoire">Victoire</option>
          <option value="Défaite">Défaite</option>
          <option value="Match nul">Match nul</option>
        </select>
        <input
          type="text"
          placeholder="Score"
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          type="text"
          placeholder="Meilleur buteur"
          value={topScorer}
          onChange={(e) => setTopScorer(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <div>
          <h3 className="text-lg font-semibold mb-2">
            Cartons et fautes des joueurs
          </h3>
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Nom du joueur"
              id="playerName"
              className="w-full px-3 py-2 border rounded-md"
            />
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() =>
                  handleAddPlayerCard(
                    (document.getElementById("playerName") as HTMLInputElement)
                      .value,
                    "yellow"
                  )
                }
                className="bg-yellow-500 text-white py-1 px-2 rounded-md"
              >
                Carton jaune
              </button>
              <button
                type="button"
                onClick={() =>
                  handleAddPlayerCard(
                    (document.getElementById("playerName") as HTMLInputElement)
                      .value,
                    "red"
                  )
                }
                className="bg-red-500 text-white py-1 px-2 rounded-md"
              >
                Carton rouge
              </button>
              <button
                type="button"
                onClick={() =>
                  handleAddPlayerFoul(
                    (document.getElementById("playerName") as HTMLInputElement)
                      .value
                  )
                }
                className="bg-blue-500 text-white py-1 px-2 rounded-md"
              >
                Faute
              </button>
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition duration-300"
        >
          Ajouter un match
        </button>
      </form>
      <ul className="space-y-4">
        {matches.map((match) => (
          <li key={match.id} className="bg-white p-4 rounded-md shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">
                  {match.date} - {match.opponent}
                </h3>
                <p className="text-gray-600">Lieu: {match.location}</p>
                <p className="text-gray-600">
                  Résultat: {match.result} ({match.score})
                </p>
                <p className="text-gray-600">
                  Meilleur buteur: {match.topScorer}
                </p>
                <div>
                  <h4 className="font-semibold">Cartons:</h4>
                  {Object.entries(match.playerCards).map(([player, cards]) => (
                    <p key={player}>
                      {player}: {cards.yellow} jaunes, {cards.red} rouges
                    </p>
                  ))}
                </div>
                <div>
                  <h4 className="font-semibold">Fautes:</h4>
                  {Object.entries(match.playerFouls).map(([player, fouls]) => (
                    <p key={player}>
                      {player}: {fouls} fautes
                    </p>
                  ))}
                </div>
              </div>
              <div className="space-x-2">
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteMatch(match.id)}
                    className="bg-red-500 text-white py-1 px-2 rounded-md hover:bg-red-600 transition duration-300"
                  >
                    Supprimer
                  </button>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
