local framework = {}
local ESX <const> = exports.es_extended:getSharedObject()

function framework.getIdentifier(playerId)
    local xPlayer <const> = ESX.GetPlayerFromId(playerId)
    return xPlayer and xPlayer.identifier or nil
end

return framework
