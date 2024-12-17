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

interface Sponsor {
  id: string;
  name: string;
  type: "main" | "secondary" | "technical";
  startDate: string;
  endDate: string;
  value: number;
}

export default function SponsorshipManagement() {
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [name, setName] = useState("");
  const [type, setType] = useState<"main" | "secondary" | "technical">("main");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [value, setValue] = useState("");

  useEffect(() => {
    fetchSponsors();
  }, []);

  const fetchSponsors = async () => {
    const querySnapshot = await getDocs(collection(db, "sponsors"));
    const fetchedSponsors: Sponsor[] = [];
    querySnapshot.forEach((doc) => {
      fetchedSponsors.push({ id: doc.id, ...doc.data() } as Sponsor);
    });
    setSponsors(fetchedSponsors);
  };

  const handleAddSponsor = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "sponsors"), {
      name,
      type,
      startDate,
      endDate,
      value: parseFloat(value),
    });
    setName("");
    setType("main");
    setStartDate("");
    setEndDate("");
    setValue("");
    fetchSponsors();
  };

  const handleUpdateSponsor = async (
    id: string,
    updatedData: Partial<Sponsor>
  ) => {
    await updateDoc(doc(db, "sponsors", id), updatedData);
    fetchSponsors();
  };

  const handleDeleteSponsor = async (id: string) => {
    await deleteDoc(doc(db, "sponsors", id));
    fetchSponsors();
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">
        Gestion des sponsors et partenariats
      </h2>
      <form onSubmit={handleAddSponsor} className="mb-4">
        <input
          type="text"
          placeholder="Nom du sponsor"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <select
          value={type}
          onChange={(e) =>
            setType(e.target.value as "main" | "secondary" | "technical")
          }
          className="mr-2 p-2 border rounded"
          required
        >
          <option value="main">Principal</option>
          <option value="secondary">Secondaire</option>
          <option value="technical">Technique</option>
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
          placeholder="Valeur du contrat"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Ajouter un sponsor
        </button>
      </form>
      <ul>
        {sponsors.map((sponsor) => (
          <li key={sponsor.id} className="mb-2">
            {sponsor.name} - {sponsor.type} - Du {sponsor.startDate} au{" "}
            {sponsor.endDate} - {sponsor.value}€
            <button
              onClick={() =>
                handleUpdateSponsor(sponsor.id, {
                  value: parseFloat(
                    prompt("Nouvelle valeur du contrat:") ||
                      sponsor.value.toString()
                  ),
                })
              }
              className="ml-2 bg-yellow-500 text-white p-1 rounded"
            >
              Modifier la valeur
            </button>
            <button
              onClick={() => handleDeleteSponsor(sponsor.id)}
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
