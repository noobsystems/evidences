local translations <const> = {
    -- all evidences
    additionalData = locale("evidences.information.metadata.additionalData"),
    crimeScene = locale("evidences.information.metadata.crime_scene"),
    collectionTime = locale("evidences.information.metadata.collection_time"),

    -- biometrics
    dna = locale("laptop.desktop_screen.common.dna"),
    fingerprint = locale("laptop.desktop_screen.common.fingerprint"),

    -- magazines
    weaponLabel = locale("evidences.information.metadata.weapon_label"),
    serialNumber = locale("evidences.information.metadata.serial_number"),
}

local order <const> = {"additionalData", "crimeScene", "dna", "fingerprint", "collectionTime", "weaponLabel", "serialNumber"}

function createInformation(evidenceInformation)
    local information = ""

    for _, key in pairs(order) do
        local value <const> = evidenceInformation[key]
        if value and translations[key] then
            if type(value) == "string" and #value > 0 then
                information = information .. string.format("%s: %s  \n ", translations[key], value)
            end
        end
    end

    return information
end

return createInformation