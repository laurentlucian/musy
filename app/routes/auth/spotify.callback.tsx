import type { LoaderFunction } from '@remix-run/node';
import { authenticator } from '~/services/auth.server';

export const loader: LoaderFunction = ({ request }) => {
  return authenticator.authenticate('spotify', request, {
    successRedirect: '/',
    failureRedirect: '/',
  });
};

// app.get('/callback', function(req, res) {

//   var code = req.query.code || null;
//   var state = req.query.state || null;

//   if (state === null) {
//     res.redirect('/#' +
//       querystring.stringify({
//         error: 'state_mismatch'
//       }));
//   } else {
//     var authOptions = {
//       url: 'https://accounts.spotify.com/api/token',
//       form: {
//         code: code,
//         redirect_uri: redirect_uri,
//         grant_type: 'authorization_code'
//       },
//       headers: {
//         'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
//       },
//       json: true
//     };
//   }
// });