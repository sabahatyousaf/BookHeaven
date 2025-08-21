import React from "react";
import { useNavigate } from "react-router-dom";
import "./NotFound.css";
import Button from "../../utils/customButton/Button";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <section id="not-found-container">
      <div className="not-found-content">
        <h1 className="not-found-title">404</h1>
        <p className="not-found-description">
          Oops! The page you’re looking for doesn’t exist.
        </p>
        <Button title="Go Back To Login" onPress={() => navigate("/")} />
      </div>
    </section>
  );
};

export default NotFound;
