'use client'

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface PlayerMovement {
  id: string;
  playerId: string;
  playerName: string;
  fromDivision: string;
  toDivision: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function PlayerMovements() {
  const [movements, setMovements] = useState<PlayerMovement[]>([]);
  const [players, setPlayers] = useState<{ id: string; name: string }[]>([]);
  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [fromDivision, setFromDivision] = useState('');
  const [toDivision, setToDivision] = useState('');
  const [date, setDate] = useState('');

  useEffect(() => {
    fetchMovements();
    fetchPlayers();
    fetchDivisions();
  }, []);

  const fetchMovements = async () => {fetchMovements = async () => {
    const q = query(collection(db, 'playerMovements'), orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);
    const fetchedMovements: PlayerMovement[] = [];
    querySnapshot.forEach((doc) => {
      fetchedMovements.push({ id: doc.id, ...doc.data() } as PlayerMovement);
    });
    setMovements(fetchedMovements);
  };

  const fetchPlayers = async () => {
    const querySnapshot = await getDocs(collection(db, 'players'));
    const fetchedPlayers: { id: string; name: string }[] = [];
    querySnapshot.forEach((doc) => {
      const playerData = doc.data();
      fetchedPlayers.push({ id: doc.id, name: playerData.name });
    });
    setPlayers(fetchedPlayers);
  };

  const fetchDivisions = async () => {
    const querySnapshot = await getDocs(collection(db, 'divisions'));
    const fetchedDivisions: { id: string; name: string }[] = [];
    querySnapshot.forEach((doc) => {
      const divisionData = doc.data();
      fetchedDivisions.push({ id: doc.id, name: divisionData.name });
    });
    setDivisions(fetchedDivisions);
  };

  const handleAddMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    const playerName = players.find(p => p.id === selectedPlayer)?.name || '';
    await addDoc(collection(db, 'playerMovements'), {
      playerId: selectedPlayer,
      playerName,
      fromDivision,
      toDivision,
      date,
      status: 'pending'
    });
    setSelectedPlayer('');
    setFromDivision('');
    setToDivision('');
    setDate('');
    fetchMovements();
  };

  const handleApproveMovement = async (id: string) => {
    await updateDoc(doc(db, 'playerMovements', id), { status: 'approved' });
    fetchMovements();
  };

  const handleRejectMovement = async (id: string) => {
    await updateDoc(doc(db, 'playerMovements', id), { status: 'rejected' });
    fetchMovements();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Suivi des mouvements des joueurs</h2>
      <form onSubmit={handleAddMovement} className="mb-4">
        <select
          value={selectedPlayer}
          onChange={(e) => setSelectedPlayer(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        >
          <option value="">Sélectionner un joueur</option>
          {players.map((player) => (
            <option key={player.id} value={player.id}>{player.name}</option>
          ))}
        </select>
        <select
          value={fromDivision}
          onChange={(e) => setFromDivision(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        >
          <option value="">Division d'origine</option>
          {divisions.map((division) => (
            <option key={division.id} value={division.name}>{division.name}</option>
          ))}
        </select>
        <select
          value={toDivision}
          onChange={(e) => setToDivision(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        >
          <option value="">Nouvelle division</option>
          {divisions.map((division) => (
            <option key={division.id} value={division.name}>{division.name}</option>
          ))}
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Proposer un mouvement
        </button>
      </form>
      <ul>
        {movements.map((movement) => (
          <li key={movement.id} className="mb-2">
            {movement.date} - {movement.playerName}: {movement.fromDivision} → {movement.toDivision}
            {movement.status === 'pending' && (
              <>
                <button
                  onClick={() => handleApproveMovement(movement.id)}
                  className="ml-2 bg-green-500 text-white p-1 rounded"
                >
                  Approuver
                </button>
                <button
                  onClick={() => handleRejectMovement(movement.id)}
                  className="ml-2 bg-red-500 text-white p-1 rounded"
                >
                  Rejeter
                </button>
              </>
            )}
            <span className={`ml-2 ${
              movement.status === 'approved' ? 'text-green-500' :
              movement.status === 'rejected' ? 'text-red-500' :
              'text-yellow-500'
            }`}>
              {movement.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

