import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../api";
import "../operator/OperatorDashboard.css";

interface Due {
  _id: string;
  description: string;
  amount: number;
  category: string;
  link: string;
  status: string;
  dueDate: string;
  department: string;
  dueType?: string;
}

interface StudentDetails {
  name: string;
  rollNumber: string;
  fatherName: string;
  mobile: string;
}

const StudentDetails: React.FC = () => {
  const { rollNumber } = useParams<{ rollNumber: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [dues, setDues] = useState<Due[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (rollNumber) {
      fetchStudentDues();
    }
  }, [rollNumber]);

  const fetchStudentDues = async () => {
    try {
      const res = await api.get(`/hod/student/${rollNumber}/dues`);
      setStudent(res.data.student);
      setDues(res.data.dues);
    } catch (err) {
      console.error("Failed to fetch student dues", err);
      navigate("/hod"); // Redirect back if error
    } finally {
      setLoading(false);
    }
  };

  // Group dues by department
  const groupDuesByDepartment = (dues: Due[]) => {
    const grouped: { [key: string]: Due[] } = {};
    dues.forEach((due) => {
      if (!grouped[due.department]) {
        grouped[due.department] = [];
      }
      grouped[due.department].push(due);
    });
    return Object.entries(grouped).map(([department, dues]) => ({
      department,
      dues,
    }));
  };

  const departmentDues = groupDuesByDepartment(dues);

  if (loading) {
    return (
      <div className="operator-main-content">
        <div>Loading...</div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="operator-main-content">
        <div>Student not found</div>
      </div>
    );
  }

  return (
    <div className="operator-main-content">
      <header className="operator-dashboard-header">
        <h1>👨‍🎓 Student Details</h1>
        <p>View detailed information and dues for {student.name}</p>
      </header>

      {/* Student Details */}
      <div
        style={{
          backgroundColor: "white",
          padding: "24px",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
          marginBottom: "24px",
        }}
      >
        <h2
          style={{
            marginBottom: "20px",
            color: "#1f2937",
            fontSize: "18px",
            fontWeight: "600",
          }}
        >
          Student Information
        </h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: "20px",
          }}
        >
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              Name
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "500",
                color: "#1f2937",
              }}
            >
              {student.name}
            </div>
          </div>
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              Roll Number
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "500",
                color: "#4f46e5",
              }}
            >
              {student.rollNumber}
            </div>
          </div>
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              Father Name
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "500",
                color: "#1f2937",
              }}
            >
              {student.fatherName}
            </div>
          </div>
          <div
            style={{
              padding: "16px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
            }}
          >
            <div
              style={{
                fontSize: "12px",
                fontWeight: "600",
                color: "#6b7280",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                marginBottom: "4px",
              }}
            >
              Mobile
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "500",
                color: "#1f2937",
              }}
            >
              {student.mobile}
            </div>
          </div>
        </div>
      </div>

      {/* Dues Table - Student Lookup Style */}
      <div
        style={{
          backgroundColor: "white",
          borderRadius: "12px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.07)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "20px 24px",
            borderBottom: "1px solid #e5e7eb",
          }}
        >
          <h2
            style={{
              margin: "0",
              color: "#1f2937",
              fontSize: "18px",
              fontWeight: "600",
            }}
          >
            Dues Status - {student.name}
          </h2>
          <p
            style={{
              margin: "4px 0 0 0",
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            Department-wise dues breakdown
          </p>
        </div>

        <div style={{ overflowX: "auto", padding: "20px 24px" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              border: "1px solid #e5e7eb",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f9fafb" }}>
                <th
                  style={{
                    border: "1px solid #e5e7eb",
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: "#374151",
                    fontSize: "14px",
                  }}
                >
                  Department
                </th>
                <th
                  style={{
                    border: "1px solid #e5e7eb",
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: "#374151",
                    fontSize: "14px",
                  }}
                >
                  Status
                </th>
                <th
                  style={{
                    border: "1px solid #e5e7eb",
                    padding: "12px 16px",
                    textAlign: "left",
                    fontWeight: "600",
                    color: "#374151",
                    fontSize: "14px",
                  }}
                >
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {departmentDues.map((dept) => (
                <tr
                  key={dept.department}
                  style={{
                    transition: "background-color 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor = "#f9fafb")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = "white")
                  }
                >
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "12px 16px",
                      fontWeight: "500",
                      color: "#1f2937",
                      fontSize: "14px",
                    }}
                  >
                    {dept.department}
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "12px 16px",
                    }}
                  >
                    <span
                      style={{
                        padding: "4px 12px",
                        borderRadius: "12px",
                        fontSize: "12px",
                        fontWeight: "600",
                        backgroundColor:
                          dept.dues.length === 0 ? "#f0fdf4" : "#fef2f2",
                        color: dept.dues.length === 0 ? "#16a34a" : "#dc2626",
                        border: `1px solid ${
                          dept.dues.length === 0 ? "#bbf7d0" : "#fecaca"
                        }`,
                      }}
                    >
                      {dept.dues.length === 0
                        ? "No Dues"
                        : `${dept.dues.length} Due(s)`}
                    </span>
                  </td>
                  <td
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "12px 16px",
                    }}
                  >
                    {dept.dues.length > 0 ? (
                      <ul
                        style={{
                          margin: "0",
                          padding: "0 0 0 20px",
                          listStyle: "disc",
                          color: "#374151",
                        }}
                      >
                        {dept.dues.map((due) => (
                          <li
                            key={due._id}
                            style={{
                              marginBottom: "8px",
                              fontSize: "14px",
                              lineHeight: "1.5",
                            }}
                          >
                            <div style={{ fontWeight: "500" }}>
                              {due.description} -{" "}
                              <span
                                style={{ color: "#dc2626", fontWeight: "600" }}
                              >
                                ₹{due.amount}
                              </span>
                              {due.dueType && (
                                <span
                                  style={{
                                    marginLeft: "8px",
                                    padding: "2px 8px",
                                    borderRadius: "8px",
                                    fontSize: "11px",
                                    backgroundColor: "#f3f4f6",
                                    color: "#6b7280",
                                    fontWeight: "500",
                                  }}
                                >
                                  {due.dueType
                                    .split("-")
                                    .map(
                                      (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1)
                                    )
                                    .join(" ")}
                                </span>
                              )}
                            </div>
                            <div
                              style={{
                                fontSize: "12px",
                                color: "#6b7280",
                                marginTop: "2px",
                              }}
                            >
                              Due Date:{" "}
                              {new Date(due.dueDate).toLocaleDateString()}
                              {due.link && (
                                <>
                                  {" | "}
                                  <a
                                    href={due.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    style={{
                                      color: "#4f46e5",
                                      textDecoration: "none",
                                    }}
                                  >
                                    View Link
                                  </a>
                                </>
                              )}
                            </div>
                            <div style={{ marginTop: "4px" }}>
                              <span
                                style={{
                                  padding: "2px 8px",
                                  borderRadius: "8px",
                                  fontSize: "11px",
                                  fontWeight: "500",
                                  backgroundColor:
                                    due.category === "payable"
                                      ? "#fef3c7"
                                      : "#e0e7ff",
                                  color:
                                    due.category === "payable"
                                      ? "#d97706"
                                      : "#3730a3",
                                }}
                              >
                                {due.category}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span
                        style={{
                          color: "#16a34a",
                          fontWeight: "500",
                          fontSize: "14px",
                        }}
                      >
                        ✓ Cleared
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {departmentDues.length === 0 && (
            <div
              style={{
                padding: "40px 24px",
                textAlign: "center",
                color: "#6b7280",
              }}
            >
              <p style={{ fontSize: "16px", margin: "0" }}>
                No dues found for this student.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Back Button */}
      <div style={{ marginTop: "24px", textAlign: "center" }}>
        <button
          onClick={() => navigate("/hod")}
          style={{
            padding: "12px 24px",
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "500",
            transition: "all 0.2s",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#4338ca";
            e.currentTarget.style.transform = "translateY(-1px)";
            e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.1)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#4f46e5";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.1)";
          }}
        >
          ← Back to Dashboard
        </button>
      </div>
    </div>
  );
};

export default StudentDetails;
