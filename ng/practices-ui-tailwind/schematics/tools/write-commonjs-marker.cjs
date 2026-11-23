const fs = require('fs');
const path = require('path');

/**
 * The published package.json of the library declares `"type": "module"` (ng-packagr output), but the schematics are
 * compiled to CommonJS. Node (and therefore the Angular CLI) would treat the compiled `.js` files as ES modules and
 * fail with "exports is not defined in ES module scope". A nested package.json in the schematics folder switches the
 * module type back to CommonJS for everything below it.
 */
function writeCommonJsMarker(schematicsDir) {
    fs.mkdirSync(schematicsDir, { recursive: true });
    fs.writeFileSync(path.join(schematicsDir, 'package.json'), JSON.stringify({ type: 'commonjs' }, null, 2) + '\n');
}

module.exports = { writeCommonJsMarker };
