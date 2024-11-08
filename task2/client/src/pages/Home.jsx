import React, { useEffect } from "react";
import { useAuth } from "../context/Auth";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const [auth] = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.user) {
      navigate("/login");
    }
  }, [auth.user, navigate]);
  return (
    <div>
      <h1>Home</h1>
    </div>
  );
};

export default Home;
