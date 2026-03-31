import { useEffect, useRef, useState, useCallback, useMemo, useImperativeHandle, forwardRef } from "react";
import Globe from "react-globe.gl";

const GEOJSON_URL =
  "https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson";

const GlobeView = forwardRef(({ onCountryClick }, ref) => {
  const globeRef = useRef();
  const [countries, setCountries] = useState([]);
  const [hoverD, setHoverD] = useState(null);
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Load country GeoJSON
  useEffect(() => {
    fetch(GEOJSON_URL)
      .then((r) => r.json())
      .then((data) => {
        setCountries(data.features);
      })
      .catch(err => console.error("Error loading GeoJSON:", err));
  }, []);

  // Memoize labels data to prevent recalculation on every render
  const labelData = useMemo(() => {
    return countries.map(f => {
      const centroid = getCentroid(f);
      return {
        lat: centroid ? centroid[1] : 0,
        lng: centroid ? centroid[0] : 0,
        text: f.properties.NAME || f.properties.ADMIN || f.properties.name || "Unknown",
        feature: f
      };
    }).filter(l => l.lat !== 0 || l.lng !== 0);
  }, [countries]);

  // Expose zoom function to parent
  useImperativeHandle(ref, () => ({
    zoomToCountry: (countryName) => {
      const country = countries.find(c => {
        const name = (c.properties.NAME || c.properties.ADMIN || c.properties.name || "").toLowerCase();
        return name === countryName.toLowerCase();
      });

      if (country && globeRef.current) {
        const centroid = getCentroid(country);
        if (centroid) {
          // Stop auto-rotation
          globeRef.current.controls().autoRotate = false;
          // Zoom
          globeRef.current.pointOfView(
            { lat: centroid[1], lng: centroid[0], altitude: 1.8 },
            1200
          );
          return true;
        }
      }
      return false;
    }
  }));

  // Auto-rotate
  useEffect(() => {
    if (globeRef.current) {
      const controls = globeRef.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.5;
      controls.enableZoom = true;
      controls.minDistance = 180;
      controls.maxDistance = 500;

      // Set initial camera position
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 0);
    }
  }, [countries]);

  // Handle resize
  useEffect(() => {
    const onResize = () =>
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const handleClick = useCallback(
    (polygon) => {
      if (!polygon) return;

      const props = polygon.properties;
      const countryName =
        props.NAME || props.ADMIN || props.name || props.admin || "Unknown";

      // Stop auto-rotation on click
      if (globeRef.current) {
        globeRef.current.controls().autoRotate = false;
      }

      // Zoom to the country
      const centroid = getCentroid(polygon);
      if (centroid) {
        globeRef.current.pointOfView(
          { lat: centroid[1], lng: centroid[0], altitude: 1.8 },
          1000
        );
      }

      onCountryClick(countryName);
    },
    [onCountryClick]
  );

  return (
    <Globe
      ref={globeRef}
      width={dimensions.width}
      height={dimensions.height}
      globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
      backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
      
      // Performance
      rendererConfig={{ 
        antialias: false, 
        alpha: true,
        powerPreference: "high-performance"
      }}

      // Country polygons
      polygonsData={countries}
      polygonAltitude={(d) => (d === hoverD ? 0.04 : 0.01)}
      polygonCapColor={(d) =>
        d === hoverD ? "rgba(59, 130, 246, 0.6)" : "rgba(59, 130, 246, 0.15)"
      }
      polygonSideColor={() => "rgba(59, 130, 246, 0.08)"}
      polygonStrokeColor={() => "rgba(148, 163, 184, 0.3)"}
      polygonLabel={(d) => {
        const name = d.properties.NAME || d.properties.ADMIN || d.properties.name || "Unknown";
        return `
          <div style="
            background: rgba(10, 14, 26, 0.95);
            border: 1px solid rgba(59, 130, 246, 0.5);
            border-radius: 8px;
            padding: 8px 12px;
            color: #f1f5f9;
            font-family: Inter, system-ui, sans-serif;
            font-size: 13px;
            font-weight: 500;
            box-shadow: 0 4px 15px rgba(0,0,0,0.5);
          ">
            📍 ${name}
          </div>
        `;
      }}
      onPolygonHover={setHoverD}
      onPolygonClick={handleClick}
      polygonsTransitionDuration={200}

      // Permanent Labels
      labelsData={labelData}
      labelLat={d => d.lat}
      labelLng={d => d.lng}
      labelText={d => d.text}
      labelSize={d => 0.4}
      labelDotRadius={d => 0.2}
      labelColor={() => "rgba(255, 255, 255, 0.85)"}
      labelResolution={2}
      onLabelClick={d => handleClick(d.feature)}

      // Atmosphere
      atmosphereColor="#3b82f6"
      atmosphereAltitude={0.15}
    />
  );
});

// Compute centroid of a GeoJSON feature
function getCentroid(feature) {
  try {
    const coords = [];
    const geometry = feature.geometry;

    function extractCoords(c) {
      if (typeof c[0] === "number") {
        coords.push(c);
      } else {
        c.forEach(extractCoords);
      }
    }

    extractCoords(geometry.coordinates);

    if (coords.length === 0) return null;

    let sumLng = 0,
      sumLat = 0;
    coords.forEach(([lng, lat]) => {
      sumLng += lng;
      sumLat += lat;
    });

    return [sumLng / coords.length, sumLat / coords.length];
  } catch {
    return null;
  }
}

export default GlobeView;
