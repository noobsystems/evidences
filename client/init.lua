lib.locale()

require "client.evidences.evidences"

require "client.evidences.registry.blood"
require "client.evidences.registry.fingerprint"
require "client.evidences.registry.magazine"
require "client.evidences.registry.casing"
require "client.evidences.registry.bullet"
require "client.evidences.registry.gunshot_residue"

require "client.dui.handler"

require "client.biometrics.biometrics_taking"

require "client.scanner.scanner"

require "client.items"

local config <const> = require "config"

if config.wiretap.enabled and GetResourceState("pma-voice"):find("start") then
    require "client.wiretap.wiretap"
end

RegisterNetEvent("evidences:notify", function(translation, type, duration)
    config.notify(translation, type, duration)
end)

TriggerServerEvent("evidences:playerLoaded", cache.serverId)


local evidenceTypes <const> = require "common.evidence_types"

exports.ox_target:addGlobalPlayer({
    label = "Evidence",
    icon = "fa-solid fa-magnifying-glass",
    openMenu = "evidences",
    canInteract = function(entity)
        local evidencePresent = false
        local requiredItemPresent = false

        local targetServerId <const> = GetPlayerServerId(NetworkGetPlayerIndexFromPed(entity))
        local stateBagKeys <const> = GetStateBagKeys(string.format("player:%s", targetServerId))
        for _, key in pairs(stateBagKeys) do
            if key:sub(1, 10) == "evidences:" then
                local evidenceType <const> = key:sub(11)
                local evidences <const> = Player(targetServerId).state[string.format("evidences:%s", evidenceType)]

                evidencePresent = evidences and next(evidences)
                if evidencePresent then
                    break
                end
            end
        end

        for _, options in pairs(evidenceTypes) do
            local hasRequiredItemToCollect <const> = options.target.collect.requiredItem and (exports.ox_inventory:Search("count", options.target.collect.requiredItem) > 0) or true
            local hasRequiredItemToDestroy <const> = options.target.destroy.requiredItem and (exports.ox_inventory:Search("count", options.target.destroy.requiredItem) > 0) or true

            requiredItemPresent = hasRequiredItemToCollect or hasRequiredItemToDestroy
            if requiredItemPresent then
                break
            end
        end

        return (exports.ox_inventory:Search("count", "forensic_kit") > 0) or (evidencePresent and requiredItemPresent)
    end
})