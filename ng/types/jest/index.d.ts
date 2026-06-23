import {
    afterAll as jestAfterAll,
    afterEach as jestAfterEach,
    beforeAll as jestBeforeAll,
    beforeEach as jestBeforeEach,
    describe as jestDescribe,
    expect as jestExpect,
    it as jestIt,
    jest as jestObject,
    test as jestTest,
} from '@jest/globals';

declare global {
    const afterAll: typeof jestAfterAll;
    const afterEach: typeof jestAfterEach;
    const beforeAll: typeof jestBeforeAll;
    const beforeEach: typeof jestBeforeEach;
    const describe: typeof jestDescribe;
    const expect: typeof jestExpect;
    const it: typeof jestIt;
    const jest: typeof jestObject;
    const test: typeof jestTest;
}

export {};
