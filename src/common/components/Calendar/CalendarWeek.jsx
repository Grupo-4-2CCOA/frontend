import styles from "../styles/CalendarWeek.module.css";
import CalendarDay from "./CalendarDay";

/**
 *
 * @param {{ day: Date, activeMonthIndex: number }} param0
 * @returns
 */
function CalendarWeek({ day, activeMonthIndex }) {
  return (
    <div className={styles.calendarWeek}>
      {Array.from({ length: 7 }, (_, index) => {
        const currentDay = new Date(day.valueOf() + (index - day.getDay()) * 24 * 60 * 60 * 1000);
        return <CalendarDay day={currentDay.getDate()} active={currentDay.getMonth() === activeMonthIndex && currentDay >= Date.now()} />;
      })}
    </div>
  );
}

export default CalendarWeek;
