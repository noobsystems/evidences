--local main = require "server.init"

local api = {}

local biometricsProvider <const> = require "server.biometrics.biometrics_provider"

api.evidenceTypes = {
    fingerprint = require "server.evidences.classes.fingerprint",
    blood = require "server.evidences.classes.dna.blood",
    saliva = require "server.evidences.classes.dna.saliva",
    magazine = require "server.evidences.classes.ballistics.magazine",
    casing = require "server.evidences.classes.ballistics.casing",
    bullet = require "server.evidences.classes.ballistics.bullet",
    gunshot_residue = require "server.evidences.classes.ballistics.gunshot_residue"
}

local cache = {}

---@param evidenceClass Evidence|string The class of the evidence or the name of that class
---@param owner number|string The serverId of the related player or the owner of the evidence (dna key, fingerprint, weapon serial number)
function api.get(evidenceClass, owner)
    if not evidenceClass then
        return
    end

    if type(evidenceClass) == "string" then
        evidenceClass = api.evidenceTypes[evidenceClass]
    end

    if not owner then
        return
    end

    if type(owner) == "number" and DoesPlayerExist(owner) then
        owner = biometricsProvider.getBiometricData(owner, evidenceClass.superClassName)
        if not owner then return end
    end

    cache[evidenceClass] = cache[evidenceClass] or {}
    cache[evidenceClass][owner] = cache[evidenceClass][owner] or evidenceClass:new(owner)

    return cache[evidenceClass][owner]
end

-- Binds evidence or removes it
---@param evidenceClass Evidence|string The class of the evidence or the name of that class
---@param owner number|string The serverId of the related player or the owner of the evidence (dna key, fingerprint, weapon serial number)
---@param fun string The method from the evidence object to execute
---@param ... any The arguments passed to the method
local function syncEvidence(evidenceClass, owner, fun, ...)
    local evidenceHolder <const> = api.get(evidenceClass, owner)
    if evidenceHolder then
        evidenceHolder[fun](evidenceHolder, ...)
    end
end

api.syncEvidence = syncEvidence

RegisterNetEvent("evidences:syncEvidence", syncEvidence)
exports("syncEvidence", syncEvidence)

return api