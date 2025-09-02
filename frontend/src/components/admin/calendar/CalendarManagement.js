import React, { useState, useEffect } from "react";
import Sidebar from "../../Sidebar";
import styles from "../../../styles/calendar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";

export default function CalendarManagement({ userRole = "client" }) {
    const today = new Date();
    const [currentMonth, setCurrentMonth] = useState(today.getMonth());
    const [currentYear, setCurrentYear] = useState(today.getFullYear());
    const [selectedDay, setSelectedDay] = useState(null);
    const [deadlines, setDeadlines] = useState({
        "2025-08-05": ["VAT Filing Deadline"],
        "2025-08-15": ["Client Report Due", "GST Filing"],
        "2025-09-01": ["Payroll Submission"],
    });

    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    const getDateKey = (y, m, d) => `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

    const prevMonth = () => {
        setCurrentMonth(m => m === 0 ? 11 : m - 1);
        setCurrentYear(y => currentMonth === 0 ? y - 1 : y);
        setSelectedDay(null);
    };

    const nextMonth = () => {
        setCurrentMonth(m => m === 11 ? 0 : m + 1);
        setCurrentYear(y => currentMonth === 11 ? y + 1 : y);
        setSelectedDay(null);
    };

    const goToToday = () => {
        setCurrentMonth(today.getMonth());
        setCurrentYear(today.getFullYear());
    };

    const firstDay = new Date(currentYear, currentMonth, 1).getDay();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const calendarCells = [];

    for (let i = 0; i < firstDay; i++) calendarCells.push({ type: "empty", key: `empty-${i}` });
    for (let d = 1; d <= daysInMonth; d++) {
        const key = getDateKey(currentYear, currentMonth, d);
        const hasDeadline = deadlines[key]?.length > 0;
        const isToday = d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
        calendarCells.push({ type: "day", day: d, key, hasDeadline, isToday, count: deadlines[key]?.length || 0 });
    }

    const monthKeyPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-`;
    const monthDeadlines = Object.keys(deadlines).filter(k => k.startsWith(monthKeyPrefix)).sort();

    const addDeadline = (key, title) => setDeadlines(prev => ({ ...prev, [key]: [...(prev[key] || []), title] }));

    const handleDayClick = (cell, e) => {
        if (cell.type !== "day") return;
        setSelectedDay({ ...cell, x: e.clientX, y: e.clientY });
    };

    useEffect(() => {
        const onDocClick = ev => {
            const popup = document.getElementById("calendar-details-popup");
            if (popup?.contains(ev.target)) return;
            setSelectedDay(null);
        };
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, []);

    return (
        <div className={styles.mainCalendarContainer} style={{ display: "flex", backgroundColor: "#e2e4e5" }}>
            <Sidebar />
            <h2 className={styles.title}>
                <FontAwesomeIcon icon={faCalendarAlt} /> Calendar Management
            </h2>
            <div className={styles.calendarContainer}>
                <div className={styles.calendarHeader}>
                    <div className={styles.monthControls}>
                        <button className={styles.navButton} onClick={prevMonth}>&lt;</button>
                        <select className={styles.monthYearSelect} value={currentMonth} onChange={e => setCurrentMonth(parseInt(e.target.value))}>
                            {monthNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
                        </select>
                        <input type="number" value={currentYear} min="2000" max="2100" onChange={e => setCurrentYear(parseInt(e.target.value))} />
                        <button className={styles.navButton} onClick={nextMonth}>&gt;</button>
                    </div>
                    <button className={styles.navButton} onClick={goToToday}>Today</button>
                </div>

                <div className={styles.calendarMain}>
                    <div className={styles.calendarGrid}>
                        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(d => <div key={d} className={styles.dayName}>{d}</div>)}
                        {calendarCells.map(cell => {
                            if (cell.type === "empty") return <div key={cell.key} className={`${styles.calendarDay} ${styles.empty}`} />;
                            return (
                                <div key={cell.key} className={`${styles.calendarDay} ${cell.isToday ? styles.currentDay : ""}`} onClick={e => handleDayClick(cell, e)}>
                                    <div className={styles.dayNumber}>{cell.day}</div>
                                    {cell.hasDeadline && <span className={styles.deadlineDot} />}
                                    {cell.count > 0 && <span className={styles.eventCount}>{cell.count}</span>}
                                </div>
                            );
                        })}
                    </div>

                    <aside className={styles.agendaPanel}>
                        <h3>Agenda — {monthNames[currentMonth]} {currentYear}</h3>
                        {monthDeadlines.length === 0 && <div className={styles.noEvents}>No deadlines this month.</div>}
                        {monthDeadlines.map(k => (
                            <div key={k} className={styles.eventItem}>
                                <strong>{k.split("-").reverse().slice(0, 3).reverse().join("-")}</strong>
                                <div>{deadlines[k].join(" • ")}</div>
                            </div>
                        ))}
                    </aside>
                </div>

                {selectedDay && (
                    <div id="calendar-details-popup" className={styles.detailsPopup} style={{ top: selectedDay.y + 8, left: selectedDay.x - 140 }} onClick={e => e.stopPropagation()}>
                        <h4>Details — {selectedDay.key}</h4>
                        {deadlines[selectedDay.key]?.length ? (
                            <ul>{deadlines[selectedDay.key].map((ev, i) => <li key={i}>{ev}</li>)}</ul>
                        ) : <div className={styles.noEvents}>No events for this date.</div>}

                        {userRole === "admin" && (
                            <div className={styles.popupButtons}>
                                <button className={`${styles.popupButton} ${styles.addButton}`} onClick={() => {
                                    const title = prompt("Add event title:");
                                    if (title) addDeadline(selectedDay.key, title);
                                }}>Add</button>
                                <button className={`${styles.popupButton} ${styles.closeButton}`} onClick={() => setSelectedDay(null)}>Close</button>
                            </div>
                        )}
                        {userRole !== "admin" && <button className={`${styles.popupButton} ${styles.closeButton}`} onClick={() => setSelectedDay(null)}>Close</button>}
                    </div>
                )}
            </div>
        </div>
    );
}
