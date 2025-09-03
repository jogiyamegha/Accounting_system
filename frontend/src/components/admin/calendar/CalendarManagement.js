import React, { useState, useEffect, useMemo, useRef } from "react";
import Sidebar from "../../Sidebar";
import styles from "../../../styles/calendar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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

    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDay, setSelectedDay] = useState(null);
    const [deadlines, setDeadlines] = useState({});
    const [selectedCategory, setSelectedCategory] = useState("");

    const [filterDate, setFilterDate] = useState("");
    const [filterCategory, setFilterCategory] = useState("");

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

    let date;

    // 🔹 Reusable fetch function
    const fetchDeadlines = async () => {
        try {
            const res = await fetch(`${ADMIN_END_POINT}/all-calendar-events`, {
                method: "GET",
                credentials: "include",
            });
            console.log("res", res);
            const data = await res.json();
            console.log("data", data);

            const mapped = {};
            data.forEach((item) => {
                const dateKey = item.date.split("T")[0];
                const title = categoryMap[item.deadlineCategory] || "Unknown";

                if (!mapped[dateKey]) mapped[dateKey] = [];
                mapped[dateKey].push({
                    title,
                    deadlineCategory: item.deadlineCategory,
                    date: dateKey,
                });
            });

            setDeadlines(mapped);
        } catch (err) {
            toast.error("Error during fetching deadline");
            console.error("Error fetching deadlines:", err);
        }
    };

    useEffect(() => {
        fetchDeadlines();
    }, []);

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

    useEffect(() => {
        if (!selectedDay) return;
        const onEscape = (ev) => {
            if (ev.key === "Escape") setSelectedDay(null);
        };
        document.addEventListener("keydown", onEscape);
        return () => document.removeEventListener("keydown", onEscape);
    }, [selectedDay]);

    // 🔹 Add event + refresh DB
    const handleAddEvent = async () => {
        if (selectedDay && selectedCategory) {
            const newEvent = {
                deadlineCategory: selectedCategory,
                date: selectedDay.key,
            };

            try {
                await fetch(`${ADMIN_END_POINT}/add-calendar-event`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newEvent),
                    credentials: "include",
                });

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
            } catch (err) {
                toast.error("something went wrong in saving deadline");
                console.error("Error saving deadline:", err);
            }

            setSelectedCategory("");
        }
    };

    const filteredMonthDeadlines = monthDeadlines.filter((k) => {
        const events = deadlines[k] || [];

        // Date filter
        if (filterDate && k !== filterDate) return false;

        // Category filter
        if (
            filterCategory &&
            !events.some((ev) => ev.deadlineCategory.toString() === filterCategory)
        ) {
            return false;
        }
        return true;
    });

    const handleEditEvent = (dateKey, events) => {
        console.log("Edit all events on", dateKey, events);
        toast.info(`Editing events for ${dateKey}`);
        // 👉 You can open modal here with prefilled event data
    };

    const handleDeleteEvent = async (dateKey, events) => {
        try {
            // Example: delete all events of that date
            await Promise.all(
                events.map((ev) =>
                    fetch(`${ADMIN_END_POINT}/delete-calendar-event/${ev._id}`, {
                        method: "DELETE",
                        credentials: "include",
                    })
                )
            );
            toast.success(`Deleted events for ${dateKey}`);
            fetchDeadlines(); // refresh
        } catch (err) {
            toast.error("Failed to delete events");
            console.error("Delete error:", err);
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
                                                    className={`${styles.deadlineDot} ${cell.status === "past"
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
                                {/* <span className={styles.filterLabel}>Filters:</span> */}
                                <input
                                    type="date"
                                    value={filterDate}
                                    onChange={(e) => setFilterDate(e.target.value)}
                                />
                                <select
                                    value={filterCategory}
                                    onChange={(e) => setFilterCategory(e.target.value)}
                                >
                                    <option value="">All Categories</option>
                                    {Object.entries(categoryMap).map(([id, label]) => (
                                        <option key={id} value={id}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                {(filterDate || filterCategory) && (
                                    <button
                                        onClick={() => {
                                            setFilterDate("");
                                            setFilterCategory("");
                                        }}
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>

                            {/* Events List */}
                            {filteredMonthDeadlines.length === 0 && (
                                <div className={styles.noEvents}>No deadlines this month.</div>
                            )}
                            {filteredMonthDeadlines.map((k) => {
                                const events = deadlines[k] || [];
                                return (
                                    <div key={k} className={styles.eventItem}>
                                        <div className={styles.eventHeader}>
                                            <strong>{k}</strong>
                                            <div className={styles.actionIcons}>
                                                <FontAwesomeIcon
                                                    icon={faPen}
                                                    className={styles.iconButton}
                                                    onClick={() => handleEditEvent(k, events)}
                                                />
                                                <FontAwesomeIcon
                                                    icon={faTrash}
                                                    className={styles.iconButton}
                                                    onClick={() => handleDeleteEvent(k, events)}
                                                />
                                            </div>
                                        </div>

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
                    onClick={() => setSelectedDay(null)}
                >
                    <div
                        ref={popupRef}
                        id="calendar-details-popup"
                        className={styles.detailsPopup}
                        onClick={(e) => e.stopPropagation()}
                    >
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
                                    {Object.entries(categoryMap).map(([id, label]) => (
                                        <option key={id} value={id}>
                                            {label}
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
