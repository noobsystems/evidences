local framework = {}
local ESX <const> = exports.es_extended:getSharedObject()

RegisterNetEvent("esx:playerLoaded", function(xPlayer)
    ESX.PlayerData = xPlayer
end)

RegisterNetEvent("esx:setJob", function(job)
    if ESX.PlayerData then
        ESX.PlayerData.job = job
    end
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

function framework.getGrade(job)
    local playerData <const> = ESX.PlayerData

    if playerData then
        if playerData.job then
            return playerData.job.name == job and playerData.job.grade or false
        end
    end

    return false
end

return framework