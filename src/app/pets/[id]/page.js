"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  Loader,
  Calendar,
  Weight,
  Cake,
  AlertCircle,
  Heart,
  Activity,
  FileText,
  Eye,
  User,
  PawPrint,
} from "lucide-react";
import MedicalRecordViewer from "@/components/MedicalRecordViewer";

export default function PetDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [petId, setPetId] = useState(null);

  const [pet, setPet] = useState(null);
  const [householdMembers, setHouseholdMembers] = useState([]);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(null);

  useEffect(() => {
    // Handle async params in Next.js 15
    const getParams = async () => {
      const resolvedParams = await params;
      setPetId(resolvedParams.id);
    };
    getParams();
  }, [params]);

  useEffect(() => {
    if (petId) {
      fetchPetDetails();
    }
  }, [petId]);

  const fetchPetDetails = async () => {
    try {
      setLoading(true);

      // Fetch pet details
      const petResponse = await fetch(`/api/pets/${petId}`);
      if (!petResponse.ok) {
        router.push("/pets");
        return;
      }
      const petData = await petResponse.json();
      setPet(petData);

      // Fetch household members
      const membersResponse = await fetch("/api/household/members");
      const membersData = await membersResponse.json();

      if (membersData.success) {
        setHouseholdMembers(membersData.members);

        // Get current user
        const userResponse = await fetch("/api/auth/me");
        const userData = await userResponse.json();

        if (userData.user) {
          const currentMember = membersData.members.find(
            (m) => m.id.toString() === userData.user.id.toString(),
          );
          setIsOwner(currentMember?.role === "owner");
        }
      }
    } catch (error) {
      console.error("Error fetching pet details:", error);
      router.push("/pets");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      confirm(
        `Are you sure you want to delete ${pet.name}? This action cannot be undone.`,
      )
    ) {
      try {
        const response = await fetch(`/api/pets/${petId}`, {
          method: "DELETE",
        });

        if (response.ok) {
          router.push("/pets");
        } else {
          const errorData = await response.json();
          alert(`Error: ${errorData.error || "Failed to delete pet"}`);
        }
      } catch (error) {
        console.error("Error deleting pet:", error);
        alert("Error deleting pet. Please try again.");
      }
    }
  };

  const handleUpdatePrimaryCarer = async (carerId) => {
    if (!isOwner) {
      alert("Only household owners can assign primary carers");
      return;
    }

    try {
      const response = await fetch(`/api/pets/${petId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ primaryCarer: carerId || null }),
      });

      if (response.ok) {
        fetchPetDetails();
      } else {
        const errorData = await response.json();
        alert(`Error: ${errorData.error || "Failed to update primary carer"}`);
      }
    } catch (error) {
      console.error("Error updating primary carer:", error);
      alert("Error updating primary carer. Please try again.");
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not provided";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birthDate.getDate())
    ) {
      age--;
    }
    return age;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader className="animate-spin text-blue-500" size={32} />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="mx-auto text-gray-400 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Pet Not Found</h2>
        <p className="text-gray-600 mb-6">
          The pet you're looking for doesn't exist or you don't have access to
          it.
        </p>
        <button
          onClick={() => router.push("/pets")}
          className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Back to Pets
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => router.push("/pets")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
        >
          <ArrowLeft size={20} />
          Back to Pets
        </button>
        <div className="flex gap-2">
          <button
            onClick={() => router.push(`/pets/${petId}/edit`)}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
          >
            <Edit size={18} />
            Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
          >
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6">
          {/* Profile Picture */}
          <div className="md:col-span-1">
            <div className="aspect-square rounded-lg overflow-hidden bg-gray-200">
              {pet.profileImage ? (
                <img
                  src={pet.profileImage}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                  <PawPrint size={80} className="text-white opacity-50" />
                </div>
              )}
            </div>
          </div>

          {/* Basic Info */}
          <div className="md:col-span-2 space-y-4">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {pet.name}
              </h1>
              <p className="text-xl text-gray-600 capitalize">{pet.animal}</p>
              {pet.breed && (
                <p className="text-lg text-gray-500">{pet.breed}</p>
              )}
            </div>

            {/* Primary Carer */}
            <div className="border-t border-gray-200 pt-4">
              <label className="block text-sm font-medium text-gray-600 mb-2">
                Primary Carer
              </label>
              {isOwner ? (
                <select
                  value={pet.primaryCarer?._id || ""}
                  onChange={(e) => handleUpdatePrimaryCarer(e.target.value)}
                  className="w-full md:w-auto border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option value="">Not assigned</option>
                  {householdMembers.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              ) : pet.primaryCarer ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold">
                    {pet.primaryCarer.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {pet.primaryCarer.name}
                    </p>
                    <p className="text-sm text-gray-600">
                      {pet.primaryCarer.email}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">No primary carer assigned</p>
              )}
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-gray-200 pt-4">
              {pet.age && (
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-600">Age</p>
                    <p className="font-semibold text-gray-900">
                      {pet.age} years
                    </p>
                  </div>
                </div>
              )}
              {pet.weight && (
                <div className="flex items-center gap-2">
                  <Weight size={20} className="text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-600">Weight</p>
                    <p className="font-semibold text-gray-900">
                      {pet.weight} lbs
                    </p>
                  </div>
                </div>
              )}
              {pet.dateOfBirth && (
                <div className="flex items-center gap-2">
                  <Cake size={20} className="text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-600">Birthday</p>
                    <p className="font-semibold text-gray-900">
                      {formatDate(pet.dateOfBirth)}
                    </p>
                  </div>
                </div>
              )}
              {pet.microchipNumber && (
                <div className="flex items-center gap-2">
                  <Activity size={20} className="text-blue-500" />
                  <div>
                    <p className="text-xs text-gray-600">Microchip</p>
                    <p className="font-semibold text-gray-900 text-xs">
                      {pet.microchipNumber}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Health Information */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Heart className="text-red-500" size={24} />
            <h2 className="text-xl font-bold text-gray-900">
              Health Information
            </h2>
          </div>

          <div className="space-y-4">
            {pet.allergies && (
              <div>
                <p className="text-sm font-medium text-gray-600">Allergies</p>
                <p className="text-gray-900">{pet.allergies}</p>
              </div>
            )}

            {pet.chronicIssues && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Chronic Issues
                </p>
                <p className="text-gray-900">{pet.chronicIssues}</p>
              </div>
            )}

            {pet.exerciseNeeds && (
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Exercise Needs
                </p>
                <p className="text-gray-900">{pet.exerciseNeeds}</p>
              </div>
            )}

            {!pet.allergies && !pet.chronicIssues && !pet.exerciseNeeds && (
              <p className="text-gray-500 text-center py-4">
                No health information recorded
              </p>
            )}
          </div>
        </div>

        {/* Medical History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-blue-500" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Medical History</h2>
          </div>

          {pet.medicalHistory && pet.medicalHistory.length > 0 ? (
            <div className="space-y-3">
              {pet.medicalHistory.map((record, index) => (
                <div
                  key={index}
                  className="border-l-4 border-blue-500 pl-4 py-2"
                >
                  <p className="font-semibold text-gray-900">
                    {record.condition}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatDate(record.date)}
                  </p>
                  {record.notes && (
                    <p className="text-sm text-gray-700 mt-1">{record.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No medical history recorded
            </p>
          )}
        </div>

        {/* Medications */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-green-500" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Medications</h2>
          </div>

          {pet.medications && pet.medications.length > 0 ? (
            <div className="space-y-3">
              {pet.medications.map((med, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <p className="font-semibold text-gray-900">{med.name}</p>
                  <p className="text-sm text-gray-600">
                    {med.dosage} • {med.frequency}
                  </p>
                  <div className="flex gap-4 mt-2 text-xs text-gray-500">
                    {med.startDate && (
                      <span>Start: {formatDate(med.startDate)}</span>
                    )}
                    {med.endDate && <span>End: {formatDate(med.endDate)}</span>}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No medications recorded
            </p>
          )}
        </div>

        {/* Vaccinations */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle className="text-purple-500" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Vaccinations</h2>
          </div>

          {pet.vaccinations && pet.vaccinations.length > 0 ? (
            <div className="space-y-3">
              {pet.vaccinations.map((vac, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-3"
                >
                  <p className="font-semibold text-gray-900">{vac.name}</p>
                  <div className="mt-2 space-y-1 text-sm">
                    <p className="text-gray-600">
                      Given: {formatDate(vac.date)}
                    </p>
                    {vac.expiryDate && (
                      <p className="text-gray-600">
                        Expires: {formatDate(vac.expiryDate)}
                      </p>
                    )}
                    {vac.veterinarian && (
                      <p className="text-gray-600">By: {vac.veterinarian}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">
              No vaccinations recorded
            </p>
          )}
        </div>
      </div>

      {/* Medical Records */}
      {pet.medicalRecords && pet.medicalRecords.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="text-orange-500" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Medical Records</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {pet.medicalRecords.map((record, index) => (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {record.fileName}
                    </p>
                    {record.description && (
                      <p className="text-sm text-gray-600 mt-1">
                        {record.description}
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      {formatDate(record.uploadedAt)}
                    </p>
                  </div>
                  <button
                    onClick={() => setSelectedMedicalRecord(record)}
                    className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition flex-shrink-0"
                    title="View file"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Medical Record Viewer Modal */}
      {selectedMedicalRecord && (
        <MedicalRecordViewer
          fileUrl={selectedMedicalRecord.fileUrl}
          fileName={selectedMedicalRecord.fileName}
          onClose={() => setSelectedMedicalRecord(null)}
        />
      )}
    </div>
  );
}
