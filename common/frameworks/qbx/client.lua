local framework = {}

function framework.getPlayerName()
    local playerData <const> = exports.qbx_core:GetPlayerData()

    if playerData then
        local charinfo <const> = playerData.charinfo
        return charinfo and (charinfo.firstname .. " " .. charinfo.lastname) or "undefined"
    end

    return "undefined"
end

function framework.getGrade(job)
    return exports.qbx_core:GetGroups()[job] or false
end

return framework