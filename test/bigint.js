var should = require('should');
var jspack = require('../jspack.js').jspack;

describe('Test long integration (examples):', function () {

  // Demonstrating using the BigInt primitive for numbers that don't fit in the basic Number primitive.
  // BigInt is a standard browser primitive supported by all major browsers circa 2020
  // Using BigInts, this package no longer needs to return an array of High/Low bytes.
  //
  // Unpacking a long results in a 3 part array containing [low, high, unsigned] bits and flag.
  // The decoded value can be applied directly to Long.fromBits()
  //
  // Test number u            228290380562207 (BE: 0x00, 0x00, 0xcf, 0xa0, 0xff, 0x09, 0xff, 0x1f)
  //                                          (LE: 0x1f, 0xff, 0x09, 0xff, 0xa0, 0xcf, 0x00, 0x00)
  // Test number s           -228290380562207 (BE: 0xff, 0xff, 0x30, 0x5f, 0x00, 0xf6, 0x00, 0xe1)
  //                                          (LE: 0xe1, 0x00, 0xf6, 0x00, 0x5f, 0x30, 0xff, 0xff)

  it('pack <Q', function () {
    var num = 228290380562207n

    var buf = jspack.Pack('<Q', [num]);

    buf.should.be.eql([0x1f, 0xff, 0x09, 0xff, 0xa0, 0xcf, 0x00, 0x00]);
  });

  it('unpack <Q', function () {
    var testNum = 0x0000cfa0ff09ff1fn; // unsigned
    var buf = jspack.Unpack('<Q', [0x1f, 0xff, 0x09, 0xff, 0xa0, 0xcf, 0x00, 0x00]);
    buf.length.should.be.eql(1);
    buf[0].should.be.eql(testNum);
  });

  it('pack <q', function () {
    //var num = new Long(0x00f600e1, 0xffff305f, true);
    var num = -228290380562207n; // signed

    var buf = jspack.Pack('<q', [num]);

    buf.should.be.eql([0xe1, 0x00, 0xf6, 0x00, 0x5f, 0x30, 0xff, 0xff]);
  });

  it('unpack <q', function () {
    var testNum = 0xffff305f00f600e1n; // signed
    var buf = jspack.Unpack('<q', [0xe1, 0x00, 0xf6, 0x00, 0x5f, 0x30, 0xff, 0xff]);
    buf.length.should.be.eql(1);
    buf[0].should.be.eql(testNum);
  });

});
describe('Test signed/unsigned int64:', function () {

  // Number 0xffa0ffe1ffff, packed with Python struct:
  // little endian:
  // 0xff, 0xff, 0xe1, 0xff, 0xa0, 0xff, 0x00, 0x00
  // big endian:
  // 0x00, 0x00, 0xff, 0xa0, 0xff, 0xe1, 0xff, 0xff

  it('pack <Q', function () {
    var buf = jspack.Pack('<Q', [0xffa0ffe1ffffn]);
    buf.should.be.eql([0xff, 0xff, 0xe1, 0xff, 0xa0, 0xff, 0x00, 0x00]);
  });

  it('pack >Q', function () {
    var buf = jspack.Pack('>Q', [0xffa0ffe1ffffn]);
    buf.should.be.eql([0x00, 0x00, 0xff, 0xa0, 0xff, 0xe1, 0xff, 0xff]);
  });

  it('unpack <Q', function () {
    var buf = jspack.Unpack('<Q', [0xff, 0xff, 0xe1, 0xff, 0xa0, 0xff, 0x00, 0x00]);
    buf.length.should.be.eql(1);
    buf[0].should.be.eql(0xffa0ffe1ffffn);
  });

  it('unpack >Q', function () {
    var buf = jspack.Unpack('>Q', [0x00, 0x00, 0xff, 0xa0, 0xff, 0xe1, 0xff, 0xff]);
    buf.length.should.be.eql(1);
    buf[0].should.be.eql(0xffa0ffe1ffffn);
  });

  // Test lower-case q as well. This only test the matching of the caracter and the unsigned bit,
  // the parsing is the same as for upper-case Q (since we don't actually convert to a number).
  it('pack >q (signed)', function () {
    var buf = jspack.Pack('>q', [0xffa0ffe1ffffn]);
    buf.should.be.eql([0x00, 0x00, 0xff, 0xa0, 0xff, 0xe1, 0xff, 0xff]);
  });

  it('unpack <q (signed)', function () {
    var buf = jspack.Unpack('<q', [0xff, 0xff, 0xe1, 0xff, 0xa0, 0xff, 0x00, 0x00]);
    buf.length.should.be.eql(1);
    buf[0].should.be.eql(0xffa0ffe1ffffn);
  });

});

