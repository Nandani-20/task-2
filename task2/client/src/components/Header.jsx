import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/Auth";

const Header = () => {
  const [auth] = useAuth();

  const navigate = useNavigate();

  const handleLogout = (e) => {
    e.preventDefault();

    try {
      localStorage.removeItem("auth");
      navigate("/login");
      window.location.reload();
    } catch (error) {
      console.log(error.message);
    }
  };

  return (
    <div>
      <nav
        className="navbar navbar-expand-lg bg-body-tertiary bg-primary"
        data-bs-theme="dark"
      >
        <div className="container-fluid">
          <Link to={"/"} className="navbar-brand">
            Chat App
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon" />
          </button>
          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <Link to={"/"} className="nav-link active" aria-current="page">
                  Home
                </Link>
              </li>
              <li className="nav-item">
                <Link to={"/"} className="nav-link">
                  About
                </Link>
              </li>
              <li className="nav-item">
                <Link to={"/chat"} className="nav-link">
                  Chat
                </Link>
              </li>
            </ul>

            {auth?.user ? (
              <div className="d-flex align-items-center gap-2">
                <div>
                  <span className="text-white">{auth?.user?.name}</span>
                </div>

                <button
                  className="btn btn-primary"
                  type="submit"
                  onClick={handleLogout}
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="d-flex align-items-center gap-2">
                <Link to={"/register"}>
                  <button className="btn btn-primary" type="submit">
                    Register
                  </button>
                </Link>

                <Link to={"/login"}>
                  <button className="btn btn-primary" type="submit">
                    Login
                  </button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
