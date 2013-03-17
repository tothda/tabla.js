describe("Tabla", function(){
  beforeEach(function(){
    loadFixtures('example-1.html');
  });

  it("should be instantiated without arguments", function(){
    new Tabla();
    expect(new Tabla()).not.toBe(null);
  });
});