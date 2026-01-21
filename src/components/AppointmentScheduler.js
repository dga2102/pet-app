import { useEffect, useState } from "react";
import {
  Plus,
  Edit,
  Trash2,
  Loader,
  AlertCircle,
  Calendar,
} from "lucide-react";

export default function AppointmentScheduler() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);
  const [pets, setPets] = useState([]);
  const [caretakers, setCaretakers] = useState([]);
  const [formData, setFormData] = useState({
    petId: "",
    title: "",
    type: "vet",
    startDate: "",
    endDate: "",
    providerName: "",
    providerPhone: "",
    providerEmail: "",
    providerAddress: "",
    notes: "",
    assignedTo: "",
    reminder: true,
    minutesBefore: "1440",
    cost: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [appointmentsRes, petsRes, caretakersRes] = await Promise.all([
        fetch("/api/appointments"),
        fetch("/api/pets"),
        fetch("/api/caretakers"),
      ]);

      const appointmentsData = await appointmentsRes.json();
      const petsData = await petsRes.json();
      const caretakersData = await caretakersRes.json();

      setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
      setPets(Array.isArray(petsData) ? petsData : []);
      setCaretakers(Array.isArray(caretakersData) ? caretakersData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setAppointments([]);
      setPets([]);
      setCaretakers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const submitData = {
        petId: formData.petId,
        title: formData.title,
        type: formData.type,
        startDate: new Date(formData.startDate),
        endDate: new Date(formData.endDate),
        provider: {
          name: formData.providerName,
          phone: formData.providerPhone,
          email: formData.providerEmail,
          address: formData.providerAddress,
        },
        notes: formData.notes,
        assignedTo: formData.assignedTo || null,
        reminder: {
          enabled: formData.reminder,
          minutesBefore: parseInt(formData.minutesBefore),
        },
        cost: formData.cost ? parseFloat(formData.cost) : null,
      };

      let response;
      if (editingAppt) {
        response = await fetch(`/api/appointments/${editingAppt._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        });
      } else {
        response = await fetch("/api/appointments", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(submitData),
        });
      }

      if (response.ok) {
        fetchData();
        setShowForm(false);
        setEditingAppt(null);
        resetForm();
      }
    } catch (error) {
      console.error("Error saving appointment:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      petId: "",
      title: "",
      type: "vet",
      startDate: "",
      endDate: "",
      providerName: "",
      providerPhone: "",
      providerEmail: "",
      providerAddress: "",
      notes: "",
      assignedTo: "",
      reminder: true,
      minutesBefore: "1440",
      cost: "",
    });
  };

  const handleEdit = (appt) => {
    setEditingAppt(appt);
    setFormData({
      petId: appt.petId?._id || appt.petId,
      title: appt.title,
      type: appt.type,
      startDate: new Date(appt.startDate).toISOString().slice(0, 16),
      endDate: new Date(appt.endDate).toISOString().slice(0, 16),
      providerName: appt.provider?.name || "",
      providerPhone: appt.provider?.phone || "",
      providerEmail: appt.provider?.email || "",
      providerAddress: appt.provider?.address || "",
      notes: appt.notes || "",
      assignedTo: appt.assignedTo?._id || "",
      reminder: appt.reminder?.enabled || true,
      minutesBefore: appt.reminder?.minutesBefore?.toString() || "1440",
      cost: appt.cost || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (apptId) => {
    if (confirm("Are you sure you want to delete this appointment?")) {
      try {
        const response = await fetch(`/api/appointments/${apptId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error("Error deleting appointment:", error);
      }
    }
  };

  const getPetName = (petId) => {
    const pet = pets.find((p) => p._id === petId);
    return pet?.name || "Unknown Pet";
  };

  const getCaretakerName = (caretakerId) => {
    if (!caretakerId) return "Unassigned";
    const caretaker = caretakers.find((c) => c._id === caretakerId);
    return caretaker?.name || "Unknown";
  };

  const upcomingAppointments = appointments
    .filter((apt) => new Date(apt.startDate) >= new Date())
    .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));

  const pastAppointments = appointments
    .filter((apt) => new Date(apt.startDate) < new Date())
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Appointments</h2>
        <button
          onClick={() => {
            setEditingAppt(null);
            resetForm();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          <Plus size={20} />
          Schedule Appointment
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">
            {editingAppt ? "Edit Appointment" : "Schedule New Appointment"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pet *
                </label>
                <select
                  name="petId"
                  value={formData.petId}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
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
                <label className="block text-sm font-medium text-gray-700">
                  Appointment Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="vet">Vet Visit</option>
                  <option value="groomer">Groomer</option>
                  <option value="walker">Walker</option>
                  <option value="training">Training</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., Annual Checkup"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Start Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  End Date & Time *
                </label>
                <input
                  type="datetime-local"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Assign To
                </label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Unassigned</option>
                  {caretakers.map((caretaker) => (
                    <option key={caretaker._id} value={caretaker._id}>
                      {caretaker.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Provider Name
                </label>
                <input
                  type="text"
                  name="providerName"
                  value={formData.providerName}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., Dr. Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Provider Phone
                </label>
                <input
                  type="tel"
                  name="providerPhone"
                  value={formData.providerPhone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Provider Email
                </label>
                <input
                  type="email"
                  name="providerEmail"
                  value={formData.providerEmail}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="provider@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cost
                </label>
                <input
                  type="number"
                  name="cost"
                  value={formData.cost}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="0.00"
                  step="0.01"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Provider Address
              </label>
              <input
                type="text"
                name="providerAddress"
                value={formData.providerAddress}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="123 Main St, City, State"
              />
            </div>

            <div className="bg-gray-50 p-4 rounded-lg space-y-3">
              <h4 className="font-semibold text-gray-900">Reminders</h4>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  name="reminder"
                  checked={formData.reminder}
                  onChange={handleCheckboxChange}
                  className="w-4 h-4 rounded"
                />
                <label className="text-sm text-gray-700">Enable reminder</label>
              </div>
              {formData.reminder && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Remind me before
                  </label>
                  <select
                    name="minutesBefore"
                    value={formData.minutesBefore}
                    onChange={handleInputChange}
                    className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  >
                    <option value="15">15 minutes</option>
                    <option value="30">30 minutes</option>
                    <option value="60">1 hour</option>
                    <option value="1440">1 day</option>
                    <option value="2880">2 days</option>
                  </select>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows="3"
                className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                placeholder="Add any notes..."
              ></textarea>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                {editingAppt ? "Update Appointment" : "Schedule Appointment"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {upcomingAppointments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-blue-50 px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Calendar size={20} />
              Upcoming Appointments ({upcomingAppointments.length})
            </h3>
          </div>
          <div className="divide-y">
            {upcomingAppointments.map((appt) => (
              <div
                key={appt._id}
                className="px-6 py-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {getPetName(appt.petId)} - {appt.title}
                    </p>
                    <div className="mt-2 text-sm text-gray-600 space-y-1">
                      <p>
                        📅 {new Date(appt.startDate).toLocaleDateString()} at{" "}
                        {new Date(appt.startDate).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                      {appt.provider?.name && <p>👨‍⚕️ {appt.provider.name}</p>}
                      {appt.provider?.phone && <p>📞 {appt.provider.phone}</p>}
                      {appt.assignedTo && (
                        <p>👤 {getCaretakerName(appt.assignedTo)}</p>
                      )}
                      {appt.cost && <p>💵 ${appt.cost}</p>}
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEdit(appt)}
                      className="text-blue-500 hover:text-blue-700 transition"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(appt._id)}
                      className="text-red-500 hover:text-red-700 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {pastAppointments.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="bg-gray-50 px-6 py-4 border-b">
            <h3 className="font-semibold text-gray-900">
              Past Appointments ({pastAppointments.length})
            </h3>
          </div>
          <div className="divide-y">
            {pastAppointments.map((appt) => (
              <div
                key={appt._id}
                className="px-6 py-4 hover:bg-gray-50 transition opacity-75"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">
                      {getPetName(appt.petId)} - {appt.title}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(appt.startDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(appt._id)}
                    className="text-red-500 hover:text-red-700 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {appointments.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
          <p className="text-gray-500 mb-4">No appointments scheduled</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            <Plus size={20} />
            Schedule First Appointment
          </button>
        </div>
      )}
    </div>
  );
}
