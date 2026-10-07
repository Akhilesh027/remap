import React, { useState } from "react";
// Renamed imports for clarity, assuming the component names inside the files are:
// Addventure.jsx exports PropertyForm (VenturePlotForm)
// Addproperty.jsx exports AddProperty (LandAddingForm)
import VenturePlotForm from "./Addventure"; 
import LandAddingForm from "./Addproperty";

const PropertyPage = () => {
  // Use meaningful tab names that match the UI labels
  const [activeMainTab, setActiveMainTab] = useState("land");

  const getTabClasses = (tabName, activeColor) => `
    flex-1 p-3 text-center font-semibold transition-colors duration-200
    ${
      activeMainTab === tabName
        ? `border-b-4 border-${activeColor}-500 text-${activeColor}-600`
        : "text-gray-500 hover:text-gray-700"
    }
  `;

  return (
    <div className="max-w-6xl mx-auto p-6 mt-10 bg-white rounded-2xl shadow-xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 border-b pb-3">Property Data Entry</h1>

      {/* Main Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={getTabClasses("land", "green")}
          onClick={() => setActiveMainTab("land")}
        >
          Land Adding
        </button>
        <button
          className={getTabClasses("venture", "blue")}
          onClick={() => setActiveMainTab("venture")}
        >
          Venture & Plot Adding
        </button>
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {/* Assumes AddProperty component is the content for "Land Adding" */}
        {activeMainTab === "land" && <LandAddingForm />}
        
        {/* Assumes PropertyForm component (from Addventure.jsx) is the content for "Venture & Plot Adding" */}
        {activeMainTab === "venture" && <VenturePlotForm />}
      </div>
    </div>
  );
};

export default PropertyPage;