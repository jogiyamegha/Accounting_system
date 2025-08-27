import '../../../styles/calendar.css';
import Sidebar from '../../Sidebar';

export default function CalendarManagment() {
  // Array of month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Get current date
  const date = new Date();
  const currentMonth = date.getMonth();
  const currentYear = date.getFullYear();
  const today = date.getDate();

  // Get the first day of the month and the number of days in the current month
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  // Generate an array for the calendar days
  const calendarDays = [];

  // Add empty cells for the days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }

  // Add the days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    const isToday = i === today;
    calendarDays.push(
      <div
        key={`day-${i}`}
        className={`calendar-day ${isToday ? 'current-day' : ''}`}
      >
        {i}
      </div>
    );
  }

  return (
    <div className="calendar-container">
        <Sidebar />
      <div className="calendar-header">
        <button className="nav-button">&lt;</button>
        <span className="month-year">{monthNames[currentMonth]} {currentYear}</span>
        <button className="nav-button">&gt;</button>
      </div>
      <div className="calendar-grid">
        <div className="day-name">Sunday</div>
        <div className="day-name">Monday</div>
        <div className="day-name">Tuesday</div>
        <div className="day-name">Wednesday</div>
        <div className="day-name">Thursday</div>
        <div className="day-name">Friday</div>
        <div className="day-name">Saturday</div>
        {calendarDays}
      </div>
    </div>
  );
};

