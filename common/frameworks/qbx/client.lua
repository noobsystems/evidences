local framework = {}

function framework.getPlayerName()
    local playerData <const> = exports.qbx_core:GetPlayerData()

    if playerData then
        local charinfo <const> = playerData.charinfo

        if charinfo then
            return {
                firstName = charinfo.firstname,
                lastName = charinfo.lastname
            }
        end
    end

    return {}
end

function framework.hasJob(job)
    return exports.qbx_core:HasGroup(job)
end

return framework