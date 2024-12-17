"use client";

import { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth, db } from "../config/firebase";
import {
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
} from "firebase/firestore";
import PlayerManagement from "./PlayerManagement";
import TeamManagement from "./TeamManagement";
import BudgetTracking from "./BudgetTracking";
import TrainingManagement from "./TrainingManagement";
import MatchManagement from "./MatchManagement";
import PerformanceTracking from "./PerformanceTracking";
import ContractManagement from "./ContractManagement";
import InternalMessaging from "./InternalMessaging";
import Calendar from "./Calendar";
import PerformanceCharts from "./PerformanceCharts";
import Notifications from "./Notifications";
import Reports from "./Reports";
import MatchSheet from "./MatchSheet";
import PlayerMovements from "./PlayerMovements";
import DocumentManagement from "./DocumentManagement";
import MatchTeamManagement from "./MatchTeamManagement";
import MedicalTracking from "./MedicalTracking";
import AdvancedPerformanceAnalysis from "./AdvancedPerformanceAnalysis";
import SocialMediaIntegration from "./SocialMediaIntegration";
import SponsorshipManagement from "./SponsorshipManagement";
import FinancialReports from "./FinancialReports";
import RecruitmentSystem from "./RecruitmentSystem";
import DivisionManagement from "./DivisionManagement";

interface DashboardProps {
  user: any;
  userRole: string;
}

export default function Dashboard({ user, userRole }: DashboardProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [upcomingMatches, setUpcomingMatches] = useState<any[]>([]);
  const [upcomingTrainings, setUpcomingTrainings] = useState<any[]>([]);
  const [budgetOverview, setBudgetOverview] = useState({
    total: 0,
    recentTransactions: [],
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
      matches.push({ id: doc.id, ...doc.data() });
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
      trainings.push({ id: doc.id, ...doc.data() });
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
    const recentTransactions: any[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();
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
      component: <TeamManagement isAdmin={isAdmin} />,
    },
    {
      id: "training",
      label: "Gestion des entraînements",
      component: <TrainingManagement isAdmin={isAdmin} />,
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
      component: <ContractManagement isAdmin={isAdmin} />,
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
      component: <MatchTeamManagement isAdmin={isAdmin} />,
    },
    {
      id: "medical",
      label: "Suivi médical",
      component: <MedicalTracking isAdmin={isAdmin} />,
    },
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
      component: <RecruitmentSystem isAdmin={isAdmin} />,
    },
    {
      id: "divisions",
      label: "Gestion des divisions",
      component: <DivisionManagement />,
    },
  ];

  const adminOnlyItems = [
    { id: "budget", label: "Suivi du budget", component: <BudgetTracking /> },
    {
      id: "playerMovements",
      label: "Mouvements des joueurs",
      component: <PlayerMovements />,
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

  if (isAdmin) {
    menuItems.push(...adminOnlyItems);
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-blue-600 text-white shadow-lg">
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
              <button
                onClick={handleSignOut}
                className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-wrap -mx-2 overflow-hidden">
          <div className="my-2 px-2 w-full overflow-hidden lg:w-1/4 xl:w-1/5">
            <nav className="space-y-1" aria-label="Navigation principale">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                    activeTab === item.id
                      ? "bg-gray-900 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  } transition duration-300`}
                  aria-pressed={activeTab === item.id}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>
          <div className="my-2 px-2 w-full overflow-hidden lg:w-3/4 xl:w-4/5">
            <main className="bg-white shadow-md rounded-lg p-6">
              {activeTab === "overview" ? (
                <div className="space-y-6">
                  <h2 className="text-2xl font-bold mb-4">Aperçu</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-md shadow">
                      <h3 className="text-lg font-semibold mb-2">
                        Prochains matchs
                      </h3>
                      <ul className="space-y-2">
                        {upcomingMatches.map((match) => (
                          <li key={match.id}>
                            {new Date(match.date).toLocaleDateString()} -{" "}
                            {match.opponent}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-md shadow">
                      <h3 className="text-lg font-semibold mb-2">
                        Prochains entraînements
                      </h3>
                      <ul className="space-y-2">
                        {upcomingTrainings.map((training) => (
                          <li key={training.id}>
                            {new Date(training.date).toLocaleDateString()} -{" "}
                            {training.type}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-white p-4 rounded-md shadow">
                      <h3 className="text-lg font-semibold mb-2">
                        Aperçu du budget
                      </h3>
                      <p className="font-bold">
                        Total: {budgetOverview.total.toFixed(2)} €
                      </p>
                      <h4 className="text-md font-semibold mt-2 mb-1">
                        Transactions récentes:
                      </h4>
                      <ul className="space-y-2">
                        {budgetOverview.recentTransactions.map(
                          (transaction) => (
                            <li key={transaction.id}>
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
                menuItems.find((item) => item.id === activeTab)?.component
              )}
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
