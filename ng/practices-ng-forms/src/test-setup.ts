import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';

setupZoneTestEnv({
    errorOnUnknownElements: true,
    errorOnUnknownProperties: true,
});
// import {enableLogTopic} from "@nexplore/practices-ng-logging";
//
// beforeAll(() => {
//   enableLogTopic('trace')
// });

