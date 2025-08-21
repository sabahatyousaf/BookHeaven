import React, { useState, useEffect } from "react";
import "./Books.css";
import { useDispatch, useSelector } from "react-redux";
import {
  getAllBooks,
  setBooks,
  deleteBook,
} from "../../../redux/slices/bookSlice";
import Modal from "../../../utils/customModal/Modal";
import { toast } from "react-hot-toast";
import InputField from "../../../utils/customInputField/InputField";
import Button from "../../../utils/customButton/Button";
import { useNavigate } from "react-router-dom";
import Loader from "../../../utils/customLoader/Loader";

const Books = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const books = useSelector((state) => state.books.books);

  const [selectedBook, setSelectedBook] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      dispatch(getAllBooks())
        .unwrap()
        .then(() => {
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [dispatch, user?.id]);

  const filteredBooks = (Array.isArray(books) ? books : []).filter((book) =>
    book.title && book.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleViewDetailChange = (book) => {
    navigate(`/admin/books/book-details/${book._id}`, {
      state: { book },
    });
  };

  const handleDeleteBook = async (book) => {
    setSelectedBook(book);
    setIsDeleteModalOpen(true);
  };

  const deleteBooks = async () => {
    setLoadingAction("DELETE");
    try {
      if (selectedBook?._id) {
        await dispatch(deleteBook(selectedBook._id));
        toast.success("Book deleted successfully!");
        dispatch(setBooks(books.filter((doc) => doc._id !== selectedBook._id)));
      }
    } catch {
      toast.error("Error while deleting book.");
    } finally {
      setLoadingAction(null);
      setIsDeleteModalOpen(false);
      setSelectedBook(null);
    }
  };

  const handleEditBook = (book) => {
    navigate(`/admin/books/edit-book/${book._id}`, {
      state: { book },
    });
  };

  const handleAddBookNavigate = () => {
    navigate("/admin/books/add-book");
  };

  return (
    <section id="book">
      <div className="books-container">
        <h2 className="books-title">Books List</h2>
        <div className="search-container" style={{ marginBottom: 15 }}>
          <div className="container text-center">
            <div className="row">
              <div className="col-sm-12 col-md-12 col-lg-6">
                <InputField
                  type="text"
                  placeholder="Search Books"
                  value={search}
                  onChange={handleSearch}
                  width={300}
                />
              </div>
              <div className="col-sm-12 col-md-12 col-lg-6">
                <Button
                  title="Add Book"
                  width={150}
                  onPress={handleAddBookNavigate}
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
                height: '30vh'
              }}
            >
              <Loader />
            </div>
          ) : filteredBooks.length > 0 ? (
            <table className="table custom-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>Genre</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredBooks.map((book, index) => (
                  <tr key={index}>
                    <td className="book-profile">
                      <img
                        src={book.bookImage}
                        alt={book.title}
                        className="book-img"
                      />
                      <span className="book-name">{book.title}</span>
                    </td>
                    <td>{book.author}</td>
                    <td>{book.genre}</td>
                    <td className="actions">
                      <button
                        className="action-button view-detail"
                        onClick={() => handleViewDetailChange(book)}
                      >
                        <i className="fas fa-eye"></i>
                      </button>

                      <button
                        className="action-button delete-book"
                        onClick={() => handleDeleteBook(book)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>

                      <button
                        className="action-button edit-book"
                        onClick={() => handleEditBook(book)}
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="no-books-found">No Books Found</div>
          )}
        </div>

        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title={`Delete ${selectedBook?.title}`}
          loading={loadingAction === "DELETE"}
          buttons={[
            {
              label: "Delete",
              className: "modal-btn-danger",
              onClick: deleteBooks,
              loading: loadingAction === "DELETE",
            },
          ]}
        >
          Are you sure you want to delete this book?
        </Modal>
      </div>
    </section>
  );
};

export default Books;
