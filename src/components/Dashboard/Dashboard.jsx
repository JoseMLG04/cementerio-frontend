import "./Dashboard.css";
import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import Menu from "../Menu/Menu";


export default function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
    }
  }, [navigate]);

  return (
    <>
      <Menu />
      <div className="main-content d-flex justify-content-center">
        <div className="content-wrapper w-100" style={{ maxWidth: "1200px" }}>
          <Outlet />
        </div>
      </div>
    </>
  );
}
