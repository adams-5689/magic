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

interface BudgetItem {
  id: string;
  category: string;
  amount: number;
  description: string;
}

export default function BudgetManagement() {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [category, setCategory] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    fetchBudgetItems();
  }, []);

  const fetchBudgetItems = async () => {
    const querySnapshot = await getDocs(collection(db, "budget"));
    const fetchedItems: BudgetItem[] = [];
    querySnapshot.forEach((doc) => {
      fetchedItems.push({ id: doc.id, ...doc.data() } as BudgetItem);
    });
    setBudgetItems(fetchedItems);
  };

  const handleAddBudgetItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "budget"), {
      category,
      amount: parseFloat(amount),
      description,
    });
    setCategory("");
    setAmount("");
    setDescription("");
    fetchBudgetItems();
  };

  const handleUpdateBudgetItem = async (
    id: string,
    updatedData: Partial<BudgetItem>
  ) => {
    await updateDoc(doc(db, "budget", id), updatedData);
    fetchBudgetItems();
  };

  const handleDeleteBudgetItem = async (id: string) => {
    await deleteDoc(doc(db, "budget", id));
    fetchBudgetItems();
  };

  const totalBudget = budgetItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Gestion du budget</h2>
      <form onSubmit={handleAddBudgetItem} className="mb-4">
        <input
          type="text"
          placeholder="Catégorie"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <input
          type="number"
          placeholder="Montant"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mr-2 p-2 border rounded"
          required
        />
        <button type="submit" className="bg-green-500 text-white p-2 rounded">
          Ajouter un élément budgétaire
        </button>
      </form>
      <p className="mb-4">Budget total : {totalBudget.toFixed(2)} €</p>
      <ul>
        {budgetItems.map((item) => (
          <li key={item.id} className="mb-2">
            {item.category} - {item.amount.toFixed(2)} € - {item.description}
            <button
              onClick={() =>
                handleUpdateBudgetItem(item.id, {
                  amount: parseFloat(
                    prompt("Nouveau montant:") || item.amount.toString()
                  ),
                })
              }
              className="ml-2 bg-yellow-500 text-white p-1 rounded"
            >
              Modifier le montant
            </button>
            <button
              onClick={() => handleDeleteBudgetItem(item.id)}
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
