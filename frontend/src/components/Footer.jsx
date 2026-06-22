import { FaGamepad, FaHeadset, FaShieldAlt } from 'react-icons/fa';

const Footer = () => (
  <footer className="footer">
    <div>
      <h3><FaGamepad /> Gamers Hub</h3>
      <p>Gaming accessories store for keyboards, mice, headsets, controllers, and streaming gear.</p>
    </div>
    <div className="footer-points">
      <span><FaHeadset /> Customer requests</span>
      <span><FaShieldAlt /> Secure JWT login</span>
    </div>
  </footer>
);

export default Footer;
