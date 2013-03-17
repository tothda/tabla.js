$(document).ready(function(){
  var a = $(':input[name="option-a"]')
    , b = $(':input[name="option-b"]')
    , c = $(':input[name="option-c"]')
    , radioDiv = $('#radio-div');

  var visibleCovers = function(){
    var ul = $('#example-1 ul').html('');
    $.each(arguments, function(i, arg){
      $('<li>'+arg+'</li>').appendTo(ul);
    });
  }

  var setVisibility = function(elem, visible) {
    if (visible) { elem.show(); }
    else { elem.hide(); }
  }

  var setRadioVisibility = _.partial(setVisibility, radioDiv);

  Tabla.LOGGING = true;
  var tabla = new Tabla('Table 1.')
    , any = Tabla.any;

  var t = tabla
            .withInputElements(a, b, c)
            .withAction(visibleCovers)
            .when(true, false, "C1").args('extra2')
            .when(true, false, "C2").args('extra1')
            .when(false, true, any).args('outdoor')
            .when(true, true, "C1").args('extra2', 'outdoor')
            .when(true, true, "C2").args('extra1', 'outdoor')
            .otherwise().args().build();

  a.change(t);
  b.change(t);
  c.change(t);

  var t2 = (new Tabla('Table 2.'))
             .withInputElements(a)
             .withAction(setRadioVisibility)
             .when(true).args(true)
             .when(false).args(false)
             .build();

  a.change(t2);

  t.call();
  t2.call();
});
