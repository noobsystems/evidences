local logger <const> = require "server.logger"
local biometricsProvider <const> = require "server.biometrics.biometrics_provider"
local linkedBiometrics <const> = require "server.biometrics.linked_biometrics"

lib.callback.register("evidences:scanFingerprint", function(scanningPlayerId, playerHoldingScanner)
    local fingerprint = biometricsProvider.getFingerprint(scanningPlayerId) -- correct/real fingerprint
    local citizen = linkedBiometrics.getCitizenLinkedToBiometricData("fingerprint", fingerprint) -- citizen linked to the fingerprint (can be a different one)

    TriggerClientEvent("evidences:fingerprintScanned", playerHoldingScanner, citizen)

    if citizen and citizen.success then
        logger.log(playerHoldingScanner, "Fingerprint scanned", { scanningPlayerId = scanningPlayerId, fingerprint = fingerprint })
        return true
    end

    return false
end)