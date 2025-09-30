local framework = {}
local ox = require "@ox_core.lib.init"

function framework.getPlayerName()
    local oxPlayer <const> = ox.GetPlayer()
    return {
        firstName = oxPlayer.get("firstName"),
        lastName = oxPlayer.get("lastName")
    }
end

function framework.hasJob(job)
    return Ox.GetPlayer().getGroups()[job]
end

return framework