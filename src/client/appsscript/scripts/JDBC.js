/**
 * Returns an established JdbcConnection session to the database.
 * @returns {Jdbc.JdbcConnection}
 */
function db_connect(){
  const username = InboxableInstance._username;
  const password = InboxableInstance._password;
  const connection_name = InboxableInstance._connection_name;
  const db_name = InboxableInstance._db_name;
  const url = "jdbc:google:mysql://" + connection_name + db_name;
  return Jdbc.getCloudSqlConnection(url, username, password);
}

function testlagilagi(){
  const connection = db_connect()
  // const sql = "SELECT * FROM user"
  // let result = db_execute(connection, "query", sql)
  let user_id = db_get_user_id(connection, "a.y.banzai@gmail.com")
  // let result2 = db_get_tables(connection)
  // Logger.log(result)
  Logger.log(user_id)
  // Logger.log(result2)
  connection.close()
}

/**
 * Execute a query or an update statement to a database.
 * Returns executed query result as resultData, an array of objects that represents the rows of the resulting data, where the columns name are the keys and the data is the value, or log the number of database rows successfully updated for update execute type.
 * 
 * TLDR:
 * Query =>>> resultData = [...{column_name: data}] 
 * Update =>>> Log number of rows updated.
 * 
 * @typedef {Object[]} resultData
 * @property resultData[].column_name - Column name.
 * 
 * @param {Jdbc.JdbcConnection} connection - JdbcConnection session to a specific database.
 * @param {string} executeType - String value specifying the statement execution type, which is either "query" or "update".
 * @param {string} sql - SQL statement.
 * @returns {resultData}
 */
function db_execute(connection, executeType, sql) {
  let statement
  let result
  try {
    statement = connection.createStatement()
    let resultData = []
    let get_data = (result) => {
      if (!result.isBeforeFirst()){
        throw "Error: No data returned from query."
      } 
      while (result.next()) {
        let metadata = result.getMetaData();
        let columnCount = metadata.getColumnCount();
        let row = {}
        for (let i = 1; i <= columnCount; i++) {
          let columnName = metadata.getColumnName(i);
          let value = result.getString(i);      
          Object.assign(row,{ [columnName]: value })
        } 
        resultData.push(row)
      }
      return resultData;
    }
    switch(executeType) {
      case 'query':
        result = statement.executeQuery(sql);
        let resultData = get_data(result)
        return resultData
      case 'update':  
        result = statement.executeUpdate(sql);
        Logger.log(`${result} rows updated.`)
    }
  }
  catch (err) {
    throw err
  }
  finally {
    result.close();
    statement.close();
  }
}

/**
 * Sort data in dataObject to tables and columns respective to db_tables schema
 * Returns sortedData object
 * 
 * TLDR:
 * =>>> sortedData = {table_name.column_name: data}
 * 
 * @typedef {Object} sortedData
 * @property {Object} table_name - Table name.
 * @property table_name.column_name - Column name.
 * 
 * @param {Object} db_tables - {table_name: [...column_name]}
 * @param {Object} dataObject - {column_name: data}
 * @returns {sortedData}
 */
function db_sort (db_tables, dataObject){
  let sortedData = {}
  for (let [column_name, data] of Object.entries(dataObject)){
    for (let [db_table_name, db_column_name] of Object.entries(db_tables)){
      if (db_column_name.includes(column_name)){
        if (!isObject(sortedData[db_table_name])){
          sortedData[db_table_name] = {}
        }
        sortedData[db_table_name][column_name] = data
      }
    }
  }
  return sortedData
}

/**
 * Returns stmtObj, an object storing one generated SQL statement per execution type per table, from the sortedData. 
 * 
 * TLDR:
 * =>>> stmtObj = {"insert"|"update"|"push": {table_name: SQL statement}}
 * 
 * @typedef {Object} stmtObj
 * @property {Object} insert - Insert statement type.
 * @property {Object} insert.table_name - Table name.
 * @property {Object} update - Update statement type.
 * @property {Object} update.table_name - Table name.
 * @property {Object} push - Push statement type.
 * @property {Object} push.table_name - Table name.
 * 
 * @param {sortedData} sortedData - Sorted data object.
 * @param {string} key_column - Key column name.
 * @param {string} key_value - Key column value.
 * @returns {stmtObj}
 */
