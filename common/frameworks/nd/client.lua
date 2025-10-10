local framework = {}

function framework.getPlayerName()
    local player <const> = exports.ND_Core:getPlayer()
    
    if player then
        return {
            firstName = player.firstname,
            lastName = player.lastname
        }
    end

    return {}
end

function framework.hasJob(job)
    local player <const> = exports.ND_Core:getPlayer()
    return player and player.groups[job] or false
end

return framework