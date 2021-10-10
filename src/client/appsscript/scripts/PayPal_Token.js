

// var TokenProperties = {
//   access_token: "access_token",
//   token_date: "token_date",
//   expires_in: "expires_in",
//   token_expiryDate: "token_expiryDate"
// }
// var TokenProperties = ScriptProperties.getProperties()

function getAccessToken(clientID, clientSecret) {

  var accessTokenEndpoint = "https://api.sandbox.paypal.com/v1/oauth2/token";
  var head = {
    "Authorization": "Basic "+ Utilities.base64Encode(clientID + ":" + clientSecret),
    'Accept': 'application/json'
  }
  var postPayload = {
    "grant_type": "client_credentials"
  } 
  var params = {
    headers: head,
    payload: postPayload
  }

  var response = UrlFetchApp.fetch(accessTokenEndpoint, params); 
  var result = response.getContentText();
  var resultObject = JSON.parse(result);

  var access_token = resultObject.access_token;
  var token_date = new Date();
  var expires_in = resultObject.expires_in;

  var token_msec = token_date.getTime(); // No. of mseconds since January 1, 1970 UTC
  var bufferPeriod = 900; // 15 minutes buffer time before actual expiry
  var expires_in_msec = (expires_in - bufferPeriod) * 1000; // convert to milliseconds
  var token_expiryDate = new Date(token_msec + expires_in_msec);
  
  var returnObj = {
    "access_token": access_token,
    "token_date": token_date,
    "expires_in": parseInt(expires_in),
    "token_expiryDate": token_expiryDate
  }

  ScriptProperties.setProperties(returnObj);
  return returnObj
}

function checkToken(){

  var tP = TokenProperties.getProperties()
  var token_expiryDate = new Date(tP.token_expiryDate);

  if ((!tP.access_token &&
    !tP.token_date &&
    !tP.token_expiryDate) ||
    (isExpired(token_expiryDate) == true)){
      Logger.log("New access token has been created.")
      return getAccessToken(PayPal._clientID, PayPal._clientID);
  } else {
    Logger.log("Token has not expired.")
    return tP;
  }
}

function clearToken(){
  var tP = TokenProperties.getProperties()
  var del = key => ScriptProperties.deleteProperty(key);
  for (let i in tP){
    del(i)
  }
}


