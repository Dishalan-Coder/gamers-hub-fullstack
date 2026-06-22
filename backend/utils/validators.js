const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^07\d{8}$/;
const imageRegex = /\.(jpg|jpeg|png|webp|gif|svg)$/i;

const isEmpty = (value) => value === undefined || value === null || String(value).trim() === '';

const validatePassword = (password, label = 'Password') => {
  if (isEmpty(password)) return `${label} is required`;
  if (String(password).length < 8) return `${label} must be at least 8 characters`;
  if (/\s/.test(password)) return `${label} must not contain spaces`;
  return '';
};

const validateRegister = ({ name, email, phone, password, confirmPassword }) => {
  const errors = {};
  if (isEmpty(name)) errors.name = 'Name is required';
  else if (String(name).trim().length < 2) errors.name = 'Name must be at least 2 characters';

  if (isEmpty(email)) errors.email = 'Email is required';
  else if (!emailRegex.test(String(email).trim())) errors.email = 'Please enter a valid email address';

  if (isEmpty(phone)) errors.phone = 'Phone number is required';
  else if (!phoneRegex.test(String(phone).trim())) errors.phone = 'Phone number must be a Sri Lankan mobile number like 0771234567';

  const passError = validatePassword(password);
  if (passError) errors.password = passError;

  if (isEmpty(confirmPassword)) errors.confirmPassword = 'Confirm password is required';
  else if (password !== confirmPassword) errors.confirmPassword = 'Passwords do not match';

  return errors;
};

const validateLogin = ({ email, password }) => {
  const errors = {};
  if (isEmpty(email)) errors.email = 'Email is required';
  else if (!emailRegex.test(String(email).trim())) errors.email = 'Please enter a valid email address';
  if (isEmpty(password)) errors.password = 'Password is required';
  return errors;
};

const validateProduct = ({ name, category, price, stock, image_url, description }) => {
  const errors = {};
  if (isEmpty(name)) errors.name = 'Product name is required';
  else if (String(name).trim().length < 3) errors.name = 'Product name must be at least 3 characters';

  if (isEmpty(category)) errors.category = 'Category is required';
  if (isEmpty(description)) errors.description = 'Description is required';

  const priceNumber = Number(price);
  const stockNumber = Number(stock);
  if (isEmpty(price)) errors.price = 'Price is required';
  else if (Number.isNaN(priceNumber) || priceNumber <= 0) errors.price = 'Price must be greater than 0';

  if (isEmpty(stock)) errors.stock = 'Quantity is required';
  else if (!Number.isInteger(stockNumber) || stockNumber < 0) errors.stock = 'Quantity must be 0 or greater';

  if (isEmpty(image_url)) errors.image_url = 'Product image URL is required';
  else if (!imageRegex.test(String(image_url).trim())) errors.image_url = 'Image must be jpg, jpeg, png, webp, gif, or svg';

  return errors;
};

const validateContact = ({ name, email, message }) => {
  const errors = {};
  if (isEmpty(name)) errors.name = 'Name is required';
  if (isEmpty(email)) errors.email = 'Email is required';
  else if (!emailRegex.test(String(email).trim())) errors.email = 'Please enter a valid email address';
  if (isEmpty(message)) errors.message = 'Message is required';
  else if (String(message).trim().length < 10) errors.message = 'Message must be at least 10 characters';
  return errors;
};

module.exports = {
  emailRegex,
  phoneRegex,
  imageRegex,
  isEmpty,
  validatePassword,
  validateRegister,
  validateLogin,
  validateProduct,
  validateContact,
};
