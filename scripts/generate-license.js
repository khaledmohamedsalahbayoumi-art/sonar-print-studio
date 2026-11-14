/**
 * CLI License Key Generator for Printify
 * Usage:
 *   node scripts/generate-license.js <MACHINE_ID> [TYPE] [DAYS]
 * Example:
 *   node scripts/generate-license.js PRINT-1185-3802-996B perpetual
 *   node scripts/generate-license.js PRINT-1185-3802-996B year 365
 */

const { generateActivationKey, getMachineId } = require('../electron/licenseManager');

const args = process.argv.slice(2);
let machineId = args[0];

if (!machineId) {
  // If no machine ID passed, use this machine's own ID
  machineId = getMachineId();
  console.log('\n[!] No Machine ID provided. Using current machine ID: ' + machineId);
}

const rawType = (args[1] || 'perpetual').toLowerCase();
const isPerp = rawType === 'perpetual' || rawType === 'perp' || rawType === 'p';
let days = 36500;
if (!isPerp) {
  if (rawType === 'day' || rawType === '1') {
    days = 1;
  } else if (rawType === 'month' || rawType === '30') {
    days = 30;
  } else {
    days = parseInt(args[2] || args[1], 10) || 365;
  }
}
const type = isPerp ? 'PERPETUAL' : 'TIME_LIMITED';

const key = generateActivationKey(machineId, type, days);

console.log('\n======================================================');
console.log('   PRINTIFY - LICENSE KEY GENERATOR');
console.log('======================================================');
console.log('  Machine ID:     ' + machineId.toUpperCase());
console.log('  License Type:   ' + (isPerp ? 'دائم مدى الحياة (Perpetual)' : `محدد المدة (${days} يوم)`));
console.log('------------------------------------------------------');
console.log('  ACTIVATION KEY: \x1b[32m\x1b[1m' + key + '\x1b[0m');
console.log('======================================================\n');

