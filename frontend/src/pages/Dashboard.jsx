import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../utils/api'

const BloodGroupColors = {
  'A+': 'bg-red-500', 'A-': 'bg-red-700',
  'B+': 'bg-orange-500', 'B-': 'bg-orange-700',
  'AB+': 'bg-purple-500', 'AB-': 'bg-purple-700',
  'O+': 'bg-blood-600', 'O-': 'bg-blood-800',
}

export default function Dashboard() {
  const { user, isAdmin } = useAuth()
  const [donor, setDonor] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      try {
        const { data } = await api.get('/donor/my')
        if (data.success) setDonor(data.donor)
      } catch {
        setDonor(null)
      } finally {
        setLoading(false)
      }
    }
    if (!isAdmin) fetch()
    else setLoading(false)
  }, [isAdmin])

  const availabilityClass = {
    'Available': 'badge-available',
    'Unavailable': 'badge-unavailable',
    'Recently Donated': 'badge-recently',
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 rounded-full border-4 border-blood-100 border-t-blood-600 animate-spin" />
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blood-700 via-blood-600 to-blood-500 p-6 sm:p-8 text-white shadow-lg shadow-blood-600/20">
        <div className="absolute right-0 top-0 bottom-0 w-48 opacity-10">
          <svg viewBox="0 0 200 200" className="w-full h-full" fill="currentColor">
            <path d="M100 10C70 50 30 70 30 110a70 70 0 00140 0c0-40-40-60-70-100z" />
          </svg>
        </div>
        <div className="relative z-10">
          <p className="text-white/70 text-sm font-medium mb-1">Welcome back,</p>
          <h1 className="font-display font-bold text-2xl sm:text-3xl mb-1">{user?.name}</h1>
          <p className="text-white/60 text-sm">{isAdmin ? 'Administrator • Full access' : 'Donor Portal'}</p>
        </div>
      </div>

      {isAdmin ? (
        /* Admin quick links */
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { to: '/admin', label: 'Admin Dashboard', desc: 'Manage all donors, search & export', icon: '🛡️', color: 'from-blood-50 to-red-50 border-blood-200' },
            { to: '/donor/new', label: 'Add Donor', desc: 'Register yourself as a donor', icon: '➕', color: 'from-emerald-50 to-green-50 border-emerald-200' },
          ].map(item => (
            <Link key={item.to} to={item.to}
              className={`card bg-gradient-to-br ${item.color} border hover:shadow-md transition-all duration-200 group`}>
              <div className="text-3xl mb-3">{item.icon}</div>
              <h3 className="font-bold text-gray-800 group-hover:text-blood-700 transition-colors">{item.label}</h3>
              <p className="text-sm text-gray-500 mt-1">{item.desc}</p>
            </Link>
          ))}
        </div>
      ) : donor ? (
        /* Donor Profile Card */
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-800">Your Donor Profile</h2>
            <Link to={`/donor/edit/${donor._id}`} className="btn-secondary text-sm py-2 px-4">
              Edit Profile
            </Link>
          </div>

          <div className="card">
            {/* Header */}
            <div className="flex items-start gap-4 mb-6 pb-6 border-b border-gray-100">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md ${BloodGroupColors[donor.bloodGroup] || 'bg-blood-600'}`}>
                {donor.bloodGroup}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xl text-gray-900">{donor.fullName}</h3>
                <p className="text-gray-500 text-sm">{donor.email}</p>
                <div className="mt-2">
                  <span className={availabilityClass[donor.availability] || 'badge'}>
                    {donor.availability === 'Available' ? '✓ ' : donor.availability === 'Recently Donated' ? '↻ ' : '✗ '}
                    {donor.availability}
                  </span>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[
                { label: 'Mobile', value: donor.mobile },
                { label: 'Age', value: `${donor.age} years` },
                { label: 'Gender', value: donor.gender },
                { label: 'Area', value: donor.area },
                { label: 'City', value: donor.city },
                { label: 'Last Donation', value: donor.lastDonationDate ? new Date(donor.lastDonationDate).toLocaleDateString() : 'Never' },
              ].map(item => (
                <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">{item.label}</p>
                  <p className="text-gray-800 font-medium text-sm">{item.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-4 bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Address</p>
              <p className="text-gray-800 font-medium text-sm">{donor.address}</p>
            </div>

            <p className="mt-4 text-xs text-gray-400 text-right">
              Registered: {new Date(donor.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      ) : (
        /* No Profile CTA */
        <div className="card text-center py-14">
          <div className="w-16 h-16 bg-blood-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blood-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No Donor Profile Yet</h3>
          <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">Create your donor profile to appear in the blood donor database and help save lives.</p>
          <Link to="/donor/new" className="btn-primary inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create Donor Profile
          </Link>
        </div>
      )}
    </div>
  )
}
