
describe('Module, ProcessFiles', function () {

    var injected = {
        method:         processFiles,
        exec:           undefined
    };


    // execute
    beforeEach(function() {

        injected.exec = injected.method({
            files:['test.js']
        });
    });


    // is it defined
    it('should be a defined module', function () {

        expect(injected.method).toBeDefined();
    });


    // does it return an array
    it('should return an array of objects', function () {

        expect(injected.exec.length).toEqual(1);
    });


    // does it return expected properties
    it('should have defined properties on the first object', function () {

        var arr = injected.exec;

        expect(typeof arr[0].id).toEqual('string');

        expect(arr[0].wait).toEqual([]);

        expect(arr[0].cache).toEqual(true);

        expect(typeof arr[0].file).toEqual('string');

        expect(typeof arr[0].type).toEqual('string');

        expect(arr[0].success).toEqual(null);

        expect(arr[0].error).toEqual(null);

        expect(arr[0].timeout).toEqual(10000);

    });

});