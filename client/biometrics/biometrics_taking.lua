local config <const> = require "config"
local evidenceTypes <const> = require "common.evidence_types"
local pendingRequests = {}

lib.callback.register("evidences:requestConsent", function(requester, type)
    local alert <const> = lib.alertDialog({
        content = locale("biometrics_taking.description", requester, locale("laptop.desktop_screen.common." .. type), locale("laptop.desktop_screen.common." .. type)),
        centered = true,
        cancel = true,
        labels = {
            confirm = locale("biometrics_taking.accept"),
            cancel = locale("biometrics_taking.deny")
        }
    })

    if alert == "confirm" then
        lib.playAnim(cache.ped, "gestures@m@standing@casual", "gesture_nod_yes_soft", 8.0, 8.0, 1500)
        return true
    end

    lib.playAnim(cache.ped, "gestures@m@standing@casual", "gesture_no_way", 8.0, 8.0, 1500)
    return false
end)

RegisterCommand("denyBiometricsTaking", function()
    lib.closeAlertDialog()
end)

local function takeBiometric(targetEntity, type, enforce)
    local targetPlayer <const> = NetworkGetPlayerIndexFromPed(targetEntity)
    local targetId <const> = GetPlayerServerId(targetPlayer)

    pendingRequests[targetEntity] = true

    local options <const> = evidenceTypes.saliva
    local metadata <const> = options.target.collect.createMetadata and options.target.collect.createMetadata("saliva", {}, GetEntityCoords(cache.ped), { player = true }) or nil
    lib.callback("evidences:takeBiometricData", false, function(success)
        pendingRequests[targetEntity] = nil

        if success then
            lib.playAnim(cache.ped, "mp_arresting", "a_uncuff", 8.0, 8.0, 4000, 16)
        end
    end, targetId, type, enforce, metadata)
end

exports.ox_target:addGlobalPlayer({
    label = locale("biometrics_taking.target.take_fingerprint"),
    icon = "fa-solid fa-fingerprint",
    distance = 3,
    groups = config.permissions.collect or false,
    items = "forensic_kit",
    canInteract = function(entity)
        if not config.isPedDead(cache.ped) then
            if not config.isPedCuffed(cache.ped) then
                return (not config.isPedDead(entity)) and (not config.isPedCuffed(entity)) and (not pendingRequests[entity])
            end
        end

        return false
    end,
    onSelect = function(data)
        takeBiometric(data.entity, "fingerprint")
    end
})

exports.ox_target:addGlobalPlayer({
    label = locale("biometrics_taking.target.take_dna"),
    icon = "fa-solid fa-dna",
    distance = 3,
    groups = config.permissions.collect or false,
    items = "forensic_kit",
    canInteract = function(entity)
        if not config.isPedDead(cache.ped) then
            if not config.isPedCuffed(cache.ped) then
                return (not config.isPedDead(entity)) and (not config.isPedCuffed(entity)) and (not pendingRequests[entity])
            end
        end

        return false
    end,
    onSelect = function(data)
        takeBiometric(data.entity, "dna")
    end
})

exports.ox_target:addGlobalPlayer({
    label = locale("biometrics_taking.target.force_take_fingerprint"),
    icon = "fa-solid fa-fingerprint",
    distance = 3,
    groups = config.permissions.collect or false,
    items = "forensic_kit",
    canInteract = function(entity)
        if not config.isPedDead(cache.ped) then
            if not config.isPedCuffed(cache.ped) then
                return config.isPedCuffed(entity) or config.isPedDead(entity)
            end
        end

        return false
    end,
    onSelect = function(data)
        takeBiometric(data.entity, "fingerprint", true)
    end
})

exports.ox_target:addGlobalPlayer({
    label = locale("biometrics_taking.target.force_take_dna"),
    icon = "fa-solid fa-dna",
    distance = 3,
    groups = config.permissions.collect or false,
    items = "forensic_kit",
    canInteract = function(entity)
        if not config.isPedDead(cache.ped) then
            if not config.isPedCuffed(cache.ped) then
                return config.isPedCuffed(entity) or config.isPedDead(entity)
            end
        end

        return false
    end,
    onSelect = function(data)
        takeBiometric(data.entity, "dna", true)
    end
})