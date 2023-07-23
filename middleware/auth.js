const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    // Get token from header
    const token = req.header('x-auth-token');

    // Check if no token
    if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    // Verify token
    try {
        let decoded;
        const secrets = {
            'listener': process.env.JWT_SECRET_User,
            'artist': process.env.JWT_SECRT_Artist,
            'admin': process.env.JWT_SECRT_Admin
        };

        for (let role in secrets) {
            try {
                decoded = jwt.verify(token, secrets[role]);
                if (decoded && decoded.role === role) {
                    req.user = decoded;
                    return next();
                }
            } catch (err) {
                // not the correct secret, try next one
            }
        }
        
        // If none of the secrets worked, throw an error
        throw new Error('Token verification failed');

    } catch (err) {
        console.error('Something wrong with auth middleware', err);
        res.status(500).json({ msg: 'Server Error' });
    }
};

module.exports = auth;