local database <const> = require "server.database"
local ox = require "@ox_core.lib.init"

local framework = {}

function framework.getIdentifier(playerId)
    local oxPlayer <const> = ox.GetPlayer(playerId)
    return oxPlayer and oxPlayer.charId
end

function framework.getPlayerName(playerId)
    local oxPlayer <const> = ox.GetPlayer(playerId)

    return oxPlayer and oxPlayer.get("name") or "undefined"
end

function framework.getGrade(job, playerId)
    local oxPlayer <const> = ox.GetPlayer(playerId)
    return oxPlayer and oxPlayer.getGroups()[job] or false
end

-- https://github.com/CommunityOx/ox_core/blob/main/sql/install.sql
function framework.getCitizens(searchText, offset)
    local pattern <const> = "%" .. searchText:sub(1, 25):gsub("\\", "\\\\"):gsub("%%", "\\%%"):gsub("_", "\\_") .. "%"

    return database.query(
        [[
            SELECT
                charId AS identifier,
                fullName,
                dateOfBirth AS birthdate,
                gender
            FROM characters
            WHERE deleted IS NULL AND fullName LIKE ?
            LIMIT 10 OFFSET ?
        ]],
        pattern, offset
    )
end

function framework.getCitizen(identifier)
    return database.selectFirstRow(
        [[
            SELECT
                charId AS identifier,
                fullName,
                dateOfBirth AS birthdate,
                gender
            FROM characters
            WHERE charId = ?
        ]],
        identifier
    )
end

return framework