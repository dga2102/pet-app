import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit,
  Trash2,
  Loader,
  Upload,
  X,
  Check,
  Eye,
  ChevronDown,
} from "lucide-react";
import MedicalRecordViewer from "./MedicalRecordViewer";

export default function PetManagement() {
  const router = useRouter();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPet, setEditingPet] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [uploadingProfilePicture, setUploadingProfilePicture] = useState(false);
  const [uploadingMedicalRecords, setUploadingMedicalRecords] = useState(false);
  const [profilePicturePreview, setProfilePicturePreview] = useState(null);
  const [medicalRecordDescription, setMedicalRecordDescription] = useState("");
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(null);
  const [expandedPets, setExpandedPets] = useState({});
  const [formData, setFormData] = useState({
    name: "",
    animal: "dog",
    breed: "",
    age: "",
    weight: "",
    dateOfBirth: "",
    allergies: "",
    chronicIssues: "",
    exerciseNeeds: "",
    microchipNumber: "",
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

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      alert("Please upload an image file for the profile picture");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicturePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary via API
    if (editingPet) {
      await uploadFile(file, "profilePicture", editingPet._id);
    }
  };

  const handleMedicalRecordUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type - only PDF and DOC files
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Please upload a PDF or DOC/DOCX file");
      return;
    }

    // Add to temporary medical records list
    const tempRecord = {
      file: file,
      fileName: file.name,
      description: medicalRecordDescription,
      tempId: Date.now(),
    };

    setMedicalRecords((prev) => [...prev, tempRecord]);
    setMedicalRecordDescription("");
  };

  const removeMedicalRecord = (tempId) => {
    setMedicalRecords((prev) =>
      prev.filter((record) => record.tempId !== tempId),
    );
  };

  const uploadFile = async (file, uploadType, petId) => {
    const formDataToSend = new FormData();
    formDataToSend.append("file", file);
    formDataToSend.append("petId", String(petId));
    formDataToSend.append("uploadType", uploadType);

    if (uploadType === "medicalRecord") {
      const record = medicalRecords.find((r) => r.file === file);
      if (record) {
        formDataToSend.append("description", record.description);
      }
    }

    try {
      if (uploadType === "profilePicture") {
        setUploadingProfilePicture(true);
      } else {
        setUploadingMedicalRecords(true);
      }

      const response = await fetch("/api/pets/upload", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        alert(`Upload failed: ${data.error}`);
        return null;
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("Error uploading file. Please try again.");
      return null;
    } finally {
      if (uploadType === "profilePicture") {
        setUploadingProfilePicture(false);
      } else {
        setUploadingMedicalRecords(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let response;
      let petId;

      if (editingPet) {
        response = await fetch(`/api/pets/${editingPet._id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        petId = editingPet._id;
      } else {
        response = await fetch("/api/pets", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });
        if (response.ok) {
          const createdPet = await response.json();
          petId = createdPet._id;
        }
      }

      if (response.ok) {
        // Upload medical records if any
        if (medicalRecords.length > 0 && medicalRecords[0].file) {
          for (const record of medicalRecords) {
            await uploadFile(record.file, "medicalRecord", petId);
          }
        }

        fetchPets();
        resetForm();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to save pet"}`);
      }
    } catch (error) {
      console.error("Error saving pet:", error);
      alert("Error saving pet. Please try again.");
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingPet(null);
    setCurrentStep(1);
    setFormData({
      name: "",
      animal: "dog",
      breed: "",
      age: "",
      weight: "",
      dateOfBirth: "",
      allergies: "",
      chronicIssues: "",
      exerciseNeeds: "",
      microchipNumber: "",
    });
    setProfilePicturePreview(null);
    setMedicalRecords([]);
    setMedicalRecordDescription("");
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
      allergies: pet.allergies || "",
      chronicIssues: pet.chronicIssues || "",
      exerciseNeeds: pet.exerciseNeeds || "",
      microchipNumber: pet.microchipNumber || "",
    });
    if (pet.profileImage) {
      setProfilePicturePreview(pet.profileImage);
    }
    setMedicalRecords([]);
    setMedicalRecordDescription("");
    setShowForm(true);
    setCurrentStep(1);
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

  const togglePetExpanded = (petId) => {
    setExpandedPets((prev) => ({
      ...prev,
      [petId]: !prev[petId],
    }));
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
            setCurrentStep(1);
            setFormData({
              name: "",
              animal: "dog",
              breed: "",
              age: "",
              weight: "",
              dateOfBirth: "",
            });
            setProfilePicturePreview(null);
            setMedicalRecords([]);
            setMedicalRecordDescription("");
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
          <h3 className="text-xl font-bold mb-6">
            {editingPet ? "Edit Pet" : "Add New Pet"}
          </h3>

          {/* Step Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center flex-1">
                  <div
                    className={`flex items-center justify-center w-8 h-8 rounded-full font-bold transition ${
                      currentStep >= step
                        ? "bg-blue-500 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {currentStep > step ? <Check size={20} /> : step}
                  </div>
                  {step < 4 && (
                    <div
                      className={`flex-1 h-1 mx-2 transition ${
                        currentStep > step ? "bg-blue-500" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>Basic Info</span>
              <span>More Info</span>
              <span>Profile Picture</span>
              <span>Medical Records</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Step 1: Basic Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Pet Name *
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
                      Animal Type *
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
              </div>
            )}

            {/* Step 2: More Info */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Step 2: More Info
                </h4>
                <p className="text-sm text-gray-600 mb-4">
                  Add additional health and identification information
                  (Optional)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Allergies
                    </label>
                    <input
                      type="text"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="e.g., Chicken, Wheat"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Chronic Issues
                    </label>
                    <input
                      type="text"
                      name="chronicIssues"
                      value={formData.chronicIssues}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="e.g., Arthritis, Diabetes"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Exercise Needs
                    </label>
                    <input
                      type="text"
                      name="exerciseNeeds"
                      value={formData.exerciseNeeds}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="e.g., 2 hours daily"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Microchip Number
                    </label>
                    <input
                      type="text"
                      name="microchipNumber"
                      value={formData.microchipNumber}
                      onChange={handleInputChange}
                      className="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2"
                      placeholder="e.g., 985 112 003 349205"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Profile Picture */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Step 3: Profile Picture
                </h4>
                <p className="text-sm text-gray-600">
                  Upload a profile picture for your pet (Optional)
                </p>

                {profilePicturePreview && (
                  <div className="relative w-48 h-48 mx-auto rounded-lg overflow-hidden border-2 border-gray-300">
                    <img
                      src={profilePicturePreview}
                      alt="Profile preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setProfilePicturePreview(null)}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                <label className="flex items-center justify-center w-full px-6 py-10 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition">
                  <div className="text-center">
                    {uploadingProfilePicture ? (
                      <>
                        <Loader
                          className="animate-spin mx-auto text-blue-500 mb-2"
                          size={24}
                        />
                        <span className="text-sm text-gray-600">
                          Uploading...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload
                          className="mx-auto text-gray-400 mb-2"
                          size={24}
                        />
                        <span className="text-sm text-gray-600">
                          Click to upload image
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleProfilePictureUpload}
                    className="hidden"
                    disabled={uploadingProfilePicture}
                  />
                </label>
              </div>
            )}

            {/* Step 4: Medical Records */}
            {currentStep === 4 && (
              <div className="space-y-4">
                <h4 className="font-semibold text-gray-900 mb-4">
                  Step 4: Medical Records
                </h4>
                <p className="text-sm text-gray-600">
                  Upload medical records (PDF, DOC, or image files) - Optional
                </p>

                {/* Uploaded Records List */}
                {medicalRecords.length > 0 && (
                  <div className="bg-blue-50 rounded-lg p-4 space-y-2">
                    <h5 className="font-medium text-gray-900">
                      Medical Records to Upload:
                    </h5>
                    {medicalRecords.map((record) => (
                      <div
                        key={record.tempId}
                        className="flex items-start justify-between bg-white p-3 rounded border border-blue-200"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">
                            {record.fileName}
                          </p>
                          {record.description && (
                            <p className="text-xs text-gray-600">
                              {record.description}
                            </p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => removeMedicalRecord(record.tempId)}
                          className="text-red-500 hover:text-red-700 ml-2"
                        >
                          <X size={18} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Description Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Record Description (Optional)
                  </label>
                  <input
                    type="text"
                    value={medicalRecordDescription}
                    onChange={(e) =>
                      setMedicalRecordDescription(e.target.value)
                    }
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                    placeholder="e.g., Vaccination Records, Lab Results, etc."
                  />
                </div>

                {/* File Upload */}
                <label className="flex items-center justify-center w-full px-6 py-10 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition">
                  <div className="text-center">
                    {uploadingMedicalRecords ? (
                      <>
                        <Loader
                          className="animate-spin mx-auto text-blue-500 mb-2"
                          size={24}
                        />
                        <span className="text-sm text-gray-600">
                          Uploading...
                        </span>
                      </>
                    ) : (
                      <>
                        <Upload
                          className="mx-auto text-gray-400 mb-2"
                          size={24}
                        />
                        <span className="text-sm text-gray-600">
                          Click to upload file
                        </span>
                        <span className="text-xs text-gray-500 block mt-1">
                          PDF, DOC, DOCX, PNG, JPG, GIF
                        </span>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    onChange={handleMedicalRecordUpload}
                    className="hidden"
                    disabled={uploadingMedicalRecords}
                  />
                </label>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 pt-6 border-t">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep - 1)}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition"
                >
                  Back
                </button>
              )}
              {currentStep < 4 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(currentStep + 1)}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  Next
                </button>
              )}
              {currentStep === 4 && (
                <button
                  type="submit"
                  className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition"
                >
                  {editingPet ? "Update Pet" : "Create Pet"}
                </button>
              )}
              <button
                type="button"
                onClick={() => resetForm()}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition ml-auto"
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
            className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
          >
            {/* Profile Picture */}
            {pet.profileImage && (
              <div
                onClick={() => router.push(`/pets/${pet._id}`)}
                className="w-full h-48 overflow-hidden bg-gray-200 cursor-pointer hover:opacity-80 transition"
              >
                <img
                  src={pet.profileImage}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div
                  className="flex-1 cursor-pointer hover:opacity-70 transition"
                  onClick={() => router.push(`/pets/${pet._id}`)}
                >
                  <h3 className="text-xl font-bold text-gray-900">
                    {pet.name}
                  </h3>
                  <p className="text-sm text-gray-600 capitalize">
                    {pet.animal}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => togglePetExpanded(pet._id)}
                    className="text-gray-500 hover:text-gray-700 transition"
                  >
                    <ChevronDown
                      size={20}
                      className={`transition-transform ${
                        expandedPets[pet._id] ? "rotate-180" : ""
                      }`}
                    />
                  </button>
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

              {/* Expanded Details */}
              {expandedPets[pet._id] && (
                <div className="space-y-2 text-sm pt-4 border-t border-gray-200">
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
                      <span className="font-medium">Weight:</span> {pet.weight}{" "}
                      lbs
                    </p>
                  )}
                  {pet.dateOfBirth && (
                    <p>
                      <span className="font-medium">DOB:</span>{" "}
                      {new Date(pet.dateOfBirth).toLocaleDateString()}
                    </p>
                  )}
                  {pet.allergies && (
                    <p>
                      <span className="font-medium">Allergies:</span>{" "}
                      {pet.allergies}
                    </p>
                  )}
                  {pet.chronicIssues && (
                    <p>
                      <span className="font-medium">Chronic Issues:</span>{" "}
                      {pet.chronicIssues}
                    </p>
                  )}
                  {pet.exerciseNeeds && (
                    <p>
                      <span className="font-medium">Exercise Needs:</span>{" "}
                      {pet.exerciseNeeds}
                    </p>
                  )}
                  {pet.microchipNumber && (
                    <p>
                      <span className="font-medium">Microchip Number:</span>{" "}
                      {pet.microchipNumber}
                    </p>
                  )}
                  {/* Medical Records */}
                  {pet.medicalRecords && pet.medicalRecords.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-3">
                        📋{" "}
                        <span className="font-medium">
                          {pet.medicalRecords.length}
                        </span>{" "}
                        medical record
                        {pet.medicalRecords.length !== 1 ? "s" : ""}
                      </p>
                      <div className="space-y-2">
                        {pet.medicalRecords.map((record, idx) => (
                          <div
                            key={idx}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-900 truncate">
                                {record.fileName}
                              </p>
                              {record.description && (
                                <p className="text-xs text-gray-600 truncate">
                                  {record.description}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() =>
                                setSelectedMedicalRecord({
                                  ...record,
                                  petId: pet._id,
                                })
                              }
                              className="ml-2 p-1.5 text-blue-500 hover:bg-blue-50 rounded transition"
                              title="View file"
                            >
                              <Eye size={16} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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

      {selectedMedicalRecord && (
        <MedicalRecordViewer
          fileUrl={selectedMedicalRecord.fileUrl}
          fileName={selectedMedicalRecord.fileName}
          petId={selectedMedicalRecord.petId}
          onClose={() => setSelectedMedicalRecord(null)}
        />
      )}
    </div>
  );
}
