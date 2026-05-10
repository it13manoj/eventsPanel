import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
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
import { useEffect, useState } from "react";

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
              <Route index path="/dashboard" element={<Home />} />
              <Route path="/stock" element={<StockPages />} />
              <Route path="/events" element={<EventsList />} />
              <Route path="/wherehouse" element={<WhereHouse />} />
              <Route path="/category" element={<Category />} />
              <Route path="/sub-category" element={<SubCategory />} />
              <Route path="/owner-vahicle" element={<Owner />} />
              <Route path="/agency-vehicle" element={<Agency />} />
              <Route path="/vehicle" element={<Vechicle />} />
              <Route path="/addvehicle" element={<AddVehicle />} />
              <Route path="/warehouselist" element={<WareHouseList />} />
              {/* Others Page */}
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/employeelist" element={<EmployeeList />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/salary" element={<Salary />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />

              {/* Forms */}
              <Route path="/form-elements" element={<FormElements />} />

              {/* Tables */}
              <Route path="/basic-tables" element={<BasicTables />} />

              {/* Ui Elements */}
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />

              {/* Charts */}
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>
          </Route>
          {/* Auth Layout */}
          <Route path="/" element={<SignIn />} />
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
