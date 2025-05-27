const checkRole = (allowedRoles) => (req, res, next) => {
    const userRole = req.session.user?.role;
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    if (roles.includes(userRole)) {
        return next();
    } else {
        return res.status(403).send("Akses ditolak. Kamu tidak punya izin ke halaman ini.");
    }
};

module.exports = checkRole;
