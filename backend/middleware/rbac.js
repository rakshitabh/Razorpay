/**
 * Role Based Access Control (RBAC) Middleware Filters
 */

// Permits only Admin roles
export const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    return next();
  }
  return res.status(403).json({
    message: 'Access denied. Security privilege tier [ADMIN] required.'
  });
};

// Permits Admin and Analyst roles (Threat containment actions, log uploads)
export const authorizeAnalyst = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'analyst')) {
    return next();
  }
  return res.status(403).json({
    message: 'Access denied. Security privilege tier [ANALYST] or [ADMIN] required.'
  });
};

// Permits Admin, Analyst, and Viewer roles (Read-only operations)
export const authorizeViewer = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'analyst' || req.user.role === 'viewer')) {
    return next();
  }
  return res.status(403).json({
    message: 'Access denied. Unauthorized security role.'
  });
};
