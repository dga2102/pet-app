"use client";

import { useAuth } from "@clerk/nextjs";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Loader } from "lucide-react";

export default function SettingsPage() {
  const { isLoaded, userId } = useAuth();
  const [familyProfile, setFamilyProfile] = useState(null);
  const [caretakers, setCaretakers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCaretakerForm, setShowCaretakerForm] = useState(false);
  const [editingCaretaker, setEditingCaretaker] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "secondary",
  });

  if (!isLoaded || !userId) {
    return redirect("/");
  }

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);

      // First, create a family profile if it doesn't exist
      const profileRes = await fetch("/api/family/profile");
      const profileData = await profileRes.json();

      if (profileRes.ok) {
        setFamilyProfile(profileData);
      } else if (profileRes.status === 404) {
        // Create default family profile
        const createRes = await fetch("/api/family/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            familyName: "My Family",
            primaryContact: { name: "Primary Contact" },
          }),
        });
        const newProfile = await createRes.json();
        if (createRes.ok) {
          setFamilyProfile(newProfile);
        }
      }

      // Fetch caretakers
      const caretakersRes = await fetch("/api/caretakers");
      const caretakersData = await caretakersRes.json();
      setCaretakers(Array.isArray(caretakersData) ? caretakersData : []);
    } catch (error) {
      console.error("Error fetching data:", error);
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

  const handleSubmitCaretaker = async (e) => {
    e.preventDefault();

    try {
      let response;
      if (editingCaretaker) {
        response = await fetch(`/api/caretakers/${editingCaretaker._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch("/api/caretakers", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
      }

      if (response.ok) {
        fetchData();
        setShowCaretakerForm(false);
        setEditingCaretaker(null);
        setFormData({
          name: "",
          email: "",
          phone: "",
          role: "secondary",
        });
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to save caretaker"}`);
      }
    } catch (error) {
      console.error("Error saving caretaker:", error);
      alert("Error saving caretaker. Please try again.");
    }
  };

  const handleEditCaretaker = (caretaker) => {
    setEditingCaretaker(caretaker);
    setFormData({
      name: caretaker.name,
      email: caretaker.email,
      phone: caretaker.phone || "",
      role: caretaker.role,
    });
    setShowCaretakerForm(true);
  };

  const handleDeleteCaretaker = async (caretakerId) => {
    if (confirm("Are you sure you want to remove this caretaker?")) {
      try {
        const response = await fetch(`/api/caretakers/${caretakerId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          fetchData();
        }
      } catch (error) {
        console.error("Error deleting caretaker:", error);
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
    <main className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
        <h4 className="text-gray-600 mt-2">
          Manage your family profile and caretakers
        </h4>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Family Profile Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-4">Family Profile</h2>
          {familyProfile && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Family Name
                </label>
                <p className="text-gray-900 font-medium">
                  {familyProfile.familyName}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Primary Contact
                </label>
                <p className="text-gray-900 font-medium">
                  {familyProfile.primaryContact?.name}
                </p>
                <p className="text-gray-600 text-sm">
                  {familyProfile.primaryContact?.email}
                </p>
              </div>
              {familyProfile.primaryContact?.phone && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone
                  </label>
                  <p className="text-gray-900">
                    {familyProfile.primaryContact.phone}
                  </p>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Family Members
                </label>
                <p className="text-gray-900">
                  {familyProfile.members?.length || 0} member(s)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Pets
                </label>
                <p className="text-gray-900">
                  {familyProfile.pets?.length || 0} pet(s)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Caretakers Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Family Members</h2>
            <button
              onClick={() => {
                setEditingCaretaker(null);
                setFormData({
                  name: "",
                  email: "",
                  phone: "",
                  role: "secondary",
                });
                setShowCaretakerForm(!showCaretakerForm);
              }}
              className="flex items-center gap-2 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
            >
              <Plus size={16} />
              Add Member
            </button>
          </div>

          {showCaretakerForm && (
            <form
              onSubmit={handleSubmitCaretaker}
              className="mb-6 p-4 bg-gray-50 rounded-lg space-y-3"
            >
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Role
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="helper">Helper</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white px-3 py-2 rounded-lg hover:bg-blue-600 transition text-sm"
                >
                  {editingCaretaker ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowCaretakerForm(false)}
                  className="flex-1 bg-gray-500 text-white px-3 py-2 rounded-lg hover:bg-gray-600 transition text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          <div className="space-y-3">
            {caretakers.length > 0 ? (
              caretakers.map((caretaker) => (
                <div
                  key={caretaker._id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">
                        {caretaker.name}
                      </p>
                      <p className="text-sm text-gray-600">{caretaker.email}</p>
                      {caretaker.phone && (
                        <p className="text-sm text-gray-600">
                          {caretaker.phone}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2 capitalize">
                        Role: {caretaker.role}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditCaretaker(caretaker)}
                        className="text-blue-500 hover:text-blue-700 transition"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDeleteCaretaker(caretaker._id)}
                        className="text-red-500 hover:text-red-700 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-sm">
                No family members added yet
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
