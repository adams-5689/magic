"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface FinancialTransaction {
  id: string;
  date: string;
  type: "income" | "expense";
  category: string;
  amount: number;
  description: string;
}

export default function FinancialReports() {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    const q = query(collection(db, "financialTransactions"));
    const querySnapshot = await getDocs(q);
    const fetchedTransactions: FinancialTransaction[] = [];
    querySnapshot.forEach((doc) => {
      fetchedTransactions.push({
        id: doc.id,
        ...doc.data(),
      } as FinancialTransaction);
    });
    setTransactions(fetchedTransactions);
  };

  const filterTransactions = () => {
    return transactions.filter(
      (t) =>
        (!startDate || t.date >= startDate) && (!endDate || t.date <= endDate)
    );
  };

  const calculateTotals = () => {
    const filteredTransactions = filterTransactions();
    const income = filteredTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = filteredTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    return { income, expenses, profit: income - expenses };
  };

  const getChartData = () => {
    const filteredTransactions = filterTransactions();
    const categories = Array.from(
      new Set(filteredTransactions.map((t) => t.category))
    );
    const incomeData = categories.map((category) =>
      filteredTransactions
        .filter((t) => t.type === "income" && t.category === category)
        .reduce((sum, t) => sum + t.amount, 0)
    );
    const expenseData = categories.map((category) =>
      filteredTransactions
        .filter((t) => t.type === "expense" && t.category === category)
        .reduce((sum, t) => sum + t.amount, 0)
    );

    return {
      labels: categories,
      datasets: [
        {
          label: "Revenus",
          data: incomeData,
          backgroundColor: "rgba(75, 192, 192, 0.6)",
        },
        {
          label: "Dépenses",
          data: expenseData,
          backgroundColor: "rgba(255, 99, 132, 0.6)",
        },
      ],
    };
  };

  const totals = calculateTotals();

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Rapports financiers détaillés</h2>
      <div className="mb-4">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="mr-2 p-2 border rounded"
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="mr-2 p-2 border rounded"
        />
      </div>
      <div className="mb-4">
        <p>
          <strong>Total des revenus:</strong> {totals.income.toFixed(2)}€
        </p>
        <p>
          <strong>Total des dépenses:</strong> {totals.expenses.toFixed(2)}€
        </p>
        <p>
          <strong>Profit:</strong> {totals.profit.toFixed(2)}€
        </p>
      </div>
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-2">Répartition par catégorie</h3>
        <div className="w-full h-96">
          <Bar
            data={getChartData()}
            options={{ responsive: true, maintainAspectRatio: false }}
          />
        </div>
      </div>
      <div>
        <h3 className="text-xl font-bold mb-2">Détail des transactions</h3>
        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th className="border border-gray-300 p-2">Date</th>
              <th className="border border-gray-300 p-2">Type</th>
              <th className="border border-gray-300 p-2">Catégorie</th>
              <th className="border border-gray-300 p-2">Montant</th>
              <th className="border border-gray-300 p-2">Description</th>
            </tr>
          </thead>
          <tbody>
            {filterTransactions().map((transaction) => (
              <tr key={transaction.id}>
                <td className="border border-gray-300 p-2">
                  {transaction.date}
                </td>
                <td className="border border-gray-300 p-2">
                  {transaction.type === "income" ? "Revenu" : "Dépense"}
                </td>
                <td className="border border-gray-300 p-2">
                  {transaction.category}
                </td>
                <td className="border border-gray-300 p-2">
                  {transaction.amount.toFixed(2)}€
                </td>
                <td className="border border-gray-300 p-2">
                  {transaction.description}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
