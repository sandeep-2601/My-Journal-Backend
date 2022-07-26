const jwt = require('jsonwebtoken');

const fetchUser = (req, res, next) => {

    const token = req.header('auth-token');
    
    if (!token)
        return res.status(401).json({ error: "Authenticate using a valid Token" });
    
    try {
        const data = jwt.verify(token, "SANDY");
        req.user = data.user;
        next();
    } catch (error) {
        return res.status(401).json({ error: "Authenticate using a valid Token" });
    }
}

module.exports = fetchUser;