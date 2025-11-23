import styles from "../styles/CalendarMonth.module.css";
import CalendarWeek from "./CalendarWeek.jsx";

const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function CalendarMonth({ currentDate = new Date() }) {
  const day1 = new Date(currentDate.getFullYear(), currentDate.getMonth());
  const visibleWeeks = 6;
  return (
    <div className={styles.calendarMonth}>
      {Array.from({ length: visibleWeeks }, (_, index) => (
        <CalendarWeek
          day={new Date(day1.valueOf() + index * 7 * 24 * 60 * 60 * 1000)}
          activeMonthIndex={currentDate.getMonth()}
        />
      ))}
    </div>
  );
}

export default CalendarMonth;
