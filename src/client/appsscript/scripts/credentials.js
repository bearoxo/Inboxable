var _db_config = () => {
  let _db_config = ScriptProperties.getProperty("_db_config")
  if (_db_config === null){
    _db_config = Inboxable_Credentials._db_config
    ScriptProperties.setProperty("_db_config", _db_config)
  }
  return _db_config
}

var _paypal_config = () => {
  let _paypal_config = ScriptProperties.getProperty("_paypal_config")
  if (_paypal_config === null){
    _paypal_config = Inboxable_Credentials._paypal_config
    ScriptProperties.setProperty("_paypal_config", _paypal_config)
  }
  return _paypal_config
}