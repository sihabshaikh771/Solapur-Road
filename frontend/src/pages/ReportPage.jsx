import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import L from 'leaflet'
import api from '../utils/api'

const SOLAPUR_CENTER = [17.6868, 75.9148]

export default function ReportPage() {
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const mapInstance = useRef(null)
  const markerRef = useRef(null)
  const fileInputRef = useRef(null)

  const [form, setForm] = useState({ lat: '', lng: '', area_name: '', condition: '', description: '' })
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  useEffect(() => {
    const map = L.map(mapRef.current, { center: SOLAPUR_CENTER, zoom: 13 })
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO', subdomains: 'abcd', maxZoom: 19,
    }).addTo(map)

    map.on('click', e => {
      const { lat, lng } = e.latlng
      if (markerRef.current) markerRef.current.remove()
      markerRef.current = L.marker([lat, lng]).addTo(map)
      setForm(prev => ({ ...prev, lat: lat.toFixed(6), lng: lng.toFixed(6) }))
    })

    mapInstance.current = map
    return () => map.remove()
  }, [])

  const handleFileChange = e => {
    const f = e.target.files?.[0]
    if (!f) return
    if (f.size > 50 * 1024 * 1024) { toast.error('File must be under 50MB'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleDrop = e => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f) { setFile(f); setPreview(URL.createObjectURL(f)) }
  }

  const useMyLocation = () => {
    if (!navigator.geolocation) { toast.error('Geolocation not supported'); return }
    navigator.geolocation.getCurrentPosition(pos => {
      const { latitude: lat, longitude: lng } = pos.coords
      setForm(prev => ({ ...prev, lat: lat.toFixed(6), lng: lng.toFixed(6) }))
      mapInstance.current.setView([lat, lng], 15)
      if (markerRef.current) markerRef.current.remove()
      markerRef.current = L.marker([lat, lng]).addTo(mapInstance.current)
      toast.success('📍 Location set to your position')
    }, () => toast.error('Could not get your location'))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!form.lat || !form.lng) { toast.error('Please click on the map to set location'); return }
    if (!form.condition) { toast.error('Please select road condition'); return }

    setSubmitting(true)
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => v && fd.append(k, v))
      if (file) fd.append('media', file)

      await api.post('/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('✅ Report submitted! +10 points earned')
      setTimeout(() => navigate('/map'), 1500)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Submission failed')
    } finally {
      setSubmitting(false)
    }
  }

  const conditionOptions = [
    { value: 'good', label: '🟢 Good', desc: 'Smooth, well-maintained' },
    { value: 'medium', label: '🟡 Medium', desc: 'Minor cracks or bumps' },
    { value: 'poor', label: '🟠 Poor', desc: 'Significant damage' },
    { value: 'dangerous', label: '🔴 Dangerous', desc: 'Potholes, major hazard' },
  ]

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2">Report a Road</h1>
        <p className="text-white/40">Upload evidence and mark the location. Earn 10 points per report.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
        {/* Left: Upload + Form */}
        <div className="flex flex-col gap-5">
          {/* File upload */}
          <div
            className={`card border-2 border-dashed cursor-pointer transition-colors ${dragOver ? 'border-brand bg-brand/5' : 'border-white/20 hover:border-white/40'}`}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleFileChange} className="hidden" />
            {preview ? (
              file?.type?.startsWith('video') ? (
                <video src={preview} controls className="w-full rounded-lg max-h-48 object-cover" />
              ) : (
                <img src={preview} alt="preview" className="w-full rounded-lg max-h-48 object-cover" />
              )
            ) : (
              <div className="flex flex-col items-center gap-3 py-8 text-center">
                <span className="text-4xl">📸</span>
                <div>
                  <p className="font-semibold">Drop photo or video here</p>
                  <p className="text-white/30 text-sm mt-1">JPG, PNG, MP4, MOV — up to 50MB</p>
                </div>
              </div>
            )}
          </div>

          {/* Condition */}
          <div>
            <label className="text-sm font-semibold text-white/60 mb-2 block">Road Condition *</label>
            <div className="grid grid-cols-2 gap-2">
              {conditionOptions.map(opt => (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setForm(p => ({ ...p, condition: opt.value }))}
                  className={`p-3 rounded-xl border text-left transition-all ${form.condition === opt.value ? 'border-brand bg-brand/10' : 'border-white/10 bg-dark-600 hover:border-white/30'}`}
                >
                  <div className="font-semibold text-sm">{opt.label}</div>
                  <div className="text-xs text-white/40 mt-0.5">{opt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Area & Description */}
          <input className="input" placeholder="Area name (e.g. Station Road, Hotgi Road)" value={form.area_name} onChange={e => setForm(p => ({ ...p, area_name: e.target.value }))} />
          <textarea className="input resize-none" rows={3} placeholder="Description (optional) — describe the issue" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />

          {/* Location display */}
          <div className="flex items-center gap-3">
            <div className="flex-1 input text-white/40 text-sm">
              {form.lat ? `📍 ${form.lat}, ${form.lng}` : 'Click on map to set location'}
            </div>
            <button type="button" onClick={useMyLocation} className="btn-secondary text-sm whitespace-nowrap py-3">Use GPS</button>
          </div>

          <button type="submit" disabled={submitting} className="btn-primary py-4 text-base font-bold flex items-center justify-center gap-2 disabled:opacity-50">
            {submitting ? <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Submitting...</> : '🚀 Submit Report (+10 pts)'}
          </button>
        </div>

        {/* Right: Map */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white/60">Click map to set location *</label>
          <div ref={mapRef} className="w-full rounded-2xl overflow-hidden border border-white/10" style={{ height: '480px' }} />
          <p className="text-xs text-white/30 text-center">Click anywhere on the map to drop a pin</p>
        </div>
      </form>
    </div>
  )
}
