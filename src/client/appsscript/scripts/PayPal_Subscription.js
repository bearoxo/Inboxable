function testx(){
  Logger.log(UserProperties.getProperty("yoyo"))
  
  // var access_token
  // var user_email

  // var TokenProperties = checkToken()
  // var access_token = TokenProperties.access_token
  // const plan_id = "P-09E19660L3543673CMETTSSA";
  // var user_email = Session.getActiveUser().getEmail();
  // Logger.log(createSubscription(access_token, plan_id, user_email))

  // var subscription_id = SubscriptionProperties.subscription_id
  // Logger.log(checkSubscription(access_token, subscription_id))
}

function createSubscription(access_token, plan_id, start_time, user_email, request_id, return_url, cancel_url){
  
  var restEndpoint = "https://api-m.sandbox.paypal.com/v1/billing/subscriptions/"

  // PayPal server stores request_id key for 72 hours.
  var head = {}
    head["Authorization"] = "Bearer " + access_token
    head["Content-Type"] = "application/json"
    head["PayPal-Request-Id"] = request_id

  var postPayload = {}
    if (user_email){
      postPayload.subscriber = subscriber = {}
        subscriber.email_address = user_email
    }
    if (return_url){
      postPayload.return_url = return_url
    }
    if (cancel_url){
      postPayload.cancel_url = cancel_url
    }
    if (start_time){
      postPayload.start_time = start_time
    }
    postPayload.plan_id = plan_id
    postPayload.application_context = application_context = {}
      application_context.brand_name = "Inboxable"
      application_context.locale = "en-US"
      application_context.user_action = "SUBSCRIBE_NOW"
      application_context.shipping_preference = "NO_SHIPPING"
      application_context.payment_method = payment_method = {}
        payment_method.payer_selected = "PAYPAL"
        payment_method.payee_preferred = "IMMEDIATE_PAYMENT_REQUIRED"

  var params = {}
    params.headers =  head
    params.payload = JSON.stringify(postPayload)

  var response = UrlFetchApp.fetch(restEndpoint, params); 
  var result = response.getContentText();
  var resultObject = JSON.parse(result);
  Logger.log(resultObject);

  var subscription_status = resultObject.status
  var subscription_id = resultObject.id
  var links = resultObject.links

  // Get tokenized URL for redirecting user to subscription
  for (var i = 0; i < resultObject.links.length; i++) {
    if (links[i].method == "GET" && links[i].rel == "approve"){
      var subscription_url = links[i].href;
    }
  }
  var url_date = new Date()

  var queryParam = "ba_token"
  var ba_token = getParameterByName(queryParam, subscription_url)

  var returnObj = {
    "request_id": request_id,
    "subscription_status": subscription_status,
    "subscription_id": subscription_id,
    "subscription_url": subscription_url,
    "url_date": url_date,
    "ba_token": ba_token,
  }

  UserProperties.setProperties(returnObj)
  return returnObj
}

  // check for subscription_url, request_id, url_date
  // if (!SubscriptionProperties), createSubscription()
  // else if (SubscriptionProperties)
    // url_date isExpired?
    // checkProductKey() <- use subscription_id to check product_key
    // checkStatus() <- use subscription_id to check status with paypal
    // if (status = "active" && product_key)
      // 
    // if status = "suspended || "cancelled"? 

  // if url_date > 2.5 hours of now, createSubscription()

function tesxt (){

  Logger.log(SubscriptionProperties.request_id)

  // let TokenProperties = checkToken()
  // var access_token = TokenProperties.access_token
  
  // checkSubscription(access_token, subscription_id, request_id)

  // let SubscriptionProperties = getSubscription()
  // var subscription_id = SubscriptionProperties.subscription_id
  // var request_id = SubscriptionProperties.request_id
  
  // getSubscription(access_token, subscription_id)

  // captureSubscription(access_token, subscription_id, request_id)

}
function checkSubscription(SubscriptionProperties){
  
  var subscription_id = SubscriptionProperties.subscription_id
  var request_id = SubscriptionProperties.request_id
  var hrs = 2
  var hrs_in_msec = hrs * 60 * 60 * 1000
  var url_date = new Date(SubscriptionProperties.url_date);

  // if (!subscription_id && !request_id){
  //   createSubscription(access_token, plan_id, user_email, return_url, cancel_url)
  // } else if (){

  // } else if (isExpired(hrs_in_msec, url_date)


  // if ()){


  //   var sP = SubscriptionProperties

  //   if (!sP.subscription_id && !sP.request_id){
  //     createSubscription(access_token, plan_id, user_email, return_url, cancel_url)
  //   } else {

  //   }



}

