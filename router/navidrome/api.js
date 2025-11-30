const express = require("express");
const router = express.Router();

router.get("/album", async(req, res) => {
    let { _end, _start, _order, _sort } = req.query;

    const offset = _start || '0';
    // const limit = _end ? String(parseInt(_end) - parseInt(_start || 0)) : '50';
    const limit = 50;
    const sortby = _sort === "name" ? "title" : _sort === "artist" ? "albumartists" : "created_date";
    const reverse = _order === "DESC" ? "1" : "";

    const albums = await (await fetch(`${global.config.music}/getall/albums?start=${offset}&limit=${limit}&sortby=${sortby}&reverse=${reverse}`, {
        headers: {
            "Cookie": req.user
        }
    })).json();

    return res.json(
        albums.items.map(album => ({
            playCount: 0,
            playDate: null,
            rating: 0,
            starred: false,
            starredAt: null,
            id: album.albumhash,
            name: album.title,
            embedArtPath: album.image,
            artistId: album.albumartists[0]?.artisthash || "",
            artist: album.albumartists[0]?.name || "",
            albumArtistId: album.albumartists[0]?.artisthash || "",
            albumArtist: album.albumartists[0]?.name || "",
            allArtistIds: album.albumartists.map(a => a.artisthash).join(","),
            maxYear: album.date ? new Date(album.date * 1000).getFullYear() : 0,
            minYear: album.date ? new Date(album.date * 1000).getFullYear() : 0,
            date: album.date ? new Date(album.date * 1000).getFullYear().toString() : "",
            maxOriginalYear: 0,
            minOriginalYear: 0,
            releases: 1,
            compilation: false,
            songCount: album.track_count || 0,
            duration: album.duration || 0,
            size: 0,
            genre: "",
            genres: null,
            fullText: `${album.title} ${album.albumartists[0]?.name || ""}`,
            orderAlbumName: album.title,
            orderAlbumArtistName: album.albumartists[0]?.name || "",
            paths: "",
            externalInfoUpdatedAt: null,
            createdAt: new Date(album.date * 1000).toISOString(),
            updatedAt: new Date(album.date * 1000).toISOString()
        }))
    )
});

router.get("/song", async(req, res) => {
    let { _end, _start, _order, _sort, album_id } = req.query;

    const album = await (await fetch(`${global.config.music}/album`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Cookie": req.user
        },
        body: JSON.stringify({ albumhash: album_id })
    })).json();

    return res.json(
        album.tracks.map(track => ({
            id: track.trackhash,
            path: track.filepath,
            title: track.title,
            album: track.album,
            artists: track.artists.map(a => a.name).join(", "),
            albumId: track.albumhash,
            albumArtist: track.albumartists[0]?.name || "",
            hasCoverArt: !!track.image,
            trackNumber: track.track,
            discNumber: track.disc || 0,
            year: album.info.date ? new Date(album.info.date * 1000).getFullYear() : 0,
            size: track.extra?.filesize || 0,
            contentType: "audio/mpeg",
            suffix: track.filepath.split('.').pop(),
            duration: track.duration,
            bitRate: track.bitrate,
            genre: "",
            compilation: false,
            createdAt: new Date(album.info.created_date * 1000).toISOString(),
            updatedAt: new Date(album.info.created_date * 1000).toISOString(),
            bookmarkPosition: 0,
            starred: track.is_favorite,
            playCount: 0
        })).sort((a, b) => a.trackNumber - b.trackNumber)
    )
});

module.exports = {
    router: router,
    name: "api"
}