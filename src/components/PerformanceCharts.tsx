"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface Performance {
  id: string;
  playerId: string;
  playerName: string;
  date: string;
  goals: number;
  assists: number;
  minutesPlayed: number;
}

export default function PerformanceCharts() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);

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

  const getChartData = () => {
    const playerPerformances = performances.filter(
      (p) => p.playerId === selectedPlayer
    );
    const sortedPerformances = playerPerformances.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    return {
      labels: sortedPerformances.map((p) => p.date),
      datasets: [
        {
          label: "Buts",
          data: sortedPerformances.map((p) => p.goals),
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
        {
          label: "Passes décisives",
          data: sortedPerformances.map((p) => p.assists),
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
        },
      ],
    };
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Graphiques de performance</h2>
      <select
        value={selectedPlayer}
        onChange={(e) => setSelectedPlayer(e.target.value)}
        className="mb-4 p-2 border rounded"
      >
        <option value="">Sélectionner un joueur</option>
        {players.map((player) => (
          <option key={player.id} value={player.id}>
            {player.name}
          </option>
        ))}
      </select>
      {selectedPlayer && (
        <div className="w-full h-96">
          <Line
            data={getChartData()}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      )}
    </div>
  );
}
