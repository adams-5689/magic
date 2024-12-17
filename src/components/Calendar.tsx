"use client";

import { useState, useEffect } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { Calendar as BigCalendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";

moment.locale("fr");
const localizer = momentLocalizer(moment);

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  allDay?: boolean;
  resource?: any;
}

export default function Calendar() {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    const fetchedEvents: Event[] = [];

    // Fetch matches
    const matchesQuery = query(collection(db, "matches"));
    const matchesSnapshot = await getDocs(matchesQuery);
    matchesSnapshot.forEach((doc) => {
      const match = doc.data();
      fetchedEvents.push({
        id: doc.id,
        title: `Match vs ${match.opponent}`,
        start: new Date(match.date),
        end: new Date(match.date),
        allDay: true,
        resource: "match",
      });
    });

    // Fetch training sessions
    const trainingsQuery = query(collection(db, "training"));
    const trainingsSnapshot = await getDocs(trainingsQuery);
    trainingsSnapshot.forEach((doc) => {
      const training = doc.data();
      fetchedEvents.push({
        id: doc.id,
        title: `Entraînement: ${training.type}`,
        start: new Date(training.date),
        end: new Date(training.date),
        allDay: true,
        resource: "training",
      });
    });

    setEvents(fetchedEvents);
  };

  return (
    <div className="h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Calendrier</h2>
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "calc(100% - 80px)" }}
        messages={{
          next: "Suivant",
          previous: "Précédent",
          today: "Aujourd'hui",
          month: "Mois",
          week: "Semaine",
          day: "Jour",
        }}
        eventPropGetter={(event) => ({
          className:
            event.resource === "match" ? "bg-blue-500" : "bg-green-500",
        })}
      />
    </div>
  );
}
