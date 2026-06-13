const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET;
console.log("JWT Secret:", jwtSecret);


const jwtAuthMiddleware = (req, res, next) => {

    const authorization = req.headers.authorization
    if(!authorization) return res.status(401).json({ error: 'Token Not Found' });

    const token = req.headers.authorization.split(' ')[1];
    if(!token) return res.status(401).json({ error: 'Unauthorized' });

    try{
        // Verify the JWT token
        const decoded = jwt.verify(token, jwtSecret);

        // Attach user information to the request object
        req.user = decoded
        next();
    }catch(err){
        console.error(err);
        res.status(401).json({ error: 'Invalid token' });
    }
}


// Function to generate JWT token
const generateToken = (userData) => {
    // Generate a new JWT token using user data
    if (!jwtSecret) {
        throw new Error('JWT secret is not configured');
    }

    return jwt.sign(userData, jwtSecret, {expiresIn: 30000});
}

module.exports = {jwtAuthMiddleware, generateToken};
