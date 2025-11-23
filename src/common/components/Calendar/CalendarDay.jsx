import styles from "../styles/CalendarDay.module.css";

function CalendarDay({day, active}) {
  return (
    <button className={styles.calendarDay} disabled={!active}>
      {day}
    </button>
  );
}

export default CalendarDay;
