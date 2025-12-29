// middleware/authorizeDepartments.js
const authorizeDepartments = (...departments) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    if (!departments.includes(req.user.department)) {
      return res.status(403).json({ message: "Forbidden: Access denied" });
    }

    next();
  };
};

module.exports = authorizeDepartments;

