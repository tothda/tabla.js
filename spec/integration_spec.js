describe("A case where a checkbox controls a div's visiblity.'", function(){
  var tabla, checkbox, div;

  beforeEach(function(){
    loadFixtures('example-1.html');
    checkbox = $(':input[name="option-a"]')
    div = $('#radio-div');

    var setVisibility = function(elem, visible) {
      if (visible) { elem.show(); }
      else { elem.hide(); }
    }

    var setRadioVisibility = _.partial(setVisibility, div);

    tabla = (new Tabla('Table 2.'))
             .withInputElements(checkbox)
             .withAction(setRadioVisibility)
             .when(true).args(true)
             .when(false).args(false)
             .build();

    checkbox.change(tabla);
    tabla.call();
  });

  it("div is hidden at the beginning", function(){
    expect(div).toBeHidden();
  });

  it("div shown/hidden when the checkbox got checked/unchecked", function(){
    checkbox.trigger('click');
    expect(div).toBeVisible();
    checkbox.trigger('click');
    expect(div).toBeHidden();
    checkbox.trigger('click');
    expect(div).toBeVisible();
  });
});

describe("The support for enter/exit action.", function(){
  var tabla, checkboxA, checkboxB, list;

  beforeEach(function(){
    loadFixtures('example-2.html');
    checkboxA = $(':input[name="option-a"]')
    checkboxB = $(':input[name="option-b"]')
    list = $('ul');

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

    tabla = (new Tabla('Table 2.'))
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

  it("should show only D at the beginning", function(){
    expect(list.find('li:visible').text()).toBe('D');
  });

  it("should show AD if checkboxA selected", function(){
    checkboxA.trigger('click');
    expect(list.find('li:visible').text()).toBe('AD');
  });

  it("should show BD if checkboxB selected", function(){
    checkboxB.trigger('click');
    expect(list.find('li:visible').text()).toBe('BD');
  });

  it("should show ABCD if both checkboxA and checkboxB selected", function(){
    checkboxA.trigger('click');
    checkboxB.trigger('click');
    expect(list.find('li:visible').text()).toBe('ABCD');
  });
});
