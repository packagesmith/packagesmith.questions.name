import chai from 'chai';
import chaiSpies from 'chai-spies';
chai.use(chaiSpies).should();
import fileSystem from 'fs-promise';
import nameQuestion from '../src/';
describe('nameQuestion', () => {

  it('returns an object with expected keys', () => {
    nameQuestion()
      .should.be.an('object')
      .with.keys([ 'name', 'message', 'default', 'when' ]);
  });

  describe('default function', () => {
    let defaultFunction = null;
    beforeEach(() => {
      defaultFunction = nameQuestion().default;
    });

    it('returns the basename of the given path', () => {
      defaultFunction({}, '/foo/bar').should.equal('bar');
      defaultFunction({}, '/path/to/my-project').should.equal('my-project');
    });

  });

  describe('when function', () => {
    let whenFunction = null;
    beforeEach(() => {
      whenFunction = nameQuestion().when;
      fileSystem.readFile = chai.spy(() => '{"foo":"bar"}');
    });

    it('returns false if `name` is in answers object', async function () {
      (await whenFunction({ name: 'foo' }, '/foo/bar')).should.equal(false);
      fileSystem.readFile.should.not.have.been.called();
    });

    it('reads package.json if name is not in answers', async function () {
      (await whenFunction({}, '/foo/bar'));
      fileSystem.readFile.should.have.been.called(1).with.exactly('/foo/bar/package.json', 'utf8');
    });

    it('returns false and mutates answers if `name` is in package.json', async function () {
      const answers = {};
      fileSystem.readFile = chai.spy(() => '{"name":"bar"}');
      (await whenFunction(answers, '/foo/bar')).should.equal(false);
      answers.should.have.property('name', 'bar');
    });

    it('returns true if `name` is not in package.json', async function () {
      const answers = {};
      (await whenFunction(answers, '/foo/bar')).should.equal(true);
      answers.should.not.have.property('name');
    });

    it('returns true if reading package.json causes error', async function () {
      const answers = {};
      fileSystem.readFile = chai.spy(() => {
        throw new Error('foo');
      });
      (await whenFunction(answers, '/foo/bar')).should.equal(true);
      answers.should.not.have.property('name');
    });

  });

});
