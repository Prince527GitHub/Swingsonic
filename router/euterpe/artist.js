const express = require("express");
const router = express.Router();

const proxy = require("../../packages/proxy");

router.get("/:id/image", async(req, res) => {
    const id = req.params.id;

    const cover = `${global.config.music}/img/a/${id}.webp`;

    if (global.config.server.proxy) proxy(res, cover);
    else res.redirect(cover);
});

module.exports = {
    router: router,
    name: "artist"
}