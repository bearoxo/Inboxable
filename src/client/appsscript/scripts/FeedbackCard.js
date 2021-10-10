// Script for Contextual card

function feedbackCard() {
  var contextualCard = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle("Feedback Card"))
    .setPeekCardHeader(CardService.newCardHeader().setTitle("Feedback Card"))
    .addSection(CardService.newCardSection()
        .addWidget(CardService.newTextParagraph().setText("The email is from: ")))
    .build();
  
  return[feedbackCard];
}
