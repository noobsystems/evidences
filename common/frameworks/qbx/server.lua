local framework = {}

function framework.getIdentifier(playerId)
    local player <const> = exports.qbx_core:GetPlayer(playerId).PlayerData
    return player and player.cid .. ":" .. player.citizenid or nil
end

return framework