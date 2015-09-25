
describe('Module, Queue', function () {

    var injected = {
        method:         queue,
        exec:           queue,
        check:          undefined
    };


    // execute
    beforeEach(function() {

        injected.check = injected.exec.check( processFiles('test.js') );
    });


    // is it defined
    it('should be a defined module', function () {

        expect(injected.method).toBeDefined();
    });


    // does it have methods
    it('should have specific methods', function () {

        expect(injected.exec.check).toBeDefined();

        expect(injected.exec.update).toBeDefined();
    });


    // does the defined method allow chained methods
    it('should have a single chained method', function () {

        expect(injected.exec.update().check).toBeDefined();
    });


    // does it return a value
    it('should return an empty array', function () {

        var val = injected.check;

        expect(val).toEqual([]);
    });

});