import React from "react";
import { mockData } from "../utils/data";
import { Card, CardContent } from "../components/Card";
import { Calendar, Car, Users, Wallet } from "lucide-react";

const DirectorDashboard = () => {
  // Filter data related to Director role
  const directorLeads = mockData.leads.filter(
    (lead) => lead.assigned === "Unassigned" || lead.assigned === "Pooja Reddy"
  );
  const cabBookings = mockData.cabRequests.filter(
    (cab) => cab.status !== "Completed"
  );
  const appointments = mockData.appointments;

  // Dashboard Stats
  const stats = [
    {
      title: "Total Leads",
      value: mockData.leads.length,
      icon: <Users className="text-blue-500 w-6 h-6" />,
    },
    {
      title: "Properties",
      value: mockData.properties.length,
      icon: <Calendar className="text-green-500 w-6 h-6" />,
    },
    {
      title: "My Commission",
      value: "₹1,25,000", // Placeholder, dynamic update when Rank-S updates
      icon: <Wallet className="text-yellow-500 w-6 h-6" />,
    },
    {
      title: "Appointments",
      value: appointments.length,
      icon: <Car className="text-purple-500 w-6 h-6" />,
    },
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Heading */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">
        Director Dashboard
      </h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-md rounded-2xl bg-white p-4 flex items-center">
            <div className="p-3 bg-gray-100 rounded-full">{stat.icon}</div>
            <div className="ml-4">
              <h2 className="text-gray-500 text-sm">{stat.title}</h2>
              <p className="text-xl font-semibold">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Leads & Appointments Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Leads Section */}
        <Card className="shadow-md bg-white rounded-2xl">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">Recent Leads</h2>
            {directorLeads.length > 0 ? (
              <ul className="space-y-3">
                {directorLeads.map((lead) => (
                  <li
                    key={lead.id}
                    className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    <p className="font-medium">{lead.name}</p>
                    <p className="text-sm text-gray-600">{lead.phone}</p>
                    <span className="text-xs text-blue-600">
                      Status: {lead.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No recent leads</p>
            )}
          </CardContent>
        </Card>

        {/* Appointments Section */}
        <Card className="shadow-md bg-white rounded-2xl">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">Upcoming Appointments</h2>
            {appointments.length > 0 ? (
              <ul className="space-y-3">
                {appointments.map((appt) => (
                  <li
                    key={appt.id}
                    className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    <p className="font-medium">{appt.client}</p>
                    <p className="text-sm text-gray-600">
                      {appt.date} at {appt.time}
                    </p>
                    <span className="text-xs text-green-600">
                      Property: {appt.property}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No upcoming appointments</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Cab Booking Section */}
      <div className="mt-8">
        <Card className="shadow-md bg-white rounded-2xl">
          <CardContent className="p-4">
            <h2 className="text-lg font-semibold mb-4">Cab Bookings</h2>
            {cabBookings.length > 0 ? (
              <ul className="space-y-3">
                {cabBookings.map((cab) => (
                  <li
                    key={cab.id}
                    className="p-3 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                  >
                    <p className="font-medium">{cab.executive}</p>
                    <p className="text-sm text-gray-600">
                      {cab.pickup} → {cab.destination}
                    </p>
                    <span className="text-xs text-purple-600">
                      Status: {cab.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500 text-sm">No cab bookings found</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DirectorDashboard;
