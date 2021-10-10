let UserConfig = {}
  UserConfig.getProperty = () => {
    const uP_get = UserProperties.getProperties()
    const returnObj = {
      product_key_flag: uP_get.product_key_flag,
      product_key: uP_get.product_key,
    }
    return returnObj
  }
  UserConfig.setProperty = () => {
    const uP_set = (key, value) => UserProperties.setProperty(key, value)
    const returnObj = {
      product_key_flag: (value) => uP_set("product_key_flag", value),
      product_key: (value) => uP_set("product_key", value),
    }
    return returnObj
  }
  UserConfig.setProperties = (obj) => {
    UserProperties.setProperties(obj);
  }

let AppConfig = {}
  AppConfig.getProperty = () => {
    const uP_get = UserProperties.getProperties()
    const returnObj = {
      db_update_flag: uP_get.db_update_flag,
    }
    return returnObj
  }
  AppConfig.setProperty = () => {
    const uP_set = (key, value) => UserProperties.setProperty(key, value)
    const returnObj = {
      db_update_flag: (value) => uP_set("db_update_flag", value),
    }
    return returnObj
  }
  AppConfig.setProperties = (obj) => {
    UserProperties.setProperties(obj);
  }













