import React, { useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import Button from "../../../utils/customButton/Button";
import InputField from "../../../utils/customInputField/InputField";
import { useDispatch } from "react-redux";
import { updateBook } from "../../../redux/slices/bookSlice";
import { toast } from "react-hot-toast";
import "./UpdateBook.css";

const UpdateBook = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  const originalBook = location.state?.book || {};
  const [book, setBook] = useState(originalBook);
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [bookImagePreview, setBookImagePreview] = useState(
    book.bookImage || "placeholder_image.jpg"
  );
  const [fileName, setFileName] = useState("Choose File");

  const handleChange = (field, value) => {
    setBook((prev) => {
      const updatedBook = { ...prev, [field]: value };
      setHasChanges(
        JSON.stringify(updatedBook) !== JSON.stringify(originalBook)
      );
      return updatedBook;
    });
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setBookImagePreview(reader.result);
      reader.readAsDataURL(file);
      handleChange("bookImage", file);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      handleChange("bookFile", file);
    }
  };

  const handleUpdateBook = async (event) => {
    event.preventDefault();
    if (!hasChanges) return;

    setLoading(true);
    try {
      const formData = new FormData();

      Object.entries(book).forEach(([key, value]) => {
        // Convert uploadedBy to string if it's an object
        if (key === "uploadedBy" && typeof value === "object") {
          formData.append(key, value._id || "");
        } else {
          formData.append(key, value);
        }
      });

      if (!book._id) {
        toast.error("Book ID is missing!");
        setLoading(false);
        return;
      }

      const resultAction = await dispatch(
        updateBook({ bookId: book._id, formData })
      );

      if (updateBook.fulfilled.match(resultAction)) {
        toast.success("Book updated successfully");
      } else {
        toast.error("Failed to update book");
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="edit-book">
      <div className="container">
        <div className="row align-items-center justify-content-center">
          <div className="col-sm-12 col-md-12 col-lg-12">
            <h1 className="title">EDIT BOOK</h1>
          </div>
        </div>

        <div className="row align-items-center justify-content-center">
          <div className="col-md-4 text-center mb-4">
            <div
              className="img-container"
              onClick={() => imageInputRef.current.click()}
            >
              <img src={bookImagePreview} alt="Book" className="image" />
            </div>
            <input
              type="file"
              ref={imageInputRef}
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleImageSelect}
            />
          </div>

          <div className="col-sm-12 col-md-12 col-lg-8">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="label">Title</label>
                <InputField
                  label="Title"
                  value={book.title}
                  onChange={(e) => handleChange("title", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="label">Author</label>
                <InputField
                  label="Author"
                  value={book.author}
                  onChange={(e) => handleChange("author", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-3">
                <label className="label">Description</label>
                <InputField
                  label="Description"
                  value={book.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  required
                  multiline
                  rows={4}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="label">Price</label>

                <InputField
                  label="Price"
                  value={book.price}
                  onChange={(e) => handleChange("price", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="label">Genre</label>

                <InputField
                  label="Genre"
                  value={book.genre.join(", ")}
                  onChange={(e) =>
                    handleChange("genre", e.target.value.split(", "))
                  }
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="label">Stock</label>

                <InputField
                  label="Stock"
                  value={book.stock}
                  onChange={(e) => handleChange("stock", e.target.value)}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <label className="label">Publication Year</label>

                <InputField
                  label="Publication Year"
                  value={book.publicationYear}
                  onChange={(e) =>
                    handleChange("publicationYear", e.target.value)
                  }
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="label">Publisher</label>

                <InputField
                  label="Publisher"
                  value={book.publisher}
                  onChange={(e) => handleChange("publisher", e.target.value)}
                  required
                />
              </div>

              <div className="col-md-6 mb-3">
                <label className="label">Number Of Pages</label>

                <InputField
                  label="Number Of Pages"
                  value={book.pages}
                  onChange={(e) => handleChange("pages", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 text-center">
                <div
                  className="file-upload-container"
                  onClick={() => fileInputRef.current.click()}
                >
                  <p className="file-label">{fileName}</p>
                </div>
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: "none" }}
                  onChange={handleFileSelect}
                />
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-sm-12 col-md-12 col-lg-12 text-center">
                <Button
                  title="Update Book"
                  width={350}
                  onPress={handleUpdateBook}
                  loading={loading}
                  disabled={!hasChanges}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default UpdateBook;
