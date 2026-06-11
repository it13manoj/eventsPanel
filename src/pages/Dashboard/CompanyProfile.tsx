
import { useState } from "react";
import {
  Building2,
  Calendar,
  Users,
  Edit,
  Save,
  X,
} from "lucide-react";

export default function CompanyProfile() {
  const [isEditing, setIsEditing] = useState(false);

  const [company, setCompany] = useState({
    companyName: "ABC Event Management",
    email: "info@abcevents.com",
    phone: "+91 9876543210",
    website: "www.abcevents.com",
    address: "Patna, Bihar, India",
    gst: "10ABCDE1234F1Z5",
    founded: "2018",
    totalEvents: "250",
    teamMembers: "35",
    about:
      "ABC Event Management specializes in weddings, corporate events, birthday parties, cultural programs, and large-scale event planning across India.",
  });

  const handleChange = (e) => {
    setCompany({
      ...company,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 text-white">
          <div className="flex items-center gap-5">
            <div className="h-24 w-24 bg-white rounded-full flex items-center justify-center">
              <Building2 size={50} className="text-blue-600" />
            </div>

            <div>
              <h1 className="text-3xl font-bold">
                {company.companyName}
              </h1>
              <p className="text-blue-100">
                Event Management Company
              </p>
            </div>
          </div>
        </div>

        {/* Company Details */}
        <div className="p-8">
          <div className="grid md:grid-cols-2 gap-6">

            <div>
              <label className="font-semibold">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={company.companyName}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full mt-1 border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={company.email}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full mt-1 border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold">
                Phone
              </label>
              <input
                type="text"
                name="phone"
                value={company.phone}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full mt-1 border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold">
                Website
              </label>
              <input
                type="text"
                name="website"
                value={company.website}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full mt-1 border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold">
                GST Number
              </label>
              <input
                type="text"
                name="gst"
                value={company.gst}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full mt-1 border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold">
                Founded Year
              </label>
              <input
                type="text"
                name="founded"
                value={company.founded}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full mt-1 border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold">
                Total Events
              </label>
              <input
                type="text"
                name="totalEvents"
                value={company.totalEvents}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full mt-1 border rounded-lg p-2"
              />
            </div>

            <div>
              <label className="font-semibold">
                Team Members
              </label>
              <input
                type="text"
                name="teamMembers"
                value={company.teamMembers}
                onChange={handleChange}
                disabled={!isEditing}
                className="w-full mt-1 border rounded-lg p-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-semibold">
                Address
              </label>
              <textarea
                name="address"
                value={company.address}
                onChange={handleChange}
                disabled={!isEditing}
                rows={2}
                className="w-full mt-1 border rounded-lg p-2"
              />
            </div>

            <div className="md:col-span-2">
              <label className="font-semibold">
                About Company
              </label>
              <textarea
                name="about"
                value={company.about}
                onChange={handleChange}
                disabled={!isEditing}
                rows={4}
                className="w-full mt-1 border rounded-lg p-2"
              />
            </div>
          </div>

          {/* Statistics */}
          <div className="grid md:grid-cols-3 gap-5 mt-8">
            <div className="bg-blue-50 p-5 rounded-lg text-center">
              <Calendar size={30} className="mx-auto text-blue-600" />
              <h3 className="text-2xl font-bold mt-2">
                {company.totalEvents}
              </h3>
              <p>Total Events</p>
            </div>

            <div className="bg-green-50 p-5 rounded-lg text-center">
              <Users size={30} className="mx-auto text-green-600" />
              <h3 className="text-2xl font-bold mt-2">
                {company.teamMembers}
              </h3>
              <p>Team Members</p>
            </div>

            <div className="bg-purple-50 p-5 rounded-lg text-center">
              <Building2 size={30} className="mx-auto text-purple-600" />
              <h3 className="text-2xl font-bold mt-2">
                {company.founded}
              </h3>
              <p>Founded</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg"
              >
                <Edit size={18} />
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg"
                >
                  <Save size={18} />
                  Save
                </button>

                <button
                  onClick={() => setIsEditing(false)}
                  className="flex items-center gap-2 bg-red-600 text-white px-5 py-2 rounded-lg"
                >
                  <X size={18} />
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}