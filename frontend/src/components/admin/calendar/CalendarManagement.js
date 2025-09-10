import React, { useState, useEffect, useMemo, useRef } from "react";
import Sidebar from "../../Sidebar";
import styles from "../../../styles/calendar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faArrowLeft,
  faCalendarAlt,
  faExclamationTriangle,
  faPen,
  faPlus,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import { ADMIN_END_POINT } from "../../../utils/constants";
import { toast } from "react-toastify";

const categoryMap = {
  1: "VAT Filing",
  2: "Corporate Tax Return",
  3: "Payroll",
  4: "Audit",
};

export default function CalendarManagement() {
  const navigate = useNavigate();
  const popupRef = useRef(null);

  const today = useMemo(() => {
    const t = new Date();
    t.setHours(0, 0, 0, 0);
    return t;
  }, []);

  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState("");

  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [selectedDay, setSelectedDay] = useState(null);
  const [deadlines, setDeadlines] = useState({});
  const [selectedCategory, setSelectedCategory] = useState("");

  const [filterDate, setFilterDate] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterClient, setFilterClient] = useState("");

  // 🔹 Edit modal states
  const [editingDateKey, setEditingDateKey] = useState(null);
  const [editingEvents, setEditingEvents] = useState([]); // array of events

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

  // 🔹 Fetch deadlines
  const fetchDeadlines = async () => {
    try {
      const res = await fetch(`${ADMIN_END_POINT}/all-calendar-events`, {
        method: "GET",
        credentials: "include",
      });
      const data = await res.json();
      // console.log("data", data);

      const mapped = {};
      data.forEach((item) => {
        const dateKey = item.date.split("T")[0];
        const title = categoryMap[item.deadlineCategory] || "Unknown";

        // Extract client names
        const clients = (item.associatedClients || []).map((c) => ({
          name: c.clientDetails?.clientName || "Unknown Client",
          email: c.clientDetails?.clientEmail || "Unknown Email",
        }));

        if (!mapped[dateKey]) mapped[dateKey] = [];
        mapped[dateKey].push({
          _id: item._id,
          title,
          deadlineCategory: item.deadlineCategory,
          date: dateKey,
          clients,
        });
      });

      setDeadlines(mapped);
    } catch (err) {
      toast.error("Error during fetching deadline");
      console.error("Error fetching deadlines:", err);
    }
  };

  const fetchClients = async () => {
    try {
      const res = await fetch(`${ADMIN_END_POINT}/fetch-clients`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) toast.error(data.error || "Failed to fetch clients");
      setClients(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load clients");
    }
  };

  useEffect(() => {
    fetchDeadlines();
    fetchClients();
  }, []);

  // 🔹 All client names extracted from deadlines (for filter dropdown)
  const allClients = (clients.records || [])
    .map((c) => c.name) // take the client name
    .filter(Boolean) // remove null/undefined
    .sort((a, b) => a.localeCompare(b));

  // Build calendar cells
  const calendarCells = [];
  for (let i = 0; i < firstDay; i++)
    calendarCells.push({ type: "empty", key: `empty-${i}` });
  for (let d = 1; d <= daysInMonth; d++) {
    const key = getDateKey(currentYear, currentMonth, d);
    const events = deadlines[key] || [];
    const hasDeadline = events.length > 0;
    const status = compareWithToday(currentYear, currentMonth, d);
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
  }

  const monthKeyPrefix = `${currentYear}-${String(currentMonth + 1).padStart(
    2,
    "0"
  )}-`;

  const monthDeadlines = Object.keys(deadlines)
    .filter((k) => k.startsWith(monthKeyPrefix))
    .sort();

  const handleDayClick = (cell, e) => {
    e.stopPropagation();
    if (cell.type !== "day") return;
    setSelectedDay({ ...cell });
    setSelectedCategory("");
  };

  const handleAddEvent = async () => {
    if (selectedDay && selectedCategory) {
      const newEvent = {
        deadlineCategory: selectedCategory,
        date: selectedDay.key,
        clientEmail: selectedClient,
      };

      try {
        let response = await fetch(`${ADMIN_END_POINT}/add-calendar-event`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEvent),
          credentials: "include",
        });

        if (!response.ok) {
          let errorData = await response.json();
          toast.error(errorData.error || "Unable to set Event");
        }

        toast.success("Event added successfully");
        await fetchDeadlines();

        setSelectedDay((prev) =>
          prev
            ? {
                ...prev,
                events: deadlines[prev.key] || [],
                count: (deadlines[prev.key] || []).length,
              }
            : prev
        );
        navigate(0);
      } catch (err) {
        toast.error("something went wrong in saving deadline");
        console.error("Error saving deadline:", err);
      }

      setSelectedCategory("");
      setSelectedClient("");
    } else {
      toast.error("Please select both category and client");
    }
  };

  const filteredMonthDeadlines = monthDeadlines.filter((dateKey) => {
    const events = deadlines[dateKey] || [];

    // Strict filter by date
    if (filterDate && dateKey !== filterDate) return false;

    // Strict filter by category: at least one event must exactly match the category
    if (
      filterCategory &&
      !events.some((ev) => ev.deadlineCategory.toString() === filterCategory)
    ) {
      return false;
    }

    // Strict filter by client name: at least one event must have a client exactly matching the name
    if (
      filterClient &&
      !events.some(
        (ev) => ev.clients.some((c) => c.name === filterClient) // exact match
      )
    ) {
      return false;
    }

    return true;
  });

  // 🔹 Open edit modal for all events on date
  // Flatten events for editing, one entry per client
  const handleEditEvent = (dateKey, events) => {
    const flattenedEvents = events.flatMap((ev) =>
      ev.clients.map((client, idx) => ({
        _id: `${ev._id}-${client.email}-${idx}`, // unique per client
        originalEventId: ev._id, // reference to original event
        title: ev.title,
        deadlineCategory: ev.deadlineCategory,
        date: ev.date,
        clientEmail: client.email,
      }))
    );

    setEditingDateKey(dateKey);
    setEditingEvents(flattenedEvents);
  };

  // Save edited events
  const saveEditedEvents = async () => {
    try {
      await Promise.all(
        editingEvents.map((ev) =>
          fetch(
            `${ADMIN_END_POINT}/edit-calendar-event/${ev.originalEventId}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                deadlineCategory: ev.deadlineCategory,
                date: ev.date,
                clientEmail: ev.clientEmail,
              }),
              credentials: "include",
            }
          )
        )
      );

      toast.success("Events updated successfully");
      setEditingDateKey(null);
      setEditingEvents([]);
      await fetchDeadlines();
      navigate(0);
    } catch (err) {
      toast.error("Error updating events");
      console.error("Update error:", err);
    }
  };

  const handleDeleteEvent = async (dateKey, events) => {
    try {
      await Promise.all(
        events.map((ev) =>
          fetch(`${ADMIN_END_POINT}/delete-calendar-event/${ev._id}`, {
            method: "DELETE",
            credentials: "include",
          })
        )
      );
      toast.success(`Deleted events for ${dateKey}`);
      fetchDeadlines();
    } catch (err) {
      toast.error("Failed to delete events");
      console.error("Delete error:", err);
    }
  };

  return (
    <div className={styles.mainCalendarWrapper}>
      <Sidebar />

      <div className={styles.contentArea}>
        <div className={styles.title}>
          <h1>
            <FontAwesomeIcon icon={faCalendarAlt} /> Calendar Management
          </h1>
        </div>

        <div className={styles.calendarContainer}>
          <div className={styles.calendarHeader}>
            <div className={styles.monthControls}>
              <button
                className={styles.navButton}
                onClick={() => changeMonth(-1)}
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
              >
                &gt;
              </button>
            </div>
            <div className={styles.tagSection}>
              <button className={styles.todayButton} onClick={goToToday}>
                Today
              </button>
              <ul>
                <li className={styles.tags}>Today</li>
                <li className={styles.tags}>Upcoming</li>
                <li className={styles.tags}>Past</li>
              </ul>
            </div>
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
              {/* Filters */}
              <div className={styles.filters}>
                <input
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  <option value="">Categories</option>
                  {Object.entries(categoryMap).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
                <select
                  value={filterClient}
                  onChange={(e) => setFilterClient(e.target.value)}
                >
                  <option value="">Clients</option>
                  {allClients.map((name, idx) => (
                    <option key={idx} value={name}>
                      {name}
                    </option>
                  ))}
                </select>
                {(filterDate || filterCategory || filterClient) && (
                  <button
                    onClick={() => {
                      setFilterDate("");
                      setFilterCategory("");
                      setFilterClient("");
                    }}
                  >
                    Clear Filters
                  </button>
                )}
              </div>
              {/* Events List */}
              {/* Events List */}{" "}
              {filteredMonthDeadlines.length === 0 && (
                <div className={styles.noEvents}>No Events this month.</div>
              )}{" "}
              {filteredMonthDeadlines
                .flatMap((dateKey) => {
                  const events = deadlines[dateKey] || [];
                  return events.flatMap((e) =>
                    e.clients.map((client, idx) => ({
                      _id: `${e._id}-${client.email}-${idx}`,
                      title: e.title,
                      clientName: client.name,
                      clientEmail: client.email,
                      dateKey,
                      originalEvent: e,
                    }))
                  );
                }) // ADD THIS NEW FILTER
                .filter((ev) => {
                  // Filter by client name if a client is selected
                  if (filterClient && ev.clientName !== filterClient) {
                    return false;
                  } // Filter by category if a category is selected

                  if (
                    filterCategory &&
                    ev.originalEvent.deadlineCategory.toString() !==
                      filterCategory
                  ) {
                    return false;
                  }
                  return true;
                })
                .map((ev) => (
                  <div key={ev._id} className={styles.eventItem}>
                    {" "}
                    <div className={styles.eventHeader}>
                      {" "}
                      <strong>
                        {" "}
                        {new Date(ev.dateKey).toLocaleDateString("en-GB")}{" "}
                      </strong>{" "}
                      <div className={styles.actionIcons}>
                        {" "}
                        <FontAwesomeIcon
                          icon={faPen}
                          className={styles.iconButton}
                          onClick={() =>
                            handleEditEvent(ev.dateKey, [ev.originalEvent])
                          }
                        />{" "}
                        <FontAwesomeIcon
                          icon={faTrash}
                          className={styles.iconButton}
                          onClick={() =>
                            handleDeleteEvent(ev.dateKey, [ev.originalEvent])
                          }
                        />{" "}
                      </div>{" "}
                    </div>
                    <div className={styles.eventListCompact}>
                      <span className={styles.eventChip}>
                        {ev.title} : {ev.clientName} ({ev.clientEmail})
                      </span>
                    </div>
                  </div>
                ))}
            </aside>
          </div>
        </div>

        <button
          className={styles.backButton}
          onClick={() => window.history.back()}
        >
          Back
          <div className={styles.icon}>
            <FontAwesomeIcon icon={faArrowLeft} />
          </div>
        </button>
      </div>

      {/* 🔹 Add Event Popup */}
      {selectedDay && (
        <div
          className={styles.modalOverlay}
          onClick={() => setSelectedDay(null)}
        >
          <div
            ref={popupRef}
            className={styles.detailsPopup}
            onClick={(e) => e.stopPropagation()}
          >
            <h4>
              Details — {new Date(selectedDay.key).toLocaleDateString("en-GB")}{" "}
              {selectedDay.isToday && (
                <span className={styles.todayPill}>Today</span>
              )}
            </h4>

            {selectedDay.events?.length ? (
              <ul className={styles.popupEventList}>
                {selectedDay.events.map((ev, i) => (
                  <li key={i} className={styles.popupEventItem}>
                    {ev.title} —{" "}
                    <span className={styles.clientEmail}>
                      {ev.clients.join(", ")}
                    </span>
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
                  <option value="">-- Select Event Category --</option>
                  {Object.entries(categoryMap).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>

                <select
                  id="clientSelect"
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  required
                  className={styles.addInput}
                >
                  <option value="">-- Select Client Email --</option>
                  {clients.records?.map((client) => (
                    <option key={client._id} value={client.email}>
                      {client.email}
                    </option>
                  ))}
                </select>

                <button
                  className={`${styles.popupButton} ${styles.addButton}`}
                  onClick={handleAddEvent}
                >
                  <FontAwesomeIcon icon={faPlus} /> Register Event
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

      {editingDateKey && (
        <div
          className={styles.modalOverlay}
          onClick={() => setEditingDateKey(null)}
        >
          <div
            className={styles.detailsPopup}
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Edit Events — {editingDateKey}</h4>

            {editingEvents.map((ev, i) => (
              <div key={ev._id} className={styles.addRow}>
                <span className={styles.eventLabel}>Event {i + 1}:</span>

                {/* Category Selector */}
                <select
                  value={ev.deadlineCategory}
                  onChange={(e) => {
                    const newEvents = [...editingEvents];
                    newEvents[i].deadlineCategory = parseInt(e.target.value);
                    setEditingEvents(newEvents);
                  }}
                  className={styles.addInput}
                >
                  {Object.entries(categoryMap).map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>

                {/* Date Input */}
                <input
                  type="date"
                  value={ev.date}
                  onChange={(e) => {
                    const newEvents = [...editingEvents];
                    newEvents[i].date = e.target.value;
                    setEditingEvents(newEvents);
                  }}
                  className={styles.addInput}
                />

                {/* Client Email Selector */}
                <select
                  value={ev.clientEmail}
                  onChange={(e) => {
                    const newEvents = [...editingEvents];
                    newEvents[i].clientEmail = e.target.value;
                    setEditingEvents(newEvents);
                  }}
                  className={styles.addInput}
                >
                  {clients.records?.map((client) => (
                    <option key={client._id} value={client.email}>
                      {client.email}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            <div className={styles.popupButtons}>
              <button
                className={`${styles.popupButton} ${styles.addButton}`}
                onClick={saveEditedEvents}
              >
                Save Changes
              </button>
              <button
                className={`${styles.popupButton} ${styles.closeButton}`}
                onClick={() => setEditingDateKey(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
