// Copyright(c) 2021, Aeranos - All Rights Reserved
// See the LICENSE file for more information.

// Script for Homepage card

function homepageCard() {

  // get user_email
  // check if user_id exist in UserProperties
  // if !user_id in UserProperties, check with database
  // if !user_id, add user_email to database and obtain user_id
  // store user_id in UserProperties

  var cardHeader = CardService.newCardHeader()
    .setTitle("App Title")
    .setSubtitle("My First Gmail Addon")
    .setImageUrl("https://image.flaticon.com/icons/png/512/969/969333.png");
    
  var cardAction = CardService.newAction()
    .setFunctionName("test");

  var saveBtn = CardService.newTextButton()
    .setText("Save changes")
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setOnClickAction(cardAction);
  
  var testBtn = CardService.newTextButton()
    .setText("added")
    .setTextButtonStyle(CardService.TextButtonStyle.FILLED)
    .setOnClickAction(cardAction);

  var switch01 = CardService.newDecoratedText()
    .setText("Sort emails by sender")
    .setTopLabel("Switch decorated text widget label")
    .setBottomLabel("This is a decorated text widget with a switch on the right")
    .setSwitchControl(CardService.newSwitch()
        .setFieldName("form_input_switch_key")
        .setValue("form_input_switch_value")
        .setOnChangeAction(CardService.newAction()
            .setFunctionName("test")));

  var switch02 = CardService.newDecoratedText()
    .setText("test")
    .setSwitchControl(CardService.newSwitch()
        .setFieldName("form_input_switch_key")
        // .setValue("form_input_switch_value")
        .setOnChangeAction(CardService.newAction()
            .setFunctionName("test")));

  var grid = CardService.newGrid()
    .setTitle("My Grid")
    .setNumColumns(3)
    .addItem(CardService.newGridItem()
        .setTitle("Facebook"))
    .addItem(CardService.newGridItem()
        .setTitle("Twitter"))
    .addItem(CardService.newGridItem()
        .setTitle("My item"));          

  var imageBtn = CardService.newImageButton()
    .setAltText("An image button with an airplane icon.")
    .setIcon(CardService.Icon.AIRPLANE)
    .setOpenLink(CardService.newOpenLink()
      .setUrl("https://www.google.com"));

  var imageBtn02 = CardService.newImageButton()
    .setAltText("An image button with an airplane icon.")
    .setIcon(CardService.Icon.CLOCK)
    .setOpenLink(CardService.newOpenLink()
      .setUrl("https://www.google.com"));

  var paypalSubscription = CardService.newOpenLink()
    .setOpenAs(CardService.OpenAs.OVERLAY)
    .setUrl(SubscriptionProperties.subscription_url);

  var fixedFooter = CardService.newFixedFooter()
    .setPrimaryButton(
      CardService.newTextButton()
        .setText("Subscribe")
        .setOnClickAction(CardService.newAction()
            .setFunctionName("createSubscription"))
        .setOpenLink(paypalSubscription))
    .setSecondaryButton(
      CardService.newTextButton()
        .setText("Help")
        .setOpenLink(paypalSubscription));
  
  var section = CardService.newCardSection()
    .setHeader(CardService.newCardHeader()
      .setTitle("Inboxable Header Title")
      .setSubtitle("Inboxable Header Subtitle"))
    // .setNumUncollapsibleWidgets(2)
    .setCollapsible(true)
    .addWidget(CardService.newTextParagraph().setText("Inboxable"))
    .addWidget(CardService.newTextInput()
      .setFieldName("input_field")
      .setTitle("Text Input Title")
      .setHint("Text Input Hint"))
    .addWidget(CardService.newSelectionInput()
      .setType(CardService.SelectionInputType.RADIO_BUTTON)
      .setTitle("Checkboxes for multiple selection")
      .setFieldName("checkbox_field")
      .addItem("Checkbox 1", "checkbox_one_value", false)
      .addItem("Checkbox 2", "checkbox_two_value", false)
      .addItem("Checkbox 3", "checkbox_three_value", false))
    .addWidget(CardService.newTextParagraph().setText("Inboxable"));

  var testDumpSection = CardService.newCardSection()
    .addWidget(switch01)
    .addWidget(switch02)
    .addWidget(saveBtn)
    .addWidget(imageBtn)
    .addWidget(imageBtn02)
    .addWidget(grid);

  var card = CardService.newCardBuilder()
    .setHeader(cardHeader)
    .setFixedFooter(fixedFooter)
    .addSection(section)
    .addSection(testDumpSection)
    .build();

  return [card];

}



