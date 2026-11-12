const os = require('os');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execSync } = require('child_process');

// MASTER SECRET SALT - Keep this secure!
const MASTER_SECRET = 'SONAR_PRINT_STUDIO_MED_LICENSE_SECRET_KEY_2026_ELSAKKA_SECURE';

let cachedMachineId = null;

/**
 * Get a persistent, hardware-locked Machine ID for Windows & macOS
 */
function getMachineId() {
  if (cachedMachineId) return cachedMachineId;

  let machineGuid = '';
  // 1. Try Windows Registry MachineGuid (Unique per Windows installation)
  if (process.platform === 'win32') {
    try {
      const regOutput = execSync('reg query HKLM\\SOFTWARE\\Microsoft\\Cryptography /v MachineGuid', {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
        timeout: 2000
      });
      const match = regOutput.match(/MachineGuid\s+REG_SZ\s+([a-f0-9\-]+)/i);
      if (match && match[1]) {
        machineGuid = match[1].trim();
      }
    } catch (e) {
      // Ignore registry error and fallback
    }
  } else if (process.platform === 'darwin') {
    // 1b. Try macOS IOPlatformUUID (Persistent per Mac hardware)
    try {
      const ioregOutput = execSync('ioreg -rd1 -c IOPlatformExpertDevice', {
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'ignore'],
        timeout: 2000
      });
      const match = ioregOutput.match(/"IOPlatformUUID"\s*=\s*"([A-F0-9\-]+)"/i);
      if (match && match[1]) {
        machineGuid = match[1].trim();
      }
    } catch (e) {
      // Ignore ioreg error and fallback
    }
  }

  // 2. Hardware components fallback
  const cpus = os.cpus() || [];
  const cpuModel = cpus[0] ? cpus[0].model : 'CPU-GENERIC';
  const hostname = os.hostname() || 'SONAR-HOST';
  const username = os.userInfo ? (os.userInfo().username || '') : '';
  const totalMem = Math.round(os.totalmem() / (1024 * 1024 * 1024)); // in GB

  const rawSeed = `${machineGuid}|${cpuModel}|${hostname}|${username}|${totalMem}|${os.arch()}`;
  const hash = crypto.createHash('sha256').update(rawSeed).digest('hex').toUpperCase();

  // Format: SONAR-XXXX-XXXX-XXXX
  cachedMachineId = `SONAR-${hash.substring(0, 4)}-${hash.substring(4, 8)}-${hash.substring(8, 12)}`;
  return cachedMachineId;
}

/**
 * Generate an activation key for a given Machine ID
 * @param {string} machineId
 * @param {'PERPETUAL'|'TIME_LIMITED'} type
 * @param {number} daysValid
 * @returns {string} XXXX-XXXX-XXXX-XXXX
 */
function generateActivationKey(machineId, type = 'PERPETUAL', daysValid = 365) {
  const normMachine = machineId.trim().toUpperCase();
  const typeFlag = type === 'PERPETUAL' ? 'P' : 'T';

  const baseEpoch = new Date('2026-01-01').getTime();
  const now = Date.now();
  let expiryDays = 0xFFFF; // 65535 days (~180 years for perpetual)
  if (type !== 'PERPETUAL') {
    expiryDays = Math.min(0xFFFE, Math.floor((now + daysValid * 24 * 60 * 60 * 1000 - baseEpoch) / (24 * 60 * 60 * 1000)));
  }
  const expiryHex = expiryDays.toString(16).toUpperCase().padStart(4, '0');

  const dataToSign = `${normMachine}#${typeFlag}#${expiryHex}`;
  const signature = crypto.createHmac('sha256', MASTER_SECRET).update(dataToSign).digest('hex').toUpperCase();

  const rawKey = typeFlag + expiryHex + signature.substring(0, 11);
  return `${rawKey.substring(0, 4)}-${rawKey.substring(4, 8)}-${rawKey.substring(8, 12)}-${rawKey.substring(12, 16)}`;
}

/**
 * Verify an activation key against a machine ID
 */
