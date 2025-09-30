local framework = {}

function framework.getPlayerName()
    local charinfo <const> = exports["qb-core"]:GetPlayerData().charinfo
    return {
        firstName = charinfo.firstname,
        lastName = charinfo.lastname
    }
end

function framework.hasJob(job)
    return exports["qb-core"]:GetPlayerData().job.name == job
end

return framework