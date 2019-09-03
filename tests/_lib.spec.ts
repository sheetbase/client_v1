import * as sinon from 'sinon';
import * as localforage from 'localforage';

// dom
import 'jsdom-global/register';

// localforage
export const localforageCreateInstanceStub = sinon.stub(localforage, 'createInstance');
