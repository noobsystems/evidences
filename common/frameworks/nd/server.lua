local framework = {}

function framework.getIdentifier(playerId)
    local player <const> = exports.ND_Core:getPlayer(playerId)
    return player and player.id or nil
end

return framework