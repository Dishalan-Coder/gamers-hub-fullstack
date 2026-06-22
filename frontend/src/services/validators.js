export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const phoneRegex = /^07\d{8}$/;
export const imageRegex = /\.(jpg|jpeg|png|webp|gif|svg)$/i;

export const getApiError = (error) => {
  return error.response?.data?.message || error.message || 'Something went wrong';
};

export const getApiErrors = (error) => {
  return error.response?.data?.errors || {};
};

export const validateRegister = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Name is required';
  else if (form.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';

  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!emailRegex.test(form.email.trim())) errors.email = 'Enter a valid email address';

  if (!form.phone.trim()) errors.phone = 'Phone number is required';
  else if (!phoneRegex.test(form.phone.trim())) errors.phone = 'Use Sri Lankan phone format like 0771234567';

  if (!form.password) errors.password = 'Password is required';
  else if (form.password.length < 8) errors.password = 'Password must be at least 8 characters';
  else if (/\s/.test(form.password)) errors.password = 'Password cannot contain spaces';

  if (!form.confirmPassword) errors.confirmPassword = 'Confirm password is required';
  else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match';
  return errors;
};

export const validateLogin = (form) => {
  const errors = {};
  if (!form.email.trim()) errors.email = 'Email is required';
  else if (!emailRegex.test(form.email.trim())) errors.email = 'Enter a valid email address';
  if (!form.password) errors.password = 'Password is required';
  return errors;
};

export const validateProduct = (form) => {
  const errors = {};
  if (!form.name.trim()) errors.name = 'Product name is required';
  if (!form.category.trim()) errors.category = 'Category is required';
  if (!form.description.trim()) errors.description = 'Description is required';
  if (!form.price) errors.price = 'Price is required';
  else if (Number(form.price) <= 0) errors.price = 'Price must be greater than 0';
  if (form.stock === '') errors.stock = 'Quantity is required';
  else if (!Number.isInteger(Number(form.stock)) || Number(form.stock) < 0) errors.stock = 'Quantity must be 0 or greater';
  if (!form.image_url.trim()) errors.image_url = 'Image URL is required';
  else if (!imageRegex.test(form.image_url.trim())) errors.image_url = 'Image must be jpg, png, webp, gif, or svg';
  return errors;
};
