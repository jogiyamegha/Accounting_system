import { useState, useEffect } from "react";
import Sidebar from "../../Sidebar";

// CalendarManagement.jsx
// Full self-contained React component with embedded CSS injection.
// Features:
// - Month navigation
// - Deadlines/events per date
// - Highlighted days with deadlines (dot + border)
// - Side panel "Agenda" listing deadlines for selected month
// - Click a day to open a small details panel
// - Optional notification for today's deadlines

export default function CalendarManagement() {
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

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Selected day for showing details
  const [selectedDay, setSelectedDay] = useState(null); // { year, month, day }

  // Example deadlines store. In real app you would fetch these from backend.
  // Format: { "YYYY-MM-DD": ["Event 1", "Event 2"] }
  const [deadlines, setDeadlines] = useState({
    "2025-08-05": ["VAT Filing Deadline"],
    "2025-08-15": ["Client Report Due", "GST Filing"],
    "2025-09-01": ["Payroll Submission"],
  });

  // Inject component-specific CSS once
  useEffect(() => {
    const id = "calendar-management-styles";
    if (document.getElementById(id)) return;

    const style = document.createElement("style");
    style.id = id;
    style.innerHTML = `
      .calendar-page { display: flex; }
      .calendar-container { font-family: Arial, sans-serif; padding: 20px; background-color: #fff; color: #333; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.08); width: calc(100% - 280px); margin-left: 260px; margin-top: 20px; box-sizing: border-box; }
      .calendar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding-bottom: 10px; border-bottom: 1px solid #eee; }
      .calendar-header .nav-button { background: none; border: none; font-size: 20px; color: #555; cursor: pointer; padding: 6px; }
      .calendar-header .nav-button:hover { color: #007bff; }
      .calendar-header .month-year { font-size: 20px; font-weight: 700; }
      .calendar-main { display: grid; grid-template-columns: 1fr 320px; gap: 20px; }
      .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 8px; text-align: center; }
      .day-name { font-weight: 600; color: #666; font-size: 12px; padding: 6px 0; }
      .calendar-day { display: flex; justify-content: center; align-items: center; height: 70px; background-color: #fafafa; border: 1px solid #e6e6e6; border-radius: 8px; font-size: 14px; color: #333; position: relative; cursor: pointer; transition: transform .08s ease, box-shadow .08s ease; }
      .calendar-day:hover { transform: translateY(-3px); box-shadow: 0 6px 14px rgba(16,24,40,0.06); }
      .calendar-day.empty { background: transparent; border: none; cursor: default; box-shadow: none; transform: none; }
      .calendar-day.current-day { background-color: #e6f0ff; border-color: #9fc5ff; color: #0b4da0; font-weight: 700; }
      .deadline-day { border: 2px solid #ff8c00; }
      .deadline-dot { position: absolute; bottom: 6px; right: 6px; width: 8px; height: 8px; background-color: #ff3b30; border-radius: 50%; }
      .day-number { position: absolute; top: 8px; left: 10px; font-weight: 700; }
      .agenda-panel { background: #fff; border: 1px solid #eaeaea; border-radius: 8px; padding: 12px; box-shadow: 0 6px 18px rgba(16,24,40,0.04); height: fit-content; }
      .agenda-panel h3 { margin: 0 0 8px 0; font-size: 16px; }
      .event-item { background: #fff7e6; border-left: 4px solid #ff8c00; padding: 8px; margin-bottom: 8px; border-radius: 4px; font-size: 13px; }
      .no-events { color: #777; font-size: 13px; }
      .details-popup { position: absolute; z-index: 40; background: white; border: 1px solid #ddd; padding: 12px; border-radius: 8px; box-shadow: 0 8px 24px rgba(16,24,40,0.12); width: 260px; }
      .details-popup h4 { margin: 0 0 8px 0; }
      .month-controls { display:flex; gap:8px; align-items:center; }

      /* Responsive tweaks */
      @media (max-width: 900px) {
        .calendar-container { width: calc(100% - 40px); margin-left: 20px; margin-right: 20px; }
        .calendar-main { grid-template-columns: 1fr; }
      }
    `;

    document.head.appendChild(style);
  }, []);

  // Helper: format date key YYYY-MM-DD
  const getDateKey = (y, m, d) => {
    const mm = String(m + 1).padStart(2, "0");
    const dd = String(d).padStart(2, "0");
    return `${y}-${mm}-${dd}`;
  };

  // Prev / Next month handlers
  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  // Compute calendar grid data
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Build grid
  const calendarCells = [];
  for (let i = 0; i < firstDay; i++) {
    calendarCells.push({ type: "empty", key: `empty-${i}` });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const key = getDateKey(currentYear, currentMonth, d);
    const hasDeadline = deadlines[key] && deadlines[key].length > 0;
    const isToday =
      d === today.getDate() &&
      currentMonth === today.getMonth() &&
      currentYear === today.getFullYear();

    calendarCells.push({ type: "day", day: d, key, hasDeadline, isToday });
  }

  // Agenda: list deadlines for selected month
  const monthKeyPrefix = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-`;
  const monthDeadlines = Object.keys(deadlines)
    .filter((k) => k.startsWith(monthKeyPrefix))
    .sort();

  // Notification for todays deadlines (runs on mount)
  useEffect(() => {
    const todayKey = getDateKey(today.getFullYear(), today.getMonth(), today.getDate());
    if (deadlines[todayKey]) {
      // You can replace alert with a nicer UI/Toast in your app
      // Only show once
      // eslint-disable-next-line no-alert
      alert("Today's Deadlines: " + deadlines[todayKey].join(", "));
    }
  }, []); // empty deps so it runs once

  // Add new deadline (example of interacting with calendar)
  const addDeadline = (dateKey, title) => {
    setDeadlines((prev) => {
      const copy = { ...prev };
      if (!copy[dateKey]) copy[dateKey] = [];
      copy[dateKey] = [...copy[dateKey], title];
      return copy;
    });
  };

  // Click day handler: open details panel anchored near the clicked cell
  const handleDayClick = (cell, e) => {
    if (cell.type !== "day") return;
    setSelectedDay({ key: cell.key, day: cell.day, x: e.clientX, y: e.clientY });
  };

  // Close details popup when clicking outside — simple global handler
  useEffect(() => {
    const onDocClick = (ev) => {
      // if click is inside popup, ignore
      const popup = document.getElementById("calendar-details-popup");
      if (popup && popup.contains(ev.target)) return;
      setSelectedDay(null);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  return (
    <div className="calendar-page">
      <Sidebar />
      <div className="calendar-container">
        <div className="calendar-header">
          <div className="month-controls">
            <button className="nav-button" onClick={prevMonth} aria-label="Previous month">&lt;</button>
            <span className="month-year">{monthNames[currentMonth]} {currentYear}</span>
            <button className="nav-button" onClick={nextMonth} aria-label="Next month">&gt;</button>
          </div>
          <div>
            <button className="nav-button" onClick={() => { setCurrentMonth(today.getMonth()); setCurrentYear(today.getFullYear()); }} title="Go to current month">Today</button>
          </div>
        </div>

        <div className="calendar-main">
          <div>
            <div className="calendar-grid">
              <div className="day-name">Sunday</div>
              <div className="day-name">Monday</div>
              <div className="day-name">Tuesday</div>
              <div className="day-name">Wednesday</div>
              <div className="day-name">Thursday</div>
              <div className="day-name">Friday</div>
              <div className="day-name">Saturday</div>

              {calendarCells.map((cell) => {
                if (cell.type === "empty") {
                  return <div key={cell.key} className="calendar-day empty" />;
                }

                return (
                  <div
                    key={cell.key}
                    className={`calendar-day ${cell.isToday ? "current-day" : ""} ${cell.hasDeadline ? "deadline-day" : ""}`}
                    onClick={(e) => handleDayClick(cell, e)}
                    title={cell.hasDeadline ? deadlines[cell.key].join(", ") : ""}
                  >
                    <div className="day-number">{cell.day}</div>
                    {cell.hasDeadline && <span className="deadline-dot" />}
                  </div>
                );
              })}
            </div>
          </div>

          <aside className="agenda-panel">
            <h3>Agenda — {monthNames[currentMonth]} {currentYear}</h3>
            {monthDeadlines.length === 0 && <div className="no-events">No deadlines this month.</div>}

            {monthDeadlines.map((k) => (
              <div key={k} className="event-item">
                <strong>{k.split("-").reverse().slice(0,3).reverse().join("-")}</strong>
                <div style={{ marginTop: 6 }}>{deadlines[k].join(" • ")}</div>
              </div>
            ))}

            <div style={{ marginTop: 12 }}>
              <button
                onClick={() => {
                  // Demo: add a deadline to the 15th of the current month
                  const newKey = getDateKey(currentYear, currentMonth, 15);
                  addDeadline(newKey, "New Deadline (added)");
                }}
                style={{ padding: "8px 12px", borderRadius: 6, border: "none", background: "#007bff", color: "white", cursor: "pointer" }}
              >
                Add sample deadline (15th)
              </button>
            </div>
          </aside>
        </div>

        {/* Details popup for selected day */}
        {selectedDay && (
          <div
            id="calendar-details-popup"
            className="details-popup"
            style={{ top: selectedDay.y + 8, left: selectedDay.x - 140 }}
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Details — {selectedDay.key}</h4>
            {deadlines[selectedDay.key] ? (
              <ul>
                {deadlines[selectedDay.key].map((ev, idx) => (
                  <li key={idx}>{ev}</li>
                ))}
              </ul>
            ) : (
              <div className="no-events">No events for this date.</div>
            )}

            <div style={{ marginTop: 8 }}>
              <button
                onClick={() => {
                  // example: add quick event to selected day
                  const title = prompt("Add event title:");
                  if (title) addDeadline(selectedDay.key, title);
                }}
                style={{ padding: "6px 10px", marginRight: 8, borderRadius: 6, border: "none", background: "#28a745", color: "white", cursor: "pointer" }}
              >
                Add
              </button>
              <button
                onClick={() => setSelectedDay(null)}
                style={{ padding: "6px 10px", borderRadius: 6, border: "1px solid #ddd", background: "white", cursor: "pointer" }}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
