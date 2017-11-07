let accessToken;
const clientId = '5b0ec3aed67846eaaf3f5b4a99aee95a';
const redirectURI = 'http://localhost:3000/';

const Spotify = {

  getAccessToken() {
    if (accessToken) {
      return accessToken;
    } else {

    const accessTokenMatch =  window.location.href.match(/access_token=([^&]*)/);
    const expiresInMatch = window.location.href.match(/expires_in=([^&]*)/)

    if (accessTokenMatch && expiresInMatch) {
      accessToken = accessTokenMatch[1];
      const expiresIn = Number(expiresInMatch[1]);
      window.setTimeout(() => accessToken = '', expiresIn * 1000);
      window.history.pushState('Access Token', null, '/');
      return accessToken;
    } else {
      const redirectUrl = 'https://accounts.spotify.com/authorize?client_id=' + clientId +
      '&response_type=token&scope=playlist-modify-public&redirect_uri=' +
       redirectURI;
       window.location = redirectUrl;
      }
    }
  },

    search(term) {
      const accessToken = Spotify.getAccessToken();
      return fetch('https://api.spotify.com/v1/search?type=track&q=' + term,
    {headers: {Authorization: `Bearer ${accessToken}`}}).then(response => {
     return response.json();
   }).then(jsonResponse => {
     if (!jsonResponse.tracks) {
       return [];
     } else {
       return jsonResponse.tracks.items.map(track => {
         return {
           ID: track.id,
           Name: track.name,
           Artist: track.artists[0].name,
           Album: track.album.name,
           URI: track.uri

         }
       })
     }
   })

 },

 savePlaylist(name, trackURIs) {
   if (name && trackURIs) {
     const accessToken = Spotify.getAccessToken();
     const headers = {Authorization: `Bearer ${accessToken}`};
     let userId;

     return fetch('https://api.spotify.com/v1/me', {headers: headers}).then(
       response => {return response.json();
       }).then(jsonResponse => {
         userId = jsonResponse.id;
        return fetch('https://api.spotify.com/v1/users/' + userId + 'playlists',
      {headers: headers, method: 'POST', body: JSON.stringify(name: name)})
    }).then(response => {
      return response.json();
    }).then (jsonResponse => {
      const playlistID = jsonResponse.id;
      return fetch('https://api.spotify.com/v1/users' + userId + '/playlists/'
    + playlistID + '/tracks', {headers: headers, method: 'POST', body: JSON.stringify({uris: trackURIs})
  })
    })

   } else {
     return;
   }
 }


};


export default Spotify;
