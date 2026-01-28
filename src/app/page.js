"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  PawPrint,
  Heart,
  Calendar,
  Users,
  ShoppingCart,
  Activity,
} from "lucide-react";

export default function Home() {
  const [user, setUser] = useState(null);
  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    }
    loadUser();
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-emerald-700">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 md:py-32">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              <span className="text-green-600">Pet Care</span> Made Easy
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Manage your pets' health, schedules, and daily care all in one
              place. Keep your family organized and your pets happy.
            </p>

            {!user && (
              <div className="flex gap-4">
                <Link
                  href="/register"
                  className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>

                <Link
                  href="/login"
                  className="bg-gray-200 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>

          <div className="hidden md:block">
            <div className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-blue-200">
              <PawPrint className="text-blue-600 mb-4" size={48} />
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                All Your Pet's Needs
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-center gap-2">
                  <Heart size={20} className="text-red-500" />
                  Health & Medical Records
                </li>
                <li className="flex items-center gap-2">
                  <Calendar size={20} className="text-orange-500" />
                  Appointments & Schedules
                </li>
                <li className="flex items-center gap-2">
                  <Activity size={20} className="text-green-500" />
                  Daily Care Tasks
                </li>
                <li className="flex items-center gap-2">
                  <Users size={20} className="text-purple-500" />
                  Family Management
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-16">
            Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-blue-50 rounded-xl p-8 hover:shadow-lg transition">
              <PawPrint className="text-blue-600 mb-4" size={40} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Pet Profiles
              </h3>
              <p className="text-gray-700">
                Create detailed profiles for each pet with breed, age, medical
                history, and vaccination records.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-green-50 rounded-xl p-8 hover:shadow-lg transition">
              <Calendar className="text-green-600 mb-4" size={40} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Smart Calendar
              </h3>
              <p className="text-gray-700">
                View your pet's entire schedule with calendar integration. Never
                miss an appointment.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-purple-50 rounded-xl p-8 hover:shadow-lg transition">
              <Activity className="text-purple-600 mb-4" size={40} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Care Planning
              </h3>
              <p className="text-gray-700">
                Create daily tasks and assign them to family members. Keep
                everyone accountable.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-red-50 rounded-xl p-8 hover:shadow-lg transition">
              <Heart className="text-red-600 mb-4" size={40} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Health Tracking
              </h3>
              <p className="text-gray-700">
                Track medications, vaccinations, vet appointments, and health
                records in one place.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-orange-50 rounded-xl p-8 hover:shadow-lg transition">
              <ShoppingCart className="text-orange-600 mb-4" size={40} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Shopping List
              </h3>
              <p className="text-gray-700">
                Keep track of pet food, supplies, toys, and medications you need
                to buy.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-indigo-50 rounded-xl p-8 hover:shadow-lg transition">
              <Users className="text-indigo-600 mb-4" size={40} />
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                Family Sharing
              </h3>
              <p className="text-gray-700">
                Invite family members to manage your pets together. Assign roles
                and responsibilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Start?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our league of pet owners who are keeping their pets healthier
            and happier with organized care.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-4">
            PetCare © {new Date().getFullYear()}. All rights reserved.
          </p>
          <p className="text-gray-400">Made with ❤️ by TeamTwo</p>
        </div>
      </footer>
    </div>
  );
}
