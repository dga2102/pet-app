import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Loader, Clock, AlertCircle } from "lucide-react";

export default function CarePlanTasks() {
  const [tasks, setTasks] = useState([]);
  const [caretakers, setCaretakers] = useState([]);
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    petId: "",
    title: "",
    description: "",
    taskType: "feeding",
    time: "09:00",
    assignedTo: "",
    daysOfWeek: [],
    priority: "medium",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [tasksRes, caretakersRes, petsRes] = await Promise.all([
        fetch("/api/tasks"),
        fetch("/api/caretakers"),
        fetch("/api/pets"),
      ]);

      const tasksData = await tasksRes.json();
      const caretakersData = await caretakersRes.json();
      const petsData = await petsRes.json();

      setTasks(Array.isArray(tasksData) ? tasksData : []);
      setCaretakers(Array.isArray(caretakersData) ? caretakersData : []);
      setPets(Array.isArray(petsData) ? petsData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
      setTasks([]);
      setCaretakers([]);
      setPets([]);
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

  const handleDayToggle = (day) => {
    setFormData((prev) => ({
      ...prev,
      daysOfWeek: prev.daysOfWeek.includes(day)
        ? prev.daysOfWeek.filter((d) => d !== day)
        : [...prev.daysOfWeek, day],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (editingTask) {
        response = await fetch(`/api/tasks/${editingTask._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch("/api/tasks", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        await fetchData();
        setShowForm(false);
        setEditingTask(null);
        resetForm();
      } else {
        console.error("Error saving task:", response.statusText);
      }
    } catch (error) {
      console.error("Error saving task:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      petId: "",
      title: "",
      description: "",
      taskType: "feeding",
      time: "09:00",
      assignedTo: "",
      daysOfWeek: [],
      priority: "medium",
    });
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      petId: task.petId?._id || task.petId,
      title: task.title,
      description: task.description || "",
      taskType: task.taskType,
      time: task.time,
      assignedTo: task.assignedTo?._id || task.assignedTo,
      daysOfWeek: task.daysOfWeek || [],
      priority: task.priority,
    });
    setShowForm(true);
  };

  const handleDelete = async (taskId) => {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    }
  };

  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  const getPetName = (petId) => {
    const pet = pets.find((p) => p._id === petId);
    return pet?.name || "Unknown Pet";
  };

  const getCaretakerName = (caretakerId) => {
    const caretaker = caretakers.find((c) => c._id === caretakerId);
    return caretaker?.name || "Unassigned";
  };

  const toggleTaskComplete = async (taskId) => {
    try {
      const task = tasks.find((t) => t._id === taskId);
      if (!task) return;

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...task,
          isCompleted: !task.isCompleted,
        }),
      });

      if (response.ok) {
        await fetchData();
      } else {
        console.error(
          "Error updating task completion status:",
          response.statusText,
        );
      }
    } catch (error) {
      console.error("Error toggling task completion:", error);
    }
  };

  const getTodaysTasks = () => {
    const today = new Date().getDay();
    return tasks.filter((task) => task.daysOfWeek?.includes(today));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="pagetitle">
        <h2 className="text-2xl font-bold">Daily Care Plan</h2>
        <button
          onClick={() => {
            setEditingTask(null);
            resetForm();
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          <Plus size={20} />
          Add Task
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">
            {editingTask ? "Edit Task" : "Create New Task"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pet
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
                  Assign To
                </label>
                <select
                  name="assignedTo"
                  value={formData.assignedTo}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="">Select a caretaker</option>
                  {caretakers.map((caretaker) => (
                    <option key={caretaker._id} value={caretaker._id}>
                      {caretaker.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Task Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., Morning Walk"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Task Type
                </label>
                <select
                  name="taskType"
                  value={formData.taskType}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="feeding">Feeding</option>
                  <option value="walking">Walking</option>
                  <option value="medication">Medication</option>
                  <option value="grooming">Grooming</option>
                  <option value="play">Play</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Time
                </label>
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Days of Week
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {dayNames.map((day, index) => (
                  <label
                    key={index}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={formData.daysOfWeek.includes(index)}
                      onChange={() => handleDayToggle(index)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">{day}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
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
                {editingTask ? "Update Task" : "Create Task"}
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

      {/* Today's Tasks Timeline */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold mb-6">Today's Tasks</h3>
        {getTodaysTasks().length > 0 ? (
          <div className="space-y-0">
            {getTodaysTasks()
              .sort((a, b) => a.time.localeCompare(b.time))
              .map((task, index, sortedTasks) => (
                <div key={task._id} className="flex gap-4">
                  {/* Timeline Column */}
                  <div className="flex flex-col items-center gap-0">
                    {/* Radio Button */}
                    <label className="relative z-10 flex items-center justify-center cursor-pointer">
                      <input
                        type="radio"
                        checked={task.isCompleted || false}
                        onChange={() => toggleTaskComplete(task._id)}
                        className="w-6 h-6 cursor-pointer accent-blue-500"
                      />
                    </label>
                    {/* Connecting Line */}
                    {index < sortedTasks.length - 1 && (
                      <div className="w-1 h-16 bg-gray-300 mt-0"></div>
                    )}
                  </div>

                  {/* Task Content */}
                  <div className="flex-1 pb-8">
                    <div className="flex gap-4 items-start">
                      {/* Task Title Column */}
                      <div
                        className={`flex-1 p-4 rounded-lg transition-all ${
                          task.isCompleted
                            ? "bg-orange-100 border border-orange-300"
                            : "bg-blue-100 border border-blue-300"
                        }`}
                      >
                        <p
                          className={`font-medium text-gray-900 ${
                            task.isCompleted
                              ? "line-through text-orange-700"
                              : "text-blue-900"
                          }`}
                        >
                          {task.title}
                        </p>
                        <p
                          className={`text-sm capitalize ${
                            task.isCompleted
                              ? "text-orange-600"
                              : "text-blue-600"
                          }`}
                        >
                          {task.taskType}
                        </p>
                      </div>

                      {/* Assigned To Column */}
                      <div className="min-w-32 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600">Assigned To</p>
                        <p className="font-medium text-gray-900">
                          {getCaretakerName(
                            task.assignedTo?._id || task.assignedTo,
                          )}
                        </p>
                      </div>

                      {/* Time Column */}
                      <div className="min-w-24 p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2">
                        <Clock size={16} className="text-gray-600" />
                        <span className="font-medium text-gray-900">
                          {task.time}
                        </span>
                      </div>

                      {/* Actions Column */}
                      <div className="flex gap-2 p-4 bg-gray-50 rounded-lg">
                        <button
                          onClick={() => handleEdit(task)}
                          className="p-2 text-blue-500 hover:bg-blue-100 rounded-lg transition"
                          title="Edit task"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="p-2 text-red-500 hover:bg-red-100 rounded-lg transition"
                          title="Delete task"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-500">No tasks scheduled for today</p>
          </div>
        )}
      </div>

      {/* All Tasks Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold">All Tasks</h3>
        </div>
        {tasks.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">
                    Pet
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">
                    Task
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">
                    Time
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">
                    Assigned To
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">
                    Days
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">
                    Priority
                  </th>
                  <th className="text-left px-6 py-3 font-semibold text-gray-900">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr
                    key={task._id}
                    className="border-b hover:bg-gray-50 transition"
                  >
                    <td className="px-6 py-4 text-gray-900 font-medium">
                      {getPetName(task.petId._id || task.petId)}
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-500 capitalize">
                          {task.taskType}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock size={16} />
                        {task.time}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {getCaretakerName(
                        task.assignedTo?._id || task.assignedTo,
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {task.daysOfWeek
                        ?.map((d) => dayNames[d].substring(0, 3))
                        .join(", ")}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          task.priority === "high"
                            ? "bg-red-100 text-red-700"
                            : task.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {task.priority}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(task)}
                          className="text-blue-500 hover:text-blue-700 transition"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(task._id)}
                          className="text-red-500 hover:text-red-700 transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <AlertCircle className="mx-auto text-gray-400 mb-2" size={32} />
            <p className="text-gray-500">No tasks created yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
