import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Login from "./shared/pages/Login";
import AdminLayout from "./admin/components/AdminLayout";
import AdminDashboard from "./admin/pages/Dashboard";
import Organizations from "./admin/pages/Organizations";
import AdminList from "./admin/pages/AdminList";
import { OrganizationApp } from "./OrganizationApp/OrganizationApp";
import { AuthProvider } from "./shared/contexts/AuthContext";

const theme = createTheme({
  palette: {
    primary: {
      main: "#16a34a",
    },
    secondary: {
      main: "#dc2626",
    },
  },
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="organizations" element={<Organizations />} />
              <Route path="list" element={<AdminList />} />
              <Route index element={<Navigate to="dashboard" replace />} />
            </Route>
            <Route
              path="/organization/*"
              element={
                <OrganizationApp
                  onLogout={() => {
                    localStorage.removeItem("user");
                    window.location.href = "/login";
                  }}
                />
              }
            />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
