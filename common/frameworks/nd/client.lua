local framework = {}

function framework.getPlayerName()
    local player <const> = exports.ND_Core:getPlayer()
    return {
        firstName = player.firstname,
        lastName = player.lastname
    }
end

function framework.hasJob(job)
    return exports.ND_Core:getPlayer().groups[job] 
end

return framework