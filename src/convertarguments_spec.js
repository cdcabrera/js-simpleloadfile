
describe('Module, ConvertArguments', function () {



    var injected = {
        method:         convertArguments,
        exec:           undefined
    };



    // execute
    beforeEach(function() {

        injected.exec = injected.method('test.js','test-again.js', ['test-yet-again.js']);
    });



    // is it defined
    it('should be a defined module', function () {

        expect(injected.method).toBeDefined();
    });



    // does it return an array
    it('should return an array', function () {

        expect(injected.exec.length).toEqual(3);
    });

});