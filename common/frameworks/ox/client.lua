local ox <const> = require "@ox_core.lib.init"

local framework = {}

function framework.getPlayerName()
    local oxPlayer <const> = ox.GetPlayer()
    return oxPlayer and oxPlayer.get("name") or "undefined"
end

function framework.getGrade(job)
    local oxPlayer <const> = ox.GetPlayer()
    return oxPlayer and oxPlayer.getGroups()[job] or false
end

return framework