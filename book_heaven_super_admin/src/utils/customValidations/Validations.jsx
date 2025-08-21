// Signin & Signup Validations

export const validateFullName = (fullName) => {
  if (!fullName) {
    return "Full Name is required";
  }
  if (fullName.length < 3) {
    return "Full Name must be at least 3 characters long";
  }
  return "";
};

export const validateEmail = (email) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) {
    return "Email is required";
  }
  if (!emailPattern.test(email)) {
    return "Please enter a valid email address";
  }
  return "";
};

export const validatePassword = (password) => {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 4) {
    return "Password must be at least 4 characters long";
  }
  return "";
};

export const validateContactNumber = (contactNumber) => {
  const contactNumberPattern = /^[0-9]{11}$/;
  if (!contactNumber) {
    return "Contact number is required";
  }
  if (!contactNumberPattern.test(contactNumber)) {
    return "Contact number must be 11 digits";
  }
  return "";
};

// Add Book Validations
export const validateTitle = (title) => {
  if (!title) {
    return "Title is required";
  }
  if (title.length < 5) {
    return "Title must be at least 5 characters long";
  }
  return "";
};

export const validateAuthor = (author) => {
  if (!author) {
    return "Author is required";
  }
  if (author.length < 5) {
    return "Author must be at least 5 characters long";
  }
  return "";
};

export const validateDescription = (description) => {
  if (!description) {
    return "Description is required";
  }
  if (description.length < 15) {
    return "Description must be at least 15 characters long";
  }
  return "";
};

export const validatePrice = (price) => {
  if (!price) {
    return "Price is required";
  }
  return "";
};

export const validateCategory = (category) => {
  if (!category) {
    return "Category is required";
  }
  return "";
};

export const validateStock = (stock) => {
  if (!stock) {
    return "Stock is required";
  }
  return "";
};

export const validatePublicationYear = (publicationYear) => {
  if (!publicationYear) {
    return "Publication Year is required";
  }
  return "";
};

export const validatePublisher = (publisher) => {
  if (!publisher) {
    return "Publisher is required";
  }
  return "";
};

export const validateNumberOfPages = (numberOfPages) => {
  if (!numberOfPages) {
    return "Number Of Pages is required";
  }
  return "";
};

export const validateFields = (fields) => {
  const validationFunctions = {
    // Signin & Signup Validations
    email: validateEmail,
    password: validatePassword,
    fullName: validateFullName,
    contactNumber: validateContactNumber,

    // Add Book Validations
    title: validateTitle,
    author: validateAuthor,
    description: validateDescription,
    price: validatePrice,
    category: validateCategory,
    stock: validateStock,
    publicationYear: validatePublicationYear,
    publisher: validatePublisher,
    numberOfPages: validateNumberOfPages,
  };

  const errors = {};

  Object.keys(fields).forEach((field) => {
    if (validationFunctions[field]) {
      const error = validationFunctions[field](fields[field]);
      if (error) {
        errors[field] = error;
      }
    }
  });

  return errors;
};

export const isValidInput = (fields) => {
  console.log("Validating fields: ", fields);
  const errors = validateFields(fields);
  console.log("Validation errors: ", errors); // Log each field error

  return Object.values(errors).every((error) => error === "");
};
