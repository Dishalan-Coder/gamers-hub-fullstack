import { useState } from 'react';
import { toast } from 'react-toastify';
import API from '../services/api';
import { emailRegex, getApiError, getApiErrors } from '../services/validators';

const Contact = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [errors, setErrors] = useState({});

  const submit = async (e) => {
    e.preventDefault();
    const validation = {};
    if (!form.name.trim()) validation.name = 'Name is required';
    if (!form.email.trim()) validation.email = 'Email is required';
    else if (!emailRegex.test(form.email.trim())) validation.email = 'Enter valid email';
    if (!form.message.trim()) validation.message = 'Message is required';
    else if (form.message.trim().length < 10) validation.message = 'Message must be at least 10 characters';
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    try {
      await API.post('/contact', form);
      toast.success('Message sent');
      setForm({ name: '', email: '', message: '' });
    } catch (error) {
      setErrors(getApiErrors(error));
      toast.error(getApiError(error));
    }
  };

  return (
    <section className="auth-card wide">
      <h1>Contact Gamers Hub</h1>
      <p>This optional feature uses Nodemailer when mail settings are configured.</p>
      <form onSubmit={submit} noValidate>
        <label>Name</label><input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />{errors.name && <small className="error">{errors.name}</small>}
        <label>Email</label><input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />{errors.email && <small className="error">{errors.email}</small>}
        <label>Message</label><textarea value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} />{errors.message && <small className="error">{errors.message}</small>}
        <button className="btn full">Send Message</button>
      </form>
    </section>
  );
};

export default Contact;
