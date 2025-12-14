"use client";
import React, { useEffect, useState } from "react";
import { useAuth } from "../../../context/AuthContext";
import { getClients, createClient, updateClient, deleteClient, getClientPayments, createPayment, updatePayment, deletePayment } from "../../../lib/api-client";
import { FaUser, FaEnvelope, FaPhone, FaMapMarkerAlt, FaSearch, FaPlus, FaEdit, FaTrash, FaRupeeSign, FaCalendarAlt, FaCreditCard, FaFileAlt } from "react-icons/fa";
import { useSearchParams } from "next/navigation";

interface Client {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
    userId: string;
}

interface Payment {
    id: string;
    amount: number;
    date: string;
    method?: string;
    description?: string;
    clientId: string;
}

const ClientsPage: React.FC = () => {
    const { user, userData } = useAuth();
    const searchParams = useSearchParams();
    const searchQuery = searchParams?.get("search") || "";
    const [clients, setClients] = useState<Client[]>([]);
    const [filteredClients, setFilteredClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
    const [payments, setPayments] = useState<{ [clientId: string]: Payment[] }>({});
    const [paymentTotals, setPaymentTotals] = useState<{ [clientId: string]: number }>({});
    const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
    const [isSearchExpanded, setIsSearchExpanded] = useState(!!searchQuery);
    const [form, setForm] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
    });
    const [paymentForm, setPaymentForm] = useState({
        amount: "",
        date: new Date().toISOString().split('T')[0],
        method: "",
        description: "",
    });
    const [editId, setEditId] = useState<string | null>(null);
    const [editingPaymentId, setEditingPaymentId] = useState<string | null>(null);
    const [deletingClientId, setDeletingClientId] = useState<string | null>(null);

    // Fetch clients
    useEffect(() => {
        if (!user) return;
        const fetchClients = async () => {
            setLoading(true);
            try {
                const res = await getClients(user.uid, userData?.organizationId);
                setClients(res);
                setError("");

                // Apply search filter
                if (searchQuery.trim()) {
                    const filtered = res.filter((c: Client) =>
                        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.phone?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        c.address?.toLowerCase().includes(searchQuery.toLowerCase())
                    );
                    setFilteredClients(filtered);
                } else {
                    setFilteredClients(res);
                }

                // Fetch payments for all clients
                const paymentPromises = res.map(async (client: Client) => {
                    try {
                        const clientPayments = await getClientPayments(client.id);
                        const total = clientPayments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
                        return { clientId: client.id, payments: clientPayments, total };
                    } catch (err) {
                        console.error(`Error fetching payments for client ${client.id}:`, err);
                        return { clientId: client.id, payments: [], total: 0 };
                    }
                });

                const paymentResults = await Promise.all(paymentPromises);
                const paymentsMap: { [key: string]: Payment[] } = {};
                const totalsMap: { [key: string]: number } = {};

                paymentResults.forEach(({ clientId, payments, total }) => {
                    paymentsMap[clientId] = payments;
                    totalsMap[clientId] = total;
                });

                setPayments(paymentsMap);
                setPaymentTotals(totalsMap);
            } catch (err) {
                setError("Failed to load clients");
                console.error("Error fetching clients:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchClients();
    }, [user, userData?.organizationId, searchQuery]);

    // Handle search
    const handleSearch = (query: string) => {
        setLocalSearchQuery(query);
        if (query.trim()) {
            const filtered = clients.filter((c) =>
                c.name.toLowerCase().includes(query.toLowerCase()) ||
                c.email?.toLowerCase().includes(query.toLowerCase()) ||
                c.phone?.toLowerCase().includes(query.toLowerCase()) ||
                c.address?.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredClients(filtered);
        } else {
            setFilteredClients(clients);
        }
    };

    // Handle add/edit client
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        if (!form.name.trim()) {
            setError("Client name is required");
            return;
        }

        try {
            setError("");
            if (editId) {
                await updateClient({
                    id: editId,
                    ...form,
                });
            } else {
                await createClient({
                    ...form,
                    userId: user.uid,
                    organizationId: userData?.organizationId,
                });
            }

            setShowModal(false);
            setForm({ name: "", email: "", phone: "", address: "", notes: "" });
            setEditId(null);

            // Refresh clients
            const res = await getClients(user.uid, userData?.organizationId);
            setClients(res);
            setFilteredClients(res);
        } catch (err) {
            setError("Failed to save client");
            console.error("Error saving client:", err);
        }
    };

    // Handle delete client
    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this client? All associated payments will also be deleted.")) {
            return;
        }

        setDeletingClientId(id);
        try {
            await deleteClient(id);
            if (!user) {
                setError("You must be logged in to delete clients.");
                return;
            }
            const res = await getClients(user.uid, userData?.organizationId);
            setClients(res);
            setFilteredClients(res);
            // Remove from payments state
            setPayments(prev => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
            setPaymentTotals(prev => {
                const updated = { ...prev };
                delete updated[id];
                return updated;
            });
        } catch (err) {
            setError("Failed to delete client");
            console.error("Error deleting client:", err);
        } finally {
            setDeletingClientId(null);
        }
    };

    // Handle edit client
    const handleEdit = (client: Client) => {
        setEditId(client.id);
        setForm({
            name: client.name,
            email: client.email || "",
            phone: client.phone || "",
            address: client.address || "",
            notes: client.notes || "",
        });
        setShowModal(true);
    };

    // Handle add payment
    const handleAddPayment = (clientId: string) => {
        setSelectedClientId(clientId);
        setEditingPaymentId(null);
        setPaymentForm({
            amount: "",
            date: new Date().toISOString().split('T')[0],
            method: "",
            description: "",
        });
        setShowPaymentModal(true);
    };

    // Handle edit payment
    const handleEditPayment = (payment: Payment) => {
        setEditingPaymentId(payment.id);
        setSelectedClientId(payment.clientId);
        setPaymentForm({
            amount: payment.amount.toString(),
            date: payment.date.split('T')[0],
            method: payment.method || "",
            description: payment.description || "",
        });
        setShowPaymentModal(true);
    };

    // Handle payment submit
    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedClientId) return;

        const amount = parseFloat(paymentForm.amount);
        if (isNaN(amount) || amount <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        try {
            setError("");
            if (editingPaymentId) {
                await updatePayment({
                    id: editingPaymentId,
                    amount,
                    date: paymentForm.date,
                    method: paymentForm.method,
                    description: paymentForm.description,
                });
            } else {
                await createPayment({
                    amount,
                    date: paymentForm.date,
                    method: paymentForm.method,
                    description: paymentForm.description,
                    clientId: selectedClientId,
                    userId: user.uid,
                });
            }

            setShowPaymentModal(false);
            setPaymentForm({
                amount: "",
                date: new Date().toISOString().split('T')[0],
                method: "",
                description: "",
            });
            setSelectedClientId(null);
            setEditingPaymentId(null);

            // Refresh payments
            const clientPayments = await getClientPayments(selectedClientId);
            const total = clientPayments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
            setPayments(prev => ({ ...prev, [selectedClientId]: clientPayments }));
            setPaymentTotals(prev => ({ ...prev, [selectedClientId]: total }));
        } catch (err) {
            setError("Failed to save payment");
            console.error("Error saving payment:", err);
        }
    };

    // Handle delete payment
    const handleDeletePayment = async (paymentId: string, clientId: string) => {
        if (!confirm("Are you sure you want to delete this payment?")) {
            return;
        }

        try {
            await deletePayment(paymentId);
            const clientPayments = await getClientPayments(clientId);
            const total = clientPayments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
            setPayments(prev => ({ ...prev, [clientId]: clientPayments }));
            setPaymentTotals(prev => ({ ...prev, [clientId]: total }));
        } catch (err) {
            setError("Failed to delete payment");
            console.error("Error deleting payment:", err);
        }
    };

    if (loading) {
        return (
            <div className="max-w-7xl mx-auto p-2 sm:p-4">
                <div className="flex items-center justify-center h-64">
                    <div className="text-slate-600">Loading clients...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto p-2 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3 flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Clients</h1>
                    {!isSearchExpanded && (
                        <button
                            onClick={() => setIsSearchExpanded(true)}
                            className="p-2 hover:bg-slate-100 rounded-lg transition"
                            aria-label="Search"
                        >
                            <FaSearch className="text-slate-600" />
                        </button>
                    )}
                    {isSearchExpanded && (
                        <div className="flex-1 max-w-md">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search clients..."
                                    value={localSearchQuery}
                                    onChange={(e) => {
                                        handleSearch(e.target.value);
                                        setLocalSearchQuery(e.target.value);
                                    }}
                                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                />
                            </div>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => {
                        setEditId(null);
                        setForm({ name: "", email: "", phone: "", address: "", notes: "" });
                        setShowModal(true);
                    }}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition font-semibold flex items-center gap-2 whitespace-nowrap"
                >
                    <FaPlus /> Add New Client
                </button>
            </div>

            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                    {error}
                </div>
            )}

            {filteredClients.length === 0 ? (
                <div className="bg-white rounded-lg shadow p-8 text-center">
                    <p className="text-slate-600">No clients found. Add your first client to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredClients.map((client) => (
                        <div
                            key={client.id}
                            className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-amber-500 hover:shadow-lg transition ${deletingClientId === client.id ? "opacity-50" : ""}`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-slate-900 mb-2">{client.name}</h3>
                                    <div className="space-y-1 text-sm text-slate-600">
                                        {client.email && (
                                            <div className="flex items-center gap-2">
                                                <FaEnvelope className="text-amber-500" />
                                                <span>{client.email}</span>
                                            </div>
                                        )}
                                        {client.phone && (
                                            <div className="flex items-center gap-2">
                                                <FaPhone className="text-amber-500" />
                                                <span>{client.phone}</span>
                                            </div>
                                        )}
                                        {client.address && (
                                            <div className="flex items-center gap-2">
                                                <FaMapMarkerAlt className="text-amber-500" />
                                                <span className="truncate">{client.address}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-2">
                                    <button
                                        onClick={() => handleEdit(client)}
                                        className="p-2 hover:bg-slate-100 rounded-lg transition text-slate-600"
                                        aria-label="Edit client"
                                    >
                                        <FaEdit />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(client.id)}
                                        disabled={deletingClientId === client.id}
                                        className="p-2 hover:bg-red-100 rounded-lg transition text-red-600 disabled:opacity-50"
                                        aria-label="Delete client"
                                    >
                                        <FaTrash />
                                    </button>
                                </div>
                            </div>

                            {client.notes && (
                                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{client.notes}</p>
                            )}

                            <div className="border-t border-slate-200 pt-4 mt-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-semibold text-slate-700">Total Payments</span>
                                    <span className="text-lg font-bold text-amber-600 flex items-center gap-1">
                                        <FaRupeeSign /> {paymentTotals[client.id]?.toLocaleString('en-IN') || 0}
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAddPayment(client.id)}
                                        className="flex-1 bg-amber-600 text-white px-3 py-2 rounded-lg hover:bg-amber-700 transition text-sm font-semibold flex items-center justify-center gap-2"
                                    >
                                        <FaPlus /> Add Payment
                                    </button>
                                    {payments[client.id] && payments[client.id].length > 0 && (
                                        <button
                                            onClick={() => {
                                                setSelectedClientId(client.id);
                                                // Show payment history in a modal or expandable section
                                            }}
                                            className="px-3 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition text-sm text-slate-700"
                                        >
                                            View ({payments[client.id].length})
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Client Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">
                                {editId ? "Edit Client" : "Add New Client"}
                            </h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Name *</label>
                                    <input
                                        type="text"
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Phone</label>
                                    <input
                                        type="tel"
                                        value={form.phone}
                                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Address</label>
                                    <input
                                        type="text"
                                        value={form.address}
                                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Notes</label>
                                    <textarea
                                        value={form.notes}
                                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                        rows={3}
                                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    />
                                </div>
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition font-semibold"
                                    >
                                        {editId ? "Update" : "Create"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowModal(false);
                                            setForm({ name: "", email: "", phone: "", address: "", notes: "" });
                                            setEditId(null);
                                        }}
                                        className="flex-1 bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-300 transition font-semibold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Payment Modal */}
            {showPaymentModal && selectedClientId && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold text-slate-900 mb-4">
                                {editingPaymentId ? "Edit Payment" : "Add Payment"}
                            </h2>
                            <form onSubmit={handlePaymentSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Amount (₹) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={paymentForm.amount}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Date *</label>
                                    <input
                                        type="date"
                                        value={paymentForm.date}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Payment Method</label>
                                    <select
                                        value={paymentForm.method}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, method: e.target.value })}
                                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                    >
                                        <option value="">Select method</option>
                                        <option value="Cash">Cash</option>
                                        <option value="Bank Transfer">Bank Transfer</option>
                                        <option value="UPI">UPI</option>
                                        <option value="Cheque">Cheque</option>
                                        <option value="Credit Card">Credit Card</option>
                                        <option value="Debit Card">Debit Card</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Description</label>
                                    <textarea
                                        value={paymentForm.description}
                                        onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
                                        rows={3}
                                        className="w-full rounded-lg border border-slate-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                                        placeholder="Payment notes or reference..."
                                    />
                                </div>

                                {/* Payment History */}
                                {payments[selectedClientId] && payments[selectedClientId].length > 0 && (
                                    <div className="border-t border-slate-200 pt-4 mt-4">
                                        <h3 className="text-sm font-semibold text-slate-700 mb-3">Payment History</h3>
                                        <div className="space-y-2 max-h-48 overflow-y-auto">
                                            {payments[selectedClientId].map((payment) => (
                                                <div key={payment.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 text-sm">
                                                            <FaRupeeSign className="text-amber-600" />
                                                            <span className="font-semibold">{payment.amount.toLocaleString('en-IN')}</span>
                                                            <span className="text-slate-500">•</span>
                                                            <span className="text-slate-600">{new Date(payment.date).toLocaleDateString()}</span>
                                                        </div>
                                                        {payment.method && (
                                                            <div className="text-xs text-slate-500 mt-1">{payment.method}</div>
                                                        )}
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button
                                                            type="button"
                                                            onClick={() => handleEditPayment(payment)}
                                                            className="p-1.5 hover:bg-slate-200 rounded text-slate-600"
                                                        >
                                                            <FaEdit className="text-xs" />
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDeletePayment(payment.id, selectedClientId)}
                                                            className="p-1.5 hover:bg-red-100 rounded text-red-600"
                                                        >
                                                            <FaTrash className="text-xs" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 bg-slate-900 text-white px-4 py-2.5 rounded-lg hover:bg-slate-800 transition font-semibold"
                                    >
                                        {editingPaymentId ? "Update" : "Add Payment"}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowPaymentModal(false);
                                            setPaymentForm({
                                                amount: "",
                                                date: new Date().toISOString().split('T')[0],
                                                method: "",
                                                description: "",
                                            });
                                            setSelectedClientId(null);
                                            setEditingPaymentId(null);
                                        }}
                                        className="flex-1 bg-slate-200 text-slate-700 px-4 py-2.5 rounded-lg hover:bg-slate-300 transition font-semibold"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClientsPage;
