import React, { useState, useEffect } from "react";
import "./Reviews.css";
import { useDispatch, useSelector } from "react-redux";
import { getAllReviews, deleteReview } from "../../../redux/slices/reviewSlice";
import Modal from "../../../utils/customModal/Modal";
import { toast } from "react-hot-toast";
import InputField from "../../../utils/customInputField/InputField";
import { useNavigate } from "react-router-dom";
import Loader from "../../../utils/customLoader/Loader";

const Reviews = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const reviews = useSelector((state) => state.reviews.reviews);

  const [selectedReview, setSelectedReview] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      dispatch(getAllReviews())
        .unwrap()
        .then(() => {
          console.log("Reviews fetched successfully!"); // Log success
          setLoading(false);
        })
        .catch((error) => {
          console.error("Error fetching reviews:", error); // Log error
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [dispatch, user?.id]);

  const filteredReviews = (Array.isArray(reviews) ? reviews : []).filter(
    (review) =>
      review.comment &&
      review.comment.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleDeleteReview = async (review) => {
    console.log("Review selected for deletion:", review); // Log selected review
    setSelectedReview(review);
    setIsDeleteModalOpen(true);
  };

  const deleteSelectedReview = async () => {
    setLoadingAction("DELETE");
    try {
      if (selectedReview?._id) {
        await dispatch(deleteReview(selectedReview._id)); // Pass only reviewId
        console.log("Review deleted successfully:", selectedReview._id); // Log success
        toast.success("Review deleted successfully!");
      }
    } catch (error) {
      console.error("Error deleting review:", error); // Log error
      toast.error("Error while deleting review.");
    } finally {
      setLoadingAction(null);
      setIsDeleteModalOpen(false);
      setSelectedReview(null);
    }
  };

  const handleViewDetailChange = (review) => {
    navigate(`/admin/reviews/review-details/${review._id}`, {
      state: { review },
    });
  };

  return (
    <section id="review">
      <div className="reviews-container">
        <h2 className="reviews-title">Reviews List</h2>
        <div className="search-container" style={{ marginBottom: 15 }}>
          <div className="container text-center">
            <div className="row">
              <div className="col-sm-12 col-md-12 col-lg-6">
                <InputField
                  type="text"
                  placeholder="Search Reviews"
                  value={search}
                  onChange={handleSearch}
                  width={300}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="table-responsive">
          {loading ? (
            <div
              className="loader-container"
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "30vh",
              }}
            >
              <Loader />
            </div>
          ) : filteredReviews.length > 0 ? (
            <table className="table custom-table">
              <thead>
                <tr>
                  <th>Reviwer Name</th>
                  <th>Reviwer Comment</th>
                  <th>Reviwer Rating</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredReviews.map((review, index) => {
                  return (
                    <tr key={index}>
                      <td className="user-profile">
                        <img
                          src={review?.userId?.profilePicture}
                          alt={review?.userId?.userName}
                          className="user-img"
                        />
                        <span className="user-name">
                          {review?.userId?.userName}
                        </span>
                      </td>
                      <td className="review-comment">{review.comment}</td>
                      <td className="review-rating">{review.rating}</td>
                      <td className="actions">
                        <button
                          className="action-button view-detail"
                          onClick={() => handleViewDetailChange(review)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>

                        <button
                          className="action-button delete-review"
                          onClick={() => handleDeleteReview(review)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div className="no-reviews-found">No Reviews Found</div>
          )}
        </div>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title={`Delete Review`}
          loading={loadingAction === "DELETE"}
          buttons={[
            {
              label: "Delete",
              className: "modal-btn-danger",
              onClick: deleteSelectedReview,
              loading: loadingAction === "DELETE",
            },
          ]}
        >
          Are you sure you want to delete this review?
        </Modal>
      </div>
    </section>
  );
};

export default Reviews;
