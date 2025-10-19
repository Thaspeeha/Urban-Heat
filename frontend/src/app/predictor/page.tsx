"use client";

import { useState } from "react";
import Header from "../components/Header";

export default function HeatVision2030() {
  const [city, setCity] = useState("Dubai Downtown");
  const [year, setYear] = useState("2030");

  return (
    <main
      className="min-h-screen flex flex-col font-sans text-gray-800"
      style={{ backgroundColor: "#F9E8D0" }}
    >
      {/* Navbar */}
      <Header />
      

      {/* Main content section */}
      <section
        className="py-6 px-8 flex flex-col gap-1"
        style={{ backgroundColor: "#FFD74A" }}
      >
        <h1 className="text-2xl font-bold text-gray-900 mt-2">
          HeatVision 2030
        </h1>
        <p className="italic text-gray-700">
          Predicting the Future Heatscape of UAE cities (2030)
        </p>
        <p className="text-gray-700 text-sm">
          Witness how your city transforms due to Urban Heat in 2030 —
          powered by AI and satellite intelligence
        </p>
      </section>

      <section className="flex flex-col items-center text-center px-6 py-10 max-w-3xl mx-auto">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">
          Seeing Tomorrows Heat, Today.
        </h2>
        <p className="text-gray-700 mb-6 text-sm leading-relaxed">
          Using satellite temperature and land cover data from 2010–2025,
          our AI model predicts the heat vulnerable zones.
        </p>

        {/* Dropdowns */}
        <div className="flex flex-wrap gap-4 mb-8 justify-center">
          <div className="flex flex-col text-left">
            <label
              htmlFor="city"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Select City Region
            </label>
            <select
              id="city"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option>Dubai Downtown</option>
              <option>Abu Dhabi Central</option>
              <option>Sharjah City</option>
              <option>Al Ain</option>
            </select>
          </div>

          <div className="flex flex-col text-left">
            <label
              htmlFor="year"
              className="text-sm font-medium text-gray-700 mb-1"
            >
              Predict for Year
            </label>
            <select
              id="year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="border border-gray-300 rounded-md px-3 py-2 text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-500"
            >
              <option>2030</option>
              <option>2035</option>
              <option>2040</option>
            </select>
          </div>
        </div>

        {/* Map Visualization - ONLY CHANGE HERE */}
        <iframe
          src={`http://localhost:8000/heat-map/${year}`}
          className="w-full h-80 rounded-xl shadow-inner"
          style={{ border: 'none' }}
          title="AI Heat Map Visualization"
        />

        {/* Actions */}
        <div className="mt-12 text-left w-full">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            What can we do?
          </h3>

          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div className="flex items-start gap-3">
              <span className="text-green-600 text-xl">🌳</span>
              <div>
                <p className="font-semibold text-gray-900">Urban Greenery</p>
                <p className="text-gray-700">
                  Every 10% increase in green cover can reduce local heat by up
                  to 1.5°C
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-yellow-600 text-xl">🏙</span>
              <div>
                <p className="font-semibold text-gray-900">
                  Reflective Surfaces
                </p>
                <p className="text-gray-700">
                  Smart materials lower roof and road temperatures cutting
                  city-wide heat gain
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-blue-600 text-xl">🧍‍♀</span>
              <div>
                <p className="font-semibold text-gray-900">
                  Community Protection
                </p>
                <p className="text-gray-700">
                  Cooling investments protect vulnerable neighborhoods from
                  extreme heat exposure
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}