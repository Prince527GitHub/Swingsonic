const express = require("express");
const router = express.Router();

router.get("/public", (req, res) => res.json([]));

router.get("/:id/views", async(req, res) => {
    const folders = await (await fetch(`${global.config.music}/folder`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            "folder": "$home",
            "tracks_only": false
        })
    })).json();

    res.json({
        "Items": folders.folders.map(folder => ({
            "Name": folder.name,
            "ServerId": "server",
            "Id": folder.path,
            "Etag": "tag",
            "DateCreated": "2024-03-04T00:39:17.500887Z",
            "CanDelete": false,
            "CanDownload": false,
            "SortName": "music",
            "ExternalUrls": [],
            "Path": folder.path,
            "EnableMediaSourceDisplay": true,
            "ChannelId": null,
            "Taglines": [],
            "Genres": [],
            "RemoteTrailers": [],
            "ProviderIds": {},
            "IsFolder": true,
            "ParentId": "0",
            "Type": "CollectionFolder",
            "People": [],
            "Studios": [],
            "GenreItems": [],
            "LocalTrailerCount": 0,
            "SpecialFeatureCount": 0,
            "DisplayPreferencesId": "folder",
            "Tags": [],
            "CollectionType": "music",
            "LocationType": "FileSystem",
            "LockedFields": [],
            "LockData": false
        })),
        "TotalRecordCount": folders.folders.length,
        "StartIndex": 0
    });
});

router.route("/authenticatebyname")
    .post(sendUser)
    .get(sendUser)

router.get("/user", sendUser);

function sendUser(req, res) {
    res.json({
        "User": {
            "Name": "test",
            "ServerId": "server",
            "Id": "user",
            "HasPassword": true,
            "HasConfiguredPassword": true,
            "HasConfiguredEasyPassword": false,
            "EnableAutoLogin": false,
            "LastLoginDate": "2024-03-04T19:59:39.5813857Z",
            "LastActivityDate": "2024-03-04T19:59:39.5813857Z",
            "Configuration": {
                "PlayDefaultAudioTrack": true,
                "SubtitleLanguagePreference": "",
                "DisplayMissingEpisodes": false,
                "GroupedFolders": [],
                "SubtitleMode": "Default",
                "DisplayCollectionsView": false,
                "EnableLocalPassword": false,
                "OrderedViews": [],
                "LatestItemsExcludes": [],
                "MyMediaExcludes": [],
                "HidePlayedInLatest": true,
                "RememberAudioSelections": true,
                "RememberSubtitleSelections": true,
                "EnableNextEpisodeAutoPlay": true
            },
            "Policy": {
                "IsAdministrator": true,
                "IsHidden": true,
                "IsDisabled": false,
                "BlockedTags": [],
                "EnableUserPreferenceAccess": true,
                "AccessSchedules": [],
                "BlockUnratedItems": [],
                "EnableRemoteControlOfOtherUsers": true,
                "EnableSharedDeviceControl": true,
                "EnableRemoteAccess": true,
                "EnableLiveTvManagement": true,
                "EnableLiveTvAccess": true,
                "EnableMediaPlayback": true,
                "EnableAudioPlaybackTranscoding": true,
                "EnableVideoPlaybackTranscoding": true,
                "EnablePlaybackRemuxing": true,
                "ForceRemoteSourceTranscoding": false,
                "EnableContentDeletion": true,
                "EnableContentDeletionFromFolders": [],
                "EnableContentDownloading": true,
                "EnableSyncTranscoding": true,
                "EnableMediaConversion": true,
                "EnabledDevices": [],
                "EnableAllDevices": true,
                "EnabledChannels": [],
                "EnableAllChannels": true,
                "EnabledFolders": [],
                "EnableAllFolders": true,
                "InvalidLoginAttemptCount": 0,
                "LoginAttemptsBeforeLockout": -1,
                "MaxActiveSessions": 0,
                "EnablePublicSharing": true,
                "BlockedMediaFolders": [],
                "BlockedChannels": [],
                "RemoteClientBitrateLimit": 0,
                "AuthenticationProviderId": "Jellyfin.Server.Implementations.Users.DefaultAuthenticationProvider",
                "PasswordResetProviderId": "Jellyfin.Server.Implementations.Users.DefaultPasswordResetProvider",
                "SyncPlayAccess": "CreateAndJoinGroups"
            }
        },
        "AccessToken": "user@password",
        "ServerId": "server"
    });
}

