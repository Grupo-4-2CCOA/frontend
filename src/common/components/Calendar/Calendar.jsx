import { useState } from "react";
import styles from "../styles/Calendar.module.css";
import CalendarMonth from "./CalendarMonth.jsx";

function getMonthOffset(date, offset) {
  const newDate = new Date(date.getFullYear(), date.getMonth() + offset);
  return newDate;
}

function Calendar({ currentDate = new Date() }) {
  const [monthDate, setMonthDate] = useState(currentDate);
  return (
    <div className={styles.calendar}>
      <div className={styles.header}>
        <button onClick={() => setMonthDate(getMonthOffset(monthDate, -1))}>&lt;</button>
        <h3>{`${monthDate.toLocaleString('default', { month: 'long' })} - ${monthDate.getFullYear()}`}</h3>
        <button onClick={() => setMonthDate(getMonthOffset(monthDate, 1))}>&gt;</button>
      </div>
      <CalendarMonth currentDate={monthDate} />
    </div>
  );
}

export default Calendar;
