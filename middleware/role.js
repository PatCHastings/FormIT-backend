function roleMiddleware(requiredRoles) {
    return (req, res, next) => {
      if (!req.user || !requiredRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access denied' });
      }
      next();
    };
  }
  
  module.exports = roleMiddleware;