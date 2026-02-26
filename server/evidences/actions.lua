local config <const> = require "config"
local framework <const> = require "common.frameworks.framework"
local evidenceTypes <const> = require "common.evidence_types"
local api <const> = require "server.evidences.api"
local logger <const> = require "server.logger"

local actions = {}

lib.callback.register("evidences:destroy", function(source, evidenceType, owner, remove)
    local requiredItem <const> = evidenceTypes[evidenceType].target.destroy.requiredItem or nil

    if requiredItem then
        local success <const> = exports.ox_inventory:RemoveItem(source, requiredItem, 1)
        if not success then
            return false
        end
    end

    local object <const> = api.get(api.evidenceTypes[evidenceType], owner)
    object[remove.fun](object, table.unpack(remove.arguments))

    local data = {
        evidenceType = evidenceType,
        biometricData = owner
    }

    if remove then
        data[remove.fun] = json.encode(remove.arguments)
    end

    logger.log(source, "Evidence destroyed", data)
    return true
end)

function actions.collect(source, evidenceType, owner, remove, metadata)
    if not framework.hasPermission(config.permissions.collect, source) then
        return false
    end

    local options <const> = evidenceTypes[evidenceType]
    local collectedItem <const> = options.target.collect.collectedItem

    if not exports.ox_inventory:CanCarryItem(source, collectedItem, 1, nil) then
        return false
    end

    local slots <const> = exports.ox_inventory:GetSlotsWithItem(source, "forensic_kit")
    if not slots or #slots < 1 then
        return false
    end

    local lowestDurability = lib.array.reduce(lib.array:from(slots), function(accumulator, element)
        local accDurability = (accumulator.metadata and accumulator.metadata.durability) or 100
        local elemDurability = (element.metadata and element.metadata.durability) or 100

        return elemDurability < accDurability and element or accumulator
    end, slots[1])

    exports.ox_inventory:SetDurability(source, lowestDurability.slot, ((lowestDurability.metadata and lowestDurability.metadata.durability) or 100) - 10)

    local success <const>, response <const> = exports.ox_inventory:AddItem(source, collectedItem, 1)
    if not success then
        return false
    end

    local object <const> = api.get(api.evidenceTypes[evidenceType], owner)

    if remove then
        object[remove.fun](object, table.unpack(remove.arguments))
    end

    metadata = metadata or {}
    metadata.information = metadata.information or {}
    metadata.information.collectionTime = os.date("%d.%m.%Y, %H:%M")
    metadata.description = require "server.evidences.evidence_information"(metadata.information)

    object:atItem(source, response[1].slot, metadata)


    local data = {
        evidenceType = evidenceType,
        biometricData = owner,
        information = metadata.description:gsub("  \n ", "\n")
    }

    if remove then
        data[remove.fun] = json.encode(remove.arguments)
    end

    logger.log(source, "Evidence collected", data)
    return true
end

lib.callback.register("evidences:collect", function(source, evidenceType, owner, remove, metadata)
    return actions.collect(source, evidenceType, owner, remove, metadata)
end)

return actions