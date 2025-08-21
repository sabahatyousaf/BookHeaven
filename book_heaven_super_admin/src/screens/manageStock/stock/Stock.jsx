import React, { useState, useEffect } from "react";
import "./Stock.css";
import { useDispatch, useSelector } from "react-redux";
import { getAllBooks, updateBook } from "../../../redux/slices/bookSlice";
import InputField from "../../../utils/customInputField/InputField";
import Loader from "../../../utils/customLoader/Loader";
import { toast } from "react-hot-toast";

const Stock = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const books = useSelector((state) => state.books.books);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      dispatch(getAllBooks())
        .unwrap()
        .then(() => setLoading(false))
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [dispatch, user?.id]);

  const filteredBooks = (Array.isArray(books) ? books : []).filter(
    (book) =>
      book.title && book.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleSearch = (e) => {
    setSearch(e.target.value);
  };

  const handleIncreaseStock = (book) => {
    const newStock = (book.stock || 0) + 1;

    dispatch(
      updateBook({
        bookId: book._id,
        formData: { ...book, stock: newStock },
      })
    )
      .unwrap()
      .then((result) => {
        const updatedBooks = books.map((b) =>
          b._id === book._id ? { ...b, stock: newStock } : b
        );
        dispatch({ type: "books/setBooks", payload: updatedBooks });
        toast.success("Stock increased successfully!");
      })
      .catch(() => toast.error("Failed to increase stock."));
  };

  const handleDecreaseStock = (book) => {
    const newStock = book.stock && book.stock > 0 ? book.stock - 1 : 0;

    dispatch(
      updateBook({
        bookId: book._id,
        formData: { ...book, stock: newStock },
      })
    )
      .unwrap()
      .then((result) => {
        const updatedBooks = books.map((b) =>
          b._id === book._id ? { ...b, stock: newStock } : b
        );
        dispatch({ type: "books/setBooks", payload: updatedBooks });
        toast.success("Stock decreased successfully!");
      })
      .catch(() => toast.error("Failed to decrease stock."));
  };

  return (
    <section id="stock">
      <div className="stocks-container">
        <h2 className="stocks-title">Stock List</h2>
        <div className="search-container" style={{ marginBottom: 15 }}>
          <div className="container text-center">
            <div className="row">
              <div className="col-sm-12 col-md-12 col-lg-12">
                <InputField
                  type="text"
                  placeholder="Search Stock"
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
          ) : filteredBooks.length > 0 ? (
            <table className="table custom-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="table-body">
                {filteredBooks.map((book, index) => (
                  <tr key={index}>
                    <td className="stock-profile">
                      <img
                        src={book.bookImage}
                        alt={book.title}
                        className="stock-img"
                      />
                      <span className="stock-name">{book.title}</span>
                    </td>
                    <td>{book.stock > 0 ? book.stock : "Out of Stock"}</td>
                    <td className="actions">
                      <button
                        className="action-button increase-stock"
                        onClick={() => handleIncreaseStock(book)}
                      >
                        <i className="fas fa-plus"></i>
                      </button>
                      <button
                        className="action-button decrease-stock"
                        onClick={() => handleDecreaseStock(book)}
                      >
                        <i className="fas fa-minus"></i>
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
      </div>
    </section>
  );
};

export default Stock;
