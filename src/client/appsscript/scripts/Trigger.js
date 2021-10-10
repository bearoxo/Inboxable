// Creates monthly time-driven trigger to handle user's product validation.

function monthlyTriggers_userHandler() {
  // Trigger every 6 hours.
  ScriptApp.newTrigger('myFunction')
    .timeBased()
    .everyHours(6)
    .create();

  // Trigger every Monday at 09:00.
  ScriptApp.newTrigger('myFunction')
    .timeBased()
    .onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(9)
    .create();

  ScriptApp.newTrigger("userHandler")
    .timeBased()
    .onMonthDay(1)
    .create();

  ScriptApp.newTrigger("userHandler")
    .timeBased()
    .everyWeeks(1)
    .create();
}


