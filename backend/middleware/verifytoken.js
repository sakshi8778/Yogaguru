import admin from "firebase-admin";
import serviceAccount from "../serviceAccountKey.json" with { type: "json" };

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

export async function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
        return res.status(401).json({ error: "No token provided" });
    }
    const idToken = authHeader.split(" ")[1];
    try {
        const decoded = await admin.auth().verifyIdToken(idToken);
        req.user = decoded; // decoded.uid, decoded.email, decoded.name, decoded.picture
        next();
    } catch (err) {
        return res.status(401).json({ error: "Invalid token" });
    }
}