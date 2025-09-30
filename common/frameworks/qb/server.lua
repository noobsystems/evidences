local framework = {}

function framework.getIdentifier(playerId)
    local player <const> = exports["qb-core"]:GetPlayer(playerId)
    return player and player.cid .. ":" .. player.citizenid or nil
end

return framework