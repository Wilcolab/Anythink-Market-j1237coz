// frontend.test.js - Unit tests for calculator frontend logic
// Uses Mocha and Chai for assertions. Run with a browser-based test runner or jsdom.

const { expect } = chai;

describe('Calculator Frontend Logic', function() {
    beforeEach(function() {
        value = 0;
        operand1 = 0;
        operand2 = 0;
        operation = null;
        state = states.start;
    });

    it('should set value correctly', function() {
        setValue(42);
        expect(getValue()).to.equal(42);
    });

    it('should handle numberPressed', function() {
        numberPressed('5');
        expect(getValue()).to.equal('5');
        numberPressed('3');
        expect(getValue()).to.equal('53');
    });

    it('should handle decimalPressed', function() {
        numberPressed('1');
        decimalPressed();
        expect(getValue()).to.equal('1.');
        numberPressed('2');
        expect(getValue()).to.equal('1.2');
    });

    it('should handle signPressed', function() {
        setValue(5);
        signPressed();
        expect(getValue()).to.equal(-5);
    });

    it('should clear on clearPressed', function() {
        setValue(99);
        clearPressed();
        expect(getValue()).to.equal(0);
    });

    it('should handle operationPressed and equalPressed for addition', function(done) {
        setValue(7);
        operationPressed('+');
        setValue(3);
        // Mock calculate to test logic without backend
        const oldCalculate = calculate;
        calculate = (a, b, op) => {
            expect(a).to.equal(7);
            expect(b).to.equal(3);
            expect(op).to.equal('+');
            calculate = oldCalculate;
            done();
        };
        equalPressed();
    });
});
