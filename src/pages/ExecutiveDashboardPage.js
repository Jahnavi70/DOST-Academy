import React, { useEffect, useState } from "react";
import AdminHeader from "../components/layout/AdminHeader";
import LearningInclinationRadar from "../components/charts/LearningInclinationRadar";
import DepartmentVelocityChart from "../components/charts/DepartmentVelocityChart";
import CompetencyHeatmapMatrix from "../components/charts/CompetencyHeatmapMatrix";
import AtRiskAlertBanner from "../components/charts/AtRiskAlertBanner";
import { executiveAnalyticsAPI } from "../services/api";

export default function ExecutiveDashboardPage() {
  const [data, setData] = useState(null);
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [curriculumFilter, setCurriculumFilter] = useState("All");
  const [timeframe, setTimeframe] = useState("Q3 2026");

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      try {
        const params = {};
        if (departmentFilter !== "All") params.department = departmentFilter;
        if (curriculumFilter !== "All") params.curriculum_id = curriculumFilter;

        const res = await executiveAnalyticsAPI.getAnalytics(params);
        if (mounted) setData(res.data);
      } catch (err) {
        console.error("Failed to load executive analytics:", err);
      }
    };
    fetchData();
    return () => { mounted = false; };
  }, [departmentFilter, curriculumFilter]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={styles.container}>
      <AdminHeader activePortal="functional" />

      <main className="lms-page-container" style={styles.content}>
        {/* Title & Filter Bar */}
        <div style={styles.topSection}>
          <div>
            <div style={styles.breadcrumb}>DOST Executive Governance &bull; Strategic Analytics</div>
            <h1 style={styles.pageTitle}>🏛️ Executive Analytics & Talent Intelligence</h1>
            <p style={styles.pageSubtitle}>
              Institutional capability metrics, learning inclinations, and progress benchmarks across DOST human resources.
            </p>
          </div>

          <div style={styles.controlsBar}>
            {/* Department Filter */}
            <select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              style={styles.selectInput}
            >
              <option value="All">All DOST Agencies</option>
              <option value="ASTI">DOST-ASTI</option>
              <option value="PAGASA">DOST-PAGASA</option>
              <option value="PHIVOLCS">DOST-PHIVOLCS</option>
              <option value="ITDI">DOST-ITDI</option>
              <option value="FNRI">DOST-FNRI</option>
              <option value="MIRDC">DOST-MIRDC</option>
              <option value="Central">Central Offices</option>
            </select>

            {/* Curriculum Filter */}
            <select
              value={curriculumFilter}
              onChange={(e) => setCurriculumFilter(e.target.value)}
              style={styles.selectInput}
            >
              <option value="All">All Curriculums</option>
              {data?.branches?.map((b) => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>

            {/* Timeframe */}
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              style={styles.selectInput}
            >
              <option value="Q3 2026">Q3 2026</option>
              <option value="Q2 2026">Q2 2026</option>
              <option value="YTD 2026">Year-to-Date 2026</option>
            </select>

            <button style={styles.exportBtn} onClick={handlePrint}>
              📥 Export Report
            </button>
          </div>
        </div>

        {/* Executive KPI Stats Grid */}
        <div style={styles.kpiGrid}>
          <div style={styles.kpiCard}>
            <span style={styles.kpiLabel}>Overall Completion Rate</span>
            <div style={styles.kpiValueRow}>
              <span style={styles.kpiVal}>{data?.kpis?.overallCompletionRate || 78.4}%</span>
              <span style={{ ...styles.kpiPill, backgroundColor: "#ECFDF5", color: "#065F46" }}>
                {data?.kpis?.overallCompletionGrowth || "+5.2%"} vs target
              </span>
            </div>
            <span style={styles.kpiSub}>Based on {data?.kpis?.totalLearners || "1,420"} enrolled personnel</span>
          </div>

          <div style={styles.kpiCard}>
            <span style={styles.kpiLabel}>Total Learning Hours</span>
            <div style={styles.kpiValueRow}>
              <span style={styles.kpiVal}>{(data?.kpis?.totalLearningHours || 14820).toLocaleString()} hrs</span>
              <span style={{ ...styles.kpiPill, backgroundColor: "#EEF2FF", color: "#1E40AF" }}>
                {data?.kpis?.totalLearningHoursGrowth || "+12% MoM"}
              </span>
            </div>
            <span style={styles.kpiSub}>Aggregated modules and practical lab duration</span>
          </div>

          <div style={styles.kpiCard}>
            <span style={styles.kpiLabel}>Certified Talent</span>
            <div style={styles.kpiValueRow}>
              <span style={styles.kpiVal}>{data?.kpis?.certifiedStaff || 524}</span>
              <span style={{ ...styles.kpiPill, backgroundColor: "#ECFDF5", color: "#065F46" }}>
                {data?.kpis?.certifiedStaffGrowth || "89 issued this mo"}
              </span>
            </div>
            <span style={styles.kpiSub}>Cryptographically signed certifications</span>
          </div>

          <div style={styles.kpiCard}>
            <span style={styles.kpiLabel}>Priority Triage</span>
            <div style={styles.kpiValueRow}>
              <span style={{ ...styles.kpiVal, color: "#DC2626" }}>{data?.kpis?.totalAtRisk || 18}</span>
              <span style={{ ...styles.kpiPill, backgroundColor: "#FEF2F2", color: "#991B1B" }}>
                Requires Intervention
              </span>
            </div>
            <span style={styles.kpiSub}>Overdue assignments or stalled velocity (&gt;14d)</span>
          </div>
        </div>

        {/* Priority Triage Alerts */}
        <AtRiskAlertBanner alerts={data?.atRiskAlerts} />

        {/* Charts 2-Column Grid: Learning Inclination Radar & Department Velocity */}
        <div style={styles.chartTwoCol}>
          <div style={{ flex: 1, minWidth: "340px" }}>
            <LearningInclinationRadar inclinations={data?.learningInclinations} />
          </div>
          <div style={{ flex: 1.2, minWidth: "340px" }}>
            <DepartmentVelocityChart
              velocities={data?.departmentVelocities}
              onSelectDepartment={(dept) => setDepartmentFilter(dept || "All")}
            />
          </div>
        </div>

        {/* Trainee Competency Growth Heatmap Matrix */}
        <div style={{ marginTop: "24px" }}>
          <CompetencyHeatmapMatrix matrix={data?.competencyMatrix} />
        </div>
      </main>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#F8FAFC",
  },
  content: {
    width: "100%",
    maxWidth: "100%",
    margin: "0",
    padding: "clamp(20px, 3vw, 48px) clamp(20px, 3vw, 48px) 60px",
    boxSizing: "border-box",
  },
  topSection: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: "24px",
    flexWrap: "wrap",
    gap: "18px",
  },
  breadcrumb: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#2563EB",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
    marginBottom: "4px",
  },
  pageTitle: {
    margin: "0 0 6px",
    fontSize: "24px",
    fontWeight: "800",
    color: "#0B1F5E",
  },
  pageSubtitle: {
    margin: 0,
    fontSize: "14px",
    color: "#64748B",
    maxWidth: "700px",
  },
  controlsBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    flexWrap: "wrap",
  },
  selectInput: {
    padding: "8px 14px",
    borderRadius: "10px",
    border: "1px solid #CBD5E1",
    fontSize: "13px",
    color: "#0B1F5E",
    backgroundColor: "#FFFFFF",
    fontWeight: "600",
    outline: "none",
  },
  exportBtn: {
    backgroundColor: "#0B1F5E",
    color: "#FFFFFF",
    border: "none",
    padding: "8px 16px",
    borderRadius: "10px",
    fontWeight: "700",
    fontSize: "13px",
    cursor: "pointer",
    boxShadow: "0 2px 6px rgba(11, 31, 94, 0.15)",
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "18px",
    marginBottom: "24px",
  },
  kpiCard: {
    backgroundColor: "#FFFFFF",
    padding: "20px",
    borderRadius: "14px",
    border: "1px solid #E2E8F0",
    boxShadow: "0 2px 8px rgba(11, 31, 94, 0.04)",
  },
  kpiLabel: {
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748B",
    textTransform: "uppercase",
    display: "block",
    marginBottom: "8px",
  },
  kpiValueRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "6px",
  },
  kpiVal: {
    fontSize: "36px",
    fontWeight: "800",
    letterSpacing: "-0.02em",
    color: "#0B1F5E",
  },
  kpiPill: {
    padding: "3px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "700",
  },
  kpiSub: {
    fontSize: "11.5px",
    color: "#94A3B8",
  },
  chartTwoCol: {
    display: "flex",
    gap: "24px",
    flexWrap: "wrap",
  },
};
