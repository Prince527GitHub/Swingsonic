module.exports = async(req, res, proxy, xml) => {
    const id = req.query.id;

    let imageId, imageType;

    if (id.startsWith("al-")) {
        imageId = id.substring(3);
        imageType = "album";
    } else {
        const decode = JSON.parse(Buffer.from(id, "base64").toString("utf-8"));
        imageId = decode.id;
        imageType = decode.type;
    }

    console.log(imageId, imageType)

    proxy(res, req, `${global.config.music}/img/${imageType === "artist" ? "artist" : "thumbnail"}/medium/${imageId}`);
}