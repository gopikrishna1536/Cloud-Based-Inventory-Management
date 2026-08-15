import React, { useState, useEffect } from 'react';
import { Plus, UserCheck, Trash2, Edit, AlertCircle } from 'lucide-react';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import api from '../services/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'STAFF',
    status: 'ACTIVE',
  });

  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (user = null) => {
    setError('');
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        password: '',
        role: user.role,
        status: user.status,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'STAFF',
        status: 'ACTIVE',
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      if (editingUser) {
        await api.put(`/users/${editingUser._id}`, formData);
      } else {
        await api.post('/users', formData);
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save user account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to deactivate or remove this user account?')) {
      try {
        await api.delete(`/users/${id}`);
        fetchUsers();
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const columns = [
    {
      header: 'Team Member',
      cell: (row) => (
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-full bg-red-600 text-white font-bold flex items-center justify-center shrink-0 shadow-sm">
            {row.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-extrabold text-slate-900 text-sm">{row.name}</div>
            <div className="text-[11px] text-slate-500">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      header: 'Role (RBAC)',
      cell: (row) => {
        const roleColors = {
          ADMIN: 'bg-red-50 text-red-700 border-red-200',
          MANAGER: 'bg-rose-50 text-rose-700 border-rose-200',
          STAFF: 'bg-slate-100 text-slate-700 border-slate-200',
        };
        return (
          <span className={`inline-block px-2.5 py-0.5 rounded border text-[10px] font-extrabold tracking-wider ${roleColors[row.role]}`}>
            {row.role}
          </span>
        );
      },
    },
    {
      header: 'Account Status',
      cell: (row) => (
        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${row.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
          {row.status}
        </span>
      ),
    },
    {
      header: 'Joined Date',
      cell: (row) => (
        <span className="text-xs text-slate-500 font-medium">
          {new Date(row.createdAt).toLocaleDateString()}
        </span>
      ),
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleOpenModal(row)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(row._id)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User & Team Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage team access permissions with Role-Based Access Control (ADMIN, MANAGER, STAFF).</p>
        </div>

        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold text-xs shadow-md shadow-red-500/20 hover:scale-105 transition flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Team User</span>
        </button>
      </div>

      <DataTable columns={columns} data={users} isLoading={loading} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? 'Edit User Account' : 'Add Team Member'}
        maxWidth="max-w-md"
      >
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-semibold">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Alice Smith"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Work Email *</label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="alice@company.com"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {editingUser ? 'Password (Leave blank to keep existing)' : 'Password *'}
            </label>
            <input
              type="password"
              required={!editingUser}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder="••••••••"
              className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Role (RBAC) *</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
              >
                <option value="STAFF">STAFF (Sales & Inventory view)</option>
                <option value="MANAGER">MANAGER (Full Inventory & Purchasing)</option>
                <option value="ADMIN">ADMIN (Full System Controls)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Account Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 focus:outline-none"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-500/20 hover:scale-105 disabled:opacity-50 transition"
            >
              {isSubmitting ? 'Saving...' : 'Save User Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
