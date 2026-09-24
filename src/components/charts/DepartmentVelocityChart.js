import React, { useState } from "react";

/**
 * Pure SVG Zero-Dependency Horizontal Stacked Bar Chart for DOST Department Completion Velocity.
 * Benchmarks completion rates and learner velocity across DOST agencies and sectors.
 */
export default function DepartmentVelocityChart({ velocities = [], onSelectDepartment }) {
  const [sortBy, setSortBy] = useState("completionRate");
  const [selectedDept, setSelectedDept] = useState(null);

  const rawData = velocities.length > 0 ? velocities : [
    { department: "DOST-ASTI", completed: 54, inProgress: 28, stalled: 6, overdue: 2, completionRate: 89, totalLearners: 90, avgDays: 14.2 },
    { department: "DOST-PAGASA", completed: 48, inProgress: 32, stalled: 7, overdue: 3, completionRate: 86, totalLearners: 90, avgDays: 16.5 },
    { department: "DOST-FNRI", completed: 42, inProgress: 26, stalled: 5, overdue: 2, completionRate: 82, totalLearners: 75, avgDays: 15.1 },
    { department: "DOST-PHIVOLCS", completed: 44, inProgress: 30, stalled: 8, overdue: 4, completionRate: 81, totalLearners: 86, avgDays: 17.8 },
    { department: "Central Offices", completed: 62, inProgress: 38, stalled: 11, overdue: 3, completionRate: 78, totalLearners: 114, avgDays: 16.0 },
    { department: "DOST-MIRDC", completed: 36, inProgress: 28, stalled: 9, overdue: 4, completionRate: 76, totalLearners: 77, avgDays: 18.0 },
    { department: "DOST-ITDI", completed: 38, inProgress: 34, stalled: 10, overdue: 5, completionRate: 74, totalLearners: 87, avgDays: 19.4 },
  ];

  // Sorting
  const sortedData = [...rawData].sort((a, b) => {
    if (sortBy === "completionRate") return b.completionRate - a.completionRate;
    if (sortBy === "totalLearners") return b.totalLearners - a.totalLearners;
    if (sortBy === "avgDays") return a.avgDays - b.avgDays;
    return 0;
  });

  const handleBarClick = (dept) => {
    const next = selectedDept === dept ? null : dept;
    setSelectedDept(next);
    if (onSelectDepartment) onSelectDepartment(next);
  };

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <div>
          <h3 style={styles.title}>📊 Department Completion Velocity</h3>
          <p style={styles.subtitle}>Curriculum progress distribution and throughput benchmarks per DOST agency</p>
        </div>
        <div style={styles.controls}>
          <label style={styles.sortLabel}>Sort by:</label>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            style={styles.select}
          >
            <option value="completionRate">Completion Rate (%)</option>
            <option value="totalLearners">Total Headcount</option>
            <option value="avgDays">Fastest Throughput (Days)</option>
          </select>
        </div>
      </div>

      {/* Legend */}
      <div style={styles.legend}>
        <div style={styles.legendItem}>
          <span style={{ ...styles.colorBox, backgroundColor: "#10B981" }} />
          <span>Completed</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.colorBox, backgroundColor: "#2563EB" }} />
          <span>In Progress</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.colorBox, backgroundColor: "#F59E0B" }} />
          <span>Stalled (&gt;14d)</span>
        </div>
        <div style={styles.legendItem}>
          <span style={{ ...styles.colorBox, backgroundColor: "#EF4444" }} />
          <span>Overdue</span>
        </div>
      </div>

      {/* Stacked Bar Rows */}
      <div style={styles.barsContainer}>
        {sortedData.map((item) => {
          const total = item.completed + item.inProgress + item.stalled + item.overdue;
          const pctCompleted = (item.completed / total) * 100;
          const pctInProgress = (item.inProgress / total) * 100;
          const pctStalled = (item.stalled / total) * 100;
          const pctOverdue = (item.overdue / total) * 100;

          const isSelected = selectedDept === item.department;

          return (
            <div
              key={item.department}
              style={{
                ...styles.row,
                backgroundColor: isSelected ? "#EFF6FF" : "transparent",
                borderColor: isSelected ? "#93C5FD" : "transparent",
              }}
              onClick={() => handleBarClick(item.department)}
            >
              <div style={styles.deptLabelCol}>
                <span style={styles.deptName}>{item.department}</span>
                <span style={styles.deptMeta}>{item.totalLearners} enrolled • {item.avgDays}d avg</span>
              </div>

              {/* Stacked Progress Bar */}
              <div style={styles.barWrapper}>
                <div style={styles.barTrack}>
                  <div
                    style={{
                      ...styles.barSegment,
                      width: `${pctCompleted}%`,
                      backgroundColor: "#10B981",
                      borderTopLeftRadius: "6px",
                      borderBottomLeftRadius: "6px",
                    }}
                    title={`Completed: ${item.completed} (${Math.round(pctCompleted)}%)`}
                  />
                  <div
                    style={{
                      ...styles.barSegment,
                      width: `${pctInProgress}%`,
                      backgroundColor: "#2563EB",
                    }}
                    title={`In Progress: ${item.inProgress} (${Math.round(pctInProgress)}%)`}
                  />
                  <div
                    style={{
                      ...styles.barSegment,
                      width: `${pctStalled}%`,
                      backgroundColor: "#F59E0B",
                    }}
                    title={`Stalled: ${item.stalled} (${Math.round(pctStalled)}%)`}
                  />
                  <div
                    style={{
                      ...styles.barSegment,
                      width: `${pctOverdue}%`,
                      backgroundColor: "#EF4444",
                      borderTopRightRadius: "6px",
                      borderBottomRightRadius: "6px",
                    }}
                    title={`Overdue: ${item.overdue} (${Math.round(pctOverdue)}%)`}
                  />
                </div>
              </div>

              {/* Percentage Indicator */}
              <div style={styles.rateCol}>
                <span style={styles.rateVal}>{item.completionRate}%</span>
                <span style={styles.rateSub}>yield</span>
              </div>
            </div>
          );
        })}
      </div>

      <div style={styles.footerNote}>
        <span>💡 Click any department row to focus metrics. Color bars reflect proportional cohort status.</span>
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
  controls: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  sortLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748B",
  },
  select: {
    padding: "6px 12px",
    borderRadius: "8px",
    border: "1px solid #CBD5E1",
    fontSize: "12px",
    color: "#0B1F5E",
    backgroundColor: "#FFFFFF",
    cursor: "pointer",
    outline: "none",
  },
  legend: {
    display: "flex",
    gap: "18px",
    marginBottom: "16px",
    flexWrap: "wrap",
    fontSize: "12px",
    fontWeight: "600",
    color: "#475569",
  },
  legendItem: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  colorBox: {
    width: "12px",
    height: "12px",
    borderRadius: "3px",
    display: "inline-block",
  },
  barsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  row: {
    display: "flex",
    alignItems: "center",
    padding: "8px 12px",
    borderRadius: "10px",
    border: "1px solid transparent",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  deptLabelCol: {
    width: "160px",
    display: "flex",
    flexDirection: "column",
    paddingRight: "12px",
  },
  deptName: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#0B1F5E",
  },
  deptMeta: {
    fontSize: "11px",
    color: "#64748B",
  },
  barWrapper: {
    flex: 1,
    paddingRight: "16px",
  },
  barTrack: {
    height: "16px",
    backgroundColor: "#F1F5F9",
    borderRadius: "6px",
    display: "flex",
    overflow: "hidden",
  },
  barSegment: {
    height: "100%",
    transition: "width 0.4s ease-in-out",
  },
  rateCol: {
    width: "55px",
    textAlign: "right",
    display: "flex",
    flexDirection: "column",
  },
  rateVal: {
    fontSize: "14px",
    fontWeight: "800",
    color: "#0B1F5E",
  },
  rateSub: {
    fontSize: "10px",
    color: "#64748B",
  },
  footerNote: {
    marginTop: "16px",
    paddingTop: "12px",
    borderTop: "1px solid #F1F5F9",
    fontSize: "11.5px",
    color: "#64748B",
  },
};
