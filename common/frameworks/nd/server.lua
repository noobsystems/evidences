local framework = {}

function framework.getIdentifier(playerId)
    local player <const> = NDCore.getPlayer(playerId)
    return player and player.id or nil
end

return framework