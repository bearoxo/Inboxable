let rick = {}
rick.a = "novpgeoearnr"
rick.s = "enenotwrrodt"
rick.t = "vnyenynguudy"
rick.l = "eaovnononneo"
rick.e = "rgueauenadsu"
rick.y = "giurldvnrae"

function roll (){
  let z = String(Object.values(rick)).length
  let result = ""
  // for (let x in Object.values(rick).length)

  for (i = 0, j=1; i<z; i++, j++){
  result += rick.a.substring(i, j) +
    rick.s.substring(i, j) +
    rick.t.substring(i, j) +
    rick.l.substring(i, j) +
    rick.e.substring(i, j) +
    rick.y.substring(i, j)
  }
  Logger.log(result)
  return result
}
