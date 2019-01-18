import { expect } from 'chai';
import { describe, it } from 'mocha';
import * as sinon from 'sinon';

import * as localforage from 'localforage';

export const localforageStub = sinon.stub(localforage);
