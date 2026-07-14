import jwt from 'jsonwebtoken';

export function authenticate(req, res, next) {
    // 1. Read the Authorization header
    const authHeader = req.headers.authorization;
    console.log({authHeader});

    // 2. Must exist and start with "Bearer "
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'No token provided' });
    }

    // 3. Extract just the token (strip "Bearer ")
    const token = authHeader.split(' ')[1];
    console.log({token});

    // 4. Verify it
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log({decoded})
        req.userId = decoded.userId;   // attach the user id for the route to use
        console.log({userid: req.userId});
        next();                         // ✅ let the request continue
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }

}

