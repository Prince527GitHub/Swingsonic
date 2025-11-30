const express = require("express");
const router = express.Router();
const crypto = require("crypto");

const { hashPassword } = require("../../packages/crypto");

router.post("/login", async(req, res) => {
    const { username, password } = req.body;

    console.log(username, password)

    const subsonicSalt = crypto.randomBytes(16).toString("hex");
    const subsonicToken = hashPassword(password, subsonicSalt);

    res.json({
        id: username,
        isAdmin: true,
        lastFMApiKey: "unsupported",
        name: username,
        subsonicSalt,
        subsonicToken,
        token: `${username}:${password}`,
        username
    });
});

module.exports = {
    router: router,
    name: "auth"
}