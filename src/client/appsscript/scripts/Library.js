function generateRandomKey(keyLength, interval = 0){

  var str = "";
  var key = "";
  var char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < keyLength; i++) {
    str += char.charAt(Math.floor(Math.random() * char.length));
  }

  if (interval != 0 && keyLength % interval != 0){
    Logger.log("Error: Key length is not a multiple of interval.");    
  } else if (interval != 0){
    for (var i = 0; i < keyLength; i += interval) {
      var key = key.concat(str.substring(i, i + interval ) + "-")
    }
    key = key.substring(0, key.length - 1);
  } else {
    key = str;
  }
      
  return key;
}

// Only get the first value for repeated parameter.
function getParameterByName(queryParam, url) {
  queryParam = queryParam.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + queryParam + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function isExpired(duration_or_expiryDate, startDate){
  
  // Duration in msec or expiryDate as per GAS Date() class format.
  var x = duration_or_expiryDate
  var now = new Date();

  if (!isNaN(x) && x instanceof Date == false){
    if (!startDate){
      throw "Error: No startDate."
    } else if (startDate instanceof Date == false){
      throw "Error: startDate is not an instance of Date."
    } else {
      var z = startDate.getTime();
      var expiryDate = new Date(z + x);
    }
  } else if (x instanceof Date == true && !startDate){
    var expiryDate = x
  } else {
    throw "Error"
  }
  
  if(now < expiryDate){
    return false
  } else if(expiryDate < startDate){
    throw "Error expiryDate is before startDate"
  } else {
    return true;
  };

}

function isObject (variable){
  if(typeof variable === 'object' && variable !== null && !Array.isArray(variable)){
    return true
  } else {
    return false
  }
}

function isNumber (variable){
  if (!isNaN(variable) 
    && typeof variable != "string" 
    && variable != null 
    && typeof variable != "boolean"){
      return true
  } else {
    return false
  }
}

function isInteger (variable){
  if (isNumber(variable) && Number.isInteger(variable)){
    return true
  } else {
    return false
  }
}

/**
 * Create a subset of an object.
 * 
 * @typedef {Object} objSubsetFunctions
 * @property {function} fromKeys - Select subset from object based on array of keys.
 * @property {function} fromValues - Select subset from object based on array of values.
 * @return {objSubsetFunctions}
 */
function createObjSubset() {
  let objSubset
  /**
   * Extract subset of an object, filtered by an array of keys.
   * 
   * @param {Object} sourceObj - Object to extract subset from.
   * @param {any[]} keys - Array of keys.
   * @param {boolean} [log=false] - Output object subset to log.
   */
  const fromKeys = (sourceObj, [...keys], log = false) => {
    if (!keys){
      objSubset = sourceObj
    } else {
      objSubset = Object.entries(sourceObj)
        .filter(([key]) => keys.includes(key))
        .reduce((newObj, [key, val]) => Object.assign(newObj, { [key]: val }), {});
    }
    if (log === true){
      Logger.log(`Object subset: ${objSubset}`)
    }
    return objSubset
  }
  /**
   * Extract subset of an object, filtered by an array of values.
   * 
   * @param {Object} sourceObj - Object to extract subset from.
   * @param {any[]} values - Array of values.
   * @param {boolean} [log=false] - Output object subset to log.
   */
  const fromValues = (sourceObj, [...values], log = false) => {
    if (!values){
      objSubset = sourceObj
    } else {
      objSubset = Object.entries(sourceObj)
        .filter(([, value]) => values.includes(value))
        .reduce((newObj, [key, val]) => Object.assign(newObj, { [key]: val }), {});
    }
    if (log === true){
      Logger.log(`Object subset: ${objSubset}`)
    }
    return objSubset
  }
  let objSubsetFunctions = {
    "fromKeys": fromKeys,
    "fromValues": fromValues
  }
  return objSubsetFunctions
}








