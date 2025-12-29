const sanitizeInput = (obj) => {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const sanitized = Array.isArray(obj) ? [] : {};
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      let value = obj[key];
      
      // Remove potential MongoDB operators
      if (key.startsWith('$')) {
        continue;
      }
      
      if (typeof value === 'string') {
        // Remove script tags and prevent XSS
        value = value
          .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          .replace(/javascript:/gi, '')
          .replace(/on\w+\s*=/gi, '')
          .trim();
      } else if (typeof value === 'object' && value !== null) {
        value = sanitizeInput(value);
      }
      
      sanitized[key] = value;
    }
  }
  
  return sanitized;
};

const sanitizer = (req, res, next) => {
  if (req.body) {
    req.body = sanitizeInput(req.body);
  }
  if (req.query) {
    req.query = sanitizeInput(req.query);
  }
  if (req.params) {
    req.params = sanitizeInput(req.params);
  }
  next();
};

module.exports = sanitizer;
