describe "A case where a checkbox controls a div's visiblity.'", ->
  beforeEach ->
    loadFixtures "example-1.html"
    @checkbox = $(":input[name=\"option-a\"]")
    @div = $("#radio-div")
    @setVisibility = (elem, visible) ->
      if visible then elem.show() else elem.hide()
    @setRadioVisibility = _.partial(@setVisibility, @div)
    @tabla = (new Tabla("Table 2."))
      .withInputElements(@checkbox)
      .withAction(@setRadioVisibility)
      .when(true).args(true)
      .when(false).args(false)
      .build()

    @checkbox.change @tabla
    @tabla.call()

  it "div is hidden at the beginning", ->
    expect(@div).toBeHidden()

  it "div shown/hidden when the checkbox got checked/unchecked", ->
    @checkbox.trigger "click"
    expect(@div).toBeVisible()
    @checkbox.trigger "click"
    expect(@div).toBeHidden()
    @checkbox.trigger "click"
    expect(@div).toBeVisible()

describe "The support for enter/exit action.", ->
  beforeEach ->
    loadFixtures "example-2.html"
    @checkboxA = $(":input[name=\"option-a\"]")
    @checkboxB = $(":input[name=\"option-b\"]")
    @list = $("ul")
    findLetter = (l) => @list.find(":contains(\"" + l + "\")"
    doLetters = (fn, letters...) =>
      _.chain(letters).map(findLetter).each(x -> fn.call(x))
    showLetters = (letters...) -> doLetters $.fn.show, letters
    hideLetters = (letters...) -> doLetters $.fn.hide, letters
    tabla = (new Tabla("Table 2."))
      .withInputElements(@checkboxA, @checkboxB)
      .withEnterAction(showLetters)
      .withExitAction(hideLetters)
      .when(false, false).args()
      .when(false, true).args("B")
      .when(true, false).args("A")
      .when(true, true).args("A", "B", "C").startFromHere()
      .build()

    @checkboxA.change tabla
    @checkboxB.change tabla
    tabla.call()

  it "should show only D at the beginning", ->
    expect(@list.find("li:visible").text()).toBe "D"

  it "should show AD if checkboxA selected", ->
    @checkboxA.trigger "click"
    expect(@list.find("li:visible").text()).toBe "AD"

  it "should show BD if checkboxB selected", ->
    @checkboxB.trigger "click"
    expect(@list.find("li:visible").text()).toBe "BD"

  it "should show ABCD if both checkboxA and checkboxB selected", ->
    @checkboxA.trigger "click"
    @checkboxB.trigger "click"
    expect(@list.find("li:visible").text()).toBe "ABCD"
