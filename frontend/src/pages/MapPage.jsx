import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import api from '../utils/api'

// Fix leaflet default icon
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const CONDITION_COLORS = {
  dangerous: '#ef4444',
  poor: '#f97316',
  medium: '#eab308',
  good: '#22c55e',
}

const CONDITION_INTENSITY = {
  dangerous: 1.0,
  poor: 0.75,
  medium: 0.5,
  good: 0.2,
}

// Solapur center coords
const SOLAPUR_CENTER = [17.6868, 75.9148]

export default function MapPage() {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const heatLayerRef = useRef(null)
  const markersLayerRef = useRef(null)
  const [reports, setReports] = useState([])
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({ dangerous: 0, poor: 0, medium: 0, good: 0 })

  useEffect(() => {
    // Init map
    const map = L.map(mapRef.current, {
      center: SOLAPUR_CENTER,
      zoom: 13,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      subdomains: 'abcd',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map
    markersLayerRef.current = L.layerGroup().addTo(map)

    return () => map.remove()
  }, [])

  useEffect(() => {
    const url = filter === 'all' ? '/reports?limit=500' : `/reports?condition=${filter}&limit=500`
    setLoading(true)
    api.get(url).then(res => {
      setReports(res.data)
      const s = { dangerous: 0, poor: 0, medium: 0, good: 0 }
      res.data.forEach(r => { if (s[r.condition] !== undefined) s[r.condition]++ })
      setStats(s)
    }).catch(() => {
      // Demo data for Solapur if API unavailable
      const demo = [
        { id: '1', lat: 17.6868, lng: 75.9148, condition: 'dangerous', area_name: 'Station Road', description: 'Deep potholes near railway crossing' },
        { id: '2', lat: 17.6901, lng: 75.9201, condition: 'poor', area_name: 'Vijapur Road', description: 'Road surface badly damaged' },
        { id: '3', lat: 17.6820, lng: 75.9080, condition: 'medium', area_name: 'Hotgi Road', description: 'Uneven surface, needs repair' },
        { id: '4', lat: 17.6950, lng: 75.9100, condition: 'good', area_name: 'MG Road', description: 'Recently repaired, smooth' },
        { id: '5', lat: 17.6780, lng: 75.9230, condition: 'dangerous', area_name: 'Akkalkot Road', description: 'Large crater near junction' },
        { id: '6', lat: 17.6830, lng: 75.9320, condition: 'medium', area_name: 'Pune-Solapur Highway', description: 'Patchy surface' },
        { id: '7', lat: 17.7020, lng: 75.9050, condition: 'good', area_name: 'Siddheshwar Temple Road', description: 'Well maintained' },
        { id: '8', lat: 17.6740, lng: 75.9010, condition: 'poor', area_name: 'Bijapur Road', description: 'Cracks throughout' },
      ]
      setReports(demo)
      const s = { dangerous: 0, poor: 0, medium: 0, good: 0 }
      demo.forEach(r => { if (s[r.condition] !== undefined) s[r.condition]++ })
      setStats(s)
    }).finally(() => setLoading(false))
  }, [filter])

  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current) return

    markersLayerRef.current.clearLayers()

    // Remove old heat layer
    if (heatLayerRef.current) {
      mapInstanceRef.current.removeLayer(heatLayerRef.current)
    }

    if (reports.length === 0) return

    // Build heatmap points
    const heatPoints = reports.map(r => [
      r.lat,
      r.lng,
      CONDITION_INTENSITY[r.condition] || 0.5
    ])

    // Load leaflet.heat dynamically
    import('leaflet.heat').then(() => {
      const heat = L.heatLayer(heatPoints, {
        radius: 30,
        blur: 20,
        maxZoom: 17,
        gradient: { 0.2: '#22c55e', 0.5: '#eab308', 0.75: '#f97316', 1.0: '#ef4444' }
      }).addTo(mapInstanceRef.current)
      heatLayerRef.current = heat
    }).catch(() => {
      // Fallback: circle markers if heat plugin unavailable
    })

    // Add circle markers for each report
    reports.forEach(report => {
      const color = CONDITION_COLORS[report.condition] || '#888'
      const circle = L.circleMarker([report.lat, report.lng], {
        radius: 8,
        fillColor: color,
        color: '#fff',
        weight: 1.5,
        opacity: 0.9,
        fillOpacity: 0.8,
      })

      const mediaHtml = report.media_url
        ? report.media_type === 'video'
          ? `<video src="${report.media_url}" class="w-full rounded-lg mt-2 max-h-32 object-cover" muted playsinline/>`
          : `<img src="${report.media_url}" class="w-full rounded-lg mt-2 max-h-32 object-cover"/>`
        : ''

      circle.bindPopup(`
        <div style="min-width:200px; font-family: 'Plus Jakarta Sans', sans-serif;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px;">
            <span style="background:${color}22;color:${color};border:1px solid ${color}44;padding:2px 10px;border-radius:20px;font-size:11px;font-weight:700;text-transform:capitalize;">${report.condition}</span>
            <span style="color:rgba(255,255,255,0.4);font-size:11px;">${report.area_name || 'Solapur'}</span>
          </div>
          ${report.description ? `<p style="color:rgba(255,255,255,0.7);font-size:12px;margin:0 0 6px;">${report.description}</p>` : ''}
          ${mediaHtml}
          ${report.users ? `<div style="margin-top:8px;font-size:11px;color:rgba(255,255,255,0.3);">by ${report.users.name}</div>` : ''}
        </div>
      `, { maxWidth: 260 })

      markersLayerRef.current.addLayer(circle)
    })
  }, [reports])

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Toolbar */}
      <div className="bg-dark-800 border-b border-white/10 px-4 py-3 flex flex-wrap items-center gap-3">
        <span className="text-sm font-semibold text-white/60">Filter:</span>
        {['all', 'dangerous', 'poor', 'medium', 'good'].map(c => (
          <button
            key={c}
            onClick={() => setFilter(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${filter === c ? 'bg-brand text-white' : 'bg-dark-600 text-white/50 hover:text-white border border-white/10'}`}
          >
            {c === 'dangerous' ? '🔴' : c === 'poor' ? '🟠' : c === 'medium' ? '🟡' : c === 'good' ? '🟢' : '🗺️'} {c}
          </button>
        ))}

        <div className="ml-auto flex items-center gap-4 text-xs">
          {Object.entries(stats).map(([k, v]) => (
            <span key={k} style={{ color: CONDITION_COLORS[k] }} className="font-semibold capitalize">{k}: {v}</span>
          ))}
          {loading && <span className="text-white/30 animate-pulse">Loading...</span>}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-8 left-4 z-[1000] bg-dark-800/90 backdrop-blur border border-white/10 rounded-xl p-3 flex flex-col gap-2">
        <span className="text-xs font-bold text-white/60 mb-1">Road Condition</span>
        {[['🔴', 'Dangerous'], ['🟠', 'Poor'], ['🟡', 'Medium'], ['🟢', 'Good']].map(([dot, label]) => (
          <div key={label} className="flex items-center gap-2 text-xs text-white/70">
            <span>{dot}</span>{label}
          </div>
        ))}
      </div>

      {/* Map */}
      <div ref={mapRef} className="flex-1 w-full" />
    </div>
  )
}
