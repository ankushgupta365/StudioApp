import Login from "./pages/Login";
import Register from "./pages/Register"
import Home from "./pages/Home";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import MyBookings from "./pages/MyBookings";
import Privacy from "./pages/Privacy";
function App() {
  const { user } = useContext(AuthContext)
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={user?<Home />: <Navigate to="/login"/>} />
        <Route path="/bookings" element={user?<MyBookings/> : <Navigate to="/login"/>}/>
        <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login"/>}/>
        <Route path="/privacy" element={<Privacy/>}/>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
