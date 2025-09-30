local api = {}

local biometricData <const> = require "server.evidences.biometric_data"

api.evidenceTypes = {
    FINGERPRINT = require "server.evidences.classes.fingerprint",
    BLOOD = require "server.evidences.classes.dna.blood",
    MAGAZINE = require "server.evidences.classes.magazine"
}

local cache = {}

---@param evidenceClass Evidence|string The class of the evidence or the name of that class
---@param owner number|string The serverId of the related player or the owner of the evidence (dna key, fingerprint, weapon serial number)
function api.get(evidenceClass, owner)
    if not evidenceClass then
        return
    end

    if type(evidenceClass) == "string" then
        evidenceClass = api.evidenceTypes[string.upper(evidenceClass)]
    end

    if not owner then
        return
    end

    if type(owner) == "number" and DoesPlayerExist(owner) then
        owner = biometricData.getBiometricData(owner, string.lower(evidenceClass.superClassName))
        if not owner then return end
    end

    cache[evidenceClass] = cache[evidenceClass] or {}
    cache[evidenceClass][owner] = cache[evidenceClass][owner] or evidenceClass:new(owner)

    return cache[evidenceClass][owner]
end

RegisterNetEvent("evidences:new", function(evidenceClass, owner, fun, ...)
    local object <const> = api.get(evidenceClass, owner)
    object[fun](object, ...)
end)

return api