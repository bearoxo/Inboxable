function doGet(e) {

  return HtmlService.createHtmlOutputFromFile("TestWeb");

  // Logger.log(e.queryString)

  // return HtmlService.createHtmlOutput(UrlFetchApp.fetch("https://github.com/bearoxo/Inboxable/issues/new"))
  
}

function test(){
  // UserProperties.deleteAllProperties()
  // Logger.log(UserProperties.getProperties())
  
  var date = new Date()
  var timestamp = date.
  Logger.log(UserProperties.getProperties())
  
  // var x = UserProperties.getProperty(y)
  // Logger.log(x)
  // x = JSON.parse(x)
  // Logger.log(x)
  // Logger.log(x.id)
}

function doPost(e) {

  // PAYMENT.SALE.COMPLETED
  // BILLING.SUBSCRIPTION.ACTIVATED
  // BILLING.SUBSCRIPTION.UPDATED
  // BILLING.SUBSCRIPTION.CANCELLED
  // BILLING.SUBSCRIPTION.SUSPENDED

  // Logger.log(JSON.parse(e.parameters));

  var postData = e.postData.contents; 
  var event = JSON.parse(postData)
  Logger.log(event.id)
  var timeStamp = new Date();
  var event_type = event["event_type"];
  
  // var time = Utilities.formatDate(timeStamp, "GMT+08:00", "MM/dd/yy, h:mm a");
    
  // UserProperties.setProperty(timeStamp, postData)
  switch (event_type)  {
    case "BILLING.SUBSCRIPTION.ACTIVATED":      
      var webhook_id = event.id;
      var plan_id = event.resource.plan_id;
      var subscription_id = event.resource.id;
      var subscription_status = event.resource.status;
      var subscriber_email = event.resource.subscriber.email_address;
      var subscriber_given_name = event.resource.subscriber.name.given_name;
      var subscriber_surname = event.resource.subscriber.name.surname;
      var start_time = event.resource.start_time;

      var cycle_executions = event.resource.billing_info.cycle_executions;
      for (var i = 0; i < cycle_executions.length; i++) {
        if (cycle_executions[i].tenure_type == "REGULAR"){
          var cycles_completed = cycle_executions[i].cycles_completed;
        }
      }

      var subscriptionData = {
        "webhook_id": webhook_id,
        "plan_id": plan_id,
        "subscription_id": subscription_id,
        "subscription_status": subscription_status,
        "subscriber_email": subscriber_email,
        "subscriber_given_name": subscriber_given_name,
        "subscriber_surname": subscriber_surname,
        "start_time": start_time,
        "cycles_completed": cycles_completed
      }

      UserProperties.setProperties(subscriptionData)
      Logger.log(event.summary);
      Logger.log("Subscription ID = " + subscription_id);
      break;
    case "BILLING.SUBSCRIPTION.RENEWED":
      var webhook_id = event.id;
      var plan_id = event.resource.plan_id;
      var subscription_id = event.resource.id;
      var subscription_status = event.resource.status;
      var subscriber_email = event.resource.subscriber.email_address;
      var subscriber_given_name = event.resource.subscriber.name.given_name;
      var subscriber_surname = event.resource.subscriber.name.surname;

      var cycle_executions = event.resource.billing_info.cycle_executions;
      for (var i = 0; i < cycle_executions.length; i++) {
        if (cycle_executions[i].tenure_type == "REGULAR"){
          var cycles_completed = cycle_executions[i].cycles_completed;
        }
      }

      var subscriptionData = {
        "webhook_id": webhook_id,
        "plan_id": plan_id,
        "subscription_id": subscription_id,
        "subscription_status": subscription_status,
        "subscriber_email": subscriber_email,
        "subscriber_given_name": subscriber_given_name,
        "subscriber_surname": subscriber_surname,
        "cycles_completed": cycles_completed
      }

      UserProperties.setProperties(subscriptionData)
      Logger.log(event.summary);
      Logger.log("Subscription ID = " + subscription_id);
      break;
    case "BILLING.SUBSCRIPTION.UPDATED":
      var hookType = "Payment";
      var customerId = event["data"].object.customer;
      Logger.log("bruh"); 
      break;
    case "BILLING.SUBSCRIPTION.SUSPENDED":
      var hookType = "Cancelled";
      var customerId = event["data"].object.customer;
      Logger.log("bruh"); 
      break;
    case "BILLING.SUBSCRIPTION.CANCELLED":
      var hookType = "Cancelled";
      var customerId = event["data"].object.customer;
      Logger.log("bruh"); 
      break;
    case "BILLING.SUBSCRIPTION.RE-ACTIVATED":
      var hookType = "Payment";
      var customerId = event["data"].object.customer;
      Logger.log("bruh"); 
      break;
  }
    
  Logger.log(event); 
  Logger.log(timeStamp); 

  return HtmlService.createHtmlOutput(200);
}
