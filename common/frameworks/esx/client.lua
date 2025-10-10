local framework = {}
local ESX <const> = exports.es_extended:getSharedObject()

RegisterNetEvent("esx:playerLoaded", function(xPlayer)
    ESX.PlayerData = xPlayer
end)

function framework.getPlayerName()
    local playerData <const> = ESX.PlayerData
    
    if playerData then
        return {
            firstName = playerData.firstName,
            lastName = playerData.lastName
        }
    end

    return {}
end

function framework.hasJob(job)
    local playerData <const> = ESX.PlayerData

    if playerData then
        if playerData.job then
            return playerData.job.name == job
        end
    end

    return false
end

return framework