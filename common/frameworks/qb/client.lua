local framework = {}
local QBCore <const> = exports["qb-core"]:GetCoreObject()

function framework.getPlayerName()
    local playerData <const> = QBCore.Functions.GetPlayerData()

    if playerData then
        local charinfo <const> = playerData.charinfo
        return charinfo and (charinfo.firstname .. " " .. charinfo.lastname) or "undefined"
    end

    return "undefined"
end

function framework.getGrade(job)
    local playerData <const> = QBCore.Functions.GetPlayerData()

    if playerData then
        if playerData.job then
            return playerData.job.name == job and playerData.job.grade.level or false
        end
    end

    return false
end

return framework