router.get("/:user/items", async(req, res) => {
    let { IncludeItemTypes, Limit, StartIndex, ParentId, AlbumArtistIds, Ids } = req.query;

    if (ParentId && IncludeItemTypes === "Audio") {
        const folders = await (await fetch(`${global.config.music}/folder`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "folder": "$home",
                "tracks_only": false
            })
        })).json();

        for (let index = 0; index < folders.folders.length; index++) {
            const folder = folders.folders[index];

            if (folder.path === ParentId) {
                IncludeItemTypes = "AllTracks";
                break;
            }
        }
    } else if (ParentId && !IncludeItemTypes) IncludeItemTypes = "Audio";

    let output = [];
    let albums = [];

    if ((IncludeItemTypes === "MusicAlbum" && !AlbumArtistIds) || (!IncludeItemTypes && !AlbumArtistIds)) {
        albums = await (await fetch(`${global.config.music}/getall/albums?start=${StartIndex || '0'}&limit=${Limit || '50'}&sortby=created_date&reverse=1`)).json();

        output = await Promise.all(await albums.items.map(async(album) => {
            const data = {
                "Name": album.title,
                "ServerId": "server",
                "Id": album.albumhash,
                "PremiereDate": "2010-02-03T00:00:00.0000000Z", // change
                "ChannelId": null,
                "RunTimeTicks": 0,
                "ProductionYear": album.date,
                "IsFolder": true,
                "Type": "MusicAlbum",
                "Artists": album.albumartists.map(artist => artist.name),
                "ArtistItems": album.albumartists.map(artist => ({
                    "Id": artist.artisthash,
                    "Name": artist.name
                })),
                "AlbumArtist": album.albumartists[0].name,
                "AlbumArtists": album.albumartists.map(artist => ({
                    "Id": artist.artisthash,
                    "Name": artist.name
                })),
                "ImageTags": {
                    "Primary" : album.albumhash
                },
                "UserData": {
                    "IsFavorite": false, // change
                    "LastPlayedDate": "2019-08-24T14:15:22Z", // change
                    "Likes": false,
                    "PlaybackPositionTicks": 0,
                    "PlayCount": 0,
                    "Played": false,
                    "PlayedPercentage": 0,
                    "Rating": 0,
                    "UnplayedItemCount": 0
                },
                "BackdropImageTags": [],
                "LocationType": "FileSystem"
            }

            const favorite = await (await fetch(`${global.config.music}/favorites/check?hash=${album.albumhash}&type=album`)).json();
            if (favorite.is_favorite) data.UserData.IsFavorite = true;

            return data;
        }));
    } else if (IncludeItemTypes === "MusicAlbum" && AlbumArtistIds) {
        albums = await (await fetch(`${global.config.music}/artist/${AlbumArtistIds}/albums?limit=7&all=false`)).json();
        albums.total = albums.appearances.length;

        output = albums.appearances.map(album => ({
            "Name": album.title,
            "ServerId": "server",
            "Id": album.albumhash,
            "PremiereDate": "2010-02-03T00:00:00.0000000Z",
            "ChannelId": null,
            "RunTimeTicks": 0,
            "ProductionYear": album.date,
            "IsFolder": true,
            "Type": "MusicAlbum",
            "UserData": {
                "PlaybackPositionTicks": 0,
                "PlayCount": 0,
                "IsFavorite": false,
                "Played": false,
            },
            "Artists": album.albumartists.map(artist => artist.name),
            "ArtistItems": album.albumartists.map(artist => ({
                "Id": artist.artisthash,
                "Name": artist.name
            })),
            "AlbumArtist": album.albumartists[0].name,
            "AlbumArtists": album.albumartists.map(artist => ({
                "Id": artist.artisthash,
                "Name": artist.name
            })),
            "ImageTags": {
                "Primary": album.albumhash
            },
            "BackdropImageTags": [],
            "LocationType": "FileSystem"
        }));
    } else if (IncludeItemTypes === "Audio" && ParentId) {
        albums = await (await fetch(`${global.config.music}/album`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ albumhash: ParentId })
        })).json();

        albums.total = albums.tracks.length;

        output = albums.tracks.map(track => ({
            "Album": track.album,
            "AlbumArtist": track.albumartists[0].name,
            "AlbumArtists": albums.info.albumartists.map(artist => ({
                "Id": artist.artisthash,
                "Name": artist.name
            })),
            "AlbumId": track.albumhash,
            "AlbumPrimaryImageTag": track.trackhash,
            "ArtistItems": track.artists.map(artist => ({
                "Id": artist.artisthash,
                "Name": artist.name
            })),
            "Artists": track.artists.map(artist => artist.name),
            "BackdropImageTags": [],
            "ChannelId": null,
            "ChildCount": 0,
            "Etag": track.trackhash,
            "Genres": [
                "Unknown"
            ],
            "Id": track.trackhash,
            "ImageTags": {
                "Primary": track.albumhash
            },
            "IndexNumber": track.track,
            "IndexNumberEnd": albums.total,
            "IsFolder": false,
            "LocationType": "FileSystem",
            "MediaType": "Audio",
            "Name": track.title,
            "ParentIndexNumber": 1,
            "ParentPrimaryImageItemId": track.albumhash,
            "PremiereDate": "2010-02-03T00:00:00.0000000Z", // change
            "ProductionYear": albums.info.date,
            "ProviderIds": {},
            "RunTimeTicks": Math.round(track.duration * 9962075.847328244),
            "ServerId": "server",
            "SongCount": albums.total,
            "Tags": [
                "Unknown"
            ],
            "Type": "Audio",
            "UserData": {
                "IsFavorite": track.is_favorite,
                "LastPlayedDate": "2019-08-24T14:15:22Z", // change
                "Likes": false,
                "PlaybackPositionTicks": 0,
                "PlayCount": 0,
                "Played": false,
                "PlayedPercentage": 0,
                "Rating": 0,
                "UnplayedItemCount": 0
            }
        }));
    } else if (IncludeItemTypes === "Playlist") {
        albums = await (await fetch(`${global.config.music}/playlists`)).json();
        albums.total = albums.data.length;

        output = albums.data.map(playlist => ({
            "Name": playlist.name,
            "ServerId": "server",
            "Id": String(playlist.id),
            "CanDelete": true,
            "SortName": playlist.name,
            "ChannelId": null,
            "RunTimeTicks": Math.round(playlist.duration * 9962075.847328244),
            "IsFolder": true,
            "Type": "Playlist",
            "UserData": {
                "PlaybackPositionTicks": 0,
                "PlayCount": 0,
                "IsFavorite": false,
                "Played": false
            },
            "ChildCount": playlist.count,
            "SongCount": playlist.count,
            "PrimaryImageAspectRatio": 1,
            "ImageTags": {
                "Primary": playlist.image
            },
            "BackdropImageTags": [],
            "LocationType": "FileSystem",
            "MediaType": "Audio"
        }));
    } 
    // else if (IncludeItemTypes === "AllTracks") {
    //     const albumSize = await (await fetch(`${global.config.music}/getall/albums?start=0&limit=1&sortby=created_date&reverse=1`)).json();
    //     albums = await (await fetch(`${global.config.music}/getall/albums?start=0&limit=${albumSize.total}&sortby=created_date&reverse=1`)).json();

    //     for (let index = 0; index < albums.items.length; index++) {
    //         const album = albums.items[index];

    //         const tracks = await (await fetch(`${global.config.music}/album`, {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json"
    //             },
    //             body: JSON.stringify({ albumhash: album.albumhash })
    //         })).json();

    //         console.log(tracks)

    //         output = [
    //             ...output,
    //             tracks.tracks.map(track => ({
    //                 "Album": track.album,
    //                 "AlbumArtist": track.albumartists[0].name,
    //                 "AlbumArtists": tracks.info.albumartists.map(artist => ({
    //                     "Id": artist.artisthash,
    //                     "Name": artist.name
    //                 })),
    //                 "AlbumId": track.albumhash,
    //                 "AlbumPrimaryImageTag": track.trackhash,
    //                 "ArtistItems": track.artists.map(artist => ({
    //                     "Id": artist.artisthash,
    //                     "Name": artist.name
    //                 })),
    //                 "Artists": track.artists.map(artist => artist.name),
    //                 "BackdropImageTags": [],
    //                 "ChannelId": null,
    //                 "ChildCount": 0,
    //                 "Etag": track.trackhash,
    //                 "Genres": [
    //                     "Unknown"
    //                 ],
    //                 "Id": track.trackhash,
    //                 "ImageTags": {
    //                     "Primary": track.albumhash
    //                 },
    //                 "IndexNumber": track.track,
    //                 "IndexNumberEnd": tracks.total,
    //                 "IsFolder": false,
    //                 "LocationType": "FileSystem",
    //                 "MediaType": "Audio",
    //                 "Name": track.title,
    //                 "ParentIndexNumber": 1,
    //                 "ParentPrimaryImageItemId": track.albumhash,
    //                 "PremiereDate": "2010-02-03T00:00:00.0000000Z", // change
    //                 "ProductionYear": tracks.info.date,
    //                 "ProviderIds": {},
    //                 "RunTimeTicks": Math.round(track.duration * 9962075.847328244),
    //                 "ServerId": "server",
    //                 "SongCount": tracks.total,
    //                 "Tags": [
    //                     "Unknown"
    //                 ],
    //                 "Type": "Audio",
    //                 "UserData": {
    //                     "IsFavorite": track.is_favorite,
    //                     "LastPlayedDate": "2019-08-24T14:15:22Z", // change
    //                     "Likes": false,
    //                     "PlaybackPositionTicks": 0,
    //                     "PlayCount": 0,
    //                     "Played": false,
    //                     "PlayedPercentage": 0,
    //                     "Rating": 0,
    //                     "UnplayedItemCount": 0
    //                 }
    //             }))
    //         ]
    //     }
    // }

    if (Ids) {
        const id = Ids.split(",")[0];

        const albumSize = await (await fetch(`${global.config.music}/getall/albums?start=0&limit=1&sortby=created_date&reverse=1`)).json();
        albums = await (await fetch(`${global.config.music}/getall/albums?start=0&limit=${albumSize.total}&sortby=created_date&reverse=1`)).json();

        for (let index = 0; index < albums.items.length; index++) {
            const album = albums.items[index];

            const tracks = await (await fetch(`${global.config.music}/album`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ albumhash: album.albumhash })
            })).json();

            if (tracks.tracks.find(track => track.trackhash === id)) {
                albums.total = tracks.total;
                output = tracks.tracks.map(track => ({
                    "Album": track.album,
                    "AlbumArtist": track.albumartists[0].name,
                    "AlbumArtists": tracks.info.albumartists.map(artist => ({
                        "Id": artist.artisthash,
                        "Name": artist.name
                    })),
                    "AlbumId": track.albumhash,
                    "AlbumPrimaryImageTag": track.trackhash,
                    "ArtistItems": track.artists.map(artist => ({
                        "Id": artist.artisthash,
                        "Name": artist.name
                    })),
                    "Artists": track.artists.map(artist => artist.name),
                    "BackdropImageTags": [],
                    "ChannelId": null,
                    "ChildCount": 0,
                    "Etag": track.trackhash,
                    "Genres": [
                        "Unknown"
                    ],
                    "Id": track.trackhash,
                    "ImageTags": {
                        "Primary": track.albumhash
                    },
                    "IndexNumber": track.track,
                    "IndexNumberEnd": tracks.total,
                    "IsFolder": false,
                    "LocationType": "FileSystem",
                    "MediaType": "Audio",
                    "Name": track.title,
                    "ParentIndexNumber": 1,
                    "ParentPrimaryImageItemId": track.albumhash,
                    "PremiereDate": "2010-02-03T00:00:00.0000000Z", // change
                    "ProductionYear": tracks.info.date,
                    "ProviderIds": {},
                    "RunTimeTicks": Math.round(track.duration * 9962075.847328244),
                    "ServerId": "server",
                    "SongCount": tracks.total,
                    "Tags": [
                        "Unknown"
                    ],
                    "Type": "Audio",
                    "UserData": {
                        "IsFavorite": track.is_favorite,
                        "LastPlayedDate": "2019-08-24T14:15:22Z", // change
                        "Likes": false,
                        "PlaybackPositionTicks": 0,
                        "PlayCount": 0,
                        "Played": false,
                        "PlayedPercentage": 0,
                        "Rating": 0,
                        "UnplayedItemCount": 0
                    }
                }));
                break;
            }
        }
    }

    res.json({
        "Items": output,
        "TotalRecordCount": albums.total || 0,
        "StartIndex": Number(StartIndex) || 0
    });
});

