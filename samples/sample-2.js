$(document).ready(function(){
  var checkboxA = $(':input[name="option-a"]')
    , checkboxB = $(':input[name="option-b"]')
    , list = $('ul');

  var showLetters = function() {
    _.each(arguments, function(letter){
      list.find(':contains("'+letter+'")').show();
    });
  };

  var hideLetters = function() {
    _.each(arguments, function(letter){
      list.find(':contains("'+letter+'")').hide();
    });
  };
  Tabla.LOGGING = true;
  var tabla = (new Tabla('Table 2.'))
             .withInputElements(checkboxA, checkboxB)
             .withEnterAction(showLetters)
             .withExitAction(hideLetters)
             .when(false, false).args()
             .when(false, true ).args('B')
             .when(true,  false).args('A')
             .when(true,  true ).args('A', 'B', 'C').startFromHere()
             .build();

  checkboxA.change(tabla);
  checkboxB.change(tabla);
  tabla.call();
});
