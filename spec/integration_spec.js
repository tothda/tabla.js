describe("hidden div based on a checkbox's state'", function(){
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

  it("is hidden at the beginning", function(){
    expect(div).toBeHidden();
  });

  it("is shown when the checkbox got checked", function(){
    checkbox.trigger('click');
    expect(div).toBeVisible();
  });
});