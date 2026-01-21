import { useEffect, useState } from "react";
import { Plus, Edit, Trash2, Loader } from "lucide-react";

export default function PetManagement() {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    animal: "dog",
    breed: "",
    age: "",
    weight: "",
    dateOfBirth: "",
  });

  useEffect(() => {
    fetchPets();
  }, []);

  const fetchPets = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/pets");
      const data = await response.json();
      setPets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching pets:", error);
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (editingPet) {
        response = await fetch(`/api/pets/${editingPet._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch("/api/pets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        fetchPets();
        setShowForm(false);
        setEditingPet(null);
        setFormData({
          name: "",
          animal: "dog",
          breed: "",
          age: "",
          weight: "",
          dateOfBirth: "",
        });
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to save pet"}`);
      }
    } catch (error) {
      console.error("Error saving pet:", error);
      alert("Error saving pet. Please try again.");
    }
  };

  const handleEdit = (pet) => {
    setEditingPet(pet);
    setFormData({
      name: pet.name,
      animal: pet.animal,
      breed: pet.breed,
      age: pet.age,
      weight: pet.weight,
      dateOfBirth: pet.dateOfBirth?.split("T")[0] || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (petId) => {
    if (confirm("Are you sure you want to delete this pet?")) {
      try {
        const response = await fetch(`/api/pets/${petId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchPets();
        }
      } catch (error) {
        console.error("Error deleting pet:", error);
      }
    }
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
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Pets</h2>
        <button
          onClick={() => {
            setEditingPet(null);
            setFormData({
              name: "",
              animal: "dog",
              breed: "",
              age: "",
              weight: "",
              dateOfBirth: "",
            });
            setShowForm(!showForm);
          }}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          <Plus size={20} />
          Add Pet
        </button>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold mb-4">
            {editingPet ? "Edit Pet" : "Add New Pet"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pet Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., Max"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Animal Type
                </label>
                <select
                  name="animal"
                  value={formData.animal}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                >
                  <option value="dog">Dog</option>
                  <option value="cat">Cat</option>
                  <option value="bird">Bird</option>
                  <option value="rabbit">Rabbit</option>
                  <option value="hamster">Hamster</option>
                  <option value="guinea pig">Guinea Pig</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Breed
                </label>
                <input
                  type="text"
                  name="breed"
                  value={formData.breed}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., Golden Retriever"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Age (years)
                </label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., 3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Weight (lbs)
                </label>
                <input
                  type="number"
                  name="weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                  placeholder="e.g., 65"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
              >
                {editingPet ? "Update Pet" : "Add Pet"}
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pets.map((pet) => (
          <div
            key={pet._id}
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
                <p className="text-sm text-gray-600 capitalize">{pet.animal}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(pet)}
                  className="text-blue-500 hover:text-blue-700 transition"
                >
                  <Edit size={20} />
                </button>
                <button
                  onClick={() => handleDelete(pet._id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              {pet.breed && (
                <p>
                  <span className="font-medium">Breed:</span> {pet.breed}
                </p>
              )}
              {pet.age && (
                <p>
                  <span className="font-medium">Age:</span> {pet.age} years
                </p>
              )}
              {pet.weight && (
                <p>
                  <span className="font-medium">Weight:</span> {pet.weight} lbs
                </p>
              )}
              {pet.dateOfBirth && (
                <p>
                  <span className="font-medium">DOB:</span>{" "}
                  {new Date(pet.dateOfBirth).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {pets.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500 mb-4">No pets added yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            <Plus size={20} />
            Add Your First Pet
          </button>
        </div>
      )}
    </div>
  );
}
