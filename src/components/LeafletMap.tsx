import { useEffect, useRef } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Props {
  /** Numele zonei la Serebii (ex. „obsidianfieldlands"). */
  area: string
  label: string
}

// La fel ca PLA-Live-Map: hărțile Hisui de la Serebii sunt tiled (2048×2048 la
// zoom 2), afișate cu Leaflet și CRS.Simple.
const TILE_SIZE = 2048
const NATIVE_MAX = 2

/** Hartă tiled interactivă (pan + zoom la niveluri), pe tile-urile Serebii. */
export default function LeafletMap({ area, label }: Props) {
  const elRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<L.Map | null>(null)
  const layerRef = useRef<L.TileLayer | null>(null)

  // Creăm harta o singură dată.
  useEffect(() => {
    if (!elRef.current || mapRef.current) return
    const map = L.map(elRef.current, {
      crs: L.CRS.Simple,
      minZoom: 0,
      maxZoom: 4,
      attributionControl: false,
      zoomSnap: 0.25,
    })
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
      layerRef.current = null
    }
  }, [])

  // Schimbăm stratul de tile-uri la schimbarea zonei.
  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    if (layerRef.current) map.removeLayer(layerRef.current)

    const sw = map.unproject([0, TILE_SIZE], NATIVE_MAX)
    const ne = map.unproject([TILE_SIZE, 0], NATIVE_MAX)
    const bounds = new L.LatLngBounds(sw, ne)

    layerRef.current = L.tileLayer(
      `https://www.serebii.net/pokearth/hisui/${area}/tile_{z}-{x}-{y}.png`,
      { minZoom: 0, maxNativeZoom: NATIVE_MAX, maxZoom: 4, noWrap: true, bounds },
    ).addTo(map)

    map.setMaxBounds(bounds)
    map.fitBounds(bounds)
    // Layout-ul poate să nu fie complet când se montează — recalculăm.
    setTimeout(() => map.invalidateSize(), 0)
  }, [area])

  return (
    <div
      ref={elRef}
      aria-label={label}
      className="h-[65vh] min-h-[340px] w-full rounded-xl border border-line"
      style={{ background: 'var(--map-board)' }}
    />
  )
}
