"use client";
interface ReportsProps {
  isAdmin: boolean;
}

import { useState } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../configs/firebase";

export default function Reports({ isAdmin }: ReportsProps) {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [report, setReport] = useState<string | null>(null);

  const generateReport = async () => {
    if (!startDate || !endDate) {
      alert("Veuillez sélectionner une période");
      return;
    }

    const matchesQuery = query(
      collection(db, "matches"),
      where("date", ">=", startDate),
      where("date", "<=", endDate)
    );
    const matchesSnapshot = await getDocs(matchesQuery);

    const performancesQuery = query(
      collection(db, "performances"),
      where("date", ">=", startDate),
      where("date", "<=", endDate)
    );
    const performancesSnapshot = await getDocs(performancesQuery);

    let totalMatches = 0;
    let wins = 0;
    let draws = 0;
    let losses = 0;
    let goalsScored = 0;
    let goalsConceded = 0;

    matchesSnapshot.forEach((doc) => {
      const match = doc.data();
      totalMatches++;
      if (match.result === "Victoire") wins++;
      else if (match.result === "Match nul") draws++;
      else losses++;

      const [ourGoals, theirGoals] = match.score.split("-").map(Number);
      goalsScored += ourGoals;
      goalsConceded += theirGoals;
    });

    const playerPerformances: {
      [key: string]: { goals: number; assists: number };
    } = {};
    performancesSnapshot.forEach((doc) => {
      const performance = doc.data();
      if (!playerPerformances[performance.playerName]) {
        playerPerformances[performance.playerName] = { goals: 0, assists: 0 };
      }
      playerPerformances[performance.playerName].goals += performance.goals;
      playerPerformances[performance.playerName].assists += performance.assists;
    });

    const reportText = `
Rapport du ${startDate} au ${endDate}

Résumé des matchs:
Total des matchs: ${totalMatches}
Victoires: ${wins}
Nuls: ${draws}
Défaites: ${losses}
Buts marqués: ${goalsScored}
Buts encaissés: ${goalsConceded}

Performances des joueurs:
${Object.entries(playerPerformances)
  .sort(([, a], [, b]) => b.goals - a.goals)
  .map(
    ([player, stats]) =>
      `${player}: ${stats.goals} buts, ${stats.assists} passes décisives`
  )
  .join("\n")}
    `;

    setReport(reportText);
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Génération de rapports</h2>
      <div className="mb-4">
        <label className="block mb-2">Date de début:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block mb-2">Date de fin:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="p-2 border rounded"
        />
      </div>
      <button
        onClick={generateReport}
        className="bg-blue-500 text-white p-2 rounded"
      >
        Générer le rapport
      </button>
      {report && (
        <pre className="mt-4 p-4 bg-gray-100 rounded whitespace-pre-wrap">
          {report}
        </pre>
      )}
    </div>
  );
}
