local framework = {}
local ox = require "@ox_core.lib.init"

function framework.getIdentifier(playerId)
    local oxPlayer <const> = ox.GetPlayer(playerId)
    return oxPlayer and oxPlayer.charId or nil
end

return framework