describe('Boundary tests:', function () {

  it('unpack >Q full', function () {
    var buf = jspack.Unpack('>Q', [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
    buf.length.should.be.eql(1);
    buf[0].should.be.eql(0xFFFFFFFFFFFFFFFFn);
  });

  it('pack >Q full', function () {
    var buf = jspack.Pack('>Q', [0xffffffffffffffffn]);
    buf.should.be.eql([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
  });

  it('unpack <Q full', function () {
    var buf = jspack.Unpack('<Q', [0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
    buf.length.should.be.eql(1);
    buf[0].should.be.eql(0xffffffffffffffffn);
  });

  it('pack <Q full', function () {
    var buf = jspack.Pack('<Q', [0xffffffffffffffffn]);
    buf.should.be.eql([0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff]);
  });

  it('unpack >Q zero', function () {
    var buf = jspack.Unpack('>Q', [0, 0, 0, 0, 0, 0, 0, 0]);
    buf.length.should.be.eql(1);
    buf[0].should.be.eql(0n);
  });

  it('pack >Q zero', function () {
    var buf = jspack.Pack('>Q', [0n]);
    buf.should.be.eql([0, 0, 0, 0, 0, 0, 0, 0]);

    buf = jspack.Pack('>Q', [0]);
    buf.should.be.eql([0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('unpack <Q zero', function () {
    var buf = jspack.Unpack('<Q', [0, 0, 0, 0, 0, 0, 0, 0]);
    buf.length.should.be.eql(1);
    buf[0].should.be.eql(0n);
  });

  it('pack <Q zero', function () {
    var buf = jspack.Pack('<Q', [0]);
    buf.should.be.eql([0, 0, 0, 0, 0, 0, 0, 0]);

    buf = jspack.Pack('<Q', [0n]);
    buf.should.be.eql([0, 0, 0, 0, 0, 0, 0, 0]);
  });

  it('unpack >Q one', function () {
    var buf = jspack.Unpack('>Q', [1, 1, 1, 1, 1, 1, 1, 1]);
    buf.length.should.be.eql(1);
    buf[0].should.be.eql(0x0101010101010101n);
  });

  it('pack >Q one', function () {
    var buf = jspack.Pack('>Q', [0x0101010101010101n]);
    buf.should.be.eql([1, 1, 1, 1, 1, 1, 1, 1]);
  });

  it('unpack <Q one', function () {
    var buf = jspack.Unpack('<Q', [1, 1, 1, 1, 1, 1, 1, 1]);
    buf.length.should.be.eql(1);
    buf[0].should.be.eql(0x0101010101010101n);
  });

  it('pack <Q one', function () {
    var buf = jspack.Pack('<Q', [0x0101010101010101n]);
    buf.should.be.eql([1, 1, 1, 1, 1, 1, 1, 1]);
  });

  it('unpack >Q 0xfe', function () {
    var buf = jspack.Unpack('>Q', [0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe]);
    buf.length.should.be.eql(1);
    buf[0].should.be.eql(0xfefefefefefefefen);
  });

  it('pack >Q 0xfe', function () {
    var buf = jspack.Pack('>Q', [0xfefefefefefefefen]);
    buf.should.be.eql([0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe]);
  });

  it('unpack <Q 0xfe', function () {
    var buf = jspack.Unpack('<Q', [0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe]);
    buf.length.should.be.eql(1);
    buf[0].should.be.eql(0xfefefefefefefefen);
  });

  it('pack <Q 0xfe', function () {
    var buf = jspack.Pack('<Q', [0xfefefefefefefefen]);
    buf.should.be.eql([0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe, 0xfe]);
  });

});
