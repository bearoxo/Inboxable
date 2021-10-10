let TokenProperties = {}
  TokenProperties.getProperties = () => {
    const sP_get = ScriptProperties.getProperties()
    const returnObj = {
      access_token: sP_get.access_token,
      token_date: sP_get.token_date,
      expires_in: sP_get.expires_in,
      token_expiryDate: sP_get.token_expiryDate
    }
    return returnObj
  }
  TokenProperties.setProperty = () => {
    const sP_set = (key, value) => ScriptProperties.setProperty(key, value)
    const returnObj = {
      access_token: (value) => sP_set("access_token", value),
      token_date: (value) => sP_set("token_date", value),
      expires_in: (value) => sP_set("expires_in", value),
      token_expiryDate: (value) => sP_set("token_expiryDate", value)
    }
    return returnObj
  }
  TokenProperties.setProperties = (obj) => {
    ScriptProperties.setProperties(obj);
  }

let SubscriptionProperties = {}
  SubscriptionProperties.getProperties = () => {
    const uP_get = UserProperties.getProperties()
    const returnObj = {
      request_id: uP_get.request_id,
      subscription_status: uP_get.subscription_status,
      subscription_id: uP_get.subscription_id,
      subscription_url: uP_get.subscription_url,
      url_date: uP_get.url_date,
      ba_token: uP_get.ba_token,
      create_time: uP_get.create_time,
      subscriber_email: uP_get.subscriber_email,
      subscriber_given_name: uP_get.given_name,
      subscriber_surname: uP_get.surname,
      outstanding_bal_currency: uP_get.outstanding_bal_currency,
      outstanding_bal_value: uP_get.outstanding_bal_value,
      cycles_completed: uP_get.cycles_completed
    }
    return returnObj
  }
  SubscriptionProperties.setProperty = () => {
    const uP_set = (key, value) => UserProperties.setProperty(key, value)
    const returnObj = {
      request_id: (value) => uP_set("request_id", value),
      subscription_status: (value) => uP_set("subscription_status", value),
      subscription_id: (value) => uP_set("subscription_id", value),
      subscription_url: (value) => uP_set("subscription_url", value),
      url_date: (value) => uP_set("url_date", value),
      ba_token: (value) => uP_set("ba_token", value),
      create_time: (value) => uP_set("create_time", value),
      subscriber_email: (value) => uP_set("subscriber_email", value),
      subscriber_given_name: (value) => uP_set("given_name", value),
      subscriber_surname: (value) => uP_set("surname", value),
      outstanding_bal_currency: (value) => uP_set("outstanding_bal_currency", value),
      outstanding_bal_value: (value) => uP_set("outstanding_bal_value", value),
      cycles_completed: (value) => uP_set("cycles_completed", value)
    }
    return returnObj
  }
  SubscriptionProperties.setProperties = (obj) => {
    UserProperties.setProperties(obj);
  }

let UserData = {}
  UserData.getProperties = () => {
    const uP_get = UserProperties.getProperties()
    const returnObj = {
      user_id: uP_get.user_id,
    }
    return returnObj
  }
  UserData.setProperty = () => {
    const uP_set = (key, value) => UserProperties.setProperty(key, value)
    const returnObj = {
      user_id: (value) => uP_set("user_id", value),
    }
    return returnObj
  }
  UserData.setProperties = (obj) => {
    UserProperties.setProperties(obj);
  }