router.get("/:user/items/:id", async(req, res) => {
    const id = req.params.id;

    const albums = await (await fetch(`${global.config.music}/album`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ albumhash: id })
    })).json();

    albums.total = albums.tracks.length;

    const output = albums.tracks.map(track => ({
        "Album": track.album,
        "AlbumArtist": track.albumartists[0].name,
        "AlbumArtists": albums.info.albumartists.map(artist => ({
            "Id": artist.artisthash,
            "Name": artist.name
        })),
        "AlbumId": track.albumhash,
        "AlbumPrimaryImageTag": track.trackhash,
        "ArtistItems": track.artists.map(artist => ({
            "Id": artist.artisthash,
            "Name": artist.name
        })),
        "Artists": track.artists.map(artist => artist.name),
        "BackdropImageTags": [],
        "ChannelId": null,
        "ChildCount": 0,
        "Etag": track.trackhash,
        "Genres": [
            "Unknown"
        ],
        "Id": track.trackhash,
        "ImageTags": {
            "Primary": track.albumhash
        },
        "IndexNumber": track.track,
        "IndexNumberEnd": albums.total,
        "IsFolder": false,
        "LocationType": "FileSystem",
        "MediaType": "Audio",
        "Name": track.title,
        "ParentIndexNumber": 1,
        "ParentPrimaryImageItemId": track.albumhash,
        "PremiereDate": "2010-02-03T00:00:00.0000000Z", // change
        "ProductionYear": albums.info.date,
        "ProviderIds": {},
        "RunTimeTicks": Math.round(track.duration * 9962075.847328244),
        "ServerId": "server",
        "SongCount": albums.total,
        "Tags": [
            "Unknown"
        ],
        "Type": "Audio",
        "UserData": {
            "IsFavorite": track.is_favorite,
            "LastPlayedDate": "2019-08-24T14:15:22Z", // change
            "Likes": false,
            "PlaybackPositionTicks": 0,
            "PlayCount": 0,
            "Played": false,
            "PlayedPercentage": 0,
            "Rating": 0,
            "UnplayedItemCount": 0
        }
    }));

    res.json({
        "Items": output,
        "TotalRecordCount": albums.total,
        "StartIndex": 0,
        "Name": albums.info.title,
        "ServerId": "server",
        "Id": albums.info.albumhash,
        "Etag": albums.info.albumhash,
        "DateCreated": "2024-03-04T00:39:33.730766Z",
        "CanDelete": true,
        "CanDownload": false,
        "SortName": albums.info.title,
        "PremiereDate": "2010-02-03T00:00:00.0000000Z",
        "ExternalUrls": [],
        "Path": "undefined",
        "EnableMediaSourceDisplay": true,
        "ChannelId": null,
        "Taglines": [],
        "Genres": albums.info.genres,
        "CumulativeRunTimeTicks": Math.round(albums.info.duration * 9962075.847328244),
        "RunTimeTicks": Math.round(albums.info.duration * 9962075.847328244),
        "PlayAccess": "Full",
        "ProductionYear": albums.info.date,
        "RemoteTrailers": [],
        "ProviderIds": {},
        "IsFolder": true,
        "ParentId": albums.info.albumhash,
        "Type": "MusicAlbum",
        "People": [],
        "Studios": [],
        "GenreItems": [],
        "LocalTrailerCount": 0,
        "UserData": {
            "PlaybackPositionTicks": 0,
            "PlayCount": 0,
            "IsFavorite": albums.info.is_favorite,
            "Played": false
        },
        "RecursiveItemCount": albums.info.count,
        "ChildCount": albums.info.count,
        "SpecialFeatureCount": 0,
        "DisplayPreferencesId": albums.info.albumhash,
        "Tags": [],
        "PrimaryImageAspectRatio": 1,
        "Artists": albums.info.albumartists.map(artist => artist.name),
        "ArtistItems": albums.info.albumartists.map(artist => ({
            "Name": artist.name,
            "Id": artist.artisthash
        })),
        "AlbumArtist": albums.info.albumartists[0].name,
        "AlbumArtists": albums.info.albumartists.map(artist => ({
            "Name": artist.name,
            "Id": artist.artisthash
        })),
        "ImageTags": {
            "Primary": albums.info.albumhash
        },
        "BackdropImageTags": [],
        "LocationType": "FileSystem",
        "LockedFields": [],
        "LockData": false
    });
});

