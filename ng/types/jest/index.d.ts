import {
    afterAll as jestAfterAll,
    afterEach as jestAfterEach,
    beforeAll as jestBeforeAll,
    beforeEach as jestBeforeEach,
    describe as jestDescribe,
    it as jestIt,
    jest as jestObject,
    test as jestTest,
} from '@jest/globals';

type JestGlobalWithLooseMocks = Omit<typeof jestObject, 'fn'> & {
    fn<T extends (...args: any[]) => any = (...args: any[]) => any>(implementation?: T): any;
};

declare global {
    const afterAll: typeof jestAfterAll;
    const afterEach: typeof jestAfterEach;
    const beforeAll: typeof jestBeforeAll;
    const beforeEach: typeof jestBeforeEach;
    const describe: typeof jestDescribe;
    const expect: any;
    const it: typeof jestIt;
    const jest: JestGlobalWithLooseMocks;
    const test: typeof jestTest;
}

export {};