function db_create_stmtObj (sortedData, key_column, key_value){
  stmtObj = {}
  stmtObj.insert = {}
  stmtObj.update = {}
  stmtObj.push = {}
  for (let [table_name, data] of Object.entries(sortedData)){
    let setData = ""
    let column_name = []
    let values = []
    for (let [key, value] of Object.entries(data)){
      if (typeof value === "string"){
        value = `"${value}"`
      }
      column_name.push(key)
      values.push(value)
      setData += `${key}=${value}`
      if (Object.entries(data).length > 1){
        setData += ", "
      }
    }
    if (Object.entries(data).length > 1){
      setData = setData.substring(0, setData.length - 2)
    }
    if (typeof key_value === "string"){
      key_value = `"${key_value}"`
    }
    const sqlInsert = `INSERT INTO ${table_name} (${column_name.join(", ")}) ` +
                      `VALUES (${values.join(", ")})`
    if (!key_column && !key_value) {
      var sqlUpdate = `UPDATE ${table_name} SET ${setData}`
    } else {
      var sqlUpdate = `UPDATE ${table_name} ` +
                      `SET ${setData} ` + 
                      `WHERE ${key_column}=${key_value}`
    }
    const sqlPush = `INSERT INTO ${table_name} (${column_name.join(", ")}) ` +
                    `VALUES (${values.join(", ")}) ` +
                    `ON DUPLICATE KEY UPDATE ${setData}`
    stmtObj.insert[table_name] = sqlInsert
    stmtObj.update[table_name] = sqlUpdate
    stmtObj.push[table_name] = sqlPush
  }
  Logger.log(stmtObj)
  return stmtObj
}

/**
 * Returns entire schema of the database into an object, db_tables, where table names are stored as the keys and the respective columns are stored in an array as the value.
 *  
 * TLDR:
 * =>>> db_tables = {table_name: [...column_name]}
 * 
 * @typedef {Object} db_tables
 * @property {Object} table_name - Table name.
 * @property {Array} table_name.column_name - Column name.
 * 
 * @param {Jdbc.JdbcConnection} connection - JdbcConnection session to a specific database.
 * @returns {db_tables}
 */
function db_get_tables (connection){
  try{
    const db_md = connection.getMetaData()
    const resultSet = db_md.getTables(null, null, "%", null)
    let db_tables = {}
    while (resultSet.next()){
      let table_name = resultSet.getString(3)
      const sql = `SELECT * FROM ${table_name}`
      let pstmt = connection.prepareStatement(sql)
      let table_md = pstmt.getMetaData()
      let columnCount = table_md.getColumnCount();
      for (let i = 1; i <= columnCount; i++) {
        var column_name = table_md.getColumnName(i);
        if (!Array.isArray(db_tables[table_name])){
          db_tables[table_name] = []
        }
        db_tables[table_name].push(column_name)
      }
    }
    return db_tables
  }
  catch(err){
    throw err
  }
  finally{
    resultSet.close()
    pstmt.close()
  }
}

/**
 * Execute data uploads into multiple tables in the database.
 * 
 * @param {Jdbc.JdbcConnection} connection - JdbcConnection session to a specific database.
 * @param {string} uploadStmtType - String value specifying the upload statement type to be executed, which is either "insert", "push" or "update".
 * @param {Object} db_tables - {table_name: [...column_name]}
 * @param {Object} dataObject - {column_name: data}
 * @param {Array} selectedTables - Array listing the selected tables name.
 * @param {String} key_column - Key column name.
 * @param {String} key_value - Key column value.
 */
function db_upload_multiTables(connection, uploadStmtType, 
                              db_tables, dataObject, selectedTables,
                              key_column, key_value){
  const objSubset = createObjectSubset(db_tables, selectedTables)
  const sortedData = db_sort(objSubset, dataObject)
  let stmtObj
  switch (uploadStmtType){
    case "insert":
    case "push":
      stmtObj = db_create_stmtObj(sortedData)
      break;
    case "update":
      stmtObj = db_create_stmtObj(sortedData, key_column, key_value)
  }
  for (let sql of Object.values(stmtObj[uploadStmtType])){
    db_execute(connection, "update", sql)
  }
}