router.route("/:user/favoriteitems/:id")
    .post(async(req, res) => {
        const id = req.params.id;

        const artist = await fetch(`${global.config.music}/artist/${id}/albums?limit=1&all=false`);
        const album = await fetch(`${global.config.music}/album`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ albumhash: id })
        });

        const type = artist.ok ? "artist" : album.ok ? "album" : "track";
        if (type) await fetch(`${global.config.music}/favorite/add`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "type": type,
                "hash": id
            })
        });

        res.json({
            "Rating": 0,
            "PlayedPercentage": 0,
            "UnplayedItemCount": 0,
            "PlaybackPositionTicks": 0,
            "PlayCount": 0,
            "IsFavorite": true,
            "Likes": true,
            "LastPlayedDate": "2019-08-24T14:15:22Z",
            "Played": true,
            "Key": "string",
            "ItemId": "string"
        });
    })
    .delete(async(req, res) => {
        const id = req.params.id;

        const artist = await fetch(`${global.config.music}/artist/${id}/albums?limit=1&all=false`);
        const album = await fetch(`${global.config.music}/album`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ albumhash: id })
        });

        const type = artist.ok ? "artist" : album.ok ? "album" : "track";
        if (type) await fetch(`${global.config.music}/favorite/remove`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                "type": type,
                "hash": id
            })
        });

        res.json({
            "Rating": 0,
            "PlayedPercentage": 0,
            "UnplayedItemCount": 0,
            "PlaybackPositionTicks": 0,
            "PlayCount": 0,
            "IsFavorite": false,
            "Likes": true,
            "LastPlayedDate": "2019-08-24T14:15:22Z",
            "Played": true,
            "Key": "string",
            "ItemId": "string"
        });
    });

