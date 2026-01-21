import { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  AlertCircle,
  ChevronRight,
  Loader,
  ChevronLeft,
} from "lucide-react";

export default function DashboardCalendar() {
  const [appointments, setAppointments] = useState([]);
  const [taskInstances, setTaskInstances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    fetchCalendarData();
  }, [selectedDate]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);

      // Fetch appointments for date range (30 days from selected date)
      const startDate = new Date(selectedDate);
      startDate.setDate(startDate.getDate() - 15);
      const endDate = new Date(selectedDate);
      endDate.setDate(endDate.getDate() + 15);

      const appointmentRes = await fetch(
        `/api/appointments?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      );
      const appointmentData = await appointmentRes.json();
      setAppointments(Array.isArray(appointmentData) ? appointmentData : []);

      // Fetch task instances for selected date
      const taskRes = await fetch(
        `/api/tasks/instances?date=${selectedDate.toISOString().split("T")[0]}`,
      );
      const taskData = await taskRes.json();
      setTaskInstances(Array.isArray(taskData) ? taskData : []);
    } catch (error) {
      console.error("Error fetching calendar data:", error);
      setAppointments([]);
      setTaskInstances([]);
    } finally {
      setLoading(false);
    }
  };

  // Generate calendar days
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const calendarDays = [];
  const firstDay = getFirstDayOfMonth(currentMonth);
  const daysInMonth = getDaysInMonth(currentMonth);

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    calendarDays.push(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i),
    );
  }

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

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const isToday = (date) => {
    const today = new Date();
    return (
      date &&
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date) => {
    return (
      date &&
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const getAppointmentsForDate = (date) => {
    if (!date) return [];
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startDate);
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const previousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1),
    );
  };

  const nextMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1),
    );
  };

  const upcomingAppointments = appointments
    .filter((apt) => new Date(apt.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar */}
      <div className="lg:col-span-2 rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-6">
          <Calendar className="text-blue-500" size={24} />
          <h2 className="text-2xl font-bold">Calendar</h2>
        </div>

        {/* Month/Year Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded transition"
          >
            <ChevronLeft size={20} />
          </button>
          <h3 className="text-xl font-semibold">
            {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded transition"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {dayNames.map((day) => (
            <div
              key={day}
              className="text-center font-semibold text-gray-600 text-sm py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((date, index) => {
            const appointmentsForDate = getAppointmentsForDate(date);
            return (
              <button
                key={index}
                onClick={() => date && setSelectedDate(date)}
                className={`
                  aspect-square p-2 rounded-lg text-sm font-medium transition
                  ${
                    !date
                      ? "bg-gray-50 cursor-default"
                      : isSelected(date)
                        ? "bg-blue-500 text-white"
                        : isToday(date)
                          ? "bg-blue-100 text-blue-900 border-2 border-blue-400"
                          : "bg-gray-50 hover:bg-blue-50"
                  }
                  ${appointmentsForDate.length > 0 ? "ring-2 ring-orange-400" : ""}
                `}
              >
                {date && (
                  <div className="h-full flex flex-col items-center justify-center">
                    <span>{date.getDate()}</span>
                    {appointmentsForDate.length > 0 && (
                      <span className="text-xs">
                        {appointmentsForDate.length} apt
                      </span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Upcoming Appointments Sidebar */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="text-orange-500" size={24} />
          <h2 className="text-xl font-bold">Upcoming</h2>
        </div>

        {upcomingAppointments.length > 0 ? (
          <div className="space-y-4">
            {upcomingAppointments.map((apt) => (
              <div
                key={apt._id}
                className="border-l-4 border-orange-500 pl-4 py-2 hover:bg-gray-50 transition rounded"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {apt.petId?.name}
                    </p>
                    <p className="text-sm text-gray-600">{apt.title}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(apt.startDate).toLocaleDateString()}{" "}
                      {new Date(apt.startDate).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className="text-gray-400 flex-shrink-0"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-500">No upcoming appointments</p>
          </div>
        )}
      </div>

      {/* Today's Tasks */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Today's Tasks</h2>
        {taskInstances.length > 0 ? (
          <div className="space-y-3">
            {taskInstances.map((task) => (
              <div
                key={task._id}
                className={`p-3 rounded border ${
                  task.isCompleted
                    ? "bg-gray-100 border-gray-300"
                    : "bg-blue-50 border-blue-300"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p
                      className={`font-medium ${
                        task.isCompleted
                          ? "line-through text-gray-500"
                          : "text-gray-900"
                      }`}
                    >
                      {task.title}
                    </p>
                    <p className="text-xs text-gray-600">{task.time}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => {}}
                    className="mt-1"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500">No tasks for today</p>
        )}
      </div>
    </div>
  );
}
