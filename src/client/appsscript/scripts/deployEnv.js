// Set the deployment environment to either "development", "test" or "production"
let deployEnv = "development"

let _db_config_env = get_db_config()[deployEnv]
let _paypal_config_env = get_paypal_config()[deployEnv]

var _db_config_ed = {
  _username: _db_config_env._username,
  _password: _db_config_env._password,
  _db_name: _db_config_env._db_name,
  _connection_name: _db_config_env._connection_name,
  _host: _db_config_env._host,
  _dialect: _db_config_env._dialect
}
var _paypal_config_ed = {
  _clientID: _paypal_config_env._clientID,
  _clientSecret: _paypal_config_env._clientSecret,
  _plan_id: _paypal_config_env._plan_id
}