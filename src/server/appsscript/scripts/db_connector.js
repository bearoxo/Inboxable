function db_connect(){
  const username = InboxableInstance._username;
  const password = InboxableInstance._password;
  const connection_name = InboxableInstance._connection_name;
  const db_name = InboxableInstance._db_name;
  const url = "jdbc:google:mysql://" + connection_name + db_name;
  return Jdbc.getCloudSqlConnection(url, username, password);
}

// Execute query or update statement to db
// "statementType = 'query' || 'update'"
// Return "data" as nested object from query or log the number of db rows updated
function db_execute(connection, statementType, sql) {
  const statement = connection.createStatement()
  let get_data = (result) => {
    let j = 0
    let returnObj = {}
    while (result.next()) {
      let metadata = result.getMetaData();
      let columnCount = metadata.getColumnCount();
      let row = {}
      for (let i = 1; i <= columnCount; i++) {
        let key = metadata.getColumnName(i);
        let value = result.getString(i);      
        row[key] = value
      }
      if (result.isFirst() && result.isLast()){
        returnObj = row
      } else {
        returnObj[j] = row
        j++
      }
    }
    result.close();
    return returnObj;
  }
  switch(statementType) {
    case 'query':
      var result = statement.executeQuery(sql);
      let data = get_data(result)
      statement.close();
      return data
    case 'update':  
      var result = statement.executeUpdate(sql);
      statement.close();
      return Logger.log(`${result} rows updated.`)
  }
}

// Sort "dataObject" key & values to any tables in the db where the "column_name"=key
// "dataObject[column_name] = data"
// "db_tables[table_name] = [...column_name]"
// Return "sortedData[table_name][column_name] = data"
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

// Generate SQL statements from the sorted dataObject and store them as object.
// "sortedData[table_name][column_name] = data"
// One generated SQL statement per execution type per table
// Return "stmtObj[insert || update || push][table_name] = SQL statement"
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

// Return "db_tables[table_name] = [...column_name]"
function db_get_tables (connection){
  const instance_md = connection.getMetaData()
  const resultSet = instance_md.getTables(null, null, "%", null)
  let db_tables = {}
  while (resultSet.next()){
    let table_name = resultSet.getString(3)
    const sql = `SELECT * FROM ${table_name}`
    let table_md = connection.prepareStatement(sql).getMetaData()
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

// "dataObject[column_name] = data"
// "db_tables[table_name] = [...column_name]"
// "selectedTables = [...table_name]"
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

function db_insert_user_email(connection, user_email){
  const table_name = "user"
  const sql = `INSERT INTO ${table_name} (user_email)` +
              `VALUES ("${user_email}")`
  return db_execute(connection, "update", sql)
}

// Return "user_id" queried from db using "user_email"
function db_get_user_id(connection, user_email){
  const table_name = "user";
  const sql = `SELECT user_id FROM ${table_name} WHERE user_email="${user_email}"`;
  const statement = connection.createStatement();
  let result = statement.executeQuery(sql);
  if(result.first()){
    var user_id = result.getString("user_id");
    Logger.log(`User ID: ${user_id}`);
    result.close();
    statement.close();
    return user_id
  } else {
    result.close();
    statement.close();
    return Logger.log(`Error: No user_id found for ${user_email} in database entry.`);
  }
}

function db_get_userData(connection, table_name, column_name, user_id){
  if (Array.isArray(column_name)){
    var column_name = `${column_name.join(", ")}`;
  }
  const sql = `SELECT ${column_name} FROM ${table_name} WHERE user_id=${user_id}`
  const returnObj = db_execute(connection, "query", sql)
  return returnObj
}

function db_get_userAllData(connection, user_id){
  let returnObj = {}
  const db_tables = db_get_tables(connection)
  for (let table_name in db_tables){
    if (Object.values(db_tables[table_name]).includes("user_id")){
      returnObj[table_name] = db_get_userData(connection, table_name, "*", user_id)
    }
  }
  Logger.log(returnObj)
  return returnObj
}

function db_update_user_name(connection, user_id, user_given_name, user_surname){
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
function db_clear_temp_data(connection, noOfDays){
  const table_name = "temp_data";
  const sql = `DELETE FROM ${table_name} ` + 
              `WHERE timestamp > DATE_ADD(timestamp, INTERVAL ${noOfDays} DAY)`;
  return db_execute(connection, "update", sql);
}

function db_insert_webhook_log(connection, user_id, subscription_id,
                              webhook_id, post_data){
  const table_name = "webhook_log"
  const sql = `INSERT INTO ${table_name} ` + 
              `(user_id, subscription_id, webhook_id, post_data) ` +
              `VALUES ` + 
              `(${user_id}, "${subscription_id}", "${webhook_id}", "${post_data}")`
  return db_execute(connection, "update", sql)
}

function db_sync(){
  var connection = db_connect();
  const statement = connection.createStatement();
  
  var sql = " "

  db_query(sql);

  query.close();
  statement.close();
  connection.close();
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




