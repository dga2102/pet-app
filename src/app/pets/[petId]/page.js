"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Eye, Loader } from "lucide-react";
import MedicalRecordViewer from "@/components/MedicalRecordViewer";

export default function PetDetailPage() {
  const { isLoaded, userId } = useAuth();
  const router = useRouter();
  const params = useParams();
  const petId = params?.petId;

  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedMedicalRecord, setSelectedMedicalRecord] = useState(null);

  useEffect(() => {
    if (!isLoaded || !userId) return;

    const fetchPet = async () => {
      try {
        const response = await fetch(`/api/pets/${petId}`);
        if (response.ok) {
          const data = await response.json();
          setPet(data);
        }
      } catch (error) {
        console.error("Error fetching pet:", error);
      } finally {
        setLoading(false);
      }
    };

    if (petId) fetchPet();
  }, [petId, isLoaded, userId]);

  if (!isLoaded || !userId) return null;

  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-96">
          <Loader className="animate-spin text-blue-500" size={40} />
        </div>
      </main>
    );
  }

  if (!pet) {
    return (
      <main className="container mx-auto px-4 py-8">
        <button
          onClick={() => router.push("/pets")}
          className="flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-6 transition"
        >
          <ArrowLeft size={20} />
          Back to my pets
        </button>

        <div className="bg-white rounded-lg shadow p-6 text-center">
          <p className="text-gray-600">Pet not found</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.push("/pets")}
        className="flex items-center gap-2 text-blue-500 hover:text-blue-700 mb-6 transition"
      >
        <ArrowLeft size={20} />
        Back to my pets
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {pet.profileImage && (
              <div className="w-full h-96 overflow-hidden bg-gray-200">
                <img
                  src={pet.profileImage}
                  alt={pet.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-6">
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {pet.name}
              </h1>
              <p className="text-lg text-gray-600 capitalize">{pet.animal}</p>
            </div>
          </div>

          {/* Medical Records */}
          {pet.medicalRecords?.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Medical Records ({pet.medicalRecords.length})
              </h2>

              <div className="space-y-3">
                {pet.medicalRecords.map((record, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {record.fileName || "Unnamed File"}
                      </p>

                      {record.description && (
                        <p className="text-sm text-gray-600 mt-1">
                          {record.description}
                        </p>
                      )}

                      {record.uploadedAt && (
                        <p className="text-xs text-gray-500 mt-1">
                          Uploaded:{" "}
                          {new Date(record.uploadedAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>

                    <button
                      onClick={() =>
                        setSelectedMedicalRecord({
                          fileUrl: record.fileUrl, // FIXED
                          fileName: record.fileName, // FIXED
                          petId: pet._id,
                        })
                      }
                      className="ml-4 p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Eye size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Quick Information
            </h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Animal Type</span>
                <span className="font-medium text-gray-900 capitalize">
                  {pet.animal}
                </span>
              </div>

              {pet.medicalRecords?.length > 0 && (
                <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                  <span className="text-gray-600">Medical Records</span>
                  <span className="font-medium text-gray-900">
                    {pet.medicalRecords.length}
                  </span>
                </div>
              )}

              {pet.microchipNumber && (
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Microchipped</span>
                  <span className="text-green-600 font-medium">✓ Yes</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Viewer Modal */}
      {selectedMedicalRecord && (
        <MedicalRecordViewer
          fileUrl={selectedMedicalRecord.fileUrl}
          fileName={selectedMedicalRecord.fileName}
          petId={selectedMedicalRecord.petId}
          onClose={() => setSelectedMedicalRecord(null)}
        />
      )}
    </main>
  );
}