function verifyActivationKey(machineId, key) {
  if (!key) return { valid: false, error: 'يرجى إدخال كود التفعيل' };
  const normMachine = machineId.trim().toUpperCase();
  const cleanKey = key.replace(/[^A-Za-z0-9]/g, '').toUpperCase();
  if (cleanKey.length !== 16) return { valid: false, error: 'طول كود التفعيل غير صحيح (يجب أن يكون 16 حرفاً)' };

  const typeFlag = cleanKey[0];
  const expiryHex = cleanKey.substring(1, 5);
  const sigPart = cleanKey.substring(5, 16);

  const baseEpoch = new Date('2026-01-01').getTime();
  const expiryDays = parseInt(expiryHex, 16);
  const expiryDate = new Date(baseEpoch + expiryDays * 24 * 60 * 60 * 1000);

  const dataToSign = `${normMachine}#${typeFlag}#${expiryHex}`;
  const expectedSig = crypto.createHmac('sha256', MASTER_SECRET).update(dataToSign).digest('hex').toUpperCase();

  if (sigPart !== expectedSig.substring(0, 11)) {
    return { valid: false, error: 'كود التفعيل غير مطابق لهذا الجهاز' };
  }

  const isPerpetual = typeFlag === 'P' || expiryDays === 0xFFFF;
  if (!isPerpetual && expiryDate.getTime() < Date.now()) {
    return {
      valid: false,
      error: 'انتهت صلاحية هذا الكود',
      expired: true,
      expiryDate: expiryDate.toISOString().slice(0, 10)
    };
  }

  const daysLeft = isPerpetual
    ? null
    : Math.max(0, Math.ceil((expiryDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)));

  return {
    valid: true,
    isPerpetual,
    type: isPerpetual ? 'PERPETUAL' : 'TIME_LIMITED',
    expiryDate: isPerpetual ? null : expiryDate.toISOString().slice(0, 10),
    daysLeft
  };
}

/**
 * Potential file storage paths for license (UserData with local app fallback)
 */
function getPossibleLicensePaths(app) {
  const paths = [];
  try {
    if (app && typeof app.getPath === 'function') {
      paths.push(path.join(app.getPath('userData'), 'license.dat'));
    }
  } catch (e) {}

  try {
    if (process.execPath) {
      paths.push(path.join(path.dirname(process.execPath), 'license.dat'));
    }
  } catch (e) {}

  try {
    paths.push(path.resolve(process.cwd(), 'license.dat'));
  } catch (e) {}

  return paths;
}

/**
 * Read and verify saved license status
 */
function getLicenseStatus(app) {
  const machineId = getMachineId();
  const candidatePaths = getPossibleLicensePaths(app);
  let foundPath = candidatePaths.find((p) => fs.existsSync(p));

  if (!foundPath) {
    return {
      isActivated: false,
      machineId,
      error: 'البرنامج غير مفعل'
    };
  }

  try {
    const rawContent = fs.readFileSync(foundPath, 'utf8');
    const data = JSON.parse(rawContent);

    // Verify cryptographic integrity of saved license data
    const verification = verifyActivationKey(machineId, data.activationKey);
    if (!verification.valid) {
      return {
        isActivated: false,
        machineId,
        error: verification.error,
        expired: verification.expired || false
      };
    }

    return {
      isActivated: true,
      machineId,
      licenseType: verification.type,
      isPerpetual: verification.isPerpetual,
      expiryDate: verification.expiryDate,
      daysLeft: verification.daysLeft,
      activatedAt: data.activatedAt || null,
      clientName: data.clientName || ''
    };
  } catch (err) {
    return {
      isActivated: false,
      machineId,
      error: 'خطأ في قراءة ملف الترخيص'
    };
  }
}

/**
 * Activate the software using an activation key
 */
function activateLicense(app, activationKey, clientName = '') {
  const machineId = getMachineId();
  const verification = verifyActivationKey(machineId, activationKey);

  if (!verification.valid) {
    return {
      success: false,
      error: verification.error
    };
  }

  const licenseRecord = {
    machineId,
    activationKey: activationKey.trim().toUpperCase(),
    clientName: clientName.trim(),
    activatedAt: new Date().toISOString(),
    type: verification.type,
    expiryDate: verification.expiryDate
  };

  const candidatePaths = getPossibleLicensePaths(app);
  let saved = false;
  let lastError = null;

  for (const candidatePath of candidatePaths) {
    try {
      const parentDir = path.dirname(candidatePath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }
      fs.writeFileSync(candidatePath, JSON.stringify(licenseRecord, null, 2), 'utf8');
      saved = true;
      break;
    } catch (err) {
      lastError = err;
    }
  }

  if (!saved) {
    return {
      success: false,
      error: 'تعذر حفظ ملف الترخيص: ' + (lastError ? lastError.message : 'Permission Denied')
    };
  }

  return {
    success: true,
    license: {
      isActivated: true,
      machineId,
      licenseType: verification.type,
      isPerpetual: verification.isPerpetual,
      expiryDate: verification.expiryDate,
      daysLeft: verification.daysLeft,
      clientName: clientName.trim()
    }
  };
}

/**
 * Deactivate or reset license (for developer testing or re-licensing)
 */
function deactivateLicense(app) {
  const candidatePaths = getPossibleLicensePaths(app);
  let removedCount = 0;
  for (const p of candidatePaths) {
    try {
      if (fs.existsSync(p)) {
        fs.unlinkSync(p);
        removedCount++;
      }
    } catch (e) {}
  }
  return { success: true, removedCount };
}

module.exports = {
  MASTER_SECRET,
  getMachineId,
  generateActivationKey,
  verifyActivationKey,
  getLicenseStatus,
  activateLicense,
  deactivateLicense
};