function getSubscription(access_token, subscription_id){

  var restEndpoint = "https://api-m.sandbox.paypal.com/v1/billing/subscriptions/"
    + subscription_id

  var head = {}
    head["Authorization"] = "Bearer "+ access_token,
    head["Content-Type"] = "application/json"

  var params = {}
    params.headers = head

  var response = UrlFetchApp.fetch(restEndpoint, params); 
  var result = response.getContentText();
  var resultObject = JSON.parse(result);
  Logger.log(resultObject);

  var subscription_status = resultObject.status
  var create_time 
  var subscriber_email = resultObject.subscriber.email_address
  var subscriber_given_name = resultObject.subscriber.name.given_name
  var subscriber_surname = resultObject.subscriber.name.surname
  var outstanding_bal_currency = resultObject.billing_info.outstanding_balance.currency_code
  var outstanding_bal_value = resultObject.billing_info.outstanding_balance.value

  var cycle_executions = resultObject.billing_info.cycle_executions
  for (var i = 0; i < cycle_executions.length; i++) {
    if (cycle_executions[i].tenure_type == "REGULAR"){
      var cycles_completed = cycle_executions[i].cycles_completed;
    }
  }

  var returnObj = {
    "subscription_status": subscription_status,
    "create_time": create_time,
    "subscriber_email": subscriber_email,
    "subscriber_given_name": subscriber_given_name,
    "subscriber_surname": subscriber_surname,
    "outstanding_bal_currency": outstanding_bal_currency,
    "outstanding_bal_value": outstanding_bal_value,
    "cycles_completed": cycles_completed
  }

  UserProperties.setProperties(returnObj)
  return returnObj
}

function flushSubscriptionUrl(){
  
  // Flush URL after 2.5 hours
  var hrs = 2.5
  var hrs_in_msec = hrs * 60 * 60 * 1000
  var url_date = new Date(SubscriptionProperties.url_date);

  if (isExpired(hrs_in_msec, url_date)){
    var del = key => UserProperties.deleteProperty(key);
    del("request_id")
    del("subscription_url")
    del("ba_token")
    del("url_date")
  }
}


function captureSubscription(access_token, subscription_id, request_id){
  
  var tP = TokenProperties.getProperties()
  var access_token = tP.access_token
  var subscription_id = "I-TH484TY8H58X"

  var restEndpoint = "https://api-m.sandbox.paypal.com/v1/billing/subscriptions/"
    + subscription_id 
    + "/capture"

  var head = {}
    head["Authorization"] = "Bearer "+ access_token,
    head["Content-Type"] = "application/json"

  var params = {}
    params.headers = head

  var response = UrlFetchApp.fetch(restEndpoint, params); 
  var result = response.getContentText();
  var resultObject = JSON.parse(result);
  Logger.log(resultObject);
}

function clearSubscription(){
  var del = key => UserProperties.deleteProperty(key);
  for (let i in SubscriptionProperties){
    del(i)
  }
};

function subscribeButton() {

  checkSubscription(SubscriptionProperties)
  var SubscriptionProperties = getSubscription(access_token, subscription_id)
  
  var request_id = ()=> {
    var request_id = SubscriptionProperties.request_id
    if (!request_id){
      request_id = Utilities.getUuid()
      UserProperties.setProperty("request_id", request_id)
    }
  }

  createSubscription(access_token, plan_id, user_email, request_id, return_url, cancel_url)

}

  // Trigger after 2.5 hours.
  // ScriptApp.newTrigger('wipeSubscriptionReq')
  //   .timeBased()
  //   .after(2.5 * 60 * 60 * 1000)
  //   .create();  




