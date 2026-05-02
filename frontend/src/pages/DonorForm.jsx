import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../utils/api'
import toast from 'react-hot-toast'

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const GENDERS = ['Male', 'Female', 'Other']
const AVAILABILITY = ['Available', 'Unavailable', 'Recently Donated']

const initialForm = {
  fullName: '', bloodGroup: '', mobile: '', email: '',
  address: '', area: '', city: '', age: '',
  gender: '', lastDonationDate: '', availability: 'Available'
}

export default function DonorForm() {
  const [form, setForm] = useState(initialForm)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  useEffect(() => {
    if (isEdit) {
      setFetchLoading(true)
      api.get('/donor/my').then(({ data }) => {
        if (data.donor) {
          const d = data.donor
          setForm({
            fullName: d.fullName || '', bloodGroup: d.bloodGroup || '',
            mobile: d.mobile || '', email: d.email || '',
            address: d.address || '', area: d.area || '',
            city: d.city || '', age: d.age || '',
            gender: d.gender || '',
            lastDonationDate: d.lastDonationDate ? d.lastDonationDate.split('T')[0] : '',
            availability: d.availability || 'Available'
          })
        }
      }).catch(() => toast.error('Failed to load donor data')).finally(() => setFetchLoading(false))
    }
  }, [id, isEdit])

  const handleChange = e => setForm(p => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    const required = ['fullName','bloodGroup','mobile','email','address','area','city','age','gender','availability']
    for (const field of required) {
      if (!form[field]) return toast.error(`Please fill in: ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
    }
    if (parseInt(form.age) < 18 || parseInt(form.age) > 65) return toast.error('Age must be between 18 and 65')

    setLoading(true)
    try {
      const payload = { ...form, age: parseInt(form.age), lastDonationDate: form.lastDonationDate || null }
      if (isEdit) {
        await api.put(`/donor/${id}`, payload)
        toast.success('Donor profile updated!')
      } else {
        await api.post('/donor/create', payload)
        toast.success('Donor profile created!')
      }
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save donor profile')
    } finally {
      setLoading(false)
    }
  }

  if (fetchLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 rounded-full border-4 border-blood-100 border-t-blood-600 animate-spin" />
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-display font-bold text-gray-900">{isEdit ? 'Update Donor Profile' : 'Create Donor Profile'}</h1>
        <p className="text-gray-500 mt-1 text-sm">{isEdit ? 'Update your blood donation information.' : 'Register as a blood donor and help save lives.'}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Info */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blood-100 text-blood-700 text-xs flex items-center justify-center font-bold">1</span>
            Personal Information
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Blood Group *</label>
              <select name="bloodGroup" value={form.bloodGroup} onChange={handleChange} className="input-field">
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Gender *</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="input-field">
                <option value="">Select Gender</option>
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Age *</label>
              <input name="age" type="number" value={form.age} onChange={handleChange} placeholder="18–65" min="18" max="65" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number *</label>
              <input name="mobile" value={form.mobile} onChange={handleChange} placeholder="+1 234 567 8900" className="input-field" />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="input-field" />
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blood-100 text-blood-700 text-xs flex items-center justify-center font-bold">2</span>
            Location Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Address *</label>
              <textarea name="address" value={form.address} onChange={handleChange} placeholder="123 Main Street, Apt 4B" rows={2} className="input-field resize-none" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Area *</label>
              <input name="area" value={form.area} onChange={handleChange} placeholder="Downtown" className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="New York" className="input-field" />
            </div>
          </div>
        </div>

        {/* Donation Info */}
        <div className="card">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blood-100 text-blood-700 text-xs flex items-center justify-center font-bold">3</span>
            Donation Details
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Last Donation Date</label>
              <input name="lastDonationDate" type="date" value={form.lastDonationDate} onChange={handleChange}
                max={new Date().toISOString().split('T')[0]} className="input-field" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Availability Status *</label>
              <select name="availability" value={form.availability} onChange={handleChange} className="input-field">
                {AVAILABILITY.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end pb-4">
          <button type="button" onClick={() => navigate('/dashboard')} className="btn-secondary">Cancel</button>
          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <><span className="spinner" />{isEdit ? 'Updating...' : 'Creating...'}</> : (isEdit ? 'Update Profile' : 'Create Profile')}
          </button>
        </div>
      </form>
    </div>
  )
}
