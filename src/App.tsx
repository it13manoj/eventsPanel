import { BrowserRouter as Router, Routes, Route } from "react-router";
import RootRedirect from "./components/RootRedirect";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import PrivateRoute from "./components/PrivateRoute";
import StockPages from "./pages/Stock/StockPage";
import EventsList from "./pages/Events/EventList";
import CompanyProfile from "./pages/Dashboard/CompanyProfile";
import WhereHouse from "./components/Invoice/wherehouse";
import Category from "./components/Invoice/Category/Category";
import SubCategory from "./components/Invoice/SubCategory/SubCategory";
import Owner from "./components/Vechicle/Owner";
import Agency from "./components/Vechicle/Agency";
import Vechicle from "./components/Vechicle/Vehicle";
import AddVehicle from "./components/Vechicle/VehicleList/AddVehicle";
import WareHouseList from "./components/Invoice/WareHouseList";
import EmployeeList from "./components/employee/EmployeeList/AddEmployee";
import Attendance from "./components/employee/Attendance";
import Salary from "./components/employee/EmployeeList/Salary";
import InvoiceList from "./components/Invoice/InvoiceList";
import { useEffect, useState } from "react";
import AvailableStock from "./pages/Dashboard/AvailableStock";
import SettingPage from "./pages/Settings/SettingPage";
import TemplatePage from "./pages/Templates/TemplatePage";
import RolesPermissionsPage from "./pages/Roles/RolesPermissionsPage";
import AdminRoute from "./components/AdminRoute";
import PermissionRoute from "./components/PermissionRoute";

export default function App() {
  const [is_enabled, setEnabled] = useState(false);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "F4") {
        setEnabled(true);
      } else {
        setEnabled(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={<PrivateRoute />}>
            {/* Dashboard Layout */}
            <Route element={<AppLayout />}>
              {/* Profile accessible to all logged in users */}
              <Route path="/profile" element={<UserProfiles />} />

              {/* Module-Guarded Routes */}
              <Route element={<PermissionRoute module="dashboard" />}>
                <Route index path="/dashboard" element={<Home />} />
                <Route path="/companyprofile" element={<CompanyProfile />} />
                <Route path="/availablestock" element={<AvailableStock />} />
              </Route>

              <Route element={<PermissionRoute module="events" />}>
                <Route path="/events" element={<EventsList />} />
              </Route>

              <Route element={<PermissionRoute module="calendar" />}>
                <Route path="/calendar" element={<Calendar />} />
              </Route>

              <Route element={<PermissionRoute module="templates" />}>
                <Route path="/templates" element={<TemplatePage />} />
              </Route>

              <Route element={<PermissionRoute module="employees" />}>
                <Route path="/employeelist" element={<EmployeeList />} />
              </Route>

              <Route element={<PermissionRoute module="roles" />}>
                <Route path="/roles-permissions" element={<RolesPermissionsPage />} />
              </Route>

              <Route element={<PermissionRoute module="attendance" />}>
                <Route path="/attendance" element={<Attendance />} />
              </Route>

              <Route element={<PermissionRoute module="salary" />}>
                <Route path="/salary" element={<Salary />} />
              </Route>

              <Route element={<PermissionRoute module="inventory" />}>
                <Route path="/stock" element={<StockPages />} />
                <Route path="/wherehouse" element={<WhereHouse />} />
                <Route path="/category" element={<Category />} />
                <Route path="/sub-category" element={<SubCategory />} />
                <Route path="/warehouselist" element={<WareHouseList />} />
              </Route>

              <Route element={<PermissionRoute module="vehicles" />}>
                <Route path="/owner-vahicle" element={<Owner />} />
                <Route path="/agency-vehicle" element={<Agency />} />
                <Route path="/vehicle" element={<Vechicle />} />
                <Route path="/addvehicle" element={<AddVehicle />} />
              </Route>

              <Route element={<PermissionRoute module="invoices" />}>
                <Route path="/invoicelist" element={<InvoiceList />} />
              </Route>

              <Route element={<PermissionRoute module="settings" />}>
                <Route path="/setting" element={<SettingPage />} />
              </Route>

              {/* Admin UI / Dev Pages */}
              <Route element={<AdminRoute />}>
                <Route path="/blank" element={<Blank />} />
                <Route path="/form-elements" element={<FormElements />} />
                <Route path="/basic-tables" element={<BasicTables />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/avatars" element={<Avatars />} />
                <Route path="/badge" element={<Badges />} />
                <Route path="/buttons" element={<Buttons />} />
                <Route path="/images" element={<Images />} />
                <Route path="/videos" element={<Videos />} />
                <Route path="/line-chart" element={<LineChart />} />
                <Route path="/bar-chart" element={<BarChart />} />
              </Route>
            </Route>
          </Route>
          {/* Auth & Home Navigation Routes */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<RootRedirect />} />
          <Route path="/signin" element={<RootRedirect />} />
          {is_enabled == true &&
            <Route path="/signup" element={<SignUp />} />
          }

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>

      </Router>

    </>
  );
}
