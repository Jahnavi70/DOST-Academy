import React, { useState } from "react";

/**
 * Pure SVG Zero-Dependency Polar / Radar Chart for DOST Strategic Learning Inclinations.
 * Visualizes trainee headcount and competency affinity across DOST's 6 core R&D pillars.
 */
export default function LearningInclinationRadar({ inclinations = [] }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  // Fallback defaults if empty
  const data = inclinations.length > 0 ? inclinations : [
    { domain: "AI & Emerging Tech", score: 88, target: 80, headcount: 42, topCourse: "Machine Learning in Public Services" },
    { domain: "Disaster Risk & Climate", score: 82, target: 75, headcount: 38, topCourse: "Multi-Hazard Protocols" },
    { domain: "Biotechnology & Health", score: 76, target: 70, headcount: 29, topCourse: "Genomics Research Standards" },
    { domain: "Energy & Green Tech", score: 71, target: 70, headcount: 24, topCourse: "Renewable Energy Integration" },
    { domain: "Advanced Materials", score: 69, target: 65, headcount: 19, topCourse: "Polymer Characterization" },
    { domain: "Smart Manufacturing", score: 79, target: 75, headcount: 26, topCourse: "IoT Factory Automation" },
  ];

  const size = 360;
  const center = size / 2;
  const radius = 125;
  const count = data.length;
  const angleStep = (Math.PI * 2) / count;

  // Grid levels (20%, 40%, 60%, 80%, 100%)
  const gridLevels = [0.2, 0.4, 0.6, 0.8, 1.0];

  const getCoordinates = (value, index) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = (Math.min(100, Math.max(0, value)) / 100) * radius;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  const getAxisEnd = (index) => {
    const angle = index * angleStep - Math.PI / 2;
    const r = radius + 24;
    return {
      x: center + r * Math.cos(angle),
      y: center + r * Math.sin(angle),
    };
  };

  // Generate polygon points
  const currentPoints = data.map((d, i) => {
    const coord = getCoordinates(d.score, i);
    return `${coord.x},${coord.y}`;
  }).join(" ");

  const targetPoints = data.map((d, i) => {
    const coord = getCoordinates(d.target, i);
    return `${coord.x},${coord.y}`;
  }).join(" ");

  const activeItem = hoveredIdx !== null ? data[hoveredIdx] : null;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>🎯 Strategic Learning Inclinations</h3>
          <p style={styles.subtitle}>Institutional workforce capability radar across DOST R&D priority tracks</p>
        </div>
        <div style={styles.legend}>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDot, backgroundColor: "#2563EB" }} />
            <span>Active Trainees</span>
          </div>
          <div style={styles.legendItem}>
            <span style={{ ...styles.legendDash, borderTop: "2px dashed #10B981" }} />
            <span>DOST Target</span>
          </div>
        </div>
      </div>

      <div style={styles.chartWrapper}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={styles.svg}>
          {/* Concentric Guide Polygons */}
          {gridLevels.map((lvl, lIdx) => {
            const pts = data.map((_, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const r = radius * lvl;
              return `${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`;
            }).join(" ");
            return (
              <polygon
                key={`grid-${lIdx}`}
                points={pts}
                fill={lIdx % 2 === 0 ? "rgba(241, 245, 249, 0.45)" : "none"}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
            );
          })}

          {/* Radial Spokes */}
          {data.map((_, i) => {
            const axisEnd = getCoordinates(100, i);
            return (
              <line
                key={`spoke-${i}`}
                x1={center}
                y1={center}
                x2={axisEnd.x}
                y2={axisEnd.y}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
            );
          })}

          {/* Target Benchmark Polygon */}
          <polygon
            points={targetPoints}
            fill="none"
            stroke="#10B981"
            strokeWidth="2"
            strokeDasharray="4 4"
          />

          {/* Current Score Polygon */}
          <polygon
            points={currentPoints}
            fill="rgba(37, 99, 235, 0.22)"
            stroke="#2563EB"
            strokeWidth="2.5"
          />

          {/* Interactive Data Vertices */}
          {data.map((d, i) => {
            const coord = getCoordinates(d.score, i);
            const isHovered = hoveredIdx === i;
            return (
              <circle
                key={`vertex-${i}`}
                cx={coord.x}
                cy={coord.y}
                r={isHovered ? 7 : 4.5}
                fill={isHovered ? "#0B1F5E" : "#2563EB"}
                stroke="#FFFFFF"
                strokeWidth="2"
                style={{ cursor: "pointer", transition: "all 0.2s" }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              />
            );
          })}

          {/* Category Axis Labels */}
          {data.map((d, i) => {
            const end = getAxisEnd(i);
            const isLeft = end.x < center - 10;
            const isRight = end.x > center + 10;
            const textAnchor = isLeft ? "end" : isRight ? "start" : "middle";
            return (
              <text
                key={`label-${i}`}
                x={end.x}
                y={end.y + 4}
                textAnchor={textAnchor}
                fontSize="10.5"
                fontWeight={hoveredIdx === i ? "700" : "600"}
                fill={hoveredIdx === i ? "#0B1F5E" : "#475569"}
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setHoveredIdx(i)}
                onMouseLeave={() => setHoveredIdx(null)}
              >
                {d.domain}
              </text>
            );
          })}
        </svg>

        {/* Hover Information Callout */}
        <div style={styles.infoBox}>
          {activeItem ? (
            <div>
              <div style={styles.badge}>{activeItem.category || "Strategic Track"}</div>
              <h4 style={styles.infoTitle}>{activeItem.domain}</h4>
              <div style={styles.statGrid}>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Affinity Score</span>
                  <span style={{ ...styles.statVal, color: "#2563EB" }}>{activeItem.score}%</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Agency Target</span>
                  <span style={{ ...styles.statVal, color: "#10B981" }}>{activeItem.target}%</span>
                </div>
                <div style={styles.statItem}>
                  <span style={styles.statLabel}>Active Staff</span>
                  <span style={styles.statVal}>{activeItem.headcount}</span>
                </div>
              </div>
              <p style={styles.topCourseText}>
                <strong>Top Course:</strong> {activeItem.topCourse}
              </p>
            </div>
          ) : (
            <div style={styles.placeholderBox}>
              <span style={{ fontSize: "24px" }}>💡</span>
              <p style={{ margin: "6px 0 0", fontSize: "12px", color: "#64748B" }}>
                Hover any vertex or pillar on the radar to inspect agency competency details and top enrolled modules.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 4px 18px rgba(11, 31, 94, 0.05)",
    border: "1px solid #E2E8F0",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "16px",
    flexWrap: "wrap",
    gap: "12px",
  },
  title: {
    margin: "0 0 4px",
    fontSize: "17px",
    fontWeight: "800",
    color: "#0B1F5E",
  },
  subtitle: {
    margin: 0,
    fontSize: "13px",
    color: "#64748B",
  },
  legend: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    fontSize: "12px",
    color: "#475569",
    fontWeight: "600",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  legendDot: {
    width: "10px",
    height: "10px",
    borderRadius: "50%",
  },
  legendDash: {
    width: "16px",
    display: "inline-block",
  },
  chartWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: "20px",
  },
  svg: {
    overflow: "visible",
  },
  infoBox: {
    width: "240px",
    minHeight: "150px",
    backgroundColor: "#F8FAFC",
    border: "1px solid #E2E8F0",
    borderRadius: "12px",
    padding: "16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  badge: {
    display: "inline-block",
    backgroundColor: "#EEF2FF",
    color: "#2563EB",
    padding: "2px 8px",
    borderRadius: "8px",
    fontSize: "11px",
    fontWeight: "700",
    marginBottom: "6px",
  },
  infoTitle: {
    margin: "0 0 10px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#0B1F5E",
  },
  statGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "8px",
    marginBottom: "10px",
  },
  statItem: {
    display: "flex",
    flexDirection: "column",
  },
  statLabel: {
    fontSize: "10px",
    color: "#64748B",
    textTransform: "uppercase",
  },
  statVal: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#0B1F5E",
  },
  topCourseText: {
    margin: 0,
    fontSize: "11px",
    color: "#334155",
    lineHeight: "1.4",
  },
  placeholderBox: {
    textAlign: "center",
    padding: "10px",
  },
};
