'use client'

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Team {
  id: string;
  name: string;
  coach: string;
}

export default function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [name, setName] = useState('');
  const [coach, setCoach] = useState('');

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const querySnapshot = await getDocs(collection(db, 'teams'));
    const fetchedTeams: Team[] = [];
    querySnapshot.forEach((doc) => {
      fetchedTeams.push({ id: doc.id, ...doc.data() } as Team);
    });
    setTeams(fetchedTeams);
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'teams'), {
      name,
      coach,
    });
    setName('');
    setCoach('');
    fetchTeams();
  };

  const handleUpdateTeam = async (id: string, updatedData: Partial<Team>) => {
    await updateDoc(doc(db, 'teams', id), updatedData);
    fetchTeams();
  };

  const handleDeleteTeam = async (id: string) => {
    await deleteDoc(doc(db, 'teams', id));
    fetchTeams();
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestion des équipes</h2>
      <form onSubmit={handleAddTeam} className="mb-4">
        <input
          type="text"
          placeholder="Nom de l'équipe"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Entraîneur"
          value={coach}
          onChange={(e) => setCoach(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Ajouter une équipe
        </button>
      </form>
      <ul>
        {teams.map((team) => (
          <li key={team.id} className="mb-2">
            {team.name} - Entraîneur: {team.coach}
            <button
              onClick={() => handleUpdateTeam(team.id, { coach: prompt('Nouvel entraîneur:') || team.coach })}
              className="ml-2 bg-yellow-500 text-white p-1 rounded"
            >
              Modifier l'entraîneur
            </button>
            <button
              onClick={() => handleDeleteTeam(team.id)}
              className="ml-2 bg-red-500 text-white p-1 rounded"
            >
              Supprimer
            </button>
          </li>
        ))}
      </ul>
    </div>>
  );
}

