"use client";

import Login from "./Login";
import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../configs/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import PlayerManagement from "../components/PlayerManagement";
import TeamManagement from "../components/TeamManagement";
import BudgetTracking from "../components/BudgetTracking";
import TrainingManagement from "../components/TrainingManagement";
import MatchManagement from "../components/MatchManagement";
import PerformanceTracking from "../components/PerformanceTracking";
import ContractManagement from "../components/ContractManagement";
import InternalMessaging from "../components/InternalMessaging";
import Calendar from "../components/Calendar";
import PerformanceCharts from "../components/PerformanceCharts";
import Notifications from "../components/Notifications";
import Reports from "../components/Reports";
import MatchSheet from "../components/MatchSheet";
import PlayerMovements from "../components/PlayerMovements";
import DocumentManagement from "../components/DocumentManagement";
import MatchTeamManagement from "../components/MatchTeamManagement";
import MedicalTracking from "../components/MedicalTracking";
import AdvancedPerformanceAnalysis from "../components/AdvancedPerformanceAnalysis";
import SocialMediaIntegration from "../components/SocialMediaIntegration";
import SponsorshipManagement from "../components/SponsorshipManagement";
import FinancialReports from "../components/FinancialReports";
import RecruitmentSystem from "../components/RecruitmentSystem";
import DivisionManagement from "../components/DivisionManagement";
import AdminOverview from "../components/AdminOverview";
import UserManagement from "../components/UserManagement";
import SystemSettings from "../components/SystemSettings";

import { Button } from "../components/ui/button";
import { ScrollArea } from "../components/ui/scroll-area";

interface DashboardProps {
  user: any;
  userRole: string;
}

interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  description: string;
  date: string;
}

