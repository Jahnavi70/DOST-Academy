import React, { useState } from "react";

/**
 * AtRiskAlertBanner Component.
 * Surfaces actionable interventions (overdue submissions, inactive trainees, queue bottlenecks)
 * for Agency Supervisors and Functional Admins.
 */
export default function AtRiskAlertBanner({ alerts = [] }) {
  const [dismissed, setDismissed] = useState([]);
  const [actionNotice, setActionNotice] = useState(null);

  const rawAlerts = alerts.length > 0 ? alerts : [
    {
      id: "alert-1",
      type: "overdue",
      severity: "high",
      title: "12 Trainees Behind on Milestone Assessments",
      detail: "Participants in 'AI and Data Engineering' have quizzes > 7 days past due.",
      department: "DOST-ASTI",
      affectedCount: 12,
      actionLabel: "Send Bulk Reminder",
    },
    {
      id: "alert-2",
      type: "bottleneck",
      severity: "medium",
      title: "Enrollment Approval Queue Exceeding 48 Hours",
      detail: "4 Mentors have unreviewed course enrollment requests awaiting action.",
      department: "DOST-ITDI",
      affectedCount: 7,
      actionLabel: "Notify Mentors",
    },
    {
      id: "alert-3",
      type: "stalled",
      severity: "medium",
      title: "Inactive Trainee Cohort (>14 Days)",
      detail: "Trainees enrolled in 'Industrial IoT' show zero activity in past two weeks.",
      department: "DOST-MIRDC",
      affectedCount: 9,
      actionLabel: "Schedule Check-in",
    },
    {
      id: "alert-4",
      type: "ready",
      severity: "info",
      title: "15 Certificates Ready for Supervisor Sign-off",
      detail: "Trainees completed 100% curriculum requirements with passing grades.",
      department: "DOST-PAGASA",
      affectedCount: 15,
      actionLabel: "Review & Sign Off",
    },
  ];

  const visibleAlerts = rawAlerts.filter((a) => !dismissed.includes(a.id));

  const handleAction = (alert) => {
    setActionNotice(`Action initiated: "${alert.actionLabel}" for ${alert.department} (${alert.affectedCount} affected). Notification dispatched.`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleDismiss = (id) => {
    setDismissed([...dismissed, id]);
  };

  const getSeverityStyle = (severity) => {
    switch (severity) {
      case "high":
        return { border: "#FCA5A5", bg: "#FEF2F2", text: "#991B1B", badgeBg: "#EF4444", icon: "🔴" };
      case "medium":
        return { border: "#FDE68A", bg: "#FFFBEB", text: "#92400E", badgeBg: "#F59E0B", icon: "🟠" };
      default:
        return { border: "#BBF7D0", bg: "#F0FDF4", text: "#166534", badgeBg: "#10B981", icon: "🟢" };
    }
  };

  if (visibleAlerts.length === 0) return null;

  return (
    <div style={styles.container}>
      <div style={styles.titleRow}>
        <h4 style={styles.title}>⚠️ Priority Interventions & Workforce Triage Alerts</h4>
        <span style={styles.badge}>{visibleAlerts.length} pending items</span>
      </div>

      {actionNotice && (
        <div style={styles.successNotice}>
          ✅ {actionNotice}
        </div>
      )}

      <div style={styles.grid}>
        {visibleAlerts.map((item) => {
          const s = getSeverityStyle(item.severity);
          return (
            <div
              key={item.id}
              style={{
                ...styles.alertCard,
                backgroundColor: s.bg,
                borderColor: s.border,
              }}
            >
              <div style={styles.alertHeader}>
                <span style={styles.icon}>{s.icon}</span>
                <div style={styles.textWrap}>
                  <div style={styles.alertTitleRow}>
                    <strong style={{ ...styles.alertTitle, color: s.text }}>{item.title}</strong>
                    <span style={styles.deptBadge}>{item.department}</span>
                  </div>
                  <p style={{ ...styles.detail, color: s.text }}>{item.detail}</p>
                </div>
              </div>

              <div style={styles.actionRow}>
                <button
                  style={styles.actionBtn}
                  onClick={() => handleAction(item)}
                >
                  {item.actionLabel}
                </button>
                <button
                  style={styles.dismissBtn}
                  onClick={() => handleDismiss(item.id)}
                >
                  Dismiss
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const styles = {
  container: {
    backgroundColor: "#FFFFFF",
    borderRadius: "16px",
    padding: "20px 24px",
    marginBottom: "24px",
    boxShadow: "0 4px 18px rgba(11, 31, 94, 0.05)",
    border: "1px solid #E2E8F0",
  },
  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "14px",
  },
  title: {
    margin: 0,
    fontSize: "15px",
    fontWeight: "800",
    color: "#0B1F5E",
  },
  badge: {
    backgroundColor: "#EFF6FF",
    color: "#2563EB",
    padding: "3px 10px",
    borderRadius: "12px",
    fontSize: "12px",
    fontWeight: "700",
  },
  successNotice: {
    padding: "10px 14px",
    backgroundColor: "#ECFDF5",
    color: "#065F46",
    border: "1px solid #A7F3D0",
    borderRadius: "8px",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "12px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))",
    gap: "12px",
  },
  alertCard: {
    border: "1px solid",
    borderRadius: "12px",
    padding: "14px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  },
  alertHeader: {
    display: "flex",
    gap: "10px",
    marginBottom: "12px",
  },
  icon: {
    fontSize: "18px",
    lineHeight: "1",
  },
  textWrap: {
    flex: 1,
  },
  alertTitleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "6px",
    marginBottom: "4px",
  },
  alertTitle: {
    fontSize: "13px",
    fontWeight: "700",
    lineHeight: "1.3",
  },
  deptBadge: {
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: "2px 6px",
    borderRadius: "4px",
    fontSize: "10.5px",
    fontWeight: "700",
    color: "#475569",
    whiteSpace: "nowrap",
  },
  detail: {
    margin: 0,
    fontSize: "12px",
    lineHeight: "1.4",
  },
  actionRow: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "8px",
    borderTop: "1px solid rgba(0, 0, 0, 0.06)",
    paddingTop: "10px",
  },
  actionBtn: {
    backgroundColor: "#0B1F5E",
    color: "#FFFFFF",
    border: "none",
    padding: "5px 12px",
    borderRadius: "6px",
    fontSize: "11.5px",
    fontWeight: "700",
    cursor: "pointer",
  },
  dismissBtn: {
    backgroundColor: "transparent",
    color: "#64748B",
    border: "none",
    padding: "5px 8px",
    fontSize: "11.5px",
    cursor: "pointer",
  },
};