/* Obsolete functions. To be deleted. Functions compiled into db_upload_multiTables(). 
  function db_insertMultiTables(connection, db_tables, dataObject, selectedTables){
    const objSubset = createObjectSubset(db_tables, selectedTables)
    const sortedData = db_sort(objSubset, dataObject)
    const stmtObj = db_create_stmtObj(sortedData)
    for (let sql of Object.values(stmtObj.insert)){
      db_execute(connection, "update", sql)
    }
  }
  function db_updateMultiTables(connection, db_tables, dataObject,
                                selectedTables, key_column, key_value){
    const objSubset = createObjectSubset(db_tables, selectedTables)
    const sortedData = db_sort(objSubset, dataObject)
    const stmtObj = db_create_stmtObj(sortedData, key_column, key_value)
    for (let sql of Object.values(stmtObj.update)){
      db_execute(connection, "update", sql)
    }
  }
  // Push dataObject upsert to db
  function db_pushMultiTables(connection, db_tables, dataObject, selectedTables){
    const objSubset = createObjectSubset(db_tables, selectedTables)
    const sortedData = db_sort(objSubset, dataObject)
    const stmtObj = db_create_stmtObj(sortedData)
    for (let sql of Object.values(stmtObj.push)){
      db_execute(connection, "update", sql)
    }
  }
*/

/**
 * Insert user_email into `user` table in database.
 * 
 * @param {Jdbc.JdbcConnection} connection - JdbcConnection session to a specific database.
 * @param {string} user_email - User email to be inserted into database.
 */
function db_insert_user_email(connection, user_email){
  const table_name = "user"
  const sql = `INSERT INTO ${table_name} (user_email)` +
              `VALUES ("${user_email}")`
  db_execute(connection, "update", sql)
}

/**
 * Query user_id from database and returns it. 
 * 
 * @param {Jdbc.JdbcConnection} connection - JdbcConnection session to a specific database.
 * @param {string} user_email - User email to be inserted into database.
 * @return {string} user_id
 */
function db_get_user_id(connection, user_email){
  let statement
  let result
  const table_name = "user";
  const sql = `SELECT user_id FROM ${table_name} WHERE user_email="${user_email}"`;
  try {
  statement = connection.createStatement();
  result = statement.executeQuery(sql);
    if(result.first()){
      let user_id = result.getString("user_id");
      return user_id
    } else {
      throw `Error: No user_id found for ${user_email} in database entry.`;
    }
  }
  catch (err) {
    throw err
  }
  finally {
    result.close();
    statement.close();
  }
}

// Return "userData[table_name][row][column_name] = value"
/**
 * Query user_id from database and returns it. 
 * 
 * @typedef {Object} userData
 * 
 * @param {Jdbc.JdbcConnection} connection - JdbcConnection session to a specific database.
 * @param {string} user_email - User email to be inserted into database.
 * @return {string} user_id
 */
function db_get_userData (connection, user_id, db_tables) {
  const table = (table_name, column_name = "*") => {
    if (Array.isArray(column_name)){
      var column_name = `${column_name.join(", ")}`;
    }
    const sql = `SELECT ${column_name} FROM ${table_name} WHERE user_id=${user_id}`
    userData = db_execute(connection, "query", sql)
    return userData 
  }
  const tables = (table_name, column_name = "*") => {
    const db_tables_subset = createObjSubset().fromKeys(db_tables, table_name)
    let userData = {}
    for (let table_name in db_tables){
      if (Object.values(db_tables[table_name]).includes("user_id")){
        userData[table_name] = table(connection, user_id, table_name, "*")
      }
    }
    Logger.log(userData)
    return userData
  }
  const all = () => {
    let userData = {}
    for (let table_name in db_tables){
      if (Object.values(db_tables[table_name]).includes("user_id")){
        userData[table_name] = table(connection, user_id, table_name, "*")
      }
    }
    Logger.log(userData)
    return userData
  }
  let dataObj = {
    "table": table,
    "tables": tables,
    "all": all
  }
  return dataObj
}

/* Obsolete functions. To be deleted. Functions compiled into db_getUserData(). 
  function db_get_userData(connection, table_name, column_name, user_id){
    if (Array.isArray(column_name)){
      var column_name = `${column_name.join(", ")}`;
    }
    const sql = `SELECT ${column_name} FROM ${table_name} WHERE user_id=${user_id}`
    const userTableData = db_execute(connection, "query", sql)
    return userTableData
  }

  function db_get_userAllData(connection, user_id, db_tables){
    let userData = {}
    for (let table_name in db_tables){
      if (Object.values(db_tables[table_name]).includes("user_id")){
        userData[table_name] = db_get_userData(connection, user_id, table_name, "*")
      }
    }
    Logger.log(userData)
    return userData
  }
*/

