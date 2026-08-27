import React, { useState, useRef, useEffect } from 'react';
import './CustomDatePicker.css';

export default function CustomDatePicker({ value, onChange, placeholder = 'dd / mm / yyyy' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) return d;
    }
    return new Date();
  });

  const containerRef = useRef(null);

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) setViewDate(d);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDate = value ? new Date(value) : null;
  const isSelectedValid = selectedDate && !isNaN(selectedDate.getTime());

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setViewDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value, 10);
    setViewDate(new Date(newYear, currentMonth, 1));
  };

  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value, 10);
    setViewDate(new Date(currentYear, newMonth, 1));
  };

  const handleSelectDay = (day) => {
    const formattedMonth = String(currentMonth + 1).padStart(2, '0');
    const formattedDay = String(day).padStart(2, '0');
    const dateStr = `${currentYear}-${formattedMonth}-${formattedDay}`;
    onChange(dateStr);
    setIsOpen(false);
  };

  const handleClear = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onChange('');
    setIsOpen(false);
  };

  const handleToday = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const today = new Date();
    const formattedMonth = String(today.getMonth() + 1).padStart(2, '0');
    const formattedDay = String(today.getDate()).padStart(2, '0');
    const dateStr = `${today.getFullYear()}-${formattedMonth}-${formattedDay}`;
    setViewDate(today);
    onChange(dateStr);
    setIsOpen(false);
  };

  // Calendar Grid Math
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sun
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Previous month trailing days
  const prevDays = [];
  for (let i = firstDayOfMonth - 1; i >= 0; i--) {
    prevDays.push(daysInPrevMonth - i);
  }

  // Current month days
  const currentDays = [];
  for (let i = 1; i <= daysInMonth; i++) {
    currentDays.push(i);
  }

  // Next month leading days
  const totalCellsSoFar = prevDays.length + currentDays.length;
  const totalGridCells = totalCellsSoFar > 35 ? 42 : 35;
  const nextDays = [];
  for (let i = 1; i <= totalGridCells - totalCellsSoFar; i++) {
    nextDays.push(i);
  }

  // Display text in input box
  const formatDisplay = () => {
    if (!isSelectedValid) return '';
    const dd = String(selectedDate.getDate()).padStart(2, '0');
    const mm = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const yyyy = selectedDate.getFullYear();
    return `${dd} / ${mm} / ${yyyy}`;
  };

  // Year options generation (1920 to current year + 5)
  const years = [];
  const startYear = 1920;
  const endYear = new Date().getFullYear() + 5;
  for (let y = endYear; y >= startYear; y--) {
    years.push(y);
  }

  const todayObj = new Date();

  return (
    <div className="custom-datepicker-container" ref={containerRef}>
      <div 
        className={`custom-datepicker-trigger ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="datepicker-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </span>

        <span className={`datepicker-value ${!formatDisplay() ? 'placeholder' : ''}`}>
          {formatDisplay() || placeholder}
        </span>

        <span className="datepicker-calendar-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
        </span>
      </div>

      {isOpen && (
        <div className="custom-datepicker-popover">
          {/* Popover Header */}
          <div className="datepicker-header">
            <div className="datepicker-selectors">
              <select 
                value={currentMonth} 
                onChange={handleMonthChange}
                className="datepicker-select month-select"
              >
                {monthNames.map((month, idx) => (
                  <option key={month} value={idx}>{month}</option>
                ))}
              </select>

              <select 
                value={currentYear} 
                onChange={handleYearChange}
                className="datepicker-select year-select"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            <div className="datepicker-nav-btns">
              <button 
                type="button" 
                className="datepicker-nav-btn" 
                onClick={handlePrevMonth}
                title="Previous Month"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="18 15 12 9 6 15"></polyline>
                </svg>
              </button>
              <button 
                type="button" 
                className="datepicker-nav-btn" 
                onClick={handleNextMonth}
                title="Next Month"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="datepicker-weekdays">
            <span>S</span>
            <span>M</span>
            <span>T</span>
            <span>W</span>
            <span>T</span>
            <span>F</span>
            <span>S</span>
          </div>

          {/* Calendar Days Grid */}
          <div className="datepicker-days-grid">
            {prevDays.map(d => (
              <button key={`prev-${d}`} type="button" className="datepicker-day sibling-month" disabled>
                {d}
              </button>
            ))}

            {currentDays.map(d => {
              const isSelected = isSelectedValid && 
                selectedDate.getDate() === d && 
                selectedDate.getMonth() === currentMonth && 
                selectedDate.getFullYear() === currentYear;

              const isToday = todayObj.getDate() === d && 
                todayObj.getMonth() === currentMonth && 
                todayObj.getFullYear() === currentYear;

              return (
                <button
                  key={`curr-${d}`}
                  type="button"
                  className={`datepicker-day ${isSelected ? 'selected' : ''} ${isToday ? 'today' : ''}`}
                  onClick={() => handleSelectDay(d)}
                >
                  {d}
                </button>
              );
            })}

            {nextDays.map(d => (
              <button key={`next-${d}`} type="button" className="datepicker-day sibling-month" disabled>
                {d}
              </button>
            ))}
          </div>

          {/* Popover Footer Actions */}
          <div className="datepicker-footer">
            <button type="button" className="datepicker-action-btn clear-btn" onClick={handleClear}>
              Clear
            </button>
            <button type="button" className="datepicker-action-btn today-btn" onClick={handleToday}>
              Today
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
