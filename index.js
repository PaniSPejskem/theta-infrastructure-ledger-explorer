var path = require('path');
var bodyParser = require('body-parser');
var express = require('express');
var webpack = require('webpack');
var config = require('./webpack.config.js');
var fs = require('fs');
var compression = require('compression')
let port = process.env.PORT || 443;


var app = express();
var compiler = webpack(config);

app.use(compression());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static('public'));


// healthy check from ELB 
app.get('/ping', function (req, res) {
  console.log('Receive healthcheck /ping from ELB - ' + req.connection.remoteAddress);
  res.writeHead(200, {
    'Content-Type': 'text/plain',
    'Content-Length': 2
  });
  res.write('OK');
  res.end();
});



app.get('*', function (req, res) {
  res.sendFile(path.resolve(__dirname, 'index.html'));
});



var privateKey = `-----BEGIN PRIVATE KEY-----
MIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCWYTRfDLZSymtP
EdKxlEsjnGQ6HSB1rs0s3u4b51S0RiH8VVgFJipZiDSBoNA6+v8UoGHeanYQ+s7j
LQsnRC/PyEWusBgZOeuSahpx9knm8otx7iQeGkEt1YeL0L+qm464FKoNULVdFCkG
Tc7xd4jX+WcUH51HGYALp2Hr21rW/EIl+6+4Bg50OTDeCSyb3f2r2N+KcgVMKUcI
nmy7RRKvioSTCi5EU8QYdb4/MZqRF6GqiM5xF0oQN8eoZLYZJLpK/quY9iuofVcl
WM5e+Muo+CePUOxQBiU2ICQC7IYKt3f9GaIgQ1q3acIBlyxZzUx2C8z8wzfmS/KJ
lwSOspuTAgMBAAECggEAHNd43XAJOfjDuw8Oi2uHO8W/fVvfwWJszJnXLjfgiZDX
7NcLgjVPMwvKEkCfH2jLao/WJXviuB/6dRzLAlV0HBRrtPTmMlRnB5ZdCxVzGB3V
u9yyRanAbYOCM0EuuZCLP2gLM3GSz07SDXj3410LPG0DpZropd3QrquEPuG72vaM
gLG9xOa7x2o7vMubYgpdYBN73SDBbmEh0/pt2OU5/LErCPxC2Ps5g0vsz5rBAEUr
0G5AKhMl7fNt//RL5/xtG7Wbxxn76DivC8XA96hycAMnWz2jkQj3F509RObaq78W
TvIbB3a6hjDcbJSSrXANy2q+4NuzP/iNtJvP3uKdhQKBgQC8jrNQbOb88uQY830y
5coZlC1dnjFLWIzcvBwohF3hQA70/OUOSkk+464FdggjF4jge/eXvD4f2WVYMbie
GC+UXaE6tMfkZShohZpJ1/jxXb92aFQerJ08/+XLWs8odFvmhgcuwyxkEvQvv8dm
UZD5Oi+NqGjoQJqlA8ayKYlntwKBgQDMKsDiE2Cir8dOnuhlavhgkKv3jH7/HUe0
pT3ZDu6MQ0DJuGVYPsHPpXCuqbRGMmxX3506aBRhlESAHaIGdlMRSvyRFj9Dml4F
O2QdbCMtSgnPdc6Vt8QGft6Q3beu2907ajZTw2BiyAg64oaZyQCYSbV7wWzkwk08
we+i3DcTBQKBgBrr0ORBuDUTRMffM9fpgRJn2pZMOMOGMA5v+SE7zN+VMs19sgJ5
Tr3g6f6znHPOL2fFq1MJuGD5vAN8jdxcnaZ0O8nS99s/KibKNH4ojM2BUg3I1YHP
qV+FNbz0CTHAc0KVjj759MORBTYwDnsoWCeNTC7QhbHrT2kSAfN8BLc/AoGARQAq
Af30iecIX+zas/PsD461X8tu3D+EDWxPM72VJ3hPPB2Cusky7T+HjrAyCgtejHA5
jhTA1p2qbPYW3UI+HrkOFObE6M8R+Yix9DOoy9Sa7i9tazIZIOzdwW39dy49Xagu
xi5gs+HQzj3iqbTB67X1jOa5K7LzMZaFq6/rORUCgYB5TZkOm6ciQufv9pGX2xk+
JebovWa5kCZtvfoeWwDtVuexfCVRDtrHK3stBBXibRQqpQkgl+ikfmG+jV7YN378
BWKvv1d20PhMV6jRowFQqtcqGiWB1GO6gkDc2/zhQJSUBrv6ZJNnV2LS6d33xdvL
kYy0aLnsh1MkjgaDOjCWAw==
-----END PRIVATE KEY-----
`;
var certificate = `-----BEGIN CERTIFICATE-----
MIIEAzCCAuugAwIBAgIUcC8sg1hxznxqsk5Nvnpom7h0SlgwDQYJKoZIhvcNAQEL
BQAwgZAxCzAJBgNVBAYTAk5IMRQwEgYDVQQIDAtOZXRoZXJsYW5kczESMBAGA1UE
BwwJQW1zdGVyZGFtMQ0wCwYDVQQKDARBc2l4MQ4wDAYDVQQLDAVUaGV0YTEPMA0G
A1UEAwwGQW1vbiBJMScwJQYJKoZIhvcNAQkBFhhhaW1lLmJsYWlzMDA4MkBnbWFp
bC5jb20wHhcNMjIwNTAxMTgyMzU0WhcNMzIwNDI4MTgyMzU0WjCBkDELMAkGA1UE
BhMCTkgxFDASBgNVBAgMC05ldGhlcmxhbmRzMRIwEAYDVQQHDAlBbXN0ZXJkYW0x
DTALBgNVBAoMBEFzaXgxDjAMBgNVBAsMBVRoZXRhMQ8wDQYDVQQDDAZBbW9uIEkx
JzAlBgkqhkiG9w0BCQEWGGFpbWUuYmxhaXMwMDgyQGdtYWlsLmNvbTCCASIwDQYJ
KoZIhvcNAQEBBQADggEPADCCAQoCggEBAJZhNF8MtlLKa08R0rGUSyOcZDodIHWu
zSze7hvnVLRGIfxVWAUmKlmINIGg0Dr6/xSgYd5qdhD6zuMtCydEL8/IRa6wGBk5
65JqGnH2Sebyi3HuJB4aQS3Vh4vQv6qbjrgUqg1QtV0UKQZNzvF3iNf5ZxQfnUcZ
gAunYevbWtb8QiX7r7gGDnQ5MN4JLJvd/avY34pyBUwpRwiebLtFEq+KhJMKLkRT
xBh1vj8xmpEXoaqIznEXShA3x6hkthkkukr+q5j2K6h9VyVYzl74y6j4J49Q7FAG
JTYgJALshgq3d/0ZoiBDWrdpwgGXLFnNTHYLzPzDN+ZL8omXBI6ym5MCAwEAAaNT
MFEwHQYDVR0OBBYEFJMt5EMGWjlLzgD7oT7+PZnhhq2rMB8GA1UdIwQYMBaAFJMt
5EMGWjlLzgD7oT7+PZnhhq2rMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQEL
BQADggEBAG2+w7uGkWMTcbtbLE0AwJMCYRgPoHcF807aA7oiY7RYLC+x0KbD3V2k
DWfzcnXoPU5bNx7hXQgHasU1qFInLq8ERt7+JeJmRpIUVWH5vX98c/xOMT+OLw0x
jVLz4Lt4ZVBOJBZLSj6hG4sSah2ndeUuEfDsKFZeDwKl5OakMof0OUFYIBZx1er6
ZWAG7z6RdszslhhiNtOOfXKJg909HbsvIXqqfC4GI0IpOT6gFzKCQhCTbfbX9880
3ddSlf64/nsOw0TuEIj7446FJT/FCMxZJNNoaTW+vm5GYtEs8Bx/x2E4VXMfaoqC
ywtrWC8oE4G53yGo3uQmzxYaekJ7idA=
-----END CERTIFICATE-----
`;

var options = {
  key: privateKey,
  cert: certificate
};
var h2 = require('spdy').createServer(options, app);


h2.listen(port, function (err) {
  if (err) {
    console.log(err);
    return;
  }
  console.log(`Listening at port: ${port}`);
});