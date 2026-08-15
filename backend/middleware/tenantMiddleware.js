/**
 * Multi-Tenancy Tenant Isolation Middleware
 * Guarantees that organizationId is always retrieved from authenticated user req.user
 * and never blindly trusted from req.body or req.params.
 */
const enforceTenant = (req, res, next) => {
  if (!req.user || !req.user.organizationId) {
    return res.status(401).json({
      success: false,
      message: 'Multi-tenant context missing: User or Organization not found.',
    });
  }

  // Get org ID safely whether organizationId is populated object or string ID
  const orgId = req.user.organizationId._id
    ? req.user.organizationId._id.toString()
    : req.user.organizationId.toString();

  req.tenantId = orgId;
  next();
};

module.exports = { enforceTenant };