router.get("/:id", (req, res) => res.json({
    "Name": "test",
    "ServerId": "866914aa47d242e68384ca8a02f9500c",
    "Id": "0f8b61481cce4b1ba545f8006eb104c1",
    "HasPassword": true,
    "HasConfiguredPassword": true,
    "HasConfiguredEasyPassword": false,
    "EnableAutoLogin": false,
    "LastLoginDate": "2024-03-04T15:13:40.4664661Z",
    "LastActivityDate": "2024-03-04T15:22:11.1448807Z",
    "Configuration": {
        "PlayDefaultAudioTrack": true,
        "SubtitleLanguagePreference": "",
        "DisplayMissingEpisodes": false,
        "GroupedFolders": [],
        "SubtitleMode": "Default",
        "DisplayCollectionsView": false,
        "EnableLocalPassword": false,
        "OrderedViews": [],
        "LatestItemsExcludes": [],
        "MyMediaExcludes": [],
        "HidePlayedInLatest": true,
        "RememberAudioSelections": true,
        "RememberSubtitleSelections": true,
        "EnableNextEpisodeAutoPlay": true
    },
    "Policy": {
        "IsAdministrator": true,
        "IsHidden": true,
        "IsDisabled": false,
        "BlockedTags": [],
        "EnableUserPreferenceAccess": true,
        "AccessSchedules": [],
        "BlockUnratedItems": [],
        "EnableRemoteControlOfOtherUsers": true,
        "EnableSharedDeviceControl": true,
        "EnableRemoteAccess": true,
        "EnableLiveTvManagement": true,
        "EnableLiveTvAccess": true,
        "EnableMediaPlayback": true,
        "EnableAudioPlaybackTranscoding": true,
        "EnableVideoPlaybackTranscoding": true,
        "EnablePlaybackRemuxing": true,
        "ForceRemoteSourceTranscoding": false,
        "EnableContentDeletion": true,
        "EnableContentDeletionFromFolders": [],
        "EnableContentDownloading": true,
        "EnableSyncTranscoding": true,
        "EnableMediaConversion": true,
        "EnabledDevices": [],
        "EnableAllDevices": true,
        "EnabledChannels": [],
        "EnableAllChannels": true,
        "EnabledFolders": [],
        "EnableAllFolders": true,
        "InvalidLoginAttemptCount": 0,
        "LoginAttemptsBeforeLockout": -1,
        "MaxActiveSessions": 0,
        "EnablePublicSharing": true,
        "BlockedMediaFolders": [],
        "BlockedChannels": [],
        "RemoteClientBitrateLimit": 0,
        "AuthenticationProviderId": "Jellyfin.Server.Implementations.Users.DefaultAuthenticationProvider",
        "PasswordResetProviderId": "Jellyfin.Server.Implementations.Users.DefaultPasswordResetProvider",
        "SyncPlayAccess": "CreateAndJoinGroups"
    }
}));

module.exports = {
    router: router,
    name: "users"
}