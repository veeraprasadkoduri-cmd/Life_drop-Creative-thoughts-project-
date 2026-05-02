import { useState, useEffect, useCallback } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const BLOOD_GROUPS = ['', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const BG_COLORS = { 'A+':'bg-red-500','A-':'bg-red-700','B+':'bg-orange-500','B-':'bg-orange-700','AB+':'bg-purple-500','AB-':'bg-purple-700','O+':'bg-blood-600','O-':'bg-blood-800' }

export default function AdminDashboard() {
  const [donors, setDonors] = useState([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [deletingId, setDeletingId] = useState(null)
  const [search, setSearch] = useState('')
  const [filterBG, setFilterBG] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterArea, setFilterArea] = useState('')
  const [confirmId, setConfirmId] = useState(null)

  const fetchDonors = useCallback(async () => {
    setLoading(true)
    try {
      const params = {}
      if (search) params.search = search
      if (filterBG) params.bloodGroup = filterBG
      if (filterCity) params.city = filterCity
      if (filterArea) params.area = filterArea
      const { data } = await api.get('/donor/all', { params })
      setDonors(data.donors || [])
    } catch {
      toast.error('Failed to fetch donors')
    } finally {
      setLoading(false)
    }
  }, [search, filterBG, filterCity, filterArea])

  useEffect(() => {
    const t = setTimeout(fetchDonors, 300)
    return () => clearTimeout(t)
  }, [fetchDonors])

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await api.delete(`/donor/${id}`)
      toast.success('Donor removed successfully')
      setDonors(p => p.filter(d => d._id !== id))
    } catch {
      toast.error('Failed to delete donor')
    } finally {
      setDeletingId(null)
      setConfirmId(null)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = {}
      if (filterBG) params.bloodGroup = filterBG
      if (filterCity) params.city = filterCity
      if (filterArea) params.area = filterArea
      const response = await api.get('/export-csv', { params, responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const a = document.createElement('a')
      a.href = url
      a.download = `lifedrop_donors_${Date.now()}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
      toast.success('CSV exported successfully!')
    } catch {
      toast.error('Export failed')
    } finally {
      setExporting(false)
    }
  }

  const clearFilters = () => { setSearch(''); setFilterBG(''); setFilterCity(''); setFilterArea('') }
  const hasFilters = search || filterBG || filterCity || filterArea

  return (
    <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage all blood donors — {donors.length} record{donors.length !== 1 ? 's' : ''} found</p>
        </div>
        <button onClick={handleExport} disabled={exporting || donors.length === 0}
          className="btn-primary flex items-center gap-2 self-start sm:self-auto">
          {exporting ? <><span className="spinner" />Exporting...</> : (
            <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>Export CSV</>
          )}
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative lg:col-span-1 sm:col-span-2">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search name, city, mobile..." className="input-field pl-9 text-sm py-2.5" />
          </div>
          <select value={filterBG} onChange={e => setFilterBG(e.target.value)} className="input-field text-sm py-2.5">
            <option value="">All Blood Groups</option>
            {BLOOD_GROUPS.slice(1).map(g => <option key={g} value={g}>{g}</option>)}
          </select>
          <input value={filterCity} onChange={e => setFilterCity(e.target.value)}
            placeholder="Filter by city..." className="input-field text-sm py-2.5" />
          <input value={filterArea} onChange={e => setFilterArea(e.target.value)}
            placeholder="Filter by area..." className="input-field text-sm py-2.5" />
        </div>
        {hasFilters && (
          <button onClick={clearFilters} className="mt-3 text-sm text-blood-600 hover:text-blood-700 font-medium flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Clear all filters
          </button>
        )}
      </div>

      {/* Donor Table / Cards */}
      {loading ? (
        <div className="card flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full border-4 border-blood-100 border-t-blood-600 animate-spin mx-auto mb-3" />
            <p className="text-gray-400 text-sm">Loading donors...</p>
          </div>
        </div>
      ) : donors.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h3 className="font-bold text-gray-700 mb-1">No donors found</h3>
          <p className="text-gray-400 text-sm">{hasFilters ? 'Try adjusting your search filters.' : 'No donors have registered yet.'}</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50/50">
                    {['Donor','Blood','Contact','Location','Age/Gender','Status','Actions'].map(h => (
                      <th key={h} className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider px-5 py-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {donors.map(d => (
                    <tr key={d._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-800 text-sm">{d.fullName}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{d.email}</p>
                      </td>
                      <td className="px-5 py-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-xs font-bold ${BG_COLORS[d.bloodGroup] || 'bg-blood-600'}`}>
                          {d.bloodGroup}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-gray-600">{d.mobile}</td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700 font-medium">{d.city}</p>
                        <p className="text-xs text-gray-400">{d.area}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="text-sm text-gray-700">{d.age} yrs</p>
                        <p className="text-xs text-gray-400">{d.gender}</p>
                      </td>
                      <td className="px-5 py-4">
                        <span className={
                          d.availability === 'Available' ? 'badge-available' :
                          d.availability === 'Recently Donated' ? 'badge-recently' : 'badge-unavailable'
                        }>
                          {d.availability}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {confirmId === d._id ? (
                          <div className="flex gap-2">
                            <button onClick={() => handleDelete(d._id)} disabled={deletingId === d._id}
                              className="text-xs bg-red-600 text-white px-3 py-1.5 rounded-lg hover:bg-red-700 transition-colors font-semibold">
                              {deletingId === d._id ? '...' : 'Confirm'}
                            </button>
                            <button onClick={() => setConfirmId(null)}
                              className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button onClick={() => setConfirmId(d._id)}
                            className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-all font-medium border border-transparent hover:border-red-200">
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {donors.map(d => (
              <div key={d._id} className="card">
                <div className="flex items-start gap-3 mb-3">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${BG_COLORS[d.bloodGroup] || 'bg-blood-600'}`}>
                    {d.bloodGroup}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-800 truncate">{d.fullName}</p>
                    <p className="text-xs text-gray-400 truncate">{d.email}</p>
                  </div>
                  <span className={
                    d.availability === 'Available' ? 'badge-available text-xs' :
                    d.availability === 'Recently Donated' ? 'badge-recently text-xs' : 'badge-unavailable text-xs'
                  }>{d.availability}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div><p className="text-gray-400">Mobile</p><p className="font-medium text-gray-700">{d.mobile}</p></div>
                  <div><p className="text-gray-400">City</p><p className="font-medium text-gray-700">{d.city}</p></div>
                  <div><p className="text-gray-400">Age</p><p className="font-medium text-gray-700">{d.age} · {d.gender}</p></div>
                </div>
                {confirmId === d._id ? (
                  <div className="flex gap-2">
                    <button onClick={() => handleDelete(d._id)} className="flex-1 text-xs bg-red-600 text-white py-2 rounded-lg font-semibold">Confirm Delete</button>
                    <button onClick={() => setConfirmId(null)} className="flex-1 text-xs bg-gray-100 text-gray-600 py-2 rounded-lg font-semibold">Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setConfirmId(d._id)} className="w-full text-xs text-red-500 border border-red-200 py-2 rounded-lg hover:bg-red-50 transition-colors font-medium">
                    Delete Donor
                  </button>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
