"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { createOrganization, getOrganizations, updateOrganizationSubscription } from "../../../lib/api-client";
import { SUBSCRIPTION_PLANS } from "../../../lib/types/organization";
import { FaBuilding, FaUsers, FaFileAlt, FaCheckCircle, FaTimes, FaEdit, FaPlus } from "react-icons/fa";

interface Organization {
  id: string;
  name: string;
  email: string;
  subscriptionPlan: string;
  subscriptionStatus: string;
  maxUsers: number;
  maxCases: number;
  currentUsers: number;
  currentCases: number;
}

const AdminPage: React.FC = () => {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingOrg, setEditingOrg] = useState<Organization | null>(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    domain: "",
    subscriptionPlan: "starter" as const,
  });

  useEffect(() => {
    if (!user) return;
    fetchOrganizations();
  }, [user]);

  const fetchOrganizations = async () => {
    try {
      setLoading(true);
      const orgs = await getOrganizations();
      setOrganizations(orgs);
      setError("");
    } catch (err) {
      setError("Failed to fetch organizations");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      await createOrganization({
        ...form,
        createdBy: user.uid,
      });
      setShowCreateModal(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        address: "",
        domain: "",
        subscriptionPlan: "starter",
      });
      fetchOrganizations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create organization");
    }
  };

  const handleUpdateSubscription = async (orgId: string, plan: string) => {
    try {
      await updateOrganizationSubscription(orgId, {
        subscriptionPlan: plan as any,
      });
      fetchOrganizations();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update subscription");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "trial":
        return "bg-blue-100 text-blue-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 text-sm sm:text-base mt-1">Manage law firms and subscriptions</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition font-semibold flex items-center gap-2 text-sm sm:text-base"
        >
          <FaPlus /> Onboard New Firm
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
          <p className="mt-2 text-slate-600 text-sm">Loading organizations...</p>
        </div>
      ) : organizations.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border-2 border-dashed border-slate-300">
          <FaBuilding className="text-4xl text-slate-400 mx-auto mb-3" />
          <p className="text-slate-600 mb-4">No organizations yet</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition font-semibold"
          >
            Onboard Your First Firm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {organizations.map((org) => {
            const plan = SUBSCRIPTION_PLANS[org.subscriptionPlan as keyof typeof SUBSCRIPTION_PLANS];
            return (
              <div key={org.id} className="bg-white rounded-lg border border-slate-200 p-4 sm:p-6 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{org.name}</h3>
                    <p className="text-sm text-slate-600">{org.email}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(org.subscriptionStatus)}`}>
                    {org.subscriptionStatus}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600">Plan:</span>
                    <span className="font-semibold text-slate-900">{plan.name}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-1">
                      <FaUsers /> Users:
                    </span>
                    <span className="font-semibold">
                      {org.currentUsers} / {org.maxUsers === -1 ? "∞" : org.maxUsers}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-600 flex items-center gap-1">
                      <FaFileAlt /> Cases:
                    </span>
                    <span className="font-semibold">
                      {org.currentCases} / {org.maxCases === -1 ? "∞" : org.maxCases}
                    </span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-200">
                  <label className="block text-xs font-semibold text-slate-700 mb-2">Change Plan:</label>
                  <select
                    value={org.subscriptionPlan}
                    onChange={(e) => handleUpdateSubscription(org.id, e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                  >
                    {Object.values(SUBSCRIPTION_PLANS).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${p.price}/mo)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Organization Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-lg p-6 shadow-2xl w-full max-w-md space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900">Onboard New Law Firm</h2>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <FaTimes />
              </button>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Firm Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Email *</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Subscription Plan *</label>
              <select
                value={form.subscriptionPlan}
                onChange={(e) => setForm({ ...form, subscriptionPlan: e.target.value as any })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              >
                {Object.values(SUBSCRIPTION_PLANS).map((plan) => (
                  <option key={plan.id} value={plan.id}>
                    {plan.name} - ${plan.price}/mo ({plan.maxUsers === -1 ? "Unlimited" : plan.maxUsers} users, {plan.maxCases === -1 ? "Unlimited" : plan.maxCases} cases)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-4">
              <button
                type="submit"
                className="flex-1 bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition font-semibold"
              >
                Create Organization
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-300 transition font-semibold"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
