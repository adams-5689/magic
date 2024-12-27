"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../configs/firebase";

interface Player {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  birthCertificate: string;
  parentBirthCertificate: string;
  weight: number;
  height: number;
  previousClubs: string[];
  photo: string;
  additionalFiles: string[];
  division: string;
}

interface PlayerManagementProps {
  isAdmin: boolean;
}

export default function PlayerManagement({ isAdmin }: PlayerManagementProps) {
  const [players, setPlayers] = useState<Player[]>([]);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [previousClubs, setPreviousClubs] = useState("");
  const [birthCertificate, setBirthCertificate] = useState<File | null>(null);
  const [parentBirthCertificate, setParentBirthCertificate] =
    useState<File | null>(null);
  const [photo, setPhoto] = useState<File | null>(null);
  const [additionalFiles, setAdditionalFiles] = useState<File[]>([]);
  const [divisions, setDivisions] = useState<{ id: string; name: string }[]>(
    []
  );
  const [selectedDivision, setSelectedDivision] = useState("");

  useEffect(() => {
    fetchPlayers();
    fetchDivisions();
  }, []);

  const fetchPlayers = async () => {
    const querySnapshot = await getDocs(collection(db, "players"));
    const fetchedPlayers: Player[] = [];
    querySnapshot.forEach((doc) => {
      fetchedPlayers.push({ id: doc.id, ...doc.data() } as Player);
    });
    setPlayers(fetchedPlayers);
  };

  const fetchDivisions = async () => {
    const querySnapshot = await getDocs(collection(db, "divisions"));
    const fetchedDivisions: { id: string; name: string }[] = [];
    querySnapshot.forEach((doc) => {
      const divisionData = doc.data();
      fetchedDivisions.push({ id: doc.id, name: divisionData.name });
    });
    setDivisions(fetchedDivisions);
  };

  const uploadFile = async (file: File, path: string) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return await getDownloadURL(storageRef);
  };

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault();

    const birthCertificateURL = birthCertificate
      ? await uploadFile(
          birthCertificate,
          `players/${firstName}_${lastName}/birth_certificate`
        )
      : "";
    const parentBirthCertificateURL = parentBirthCertificate
      ? await uploadFile(
          parentBirthCertificate,
          `players/${firstName}_${lastName}/parent_birth_certificate`
        )
      : "";
    const photoURL = photo
      ? await uploadFile(photo, `players/${firstName}_${lastName}/photo`)
      : "";

    const additionalFilesURLs = await Promise.all(
      additionalFiles.map((file, index) =>
        uploadFile(
          file,
          `players/${firstName}_${lastName}/additional_file_${index}`
        )
      )
    );

    await addDoc(collection(db, "players"), {
      firstName,
      lastName,
      dateOfBirth,
      birthCertificate: birthCertificateURL,
      parentBirthCertificate: parentBirthCertificateURL,
      weight: parseFloat(weight),
      height: parseFloat(height),
      previousClubs: previousClubs.split(",").map((club) => club.trim()),
      photo: photoURL,
      additionalFiles: additionalFilesURLs,
      division: selectedDivision,
    });

    // Reset form fields
    setFirstName("");
    setLastName("");
    setDateOfBirth("");
    setWeight("");
    setHeight("");
    setPreviousClubs("");
    setBirthCertificate(null);
    setParentBirthCertificate(null);
    setPhoto(null);
    setAdditionalFiles([]);
    setSelectedDivision("");

    fetchPlayers();
  };

  const handleUpdatePlayer = async (
    id: string,
    updatedData: Partial<Player>
  ) => {
    await updateDoc(doc(db, "players", id), updatedData);
    fetchPlayers();
  };

  const handleDeletePlayer = async (id: string) => {
    if (isAdmin) {
      await deleteDoc(doc(db, "players", id));
      fetchPlayers();
    } else {
      alert("Seul l'administrateur peut supprimer des joueurs.");
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Gestion des joueurs</h2>
      <form onSubmit={handleAddPlayer} className="space-y-4">
        <input
          type="text"
          placeholder="Prénom"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          type="text"
          placeholder="Nom"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          type="date"
          placeholder="Date de naissance"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          type="number"
          placeholder="Poids (kg)"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          type="number"
          placeholder="Taille (cm)"
          value={height}
          onChange={(e) => setHeight(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <input
          type="text"
          placeholder="Clubs précédents (séparés par des virgules)"
          value={previousClubs}
          onChange={(e) => setPreviousClubs(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
        <div>
          <label className="block mb-2">Extrait de naissance du joueur</label>
          <input
            type="file"
            onChange={(e) =>
              setBirthCertificate(e.target.files ? e.target.files[0] : null)
            }
            className="w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Extrait de naissance d'un parent</label>
          <input
            type="file"
            onChange={(e) =>
              setParentBirthCertificate(
                e.target.files ? e.target.files[0] : null
              )
            }
            className="w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Photo du joueur</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) =>
              setPhoto(e.target.files ? e.target.files[0] : null)
            }
            className="w-full"
            required
          />
        </div>
        <div>
          <label className="block mb-2">Fichiers supplémentaires</label>
          <input
            type="file"
            multiple
            onChange={(e) =>
              setAdditionalFiles(
                e.target.files ? Array.from(e.target.files) : []
              )
            }
            className="w-full"
          />
        </div>
        <select
          value={selectedDivision}
          onChange={(e) => setSelectedDivision(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        >
          <option value="">Sélectionner une division</option>
          {divisions.map((division) => (
            <option key={division.id} value={division.id}>
              {division.name}
            </option>
          ))}
        </select>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Ajouter un joueur
        </button>
      </form>
      <ul className="space-y-4">
        {players.map((player) => (
          <li key={player.id} className="bg-white p-4 rounded-md shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold">
                  {player.firstName} {player.lastName}
                </h3>
                <p className="text-gray-600">Né le: {player.dateOfBirth}</p>
                <p className="text-gray-600">
                  Poids: {player.weight} kg, Taille: {player.height} cm
                </p>
                <p className="text-gray-600">
                  Clubs précédents: {player.previousClubs.join(", ")}
                </p>
                <p className="text-gray-600">
                  Division:{" "}
                  {divisions.find((d) => d.id === player.division)?.name ||
                    "Non assignée"}
                </p>
              </div>
              <div className="space-x-2">
                {isAdmin && (
                  <button
                    onClick={() => handleDeletePlayer(player.id)}
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
