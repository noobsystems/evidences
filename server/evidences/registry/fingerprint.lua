local eventHandler <const> = require "common.events.handler"
local api <const> = require "server.evidences.api"

-- Add fingerprints to weapons
-- Only add fingerprints to weapons, as adding them to other items would prevent stacking them
-- This is because fingerprints are stored in the item's metadata and item's with different metadata cannot be stacked
eventHandler.onLocal("ox_inventory:usedItem", function(event)
    local playerId <const>, name <const>, slotId <const>, metadata <const> = table.unpack(event.arguments)
    if string.sub(string.lower(name), 1, #"weapon") == "weapon" then
        api.get(api.evidenceTypes.FINGERPRINT, playerId):atItem(playerId, slotId)
    end
end)

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