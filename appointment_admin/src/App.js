import Login from "./pages/Login";
import Register from "./pages/Register"
import Home from "./pages/Home";
import { BrowserRouter, Navigate, Route, Routes, Router, createBrowserRouter, RouterProvider } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "./context/AuthContext";
import Users from "./pages/Users";
import Requests from "./pages/Requests";
import Sidebar from "./components/Sidebar";
import styled from "styled-components";
import './App.css'
import PageLayout from './PageLayout'
import Programs from "./pages/Programs";
import StudioConfigure from "./pages/StudioConfigure";
import Manage from "./pages/Manage";
import Privacy from "./pages/Privacy";
import Cancelled from "./pages/Cancelled";
import Waiting from "./pages/Waiting";

function App() {
  const { user } = useContext(AuthContext)
  return (
    <BrowserRouter>
      <Routes>
        <Route exact path="/" element={user?.isAdmin ? <Home /> : <Navigate to="/login" />} />
        <Route path="/login" element={user?.isAdmin ?<Home/>:<Login />} />
        <Route path="/register" element={user?.isAdmin ?<Home/>:<Register />} />
        <Route path="/users" element={user?.isAdmin? (user?.role == "recorder" || user?.role == "manager" || user?.role == "pcs"? <Navigate to="/"/>: <Users/>): <Navigate to="/login"/>}/>
        <Route path="/requests" element={user?.isAdmin ?(user?.role == 'pcs'?<Navigate to='/'/>:<Requests />): <Navigate to="/login"/>} />
        <Route path="/programs" element={user?.isAdmin? (user?.role == "recorder" || user?.role == "manager" || user?.role == "pcs"? <Navigate to="/"/>: <Programs/>): <Navigate to="/login"/>} />
        <Route path="/configure" element={user?.isAdmin? (user?.role == "recorder" || user?.role == "manager" || user?.role == "pcs"? <Navigate to="/"/>: <StudioConfigure/>): <Navigate to="/login"/>} />
        <Route path="/cancelled" element={user?.isAdmin ?(user?.role == "recorder" || user?.role == "manager" || user?.role == "pcs"? <Navigate to="/"/>: <Cancelled/>): <Navigate to="/login"/>} />
        <Route path="/waiting" element={user?.isAdmin? (user?.role == "recorder" || user?.role == "manager" || user?.role == "pcs"? <Navigate to="/"/>: <Waiting/>): <Navigate to="/login"/>}/>
        <Route path="/manage" element={user?.isAdmin ? (user?.role == "pcs"? <Navigate to="/"/>: <Manage/>): <Navigate to="/login"/>} />
        <Route path="/privacy" element={<Privacy/>} />
      </Routes>
    </BrowserRouter>
  );
}


export default App;
