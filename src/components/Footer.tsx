import React from "react";
import "./Footer.css";

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-section">
          <p className="footer-copyright">
            © {currentYear} VNR Vignana Jyothi Institute of Engineering & Technology. All rights reserved.
          </p>
        </div>
        <div className="footer-section">
          <p className="footer-support">
            For support, email:{" "}
            <a href="mailto:nodues@vnrvjiet.in" className="footer-email">
              nodues@vnrvjiet.in
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
