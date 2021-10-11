let get_db_config = () => {
  let _db_config;
  try {
    _db_config = JSON.parse(ScriptProperties.getProperty("_db_config"));
    if (_db_config === null){
      _db_config = Inboxable_Credentials._db_config;
      ScriptProperties.setProperty("_db_config", JSON.stringify(_db_config));
    }
  }
  catch {
    _db_config = Inboxable_Credentials._db_config;
    ScriptProperties.setProperty("_db_config", JSON.stringify(_db_config));
  }
  return _db_config;
}

let get_paypal_config = () => {
  let _paypal_config;
  try {
    _paypal_config = JSON.parse(ScriptProperties.getProperty("_paypal_config"));
    if (_paypal_config === null){
      _paypal_config = Inboxable_Credentials._paypal_config;
      ScriptProperties.setProperty("_paypal_config", JSON.stringify(_paypal_config));  
    }
  }
  catch {
    _paypal_config = Inboxable_Credentials._paypal_config;
    ScriptProperties.setProperty("_paypal_config", JSON.stringify(_paypal_config));
  }
  return _paypal_config;
}