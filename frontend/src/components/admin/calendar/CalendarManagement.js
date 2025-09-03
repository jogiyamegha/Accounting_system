import React, { useState, useEffect } from "react";
import Sidebar from "../../Sidebar";
import styles from "../../../styles/calendar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarAlt,
  faExclamationTriangle,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";
import { useRef } from "react";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ADMIN_END_POINT } from "../../../utils/constants";

// Utility: safe parse events as array of objects { title, notes }
const normalizeEvents = (val) => {
  if (!val) return [];
  return val.map((e) => (typeof e === "string" ? { title: e } : e));
};

export default function CalendarManagement() {
  const navigate = useNavigate();

  const today = useMemo(() => {
    const t = new Date();
    // Normalize to 00:00
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const popupRef = useRef(null);
  const [newEventTitle, setNewEventTitle] = useState(""); // Add new state for the input
  const [selectedCategory, setSelectedCategory] = useState("");

  const categoryOptions = [
    { id: 1, label: "VAT Filing" },
    { id: 2, label: "Corporate Tax Return" },
    { id: 3, label: "Payroll" },
    { id: 4, label: "Audit" },
  ];

  // Seed data (can be replaced with API data)
  const [deadlines, setDeadlines] = useState({
    "2025-09-05": ["VAT Filing Deadline"],
    "2025-09-15": ["Client Report Due", "GST Filing"],
    "2025-09-01": ["Payroll Submission"],
  });

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getDateKey = (y, m, d) =>
    `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

  const changeMonth = (delta) => {
    const d = new Date(currentYear, currentMonth + delta, 1);
    setCurrentMonth(d.getMonth());
    setCurrentYear(d.getFullYear());
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentMonth(today.getMonth());
    setCurrentYear(today.getFullYear());
  };

  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const compareWithToday = (y, m, d) => {
    const target = new Date(y, m, d);
    target.setHours(0, 0, 0, 0);
    if (target.getTime() < today.getTime()) return "past";
    if (target.getTime() === today.getTime()) return "today";
    return "upcoming";
  };

  // Build calendar cells
  const calendarCells = [];
  for (let i = 0; i < firstDay; i++)
    calendarCells.push({ type: "empty", key: `empty-${i}` });
  for (let d = 1; d <= daysInMonth; d++) {
    const key = getDateKey(currentYear, currentMonth, d);
    const events = normalizeEvents(deadlines[key]);
    const hasDeadline = events.length > 0;
    const status = compareWithToday(currentYear, currentMonth, d); // past | today | upcoming
    const isToday = status === "today";
    calendarCells.push({
      type: "day",
      day: d,
      key,
      hasDeadline,
      isToday,
      status,
      count: events.length,
      events,
    });
    // console.log("calendarCells",calendarCells)
  }

  const monthKeyPrefix = `${currentYear}-${String(currentMonth + 1).padStart(
    2,
    "0"
  )}-`;
  const monthDeadlines = Object.keys(deadlines)
    .filter((k) => k.startsWith(monthKeyPrefix))
    .sort();

  const addDeadline = (key, eventObj) =>
    setDeadlines((prev) => ({
      ...prev,
      [key]: [...normalizeEvents(prev[key]), eventObj],
    }));

  const handleDayClick = (cell, e) => {
    e.stopPropagation();
    console.log("selectedDay", selectedDay);
    console.log("2", cell.type);

    if (cell.type !== "day") return;
    // const rect = e.currentTarget.getBoundingClientRect();
    // const x = rect.left + rect.width / 2;
    // const y = rect.top + window.scrollY + rect.height + 8; // below cell

    // console.log("x", x);
    // console.log("y", y);
    setSelectedDay({ ...cell });

    setNewEventTitle(""); // Clear input when a new day is selected
  };

  //   useEffect(() => {
  //     const onDocClick = (ev) => {
  //       if (popupRef.current && popupRef.current.contains(ev.target)) return;
  //       setSelectedDay(null);
  //     };
  //     document.addEventListener("click", onDocClick);
  //     return () => document.removeEventListener("click", onDocClick);
  //   }, []);

  useEffect(() => {
    if (!selectedDay) return;
    const onEscape = (ev) => {
      if (ev.key === "Escape") setSelectedDay(null);
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [selectedDay]);

  const handleAddEvent = async () => {
    if (selectedDay && selectedCategory) {
      const categoryLabel = categoryOptions.find(
        (c) => c.id === parseInt(selectedCategory)
      )?.label;

      const newEvent = {
        title: categoryLabel, // event title is the category
        deadlineCategory: selectedCategory,
        date: selectedDay.key, // or selectedDay.date depending on your data
      };

      // update UI immediately
      addDeadline(selectedDay.key, newEvent);
      setSelectedDay((prev) => ({
        ...prev,
        events: [...(prev?.events || []), newEvent],
        count: (prev?.count || 0) + 1,
      }));

      console.log("first", newEvent)

      // send to backend
    //   try {
    //     const res = await fetch(`${ADMIN_END_POINT}/add-calender-event`, {
    //       method: "POST",
    //       headers: {
    //         "Content-Type": "application/json",
    //       },
    //       body: JSON.stringify(newEvent),
    //       credentials: "include",
    //     });

    //     const data = await res.json();
    //     console.log("Saved deadline:", data);
    //   } catch (err) {
    //     console.error("Error saving deadline:", err);
    //   }

      setSelectedCategory(""); // reset form
    }
  };

  return (
    <div className={styles.mainCalendarWrapper}>
      <Sidebar />

      <div className={styles.contentArea}>
        <h2 className={styles.title}>
          <FontAwesomeIcon icon={faCalendarAlt} /> Calendar Management
        </h2>

        <div className={styles.calendarContainer}>
          <div className={styles.calendarHeader}>
            <div className={styles.monthControls}>
              <button
                className={styles.navButton}
                onClick={() => changeMonth(-1)}
                aria-label="Previous month"
              >
                &lt;
              </button>
              <select
                className={styles.monthYearSelect}
                value={currentMonth}
                onChange={(e) => setCurrentMonth(parseInt(e.target.value))}
              >
                {monthNames.map((m, i) => (
                  <option key={i} value={i}>
                    {m}
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={currentYear}
                min="2000"
                max="2100"
                onChange={(e) => setCurrentYear(parseInt(e.target.value))}
              />
              <button
                className={styles.navButton}
                onClick={() => changeMonth(1)}
                aria-label="Next month"
              >
                &gt;
              </button>
            </div>
            <button className={styles.todayButton} onClick={goToToday}>
              Today
            </button>
          </div>

          <div className={styles.calendarMain}>
            <div className={styles.calendarGrid}>
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                <div key={d} className={styles.dayName}>
                  {d}
                </div>
              ))}

              {calendarCells.map((cell) => {
                if (cell.type === "empty")
                  return (
                    <div
                      key={cell.key}
                      className={`${styles.calendarDay} ${styles.empty}`}
                    />
                  );

                const cellClass = [
                  styles.calendarDay,
                  cell.isToday ? styles.currentDay : "",
                  cell.status === "past" && cell.hasDeadline
                    ? styles.pastWithEvent
                    : "",
                  cell.status === "upcoming" && cell.hasDeadline
                    ? styles.upcomingWithEvent
                    : "",
                ]
                  .filter(Boolean)
                  .join(" ");

                return (
                  <div
                    key={cell.key}
                    className={cellClass}
                    onClick={(e) => handleDayClick(cell, e)}
                  >
                    <div className={styles.dayNumber}>{cell.day}</div>

                    {cell.hasDeadline && (
                      <>
                        <span
                          className={`${styles.deadlineDot} ${
                            cell.status === "past"
                              ? styles.dotPast
                              : cell.status === "today"
                              ? styles.dotToday
                              : styles.dotUpcoming
                          }`}
                        />
                        <span className={styles.eventCount}>{cell.count}</span>
                      </>
                    )}

                    {cell.status === "past" && cell.hasDeadline && (
                      <span className={styles.overdueBadge}>
                        <FontAwesomeIcon icon={faExclamationTriangle} /> Overdue
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            <aside className={styles.agendaPanel}>
              <h3>
                Agenda — {monthNames[currentMonth]} {currentYear}
              </h3>
              {monthDeadlines.length === 0 && (
                <div className={styles.noEvents}>No deadlines this month.</div>
              )}
              {monthDeadlines.map((k) => {
                const events = normalizeEvents(deadlines[k]);
                return (
                  <div key={k} className={styles.eventItem}>
                    <strong>
                      {k.split("-").reverse().slice(0, 3).reverse().join("-")}
                    </strong>
                    <div className={styles.eventListCompact}>
                      {events.map((e, i) => (
                        <span key={i} className={styles.eventChip}>
                          {e.title}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </aside>
          </div>
        </div>
      </div>

      {selectedDay && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedDay(null)} // clicking overlay closes modal
        >
          <div
            ref={popupRef}
            id="calendar-details-popup"
            className={styles.detailsPopup}
            onClick={(e) => e.stopPropagation()} // clicks inside modal shouldn't close it
          >
            {/* Keep your existing content here unchanged */}
            <h4>
              Details — {selectedDay.key}{" "}
              {selectedDay.isToday && (
                <span className={styles.todayPill}>Today</span>
              )}
            </h4>

            {selectedDay.events?.length ? (
              <ul className={styles.popupEventList}>
                {selectedDay.events.map((ev, i) => (
                  <li key={i} className={styles.popupEventItem}>
                    {ev.title}
                  </li>
                ))}
              </ul>
            ) : (
              <div className={styles.noEvents}>No events for this date.</div>
            )}

            <div className={styles.addForm}>
              <label className={styles.addLabel} htmlFor="categorySelect">
                Register a new deadline
              </label>
              <div className={styles.addRow}>
                <select
                  id="categorySelect"
                  className={styles.addInput}
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">-- Select Deadline Category --</option>
                  {categoryOptions.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>

                <button
                  className={`${styles.popupButton} ${styles.addButton}`}
                  onClick={handleAddEvent}
                >
                  <FontAwesomeIcon icon={faPlus} /> Register Deadline
                </button>
              </div>
            </div>

            <div className={styles.popupButtons}>
              <button
                className={`${styles.popupButton} ${styles.closeButton}`}
                onClick={() => setSelectedDay(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
