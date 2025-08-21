import React, { useState, useRef, useEffect } from "react";
import { useDispatch } from "react-redux";
import "./AddBook.css";
import InputField from "../../../utils/customInputField/InputField";
import Button from "../../../utils/customButton/Button";
import imgPlaceholder from "../../../assets/logo/logo.png";
import {
  validateTitle,
  validateAuthor,
  validateDescription,
  validatePrice,
  validateCategory,
  validateStock,
  validatePublicationYear,
  validatePublisher,
  validateNumberOfPages,
  validateFields,
} from "../../../utils/customValidations/Validations";
import { addBook } from "../../../redux/slices/bookSlice";
import { toast } from "react-hot-toast";

const AddBook = () => {
  const dispatch = useDispatch();
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);
  const [bookImage, setBookImage] = useState(null);
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [publicationYear, setPublicationYear] = useState("");
  const [publisher, setPublisher] = useState("");
  const [pages, setPages] = useState("");
  const [fileName, setFileName] = useState("Choose File");
  const [bookFile, setBookFile] = useState(null);
  const [bookImagePreview, setBookImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const [titleError, setTitleError] = useState("");
  const [authorError, setAuthorError] = useState("");
  const [descriptionError, setDescriptionError] = useState("");
  const [priceError, setPriceError] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [stockError, setStockError] = useState("");
  const [publicationYearError, setPublicationYearError] = useState("");
  const [publisherError, setPublisherError] = useState("");
  const [numberOfPagesError, setNumberOfPagesError] = useState("");

  useEffect(() => {
    const hasErrors =
      titleError ||
      authorError ||
      descriptionError ||
      priceError ||
      categoryError ||
      stockError ||
      publicationYearError ||
      publisherError ||
      numberOfPagesError ||
      !title ||
      !author ||
      !description ||
      !price ||
      !category ||
      !stock ||
      !publicationYear ||
      !publisher ||
      !pages;
  }, [
    titleError,
    authorError,
    descriptionError,
    priceError,
    categoryError,
    stockError,
    publicationYearError,
    publisherError,
    numberOfPagesError,
    title,
    author,
    description,
    price,
    category,
    stock,
    publicationYear,
    publisher,
    pages,
  ]);

  const handleTitleChange = (e) => {
    setTitle(e.target.value);
    setTitleError(validateTitle(e.target.value));
  };

  const handleAuthorChange = (e) => {
    setAuthor(e.target.value);
    setAuthorError(validateAuthor(e.target.value));
  };

  const handleDescriptionChange = (e) => {
    setDescription(e.target.value);
    setDescriptionError(validateDescription(e.target.value));
  };

  const handlePriceChange = (e) => {
    setPrice(e.target.value);
    setPriceError(validatePrice(e.target.value));
  };

  const handleCategoryChange = (e) => {
    setCategory(e.target.value);
    setCategoryError(validateCategory(e.target.value));
  };

  const handleStockChange = (e) => {
    setStock(e.target.value);
    setStockError(validateStock(e.target.value));
  };

  const handlePublicationYearChange = (e) => {
    setPublicationYear(e.target.value);
    setPublicationYearError(validatePublicationYear(e.target.value));
  };

  const handlePublisherChange = (e) => {
    setPublisher(e.target.value);
    setPublisherError(validatePublisher(e.target.value));
  };

  const handleNumberOfPagesChange = (e) => {
    setPages(e.target.value);
    setNumberOfPagesError(validateNumberOfPages(e.target.value));
  };

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setBookImage(file); // Store the file for upload

      const reader = new FileReader();
      reader.onloadend = () => setBookImagePreview(reader.result); // Set preview
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      setBookFile(file); // Store the file in state
    }
  };

  const handleAddBook = async (event) => {
    event.preventDefault();

    const fields = {
      title,
      author,
      description,
      price,
      genre: Array.isArray(category) ? category : [category],
      stock,
      publicationYear,
      publisher,
      pages,
    };

    const errors = validateFields(fields);
    if (Object.keys(errors).length > 0) {
      toast.error(errors[Object.keys(errors)[0]]);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      Object.entries(fields).forEach(([key, value]) =>
        formData.append(
          key,
          Array.isArray(value) ? JSON.stringify(value) : value
        )
      );

      if (bookImage) {
        formData.append("bookImage", bookImage);
      }

      if (bookFile) {
        formData.append("bookFile", bookFile);
      }

      const resultAction = await dispatch(addBook(formData));

      if (addBook.fulfilled.match(resultAction)) {
        toast.success("Book added successfully");

        setTitle("");
        setAuthor("");
        setDescription("");
        setPrice("");
        setCategory([]);
        setStock("");
        setPublicationYear("");
        setPublisher("");
        setPages("");
        setBookImage(null);
        setBookImagePreview(null);
        setBookFile(null);
        setFileName("Choose File");
        setTimeout(() => {
          navigate("/admin/books/mange-books");
        }, 2000);
      } else if (addBook.rejected.match(resultAction)) {
        toast.error(resultAction.payload?.error || "Failed to add book.");
      } else {
        toast.error("Unexpected response from server.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="upload-book">
      <div className="container">
        <div className="row align-items-center justify-content-center">
          <div className="col-sm-12 col-md-12 col-lg-12">
            <h1 className="title">ADD BOOK</h1>
          </div>
        </div>

        <div className="row align-items-center justify-content-center">
          <div className="col-md-4 text-center mb-4">
            <div
              className="img-container"
              onClick={() => imageInputRef.current.click()}
            >
              <img
                src={bookImagePreview || imgPlaceholder}
                alt="Book"
                className="image"
              />
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
                <InputField
                  label="Title"
                  value={title}
                  onChange={handleTitleChange}
                  required
                  editable={true}
                />
              </div>
              <div className="col-md-6 mb-3">
                <InputField
                  label="Author"
                  value={author}
                  onChange={handleAuthorChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-12 mb-3">
                <InputField
                  label="Description"
                  value={description}
                  onChange={handleDescriptionChange}
                  required
                  multiline
                  rows={4}
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <InputField
                  label="Price"
                  value={price}
                  onChange={handlePriceChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <InputField
                  label="Genre"
                  value={category}
                  onChange={handleCategoryChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <InputField
                  label="Stock"
                  value={stock}
                  onChange={handleStockChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <InputField
                  label="Publication Year"
                  value={publicationYear}
                  onChange={handlePublicationYearChange}
                  required
                />
              </div>
            </div>

            <div className="row">
              <div className="col-md-6 mb-3">
                <InputField
                  label="Publisher"
                  value={publisher}
                  onChange={handlePublisherChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-3">
                <InputField
                  label="No of Pages"
                  value={pages}
                  onChange={handleNumberOfPagesChange}
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
                  title="Add Book"
                  width={350}
                  onPress={handleAddBook}
                  loading={loading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AddBook;
