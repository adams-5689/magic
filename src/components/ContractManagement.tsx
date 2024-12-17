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

interface Contract {
  id: string;
  playerId: string;
  playerName: string;
  startDate: string;
  endDate: string;
  salary: number;
}

export default function ContractManagement() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [salary, setSalary] = useState("");

  useEffect(() => {
    fetchContracts();
    fetchPlayers();
  }, []);

  const fetchContracts = async () => {
    const querySnapshot = await getDocs(collection(db, "contracts"));
    const fetchedContracts: Contract[] = [];
    querySnapshot.forEach((doc) => {
      fetchedContracts.push({ id: doc.id, ...doc.data() } as Contract);
    });
    setContracts(fetchedContracts);
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

  const handleAddContract = async (e: React.FormEvent) => {
    e.preventDefault();
    const playerName = players.find((p) => p.id === selectedPlayer)?.name || "";
    await addDoc(collection(db, "contracts"), {
      playerId: selectedPlayer,
      playerName,
      startDate,
      endDate,
      salary: parseFloat(salary),
    });
    setSelectedPlayer("");
    setStartDate("");
    setEndDate("");
    setSalary("");
    fetchContracts();
  };

  const handleUpdateContract = async (
    id: string,
    updatedData: Partial<Contract>
  ) => {
    await updateDoc(doc(db, "contracts", id), updatedData);
    fetchContracts();
  };

  const handleDeleteContract = async (id: string) => {
    await deleteDoc(doc(db, "contracts", id));
    fetchContracts();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des contrats</h2>
      <form onSubmit={handleAddContract} className="mb-4">
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
          placeholder="Date de début"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <input
          type="date"
          placeholder="Date de fin"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Salaire annuel"
          value={salary}
          onChange={(e) => setSalary(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Ajouter un contrat
        </button>
      </form>
      <ul>
        {contracts.map((contract) => (
          <li key={contract.id} className="mb-2">
            {contract.playerName} - Du {contract.startDate} au{" "}
            {contract.endDate} - Salaire: {contract.salary}€/an
            <button
              onClick={() =>
                handleUpdateContract(contract.id, {
                  salary: parseFloat(
                    prompt("Nouveau salaire:") || contract.salary.toString()
                  ),
                })
              }
              className="ml-2 bg-yellow-500 text-white p-1 rounded"
            >
              Modifier le salaire
            </button>
            <button
              onClick={() => handleDeleteContract(contract.id)}
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
