import React, { useState } from "react";

/**
 * Trainee Competency Growth Heatmap Matrix.
 * Maps core DOST scientific competencies across workforce seniority tiers.
 */
export default function CompetencyHeatmapMatrix({ matrix = [] }) {
  const [selectedSkill, setSelectedSkill] = useState(null);

  const data = matrix.length > 0 ? matrix : [
    { skill: "R&D Grant Lifecycle & Proposal Writing", category: "Governance", junior: 62, senior: 85, lead: 96 },
    { skill: "Laboratory ISO & Safety Protocols", category: "Quality Standards", junior: 78, senior: 92, lead: 99 },
    { skill: "Python for Scientific Data & Analytics", category: "Emerging Tech", junior: 54, senior: 79, lead: 91 },
    { skill: "Multi-Hazard Climate & Disaster Modeling", category: "Resilience", junior: 68, senior: 84, lead: 95 },
    { skill: "IP Protection & Tech Commercialization", category: "Innovation", junior: 45, senior: 72, lead: 88 },
  ];

  const getColor = (val) => {
    if (val >= 90) return { bg: "#0B1F5E", text: "#FFFFFF" };
    if (val >= 75) return { bg: "#1E40AF", text: "#FFFFFF" };
    if (val >= 60) return { bg: "#3B82F6", text: "#FFFFFF" };
    if (val >= 40) return { bg: "#93C5FD", text: "#0B1F5E" };
    return { bg: "#E2E8F0", text: "#475569" };
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>🧩 Workforce Competency Growth Matrix</h3>
          <p style={styles.subtitle}>Proficiency benchmarks assessed across workforce seniority tiers</p>
        </div>
        <div style={styles.legend}>
          <span style={styles.legendLabel}>Scale:</span>
          <span style={{ ...styles.legendBadge, backgroundColor: "#E2E8F0", color: "#475569" }}>&lt;40%</span>
          <span style={{ ...styles.legendBadge, backgroundColor: "#93C5FD", color: "#0B1F5E" }}>40-59%</span>
          <span style={{ ...styles.legendBadge, backgroundColor: "#3B82F6", color: "#FFF" }}>60-74%</span>
          <span style={{ ...styles.legendBadge, backgroundColor: "#1E40AF", color: "#FFF" }}>75-89%</span>
          <span style={{ ...styles.legendBadge, backgroundColor: "#0B1F5E", color: "#FFF" }}>90%+</span>
        </div>
      </div>

      <div style={styles.tableWrapper}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={{ ...styles.th, textAlign: "left" }}>Competency Area</th>
              <th style={{ ...styles.th, textAlign: "left" }}>Domain Category</th>
              <th style={styles.th}>Junior Trainees</th>
              <th style={styles.th}>Senior Specialists</th>
              <th style={styles.th}>Lead / Supervisors</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, idx) => {
              const jColor = getColor(row.junior);
              const sColor = getColor(row.senior);
              const lColor = getColor(row.lead);
              const isSelected = selectedSkill === row.skill;

              return (
                <tr
                  key={idx}
                  style={{
                    backgroundColor: isSelected ? "#F0FDF4" : idx % 2 === 0 ? "#FAFAFA" : "#FFFFFF",
                    cursor: "pointer",
                  }}
                  onClick={() => setSelectedSkill(isSelected ? null : row.skill)}
                >
                  <td style={styles.skillCell}>
                    <strong>{row.skill}</strong>
                  </td>
                  <td style={styles.catCell}>
                    <span style={styles.catBadge}>{row.category}</span>
                  </td>
                  <td style={styles.scoreCell}>
                    <div style={{ ...styles.cellBox, backgroundColor: jColor.bg, color: jColor.text }}>
                      {row.junior}%
                    </div>
                  </td>
                  <td style={styles.scoreCell}>
                    <div style={{ ...styles.cellBox, backgroundColor: sColor.bg, color: sColor.text }}>
                      {row.senior}%
                    </div>
                  </td>
                  <td style={styles.scoreCell}>
                    <div style={{ ...styles.cellBox, backgroundColor: lColor.bg, color: lColor.text }}>
                      {row.lead}%
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedSkill && (
        <div style={styles.drilldownAlert}>
          <strong>Selected Competency:</strong> {selectedSkill} —
          <span style={{ marginLeft: "6px", color: "#166534" }}>
            Curriculum learning outcomes verified against DOST standard capability indices.
          </span>
        </div>
      )}
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
    gap: "6px",
    fontSize: "11px",
    fontWeight: "600",
  },
  legendLabel: {
    color: "#64748B",
    marginRight: "4px",
  },
  legendBadge: {
    padding: "3px 7px",
    borderRadius: "4px",
    fontSize: "10px",
    fontWeight: "700",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: "13px",
  },
  th: {
    padding: "10px 14px",
    borderBottom: "2px solid #E2E8F0",
    color: "#475569",
    fontWeight: "700",
    fontSize: "12px",
    textTransform: "uppercase",
  },
  skillCell: {
    padding: "12px 14px",
    color: "#0B1F5E",
    borderBottom: "1px solid #F1F5F9",
  },
  catCell: {
    padding: "12px 14px",
    borderBottom: "1px solid #F1F5F9",
  },
  catBadge: {
    display: "inline-block",
    backgroundColor: "#EFF6FF",
    color: "#1E40AF",
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "600",
  },
  scoreCell: {
    padding: "10px 14px",
    textAlign: "center",
    borderBottom: "1px solid #F1F5F9",
  },
  cellBox: {
    padding: "6px 12px",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "12.5px",
    display: "inline-block",
    minWidth: "48px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
  },
  drilldownAlert: {
    marginTop: "16px",
    padding: "10px 14px",
    backgroundColor: "#F0FDF4",
    border: "1px solid #BBF7D0",
    borderRadius: "8px",
    fontSize: "12.5px",
    color: "#14532D",
  },
};
