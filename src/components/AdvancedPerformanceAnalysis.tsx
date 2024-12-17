"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
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
  passAccuracy: number;
  shotsOnTarget: number;
  tackles: number;
}

export default function AdvancedPerformanceAnalysis() {
  const [performances, setPerformances] = useState<Performance[]>([]);
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");

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

  const getPlayerPerformances = () => {
    return performances
      .filter((p) => p.playerId === selectedPlayer)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };

  const getChartData = () => {
    const playerPerformances = getPlayerPerformances();
    return {
      labels: playerPerformances.map((p) => p.date),
      datasets: [
        {
          label: "Buts",
          data: playerPerformances.map((p) => p.goals),
          borderColor: "rgb(255, 99, 132)",
          backgroundColor: "rgba(255, 99, 132, 0.5)",
        },
        {
          label: "Passes décisives",
          data: playerPerformances.map((p) => p.assists),
          borderColor: "rgb(53, 162, 235)",
          backgroundColor: "rgba(53, 162, 235, 0.5)",
        },
        {
          label: "Précision des passes (%)",
          data: playerPerformances.map((p) => p.passAccuracy),
          borderColor: "rgb(75, 192, 192)",
          backgroundColor: "rgba(75, 192, 192, 0.5)",
        },
      ],
    };
  };

  const getBarChartData = () => {
    const playerPerformances = getPlayerPerformances();
    return {
      labels: playerPerformances.map((p) => p.date),
      datasets: [
        {
          label: "Tirs cadrés",
          data: playerPerformances.map((p) => p.shotsOnTarget),
          backgroundColor: "rgba(255, 206, 86, 0.5)",
        },
        {
          label: "Tacles",
          data: playerPerformances.map((p) => p.tackles),
          backgroundColor: "rgba(153, 102, 255, 0.5)",
        },
      ],
    };
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Analyse avancée des performances
      </h2>
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
        <div>
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-2">
              Évolution des performances
            </h3>
            <div className="w-full h-96">
              <Line
                data={getChartData()}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
          <div className="mb-8">
            <h3 className="text-xl font-bold mb-2">
              Statistiques défensives et offensives
            </h3>
            <div className="w-full h-96">
              <Bar
                data={getBarChartData()}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Résumé des performances</h3>
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-300 p-2">Date</th>
                  <th className="border border-gray-300 p-2">Minutes jouées</th>
                  <th className="border border-gray-300 p-2">Buts</th>
                  <th className="border border-gray-300 p-2">
                    Passes décisives
                  </th>
                  <th className="border border-gray-300 p-2">
                    Précision des passes
                  </th>
                  <th className="border border-gray-300 p-2">Tirs cadrés</th>
                  <th className="border border-gray-300 p-2">Tacles</th>
                </tr>
              </thead>
              <tbody>
                {getPlayerPerformances().map((performance) => (
                  <tr key={performance.id}>
                    <td className="border border-gray-300 p-2">
                      {performance.date}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {performance.minutesPlayed}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {performance.goals}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {performance.assists}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {performance.passAccuracy}%
                    </td>
                    <td className="border border-gray-300 p-2">
                      {performance.shotsOnTarget}
                    </td>
                    <td className="border border-gray-300 p-2">
                      {performance.tackles}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
