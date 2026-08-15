import React, { useState } from "react";
import {
  User,
  Bell,
  Shield,
  CreditCard,
  Save,
} from "lucide-react";

export default function Settings() {
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    fullName: "John Recruiter",
    email: "",
    company: "HireResQ",
    notifications: true,
    emailNotifications: true,
  });

  const handleChange = (field, value) => {
    setSettings((current) => ({
      ...current,
      [field]: value,
    }));

    setSaved(false);
  };

  const handleSave = () => {
    localStorage.setItem(
      "hireresq_settings",
      JSON.stringify(settings)
    );

    setSaved(true);

    setTimeout(() => {
      setSaved(false);
    }, 3000);
  };

  return (
    <div className="min-h-full bg-gray-50 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Settings
        </h1>

        <p className="mt-2 text-gray-600">
          Manage your HireResQ account and application preferences.
        </p>
      </div>

      <div className="max-w-5xl space-y-6">
        {/* Profile */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <User className="w-5 h-5 text-red-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Profile
                </h2>

                <p className="text-sm text-gray-500">
                  Update your account information.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>

              <input
                type="text"
                value={settings.fullName}
                onChange={(e) =>
                  handleChange("fullName", e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>

              <input
                type="email"
                value={settings.email}
                onChange={(e) =>
                  handleChange("email", e.target.value)
                }
                placeholder="your@email.com"
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>

              <input
                type="text"
                value={settings.company}
                onChange={(e) =>
                  handleChange("company", e.target.value)
                }
                className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Bell className="w-5 h-5 text-red-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h2>

                <p className="text-sm text-gray-500">
                  Control how HireResQ keeps you informed.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">
                  Application Notifications
                </p>

                <p className="text-sm text-gray-500">
                  Receive notifications about recruitment activity.
                </p>
              </div>

              <input
                type="checkbox"
                checked={settings.notifications}
                onChange={(e) =>
                  handleChange(
                    "notifications",
                    e.target.checked
                  )
                }
                className="w-5 h-5 accent-red-600"
              />
            </label>

            <label className="flex items-center justify-between gap-4 cursor-pointer">
              <div>
                <p className="font-medium text-gray-900">
                  Email Notifications
                </p>

                <p className="text-sm text-gray-500">
                  Receive important updates by email.
                </p>
              </div>

              <input
                type="checkbox"
                checked={settings.emailNotifications}
                onChange={(e) =>
                  handleChange(
                    "emailNotifications",
                    e.target.checked
                  )
                }
                className="w-5 h-5 accent-red-600"
              />
            </label>
          </div>
        </section>

        {/* Security */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <Shield className="w-5 h-5 text-red-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Security
                </h2>

                <p className="text-sm text-gray-500">
                  Manage account security settings.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <button
              type="button"
              className="px-5 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
            >
              Change Password
            </button>
          </div>
        </section>

        {/* Subscription */}
        <section className="bg-white rounded-2xl border border-gray-200 shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-red-600" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  Subscription
                </h2>

                <p className="text-sm text-gray-500">
                  Manage your HireResQ subscription.
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-gray-900">
                  Pro Plan
                </p>

                <p className="text-sm text-gray-500">
                  Your current HireResQ plan
                </p>
              </div>

              <button
                type="button"
                className="px-5 py-3 rounded-xl bg-black hover:bg-gray-800 text-white font-medium"
              >
                Manage Plan
              </button>
            </div>
          </div>
        </section>

        {/* Save */}
        <div className="flex items-center justify-end gap-4 pb-8">
          {saved && (
            <span className="text-sm text-green-600 font-medium">
              Settings saved successfully.
            </span>
          )}

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-medium"
          >
            <Save className="w-5 h-5" />
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );
}