export default function Dashboard({ user, userRole }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [upcomingTrainings, setUpcomingTrainings] = useState<any[]>([]);
  const [budgetOverview, setBudgetOverview] = useState({
    total: 0,
    recentTransactions: [] as Transaction[],
  });

  useEffect(() => {
    fetchUpcomingMatches();
    fetchUpcomingTrainings();
    fetchBudgetOverview();
  }, []);

  const handleSignOut = () => {
    signOut(auth);
  };

  const isAdmin = userRole === "admin";

  const fetchUpcomingMatches = async () => {
    const q = query(
      collection(db, "matches"),
      where("date", ">=", new Date().toISOString()),
      orderBy("date"),
      limit(5)
    );
    const querySnapshot = await getDocs(q);
    const matches: any[] = [];
    querySnapshot.forEach((doc) => {
      matches.push({ ...doc.data(), id: doc.id });
    });
    setUpcomingMatches(matches);
  };

  const fetchUpcomingTrainings = async () => {
    const q = query(
      collection(db, "training"),
      where("date", ">=", new Date().toISOString()),
      orderBy("date"),
      limit(5)
    );
    const querySnapshot = await getDocs(q);
    const trainings: any[] = [];
    querySnapshot.forEach((doc) => {
      trainings.push({ ...doc.data(), id: doc.id });
    });
    setUpcomingTrainings(trainings);
  };

  const fetchBudgetOverview = async () => {
    const q = query(
      collection(db, "budget"),
      orderBy("date", "desc"),
      limit(5)
    );
    const querySnapshot = await getDocs(q);
    let total = 0;
    const recentTransactions: Transaction[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data() as Transaction;
      total += data.type === "income" ? data.amount : -data.amount;
      recentTransactions.push({ id: doc.id, ...data });
    });
    setBudgetOverview({ total, recentTransactions });
  };

  const menuItems = [
    { id: "overview", label: "Aperçu", component: null },
    {
      id: "players",
      label: "Gestion des joueurs",
      component: <PlayerManagement isAdmin={isAdmin} />,
    },
    {
      id: "teams",
      label: "Gestion des équipes",
      component: <TeamManagement />,
    },
    {
      id: "training",
      label: "Gestion des entraînements",
      component: <TrainingManagement />,
    },
    {
      id: "matches",
      label: "Gestion des matchs",
      component: <MatchManagement isAdmin={isAdmin} />,
    },
    {
      id: "performance",
      label: "Suivi des performances",
      component: <PerformanceTracking />,
    },
    {
      id: "contracts",
      label: "Gestion des contrats",
      component: <ContractManagement />,
    },
    {
      id: "messaging",
      label: "Messagerie interne",
      component: <InternalMessaging />,
    },
    { id: "calendar", label: "Calendrier", component: <Calendar /> },
    {
      id: "charts",
      label: "Graphiques de performance",
      component: <PerformanceCharts />,
    },
    {
      id: "notifications",
      label: "Notifications",
      component: <Notifications />,
    },
    {
      id: "reports",
      label: "Rapports",
      component: <Reports isAdmin={isAdmin} />,
    },
    {
      id: "matchSheets",
      label: "Feuilles de match",
      component: <MatchSheet isAdmin={isAdmin} />,
    },
    {
      id: "documents",
      label: "Gestion des documents",
      component: <DocumentManagement isAdmin={isAdmin} />,
    },
    {
      id: "matchTeams",
      label: "Équipes de match",
      component: <MatchTeamManagement />,
    },
    { id: "medical", label: "Suivi médical", component: <MedicalTracking /> },
    {
      id: "advancedPerformance",
      label: "Analyse avancée",
      component: <AdvancedPerformanceAnalysis />,
    },
    {
      id: "socialMedia",
      label: "Médias sociaux",
      component: <SocialMediaIntegration isAdmin={isAdmin} />,
    },
    {
      id: "recruitment",
      label: "Recrutement",
      component: <RecruitmentSystem />,
    },
    {
      id: "divisions",
      label: "Gestion des divisions",
      component: <DivisionManagement />,
    },
  ];

  const adminMenuItems = [
    {
      id: "adminOverview",
      label: "Vue d'ensemble admin",
      component: <AdminOverview />,
    },
    {
      id: "userManagement",
      label: "Gestion des utilisateurs",
      component: <UserManagement />,
    },
    {
      id: "systemSettings",
      label: "Paramètres du système",
      component: <SystemSettings />,
    },
  ];

  const adminOnlyItems = [
    { id: "budget", label: "Suivi du budget", component: <BudgetTracking /> },
    {
      id: "playerMovements",
      label: "Mouvements des joueurs",
      component: <PlayerMovements isAdmin={false} />,
    },
    {
      id: "sponsorship",
      label: "Gestion des sponsors",
      component: <SponsorshipManagement />,
    },
    {
      id: "financialReports",
      label: "Rapports financiers",
      component: <FinancialReports />,
    },
  ];

  const allMenuItems = isAdmin
    ? [...menuItems, ...adminMenuItems, ...adminOnlyItems]
    : menuItems;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <nav className="bg-blue-600 dark:bg-blue-800 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <span className="font-bold text-xl">
                Tableau de bord du club de football
              </span>
            </div>
            <div className="flex items-center">
              <span className="mr-4">
                Connecté en tant que :{" "}
                {isAdmin ? "Administrateur" : "Entraîneur"}
              </span>
              <Button onClick={handleSignOut} variant="destructive">
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <aside className="w-full lg:w-1/4 xl:w-1/5">
            <ScrollArea className="h-[calc(100vh-6rem)]">
              <nav className="space-y-1" aria-label="Navigation principale">
                {allMenuItems.map((item) => (
                  <Button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    variant={activeTab === item.id ? "secondary" : "ghost"}
                    className="w-full justify-start"
                  >
                    {item.label}
                  </Button>
                ))}
              </nav>
            </ScrollArea>
          </aside>
          <main className="flex-1">
            <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
              {activeTab === "overview" ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-4 dark:text-white">
                    Aperçu
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-md shadow">
                      <h3 className="text-lg font-semibold mb-2 dark:text-white">
                        Prochains matchs
                      </h3>
                      <ul className="space-y-2">
                        {upcomingMatches.map((match) => (
                          <li key={match.id} className="dark:text-gray-200">
                            {new Date(match.date).toLocaleDateString()} -{" "}
                            {match.opponent}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-md shadow">
                      <h3 className="text-lg font-semibold mb-2 dark:text-white">
                        Prochains entraînements
                      </h3>
                      <ul className="space-y-2">
                        {upcomingTrainings.map((training) => (
                          <li key={training.id} className="dark:text-gray-200">
                            {new Date(training.date).toLocaleDateString()} -{" "}
                            {training.type}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white dark:bg-gray-700 p-4 rounded-md shadow">
                      <h3 className="text-lg font-semibold mb-2 dark:text-white">
                        Aperçu du budget
                      </h3>
                      <p className="font-bold dark:text-gray-200">
                        Total: {budgetOverview.total.toFixed(2)} €
                      </p>
                      <h4 className="text-md font-semibold mt-2 mb-1 dark:text-gray-300">
                        Transactions récentes:
                      </h4>
                      <ul className="space-y-2">
                        {budgetOverview.recentTransactions.map(
                          (transaction) => (
                            <li
                              key={transaction.id}
                              className="dark:text-gray-200"
                            >
                              {transaction.type === "income" ? "+" : "-"}{" "}
                              {transaction.amount.toFixed(2)} € -{" "}
                              {transaction.description}
                            </li>
                          )
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ) : (
                allMenuItems.find((item) => item.id === activeTab)?.component
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
