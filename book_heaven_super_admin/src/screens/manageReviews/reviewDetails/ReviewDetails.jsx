import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Loader from "../../../utils/customLoader/Loader";
import "./ReviewDetails.css"; // Update the CSS file name

const ReviewDetails = () => {
  const location = useLocation();
  const [review, setReview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setReview(location.state?.review || null);
      setLoading(false);
    }, 1000);
  }, [location.state]);

  if (loading) {
    return (
      <div
        className="loader-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <Loader />
      </div>
    );
  }

  if (!review) {
    return <div className="not-found">No Review Found</div>;
  }

  return (
    <section id="review-detail">
      <div className="banner">
        <h1>Review Details</h1>
      </div>
      <div className="container">
        <div className="profile" style={{ marginTop: 40 }}>
          <img
            src={review?.userId?.profilePicture || "placeholder_image.jpg"}
            alt="Reviewer Profile"
          />
        </div>
        <div className="details">
          <div className="table-responsive">
            <table className="table">
              <tbody>
                <tr>
                  <td className="label color1">Reviewer Name</td>
                  <td className="value color1">{review?.userId?.userName}</td>
                  <td className="label color1">Reviewer Email</td>
                  <td className="value color1">{review?.userId?.email}</td>
                </tr>
                <tr>
                  <td className="label color2">Rating</td>
                  <td className="value color2">{review.rating}/5</td>
                  <td className="label color3">Comment</td>
                  <td className="value color3" colSpan="3">
                    {review.comment}
                  </td>
                </tr>
                <tr>
                  <td className="label color4">Book Title</td>
                  <td className="value color4">{review?.bookId?.title}</td>
                  <td className="label color1">Book Author</td>
                  <td className="value color1">{review?.bookId?.author}</td>
                </tr>
                <tr>
                  <td className="label color2">Book Genre</td>
                  <td className="value color2">
                    {review?.bookId?.genre?.join(", ")}
                  </td>
                  <td className="label color3">Book Price</td>
                  <td className="value color3">${review?.bookId?.price}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReviewDetails;
