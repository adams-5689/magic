import React, { useState, useEffect } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../configs/firebase";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";

interface SystemSettings {
  clubName: string;
  maxPlayersPerTeam: number;
  seasonStartDate: string;
  seasonEndDate: string;
}

export default function SystemSettings() {
  const [settings, setSettings] = useState<SystemSettings>({
    clubName: "",
    maxPlayersPerTeam: 0,
    seasonStartDate: "",
    seasonEndDate: "",
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const docRef = doc(db, "systemSettings", "general");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      setSettings(docSnap.data() as SystemSettings);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({
      ...prev,
      [name]: name === "maxPlayersPerTeam" ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const docRef = doc(db, "systemSettings", "general");
      await updateDoc(docRef, {
        clubName: settings.clubName,
        maxPlayersPerTeam: settings.maxPlayersPerTeam,
        seasonStartDate: settings.seasonStartDate,
        seasonEndDate: settings.seasonEndDate,
      });
      alert("Paramètres mis à jour avec succès");
    } catch (error) {
      console.error("Erreur lors de la mise à jour des paramètres:", error);
      alert("Une erreur est survenue lors de la mise à jour des paramètres");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres du système</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clubName">Nom du club</Label>
            <Input
              id="clubName"
              name="clubName"
              value={settings.clubName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxPlayersPerTeam">
              Nombre maximum de joueurs par équipe
            </Label>
            <Input
              id="maxPlayersPerTeam"
              name="maxPlayersPerTeam"
              type="number"
              value={settings.maxPlayersPerTeam}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seasonStartDate">Date de début de saison</Label>
            <Input
              id="seasonStartDate"
              name="seasonStartDate"
              type="date"
              value={settings.seasonStartDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="seasonEndDate">Date de fin de saison</Label>
            <Input
              id="seasonEndDate"
              name="seasonEndDate"
              type="date"
              value={settings.seasonEndDate}
              onChange={handleChange}
              required
            />
          </div>
          <Button type="submit">Enregistrer les paramètres</Button>
        </form>
      </CardContent>
    </Card>
  );
}
