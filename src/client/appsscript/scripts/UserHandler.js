// 1. Resolve user_id
// 2. check user status
// User's product validation


function clearUserProperties () {
  UserProperties.deleteAllProperties()
}


function getUserProperties () {
  let userProperties = UserProperties.getProperties()
  Logger.log(userProperties.user_id)
}

function testStep () {
  const connection = db_connect()
  const user_email = Session.getActiveUser().getEmail()
  db_insert_user_email(connection, user_email)
  connection.close()
}

function userId_handler (userProperties) {
  const connection = db_connect()
  const user_email = Session.getActiveUser().getEmail()
  let user_id
  try {
    // Check for user_id in UserProperties 
    // If does exist, return the value
    if (userProperties.user_id){
      user_id = userProperties.user_id
    } else {
      // If doesn't exist, check in db
      // If does exist in db, return the value
      try {
        user_id = db_get_user_id(connection, user_email)
      }
      // If doesn't exist in db, insert user_email to db and return the new user_id
      catch {
        db_insert_user_email(connection, user_email)
        user_id = db_get_user_id(connection, user_email)
      }  
      // Set the value of user_id obtained from db to UserProperties
      UserProperties.setProperty("user_id", user_id)
    }
    if (!user_id){
      throw `Error: No valid User ID assigned for ${user_email}.`
    } else {
      Logger.log(`User ID: ${user_id}`);
      return user_id
    }
  }
  catch (err) {
    throw err
  }
  finally {
    connection.close()
  }
}

function userHandler(subscription_status) {

  // Check if product_key exist in UserProperties
  // check if product_key exist in db using user_id
  // check if subscription_id exist in UserProperties
  // check if subscription_id exist in db using user_id
  // if !product_key || !subscription_id
  // set product_mode = "Free"
  
  // if subscription_id exist,
  // check subscription_status using PayPal REST API
  // if subsciption_status != active
  // set product_mode = "Free"

  // if subsciption_status == active
  // else if product_key exist and subsciption_status == active
  // set product_mode = "Pro"

}

function check_property(key){
  if (UserProperties.getProperty(key) && ScriptProperties.getProperty(key)){
    throw "Error: Property key exist in both UserProperties & ScriptProperties"
  } else if (UserProperties.getProperty(key)){
    property = UserProperties.getProperty(key)
  } else if (ScriptProperties.getProperty(key)){
    property = ScriptProperties.getProperty(key)
  } else {
    property = false
  }

  var db_property = db_get(key)
  if ((db_property && !property) || ((db_property != property))){
    property = db_property
  }
  
  var pp_property = pp_get(key)


}

function check_subscription_id(){
  let db_subscription_id = db_get_user_id();
  if (!SubscriptionProperties.subscription_id && !db_get_subscription_id){
    false
  } else if (db_get_subscription_id) {
    subscription_id = db_get_subscription_id
  }

  // Check if subscription_id exist in SubscriptionProperties
  // check if subscription_id exist in db using user_id
  // return subscription_id or false
}

function check_subscription_status(){
  // check_subscription_id()
  // check_product_key()
  // check subscription_status in UserProperties
  // check subscription_status in db using user_id
  // check subscription_status using PayPal REST API
  // if subscription_status == active
    // if !check_product_key()
    // add_product_key()
  // return subscription_status
}

function check_product_key(){
  // check_subscription_id()
  // check_subscription_status()
  let subscription_status = check_subscription_status();
  let product_key_state = UserConfig.product_key_state;
  let db_product_key = db_get_product_key();
  if (UserConfig.product_key && db_product_key){
    product_key_state = true;
  } else {

  }
  
  if (product_key_state && subscription_status == "ACTIVE"){
    let product_key = UserConfig.product_key;
    return product_key;
  } else {
    return false;
  }
  // check if product_key exist in db using user_id
  // Check_subscription_status()
  // return product_key or false
}

function add_product_key(){
  let flag = UserConfig.product_key_flag;
  if (!flag){
    let product_key = generateRandomKey(16, 4);
    UserProperties.setProperty("product_key", product_key)
    UserProperties.setProperty("product_key_flag", true)
    flag = true
    return product_key;
  } else {
    throw "Error: Product key has previously been generated before."
  }
}


function user_product_key () {
  
    // paypal webhook
    // Get postData from webhook
    // if user has made payment and subscription_status = active
    // change user status

  // if paid customer,
    // set user subscription_plan = "Pro"

  // if not, what?
    // set user subscription_plan = "Free"
}


function watafak (){
  let x = true
  if(x){
    Logger.log(x)
  }
}










