'use client'

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../configs/firebase';

interface Division {
  id: string;
  name: string;
  ageGroup: string;
}

export default function DivisionManagement() {
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [name, setName] = useState('');
  const [ageGroup, setAgeGroup] = useState('');

  useEffect(() => {
    fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    const querySnapshot = await getDocs(collection(db, 'divisions'));
    const fetchedDivisions: Division[] = [];
    querySnapshot.forEach((doc) => {
      fetchedDivisions.push({ id: doc.id, ...doc.data() } as Division);
    });
    setDivisions(fetchedDivisions);
  };

  const handleAddDivision = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'divisions'), {
      name,
      ageGroup,
    });
    setName('');
    setAgeGroup('');
    fetchDivisions();
  };

  const handleUpdateDivision = async (id: string, updatedData: Partial<Division>) => {
    await updateDoc(doc(db, 'divisions', id), updatedData);
    fetchDivisions();
  };

  const handleDeleteDivision = async (id: string) => {
    await deleteDoc(doc(db, 'divisions', id));
    fetchDivisions();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Gestion des divisions</h2>
      <form onSubmit={handleAddDivision} className="space-y-4">
        <input
          type="text"
          placeholder="Nom de la division (ex: U19, U15)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          type="text"
          placeholder="Groupe d'âge (ex: 17-19 ans)"
          value={ageGroup}
          onChange={(e) => setAgeGroup(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <button type="submit" className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300">
          Ajouter une division
        </button>
      </form>
      <ul className="space-y-4">
        {divisions.map((division) => (
          <li key={division.id} className="bg-white p-4 rounded-md shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">{division.name}</h3>
                <p className="text-gray-600">{division.ageGroup}</p>
              </div>
              <div className="space-x-2">
                <button
                  onClick={() => handleUpdateDivision(division.id, { name: prompt('Nouveau nom:', division.name) || division.name })}
                  className="bg-yellow-500 text-white py-1 px-2 rounded-md hover:bg-yellow-600 transition duration-300"
                >
                  Modifier
                </button>
                <button
                  onClick={() => handleDeleteDivision(division.id)}
                  className="bg-red-500 text-white py-1 px-2 rounded-md hover:bg-red-600 transition duration-300"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