function db_update_userName(connection, user_id, user_given_name, user_surname){
  const table_name = "user"
  const sql = `UPDATE ${table_name} ` +
              `SET user_given_name="${user_given_name}", ` + 
              `user_surname="${user_surname}" ` + 
              `WHERE user_id=${user_id}`
  return db_execute(connection, "update", sql)                              
}

// function db_insert_subscription(connection, db_tables, dataObject){
//   const table_name = "subscription"
//   const db_tables_subset = createObjectSubset(db_tables, table_name)
//   const sortedData = db_sort(db_tables_subset, dataObject)
//   const stmtObj = db_create_stmtObj (sortedData)
//   const sql =  stmtObj.insert[table_name]
//   return db_execute(connection, "update", sql)
// }

function db_push_subscription(connection, db_tables, dataObject){
  const table_name = "subscription"
  const db_tables_subset = createObjectSubset(db_tables, table_name)
  const sortedData = db_sort(db_tables_subset, dataObject)
  const stmtObj = db_create_stmtObj (sortedData)
  const sql =  stmtObj.push[table_name]
  return db_execute(connection, "update", sql)
}

function db_push_product(connection, user_id, subscription_id, product_plan, product_key){
  const table_name = "product"
  const sortedData = {}
  sortedData[table_name] = {}
  sortedData[table_name]["user_id"] = user_id
  sortedData[table_name]["subscription_id"] = subscription_id
  sortedData[table_name]["product_plan"] = product_plan
  sortedData[table_name]["product_key"] = product_key
  const stmtObj = db_create_stmtObj (sortedData)
  const sql =  stmtObj.push[table_name]
  return db_execute(connection, "update", sql)
}

function db_insert_comp_email(connection, user_id, comp_email){
  const table_name = "comp_email"
  const sql = `INSERT INTO ${table_name} (user_id, comp_email) ` +
              `VALUES (${user_id}, "${comp_email}")`
  return db_execute(connection, "update", sql)
}
function db_update_comp_email(connection, user_id, old_comp_email, new_comp_email){
  const table_name = "comp_email"
  const sql = `UPDATE ${table_name} ` +
              `SET comp_email="${new_comp_email}" ` + 
              `WHERE user_id=${user_id} AND comp_email=${old_comp_email}`
  return db_execute(connection, "update", sql)
}

function db_insert_temp_data(connection, user_id, temp_subscription_id){
  const table_name = "temp_data"
  const sql = `INSERT INTO ${table_name} (user_id, temp_subscription_id) ` +
              `VALUES (${user_id}, "${temp_subscription_id}")`
  return db_execute(connection, "update", sql)
}
// Clear temp_data for data that has past a certain specified no. of days
// function db_clear_temp_data(connection, noOfDays){
//   const table_name = "temp_data";
//   const sql = `DELETE FROM ${table_name} ` + 
//               `WHERE timestamp > DATE_ADD(timestamp, INTERVAL ${noOfDays} DAY)`;
//   return db_execute(connection, "update", sql);
// }

function db_insert_webhook_log(connection, user_id, subscription_id,
                              webhook_id, post_data){
  const table_name = "webhook_log"
  const sql = `INSERT INTO ${table_name} ` + 
              `(user_id, subscription_id, webhook_id, post_data) ` +
              `VALUES ` + 
              `(${user_id}, "${subscription_id}", "${webhook_id}", "${post_data}")`
  return db_execute(connection, "update", sql)
}


function get_userPropertiesCount () {
  let userProperties = UserProperties.getProperties()
  Logger.log(Object.entries(userProperties).length)
  const x = Object.keys(userProperties)
  Logger.log(x[1])
}

// "db_userData" => "userData[table_name][row][column_name] = value"
function db_syncUserProperties (connection, user_id, userProperties){
  const db_userData = db_get_userData(connection, user_id)
  const propEntries = Object.entries(userProperties)
  const user_email = Session.getActiveUser().getEmail()

  for (i = 0; i < propEntries.length; i++){
    for (let [key, value] of propEntries){
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
    }
  }

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
}

// UserHandler
// 1. insert user_email
// 2. get user_id
// 3. insert temp_data
// 4. insert/update comp_email

// Time-driven triggers
// 1. set time-driven trigger for clearing temp_data

// WebApp
// 1. insert webhook_log
// 2. push subscription
// 3. push product




