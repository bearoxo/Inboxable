// Script for Contextual card

function contextualCard() {
  var contextualCard = CardService.newCardBuilder()
    .setHeader(CardService.newCardHeader().setTitle("Contextual Card"))
    .setPeekCardHeader(CardService.newCardHeader().setTitle("Feedback Card"))
    .addSection(CardService.newCardSection()
        .addWidget(CardService.newTextParagraph().setText("The email is from: ")))
    .build();
  
  return[contextualCard];
}
