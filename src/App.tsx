import type { JSX } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Footer from "./components/Footer";
import Header from "./components/Header";
import Layout from "./components/Layout";
import { lazyLoad } from "./utils/lazyLoad";

// Lazy load pages for better performance
const Dashboard = lazyLoad(() => import("./pages/Dashboard"));
const Users = lazyLoad(() => import("./pages/Users"));
const Departments = lazyLoad(() => import("./pages/Departments"));
const AcademicYear = lazyLoad(() => import("./pages/AcademicYear"));
const Students = lazyLoad(() => import("./pages/Students"));
const Faculty = lazyLoad(() => import("./pages/Faculty"));
const Login = lazyLoad(() => import("./pages/Login"));
const StudentDuesLookup = lazyLoad(() => import("./pages/StudentDuesLookup"));

// Operator pages
const OperatorDashboard = lazyLoad(
  () => import("./pages/operator/OperatorDashboard")
);
const OperatorLayout = lazyLoad(
  () => import("./pages/operator/OperatorLayout")
);
const AccountsDashboard = lazyLoad(
  () => import("./pages/operator/AccountsDashboard")
);
const AccountsStudentDues = lazyLoad(
  () => import("./pages/operator/AccountsStudentDues")
);
const AccountsStudentDetails = lazyLoad(
  () => import("./pages/operator/AccountsStudentDetails")
);
const AccountsFacultyDues = lazyLoad(
  () => import("./pages/operator/AccountsFacultyDues")
);
const AccountsFacultyDetails = lazyLoad(
  () => import("./pages/operator/AccountsFacultyDetails")
);
const AddDue = lazyLoad(() => import("./pages/operator/AddDue"));
const ClearDue = lazyLoad(() => import("./pages/operator/ClearDues"));
const OtherDeptDues = lazyLoad(() => import("./pages/operator/OtherDeptDues"));
const ChangePassword = lazyLoad(
  () => import("./pages/operator/ChangePassword")
);
const HRFacultyDues = lazyLoad(() => import("./pages/operator/HRFacultyDues"));
const HRFacultyDetails = lazyLoad(
  () => import("./pages/operator/HRFacultyDetails")
);
const HRFacultyDashboard = lazyLoad(
  () => import("./pages/operator/HRFacultyDashboard")
);

// HOD pages
const HODDashboard = lazyLoad(() => import("./pages/hod/HODDashboard"));
const HODLayout = lazyLoad(() => import("./pages/hod/HODLayout"));
const StudentDetails = lazyLoad(() => import("./pages/hod/StudentDetails"));
const HODChangePassword = lazyLoad(
  () => import("./pages/hod/HODChangePassword")
);

// HR pages
const HRDashboard = lazyLoad(() => import("./pages/hr/HRDashboard"));
const HRLayout = lazyLoad(() => import("./pages/hr/HRLayout"));
const AddFacultyDue = lazyLoad(() => import("./pages/hr/AddFacultyDue"));
const HRChangePassword = lazyLoad(() => import("./pages/hr/HRChangePassword"));

// Utility: get role from session
function getRole() {
  const user = sessionStorage.getItem("user");
  if (!user) return null;
  try {
    return JSON.parse(user).role;
  } catch {
    return null;
  }
}

// PrivateRoute → checks only token
const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = sessionStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
};

// AdminRoute → allows only admins/super_admins
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const token = sessionStorage.getItem("token");
  const role = getRole();
  if (!token) return <Navigate to="/login" replace />;
  if (role !== "super_admin" && role !== "admin")
    return <Navigate to="/operator" replace />;
  return children;
};

// OperatorRoute → allows only department operators
const OperatorRoute = ({ children }: { children: JSX.Element }) => {
  const token = sessionStorage.getItem("token");
  const role = getRole();
  if (!token) return <Navigate to="/login" replace />;
  if (role !== "department_operator") return <Navigate to="/" replace />;
  return children;
};

// HODRoute → allows only HODs
const HODRoute = ({ children }: { children: JSX.Element }) => {
  const token = sessionStorage.getItem("token");
  const role = getRole();
  if (!token) return <Navigate to="/login" replace />;
  if (role !== "hod") return <Navigate to="/" replace />;
  return children;
};

// HRRoute → allows only HR
const HRRoute = ({ children }: { children: JSX.Element }) => {
  const token = sessionStorage.getItem("token");
  const role = getRole();
  if (!token) return <Navigate to="/login" replace />;
  if (role !== "hr") return <Navigate to="/" replace />;
  return children;
};

// New component to handle role-based redirects
const RoleBasedRedirect = () => {
  const role = getRole();

  if (!role) {
    return <Navigate to="/login" replace />;
  }

  if (role === "super_admin" || role === "admin") {
    return <Navigate to="/admin" replace />;
  }

  if (role === "department_operator") {
    return <Navigate to="/operator" replace />;
  }

  if (role === "hod") {
    return <Navigate to="/hod" replace />;
  }

  if (role === "hr") {
    return <Navigate to="/hr" replace />;
  }

  return <Navigate to="/login" replace />;
};

function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
          width: "100%",
          paddingBottom: "70px", // Space for fixed footer
        }}
      >
        <Header />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/student-lookup" element={<StudentDuesLookup />} />

            {/* Admin routes */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Layout />
                </AdminRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="users" element={<Users />} />
              <Route path="departments" element={<Departments />} />
              <Route path="academic-years" element={<AcademicYear />} />
              <Route path="students" element={<Students />} />
              <Route path="faculty" element={<Faculty />} />
            </Route>

            {/* Redirect root to appropriate dashboard based on role */}
            <Route path="/" element={<RoleBasedRedirect />} />

            {/* Operator routes */}
            <Route
              path="/operator"
              element={
                <OperatorRoute>
                  <OperatorLayout />
                </OperatorRoute>
              }
            >
              <Route index element={<OperatorDashboard />} />
              <Route
                path="accounts-dashboard"
                element={<AccountsDashboard />}
              />
              <Route
                path="accounts-student-dues"
                element={<AccountsStudentDues />}
              />
              <Route
                path="student/:rollNumber"
                element={<AccountsStudentDetails />}
              />
              <Route
                path="accounts-faculty-dues"
                element={<AccountsFacultyDues />}
              />
              <Route
                path="faculty/:facultyId"
                element={<AccountsFacultyDetails />}
              />
              <Route path="add-due" element={<AddDue />} />
              <Route path="other-dues" element={<OtherDeptDues />} />
              <Route path="clear-dues" element={<ClearDue />} />
              <Route path="change-password" element={<ChangePassword />} />
              {/* HR operator routes */}
              <Route
                path="hr-faculty-dashboard"
                element={<HRFacultyDashboard />}
              />
              <Route path="hr-faculty-dues" element={<HRFacultyDues />} />
              <Route
                path="hr-faculty/:facultyId"
                element={<HRFacultyDetails />}
              />
            </Route>

            {/* HOD routes */}
            <Route
              path="/hod"
              element={
                <HODRoute>
                  <HODLayout />
                </HODRoute>
              }
            >
              <Route index element={<HODDashboard />} />
              <Route path="student/:rollNumber" element={<StudentDetails />} />
              <Route path="change-password" element={<HODChangePassword />} />
            </Route>

            {/* HR routes */}
            <Route
              path="/hr"
              element={
                <HRRoute>
                  <HRLayout />
                </HRRoute>
              }
            >
              <Route index element={<HRDashboard />} />
              <Route path="add-faculty-due" element={<AddFacultyDue />} />
              <Route path="change-password" element={<HRChangePassword />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
