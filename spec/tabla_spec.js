describe("Tabla", function(){
  it("should be instantiated without arguments", function(){
    expect(new Tabla()).not.toBe(null);
  });

  describe("With a when/then rule", function(){
    var tabla, spy, fnResult;

    beforeEach(function(){
      var fn = function() { return fnResult; };
      spy = jasmine.createSpy();
      tabla = (new Tabla()).
        withAction(spy).
        whenMatches(fn).args(1,2,3).
        build();
    });

    it("calls the action when when is true", function(){
      fnResult = true;
      tabla();
      expect(spy).toHaveBeenCalledWith(1,2,3);
    })

    it("doesn't call the action when the rule doesn't match", function(){
      fnResult = false;
      tabla();
      expect(spy).not.toHaveBeenCalled();
    })
  });

  describe("With an otherwise rule + enter/exit action", function(){
    var tabla, enterSpy, exitSpy, fn1Result, fn2Result;

    beforeEach(function(){
      var fn1 = function() { return fn1Result; };
      var fn2 = function() { return fn2Result; };
      enterSpy = jasmine.createSpy();
      exitSpy = jasmine.createSpy();
      tabla = (new Tabla()).
        withEnterAction(enterSpy).
        withExitAction(exitSpy).
        whenMatches(fn1).args('fn1').startFromHere().
        whenMatches(fn2).args('fn2').
        otherwise().args('otherwise').
        build();
    });

    it("First: exitAction of start rule, then enter action of next", function(){
      fn1Result = false;
      fn2Result = true;
      tabla();
      expect(exitSpy).toHaveBeenCalledWith('fn1');
      expect(enterSpy).toHaveBeenCalledWith('fn2');
    });

    it("Calls the otherwise action if none of the rules match.", function(){
      fn1Result = false;
      fn2Result = false;
      tabla();
      expect(exitSpy).toHaveBeenCalledWith('fn1');
      expect(enterSpy).toHaveBeenCalledWith('otherwise');
    });
  });
});

describe("Tabla.Term", function(){
  it("Cannot be instantiated without argument.", function(){
    expect(function(){ new Tabla.Term(); }).toThrow(new TypeError("Unexpected arguments."));
  });

  describe("jQuery element + value", function(){
    var checkbox, term;

    beforeEach(function(){
      checkbox = $('<input type="checkbox" checked="checked"/>');
      term = new Tabla.Term(checkbox, true);
    });

    it("Cannot be instantiated..", function(){
      expect(new Tabla.Term(checkbox, true));
    });

    it("Checkbox: when checked then matches true", function(){
      expect(term.evaluate()).toBeTruthy();
    });

    it("Checkbox: when not checked then matches false ", function(){
      checkbox.trigger('click');
      expect(term.evaluate()).toBeFalsy();
    });
  });

  describe("With binary function", function(){
    it("Evaluates to the same value as the fn.", function(){
      var falseTerm = new Tabla.Term(function(){return false;});
      var trueTerm = new Tabla.Term(function(){return true;});
      expect(falseTerm.evaluate()).toBeFalsy();
      expect(trueTerm.evaluate()).toBeTruthy();
    });
  });
});

describe("Tabla.Rule", function(){
  it("Can be instantiated", function(){
    expect(new Tabla.Rule()).not.toBe(null);
  });
});
