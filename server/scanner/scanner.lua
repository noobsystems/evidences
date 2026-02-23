local logger <const> = require "server.logger"
local biometricsProvider <const> = require "server.biometrics.biometrics_provider"
local linkedBiometrics <const> = require "server.biometrics.linked_biometrics"

lib.callback.register("evidences:scanFingerprint", function(scanningPlayerId, pedHoldingScanner)
    local fingerprint = biometricsProvider.getFingerprint(scanningPlayerId) -- correct/real fingerprint
    local citizen = linkedBiometrics.getCitizenLinkedToBiometricData("fingerprint", fingerprint) -- citizen linked to the fingerprint (can be a different one)

    if citizen and citizen.success then TriggerClientEvent("evidences:fingerprintScanned", pedHoldingScanner, citizen)
    logger.log(scanningPlayerId, "A fingerprint has been scanned. The fingerprint is "..fingerprint.."", "scanner", "info", "Fingerprint scanned", {fingerprint}) end
    return citizen and citizen.success == false or false
end)