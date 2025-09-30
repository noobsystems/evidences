local api <const> = require "server.evidences.api"

local translations <const> = {
    -- all evidences
    crimeScene = locale("evidences.information.metadata.crime_scene"),
    collectionTime = locale("evidences.information.metadata.collection_time"),
    additionalData = locale("evidences.information.metadata.additionalData"),

    -- magazines
    weaponLabel = locale("evidences.information.metadata.weapon_label"),
    serialNumber = locale("evidences.information.metadata.serial_number"),

    -- database information
    firstname = locale("evidences.information.metadata.firstname"),
    lastname = locale("evidences.information.metadata.lastname"),
    birthdate = locale("evidences.information.metadata.birthdate")
}

local order <const> = {"crimeScene", "collectionTime", "additionalData", "weaponLabel", "serialNumber"}
local subOrder <const> = {"firstname", "lastname", "birthdate"}

for evidenceType, evidenceClass in pairs(api.evidenceTypes) do
    if evidenceClass.superClassName then
        translations[evidenceClass.superClassName] = locale(string.format("laptop.desktop_screen.database_app.types.%s", string.lower(evidenceClass.superClassName)))
        table.insert(order, evidenceClass.superClassName)
    end
end

function createInformation(evidenceInformation)
    local information = ""

    for _, key in pairs(order) do
        local value <const> = evidenceInformation[key]
        if value and translations[key] then
            if type(value) == "table" then
                information = information .. string.format("%s:  \n ", translations[key])

                for _, subKey in pairs(subOrder) do
                    local subValue <const> = value[subKey]
                    if subValue and #subValue > 0 and translations[subKey] then
                        information = information .. string.format("ㅤㅤ%s: %s  \n ", translations[subKey], subValue)
                    end
                end
            end

            if type(value) == "string" and #value > 0 then
                information = information .. string.format("%s: %s  \n ", translations[key], value)
            end
        end
    end

    return information
end

return createInformation