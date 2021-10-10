function reportBugAction() {
  
  return reportBug = CardService.newUniversalActionResponseBuilder()
    .setOpenLink(CardService.newOpenLink()
      .setOpenAs(CardService.OpenAs.OVERLAY)
      .setUrl("https://github.com/bearoxo/Inboxable/issues/new?assignees=&labels=bug&template=bug_report.md&title="))
    .build();
}

function requestFeatureAction() {
  
  return feedbackResponse = CardService.newUniversalActionResponseBuilder()
    .setOpenLink(CardService.newOpenLink()
      .setOpenAs(CardService.OpenAs.OVERLAY)
      .setUrl("https://github.com/bearoxo/Inboxable/issues/new?assignees=&labels=enhancement&template=feature_request.md&title="))
    .build();
}

function feedbackAction() {
  
  return feedbackResponse = CardService.newUniversalActionResponseBuilder()
    .setOpenLink(CardService.newOpenLink()
      .setOpenAs(CardService.OpenAs.OVERLAY)
      .setUrl("https://github.com/bearoxo/Inboxable/issues/new"))
    .build();
 
}

