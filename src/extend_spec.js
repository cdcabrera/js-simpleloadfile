
describe('Module, Extend', function () {



    var injected = {
        method:         extend,
        exec:           undefined
    };



    // execute
    beforeEach(function() {

        injected.exec = injected.method(
            { file:'test.js' },
            { arr: ['one','two'] },
            { file:'test-replacement.js' },
            { num: 1200 },
            { date: new Date() },
            { bool: false }
        );
    });



    // is it defined
    it('should be a defined module', function () {

        expect(injected.method).toBeDefined();
    });



    // does it return an object
    it('should return an object with defined properties', function () {

        expect(injected.exec.file).toEqual('test-replacement.js');

        expect(injected.exec.arr.length).toEqual(2);

        expect(injected.exec.num).toEqual(1200);

        expect(injected.exec.date).toBeDefined();

        expect(injected.exec.bool).toEqual(false);
    });

});