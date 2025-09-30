local framework = {}

function framework.getPlayerName()
    local charinfo <const> = exports.qbx_core:GetPlayerData().charinfo
    return {
        firstName = charinfo.firstname,
        astName = charinfo.lastname
    }
end

function framework.hasJob(job)
    return exports.qbx_core:HasGroup(job)
end

return framework