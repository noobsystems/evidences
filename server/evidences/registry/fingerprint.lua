local eventHandler <const> = require "common.events.handler"
local api <const> = require "server.evidences.api"

-- Add fingerprints on the fingerprint_scanner item everytime a player is scanning their fingerprint
lib.callback.register("evidences:scanner:scan", function(fingerprintedPlayerId, scanningPlayerId)
    local evidence <const> = api.get(api.evidenceTypes.FINGERPRINT, fingerprintedPlayerId)
    if evidence then
        evidence:atLastUsedItemOf(scanningPlayerId)
        TriggerClientEvent("evidences:scanner:scanned", scanningPlayerId)
        return true
    end

    return false
end)