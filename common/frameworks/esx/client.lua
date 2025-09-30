local framework = {}
local ESX <const> = exports.es_extended:getSharedObject()

function framework.getPlayerName()
    local playerData <const> = ESX.PlayerData
    return {
        firstName = playerData.firstName,
        lastName = playerData.lastName
    }
end

function framework.hasJob(job)
    return ESX.PlayerData.job.name == job
end

return framework