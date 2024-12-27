"use client";

import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import { db } from "../configs/firebase";

interface BudgetItem {
  id: string;
  amount: number;
  type: "income" | "expense";
  description: string;
  date: string;
}

export default function BudgetTracking() {
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [amount, setAmount] = useState("");
  const [type, setType] = useState<"income" | "expense">("income");
  const [description, setDescription] = useState("");
  const [totalBudget, setTotalBudget] = useState(0);

  useEffect(() => {
    fetchBudgetItems();
  }, []);

  const fetchBudgetItems = async () => {
    const q = query(collection(db, "budget"), orderBy("date", "desc"));
    const querySnapshot = await getDocs(q);
    const fetchedItems: BudgetItem[] = [];
    querySnapshot.forEach((doc) => {
      fetchedItems.push({ id: doc.id, ...doc.data() } as BudgetItem);
    });
    setBudgetItems(fetchedItems);
    calculateTotalBudget(fetchedItems);
  };

  const calculateTotalBudget = (items: BudgetItem[]) => {
    const total = items.reduce((acc, item) => {
      return item.type === "income" ? acc + item.amount : acc - item.amount;
    }, 0);
    setTotalBudget(total);
  };

  const handleAddBudgetItem = async (e: React.FormEvent) => {
    e.preventDefault();
    await addDoc(collection(db, "budget"), {
      amount: parseFloat(amount),
      type,
      description,
      date: new Date().toISOString(),
    });
    setAmount("");
    setType("income");
    setDescription("");
    fetchBudgetItems();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">Suivi du budget</h2>
      <div className="bg-white p-4 rounded-md shadow">
        <h3 className="text-xl font-semibold mb-2">
          Budget total: {totalBudget.toFixed(2)} €
        </h3>
      </div>
      <form onSubmit={handleAddBudgetItem} className="space-y-4">
        <input
          type="number"
          placeholder="Montant"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value as "income" | "expense")}
          className="w-full px-3 py-2 border rounded-md"
          required
        >
          <option value="income">Revenu</option>
          <option value="expense">Dépense</option>
        </select>
        <input
          type="text"
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition duration-300"
        >
          Ajouter une transaction
        </button>
      </form>
      <ul className="space-y-4">
        {budgetItems.map((item) => (
          <li key={item.id} className="bg-white p-4 rounded-md shadow">
            <div className="flex justify-between items-center">
              <div>
                <h3
                  className={`text-lg font-semibold ${
                    item.type === "income" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {item.type === "income" ? "+" : "-"} {item.amount.toFixed(2)}{" "}
                  €
                </h3>
                <p className="text-gray-600">{item.description}</p>
                <p className="text-gray-400 text-sm">
                  {new Date(item.date).toLocaleDateString()}
                </p>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
