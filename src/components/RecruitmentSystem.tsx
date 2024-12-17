'use client'

import { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../config/firebase';

interface Recruit {
  id: string;
  name: string;
  position: string;
  age: number;
  currentClub: string;
  status: 'scouted' | 'contacted' | 'negotiating' | 'signed' | 'rejected';
  notes: string;
}

export default function RecruitmentSystem() {
  const [recruits, setRecruits] = useState<Recruit[]>([]);
  const [name, setName] = useState('');
  const [position, setPosition] = useState('');
  const [age, setAge] = useState('');
  const [currentClub, setCurrentClub] = useState('');
  const [status, setStatus] = useState<'scouted' | 'contacted' | 'negotiating' | 'signed' | 'rejected'>('scouted');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    fetchRecruits();
  }, []);

  const fetchRecruits = async () => {
    const querySnapshot = await getDocs(collection(db, 'recruits'));
    const fetchedRecruits: Recruit[] = [];
    querySnapshot.forEach((doc) => {
      fetchedRecruits.push({ id: doc.id, ...doc.data() } as Recruit);
    });
    setRecruits(fetchedRecruits);
  };

  const handleAddRecruit = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, 'recruits'), {
      name,
      position,
      age: parseInt(age),
      currentClub,
      status,
      notes,
    });
    setName('');
    setPosition('');
    setAge('');
    setCurrentClub('');
    setStatus('scouted');
    setNotes('');
    fetchRecruits();
  };

  const handleUpdateRecruit = async (id: string, updatedData: Partial<Recruit>) => {
    await updateDoc(doc(db, 'recruits', id), updatedData);
    fetchRecruits();
  };

  const handleDeleteRecruit = async (id: string) => {
    await deleteDoc(doc(db, 'recruits', id));
    fetchRecruits();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Système de recrutement</h2>
      <form onSubmit={handleAddRecruit} className="mb-4">
        <input
          type="text"
          placeholder="Nom du joueur"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Âge"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Club actuel"
          value={currentClub}
          onChange={(e) => setCurrentClub(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as 'scouted' | 'contacted' | 'negotiating' | 'signed' | 'rejected')}
          className="mr-2 p-2 border rounded"
          required
        >
          <option value="scouted">Repéré</option>
          <option value="contacted">Contacté</option>
          <option value="negotiating">En négociation</option>
          <option value="signed">Signé</option>
          <option value="rejected">Rejeté</option>
        </select>
        <textarea
          placeholder="Notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="mr-2 p-

