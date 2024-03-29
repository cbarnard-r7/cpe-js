const chai = require('chai');

const CPE2_3_URI = require('../src/CPE2_3_URI');
const { AttributeError, GrammarError } = require('../src/Errors/index');

describe('CPE2_3_URI.js', function () {
  describe('Grammar', function () {
    it('should throw a grammar error if the CPE string is invalid', function () {
      const exprs = [
        'foo',
        'bar',
        '',
        'shtjryk75i6u4q5yehrtangmshtu,el687ke5wjyrsmhfdg,ukyjrsthsryj',
        '0',
        'true',
        'a:microsoft:internet_explorer:8.%02:sp%01',
      ];

      exprs.forEach((expr) => chai.expect(() => new CPE2_3_URI(exprs[0])).to.throw(GrammarError));
    });
  });

  describe('#constructor()', function () {
    it('should create a CPE2_3URI object with a valid string expression', function () {
      const exprs = [
        'cpe:/a',
        'cpe:/a:microsoft',
        'cpe:/a:microsoft:internet_explorer',
        'cpe:/a:microsoft:internet_explorer:8.%02',
        'cpe:/a:microsoft:internet_explorer:8.%02:sp%01',
        'cpe:/a:microsoft:internet_explorer:8.%02:sp%01:something',
        'cpe:/a:%240.99_kindle_books_project:%240.99_kindle_books:6::~~~android~~',
        'cpe:/a:adbnewssender_project:adbnewssender:1.0.0:::de',
      ];

      try {
        exprs.forEach((expr) => chai.expect(new CPE2_3_URI(expr), `${expr} failed to parse`).to.be.an.instanceof(CPE2_3_URI));
      } catch (e) {
        chai.assert.fail(`Expression threw an Error: ${e}`);
      }
    });
  });

  describe('#getAttributeValues()', function () {
    it('should properly extract fields from URI expressions', function () {
      let expr = 'cpe:/a:microsoft:internet_explorer:8.%02:sp%01';

      let cpe = new CPE2_3_URI(expr);
      chai.expect(cpe.getAttributeValues('part')).to.equal('a');
      chai.expect(cpe.getAttributeValues('vendor')).to.equal('microsoft');
      chai.expect(cpe.getAttributeValues('product')).to.equal('internet_explorer');
      chai.expect(cpe.getAttributeValues('version')).to.equal('8.%02');
      chai.expect(cpe.getAttributeValues('update')).to.equal('sp%01');
      chai.expect(cpe.getAttributeValues('edition')).to.equal('ANY');
      chai.expect(cpe.getAttributeValues('lang')).to.equal('ANY');

      expr = 'cpe:/';

      cpe = new CPE2_3_URI(expr);
      chai.expect(cpe.getAttributeValues('part')).to.equal('ANY');
      chai.expect(cpe.getAttributeValues('vendor')).to.equal('ANY');
      chai.expect(cpe.getAttributeValues('product')).to.equal('ANY');
      chai.expect(cpe.getAttributeValues('version')).to.equal('ANY');
      chai.expect(cpe.getAttributeValues('update')).to.equal('ANY');
      chai.expect(cpe.getAttributeValues('edition')).to.equal('ANY');
      chai.expect(cpe.getAttributeValues('lang')).to.equal('ANY');

      expr = 'cpe:/a:b:c:d:e:f:gh';

      cpe = new CPE2_3_URI(expr);
      chai.expect(cpe.getAttributeValues('part')).to.equal('a');
      chai.expect(cpe.getAttributeValues('vendor')).to.equal('b');
      chai.expect(cpe.getAttributeValues('product')).to.equal('c');
      chai.expect(cpe.getAttributeValues('version')).to.equal('d');
      chai.expect(cpe.getAttributeValues('update')).to.equal('e');
      chai.expect(cpe.getAttributeValues('edition')).to.equal('f');
      chai.expect(cpe.getAttributeValues('lang')).to.equal('gh');
    });

    it('should return an error if the attribute name is invalid', function () {
      const expr = 'cpe:/a:b:c:d';
      const cpe = new CPE2_3_URI(expr);

      chai.expect(() => cpe.getAttributeValues('foo').to.throw(AttributeError));
    });
  });

  describe('#generateCpeStringFromAttributes()', function () {
    it('should create a valid CPE string from an attribute dictionary', function () {
      const testAttrs = {
        part: 'a',
        vendor: 'b',
        product: 'c',
        version: 'd',
        update: 'e',
        edition: 'f',
        lang: 'g',
      };

      chai.expect(CPE2_3_URI.generateCpeStringFromAttributes(testAttrs)).to.equal('cpe:/a:b:c:d:e:f:g');
    });

    it('should trim missing trailing values', function () {
      let testAttrs = {
        part: 'a',
        vendor: 'b',
        product: 'c',
        version: 'd',
        update: 'e',
        edition: 'f',
      };

      chai.expect(CPE2_3_URI.generateCpeStringFromAttributes(testAttrs)).to.equal('cpe:/a:b:c:d:e:f');

      testAttrs = {
        part: 'a',
        vendor: 'b',
      };

      chai.expect(CPE2_3_URI.generateCpeStringFromAttributes(testAttrs)).to.equal('cpe:/a:b');
    });

    it('should fill in missing values with asterisks', function () {
      let testAttrs = {
        part: 'a',
        update: 'e',
        edition: 'f',
      };

      chai.expect(CPE2_3_URI.generateCpeStringFromAttributes(testAttrs)).to.equal('cpe:/a:*:*:*:e:f');

      testAttrs = {
        part: 'a',
        product: 'c',
        update: 'e',
      };

      chai.expect(CPE2_3_URI.generateCpeStringFromAttributes(testAttrs)).to.equal('cpe:/a:*:c:*:e');
    });

    it('should replace ANY keyword with an asterisk', function () {
      const testAttrs = {
        part: 'a',
        update: 'ANY',
        edition: 'f',
      };

      chai.expect(CPE2_3_URI.generateCpeStringFromAttributes(testAttrs)).to.equal('cpe:/a:*:*:*:*:f');
    });
  });

  describe('#parseCpeString()', function () {
    it('should parse a valid CPE string and turn it into attrs', function () {
      const expr = 'cpe:/a:b:c';

      const expected = {
        prefix: 'cpe:/',
        part: 'a',
        vendor: 'b',
        product: 'c',
      };

      chai.expect(CPE2_3_URI.parseCpeString(expr)).to.deep.equal(expected);
    });
  });
});
