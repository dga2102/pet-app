"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  ArrowLeft,
  Edit,
  Trash2,
  Loader,
  X,
} from "lucide-react";

export default function CalendarPage() {
  const router = useRouter();
  const [appointments, setAppointments] = useState([]);
  const [pets, setPets] = useState([]);
  const [members, setMembers] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [filters, setFilters] = useState({
    petId: "",
    assignedTo: "",
  });
  const [formData, setFormData] = useState({
    petId: "",
    assignedTo: "",
    title: "",
    appointmentType: "vet-checkup",
    startDate: "",
    endDate: "",
    notes: "",
    location: "",
  });

  useEffect(() => {
    fetchData();
  }, [currentMonth, filters]);

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch user info
      const userResponse = await fetch("/api/auth/me");
      const userData = await userResponse.json();

      if (!userData.user) {
        router.push("/login");
        return;
      }

      setCurrentUser(userData.user);

      // Fetch household members
      const membersResponse = await fetch("/api/household/members");
      const membersData = await membersResponse.json();

      if (membersData.success) {
        setMembers(membersData.members);
        const currentMember = membersData.members.find(
          (m) => m.id.toString() === userData.user.id.toString(),
        );
        setIsOwner(currentMember?.role === "owner");
      }

      // Fetch pets
      const petsResponse = await fetch("/api/pets");
      const petsData = await petsResponse.json();
      setPets(Array.isArray(petsData) ? petsData : []);

      // Fetch appointments for current month +/- 15 days
      const startDate = new Date(currentMonth);
      startDate.setDate(1);
      startDate.setDate(startDate.getDate() - 15);
      const endDate = new Date(currentMonth);
      endDate.setMonth(endDate.getMonth() + 1);
      endDate.setDate(15);

      let appointmentsUrl = `/api/appointments?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`;
      if (filters.petId) appointmentsUrl += `&petId=${filters.petId}`;
      if (filters.assignedTo)
        appointmentsUrl += `&assignedTo=${filters.assignedTo}`;

      const appointmentsResponse = await fetch(appointmentsUrl);
      const appointmentsData = await appointmentsResponse.json();
      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const calendarDays = [];
  const firstDay = getFirstDayOfMonth(currentMonth);
  const daysInMonth = getDaysInMonth(currentMonth);

  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

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

  const getSelectedDateAppointments = () => {
    return getAppointmentsForDate(selectedDate);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (editingAppointment) {
        response = await fetch(`/api/appointments/${editingAppointment._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch("/api/appointments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        await fetchData();
        resetForm();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to save appointment"}`);
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
      alert("Error saving appointment. Please try again.");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingAppointment(null);
    setFormData({
      petId: "",
      assignedTo: "",
      title: "",
      appointmentType: "vet-checkup",
      startDate: "",
      endDate: "",
      notes: "",
      location: "",
    });
  };

  const handleEdit = (appointment) => {
    setEditingAppointment(appointment);
    setFormData({
      petId: appointment.petId?._id || appointment.petId,
      assignedTo: appointment.assignedTo?._id || appointment.assignedTo,
      title: appointment.title,
      appointmentType: appointment.appointmentType,
      startDate: new Date(appointment.startDate).toISOString().slice(0, 16),
      endDate: new Date(appointment.endDate).toISOString().slice(0, 16),
      notes: appointment.notes || "",
      location: appointment.location || "",
    });
    setShowDetail(false);
    setShowForm(true);
  };

  const handleDelete = async (appointmentId) => {
    if (!isOwner) {
      alert("Only household owners can delete appointments");
      return;
    }

    if (confirm("Are you sure you want to delete this appointment?")) {
      try {
        const response = await fetch(`/api/appointments/${appointmentId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          await fetchData();
          setShowDetail(false);
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.error || "Failed to delete appointment"}`);
        }
      } catch (error) {
        console.error("Error deleting appointment:", error);
        alert("Error deleting appointment. Please try again.");
      }
    }
  };

  const handleAppointmentClick = async (appointmentId) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`);
      const data = await response.json();

      if (response.ok) {
        setSelectedAppointment(data);
        setShowDetail(true);
      }
    } catch (error) {
      console.error("Error fetching appointment:", error);
    }
  };

  const appointmentTypeLabels = {
    "vet-checkup": "Vet Checkup",
    emergency: "Emergency",
    grooming: "Grooming",
    vaccination: "Vaccination",
    training: "Training",
    other: "Other",
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  // Show appointment detail view
  if (showDetail && selectedAppointment) {
    return (
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => setShowDetail(false)}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Calendar
        </button>

        <div className="bg-white rounded-lg shadow-md p-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {selectedAppointment.title}
              </h1>
              <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {appointmentTypeLabels[selectedAppointment.appointmentType]}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(selectedAppointment)}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
              >
                <Edit size={20} />
              </button>
              {isOwner && (
                <button
                  onClick={() => handleDelete(selectedAppointment._id)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition"
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">Pet</h3>
              <div className="flex items-center gap-3">
                {selectedAppointment.petId?.profileImage && (
                  <img
                    src={selectedAppointment.petId.profileImage}
                    alt={selectedAppointment.petId.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                )}
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedAppointment.petId?.name}
                  </p>
                  <p className="text-sm text-gray-600 capitalize">
                    {selectedAppointment.petId?.animal}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Assigned To
              </h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-greens-500 text-white flex items-center justify-center font-bold">
                  {selectedAppointment.assignedTo?.name
                    ?.charAt(0)
                    .toUpperCase()}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {selectedAppointment.assignedTo?.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {selectedAppointment.assignedTo?.email}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Start Time
              </h3>
              <p className="text-gray-900">
                {new Date(selectedAppointment.startDate).toLocaleString()}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                End Time
              </h3>
              <p className="text-gray-900">
                {new Date(selectedAppointment.endDate).toLocaleString()}
              </p>
            </div>

            {selectedAppointment.location && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Location
                </h3>
                <p className="text-gray-900">{selectedAppointment.location}</p>
              </div>
            )}

            {selectedAppointment.notes && (
              <div className="md:col-span-2">
                <h3 className="text-sm font-medium text-gray-600 mb-2">
                  Notes
                </h3>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {selectedAppointment.notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="componentmw">
      {/* Header */}
      <div className="pagetitle">
        <h1 className="text-3xl font-bold">Calendar</h1>
        <button
          onClick={() => {
            setEditingAppointment(null);
            const now = new Date();
            setFormData({
              petId: "",
              assignedTo: "",
              title: "",
              appointmentType: "vet-checkup",
              startDate: now.toISOString().slice(0, 16),
              endDate: new Date(now.getTime() + 60 * 60 * 1000)
                .toISOString()
                .slice(0, 16),
              notes: "",
              location: "",
            });
            setShowForm(true);
          }}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          <Plus size={20} />
          Add Appointment
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter size={20} className="text-gray-600" />
          <h3 className="font-semibold text-gray-900">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Pet
            </label>
            <select
              value={filters.petId}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, petId: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">All Pets</option>
              {pets.map((pet) => (
                <option key={pet._id} value={pet._id}>
                  {pet.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filter by Member
            </label>
            <select
              value={filters.assignedTo}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, assignedTo: e.target.value }))
              }
              className="w-full border border-gray-300 rounded-lg px-3 py-2"
            >
              <option value="">All Members</option>
              {members.map((member) => (
                <option key={member.id} value={member.id}>
                  {member.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Calendar and Appointments Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
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
                          ? "bg-green-500 text-white"
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
                        <span className="text-xs mt-1">
                          {appointmentsForDate.length}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Appointments for Selected Date */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <CalendarIcon size={20} className="text-blue-500" />
            <h3 className="font-semibold text-gray-900">
              {selectedDate.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
              })}
            </h3>
          </div>

          {getSelectedDateAppointments().length > 0 ? (
            <div className="space-y-3">
              {getSelectedDateAppointments().map((apt) => (
                <div
                  key={apt._id}
                  onClick={() => handleAppointmentClick(apt._id)}
                  className="border-l-4 border-blue-500 pl-4 py-3 hover:bg-gray-50 transition rounded cursor-pointer"
                >
                  <p className="font-semibold text-gray-900">{apt.title}</p>
                  <p className="text-sm text-gray-600">
                    {apt.petId?.name} •{" "}
                    {appointmentTypeLabels[apt.appointmentType]}
                  </p>
                  <div className="flex items-center gap-2 text-xs text-gray-500 mt-2">
                    <Clock size={14} />
                    {new Date(apt.startDate).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <CalendarIcon className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-500">No appointments</p>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">
                  {editingAppointment ? "Edit Appointment" : "New Appointment"}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pet *
                    </label>
                    <select
                      name="petId"
                      value={formData.petId}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">Select a pet</option>
                      {pets.map((pet) => (
                        <option key={pet._id} value={pet._id}>
                          {pet.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Assign To *
                    </label>
                    <select
                      name="assignedTo"
                      value={formData.assignedTo}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="">Select a member</option>
                      {members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="e.g., Annual Checkup"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Appointment Type *
                    </label>
                    <select
                      name="appointmentType"
                      value={formData.appointmentType}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    >
                      <option value="vet-checkup">Vet Checkup</option>
                      <option value="emergency">Emergency</option>
                      <option value="grooming">Grooming</option>
                      <option value="vaccination">Vaccination</option>
                      <option value="training">Training</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="e.g., City Vet Clinic"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="startDate"
                      value={formData.startDate}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date & Time *
                    </label>
                    <input
                      type="datetime-local"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      rows="4"
                      className="w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="Add any additional notes..."
                    ></textarea>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
                  >
                    {editingAppointment
                      ? "Update Appointment"
                      : "Create Appointment"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
