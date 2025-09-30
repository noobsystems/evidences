local evidenceTypes <const> = require "common.evidence_types"
local api <const> = require "server.evidences.api"

lib.callback.register("evidences:destroy", function(source, evidenceType, owner, remove)
    local requiredItem <const> = evidenceTypes[evidenceType].target.destroy.requiredItem or nil

    if requiredItem then
        local success, response = exports.ox_inventory:RemoveItem(source, requiredItem, 1)
        if not success then
            return response
        end
    end

    local object <const> = api.get(api.evidenceTypes[evidenceType], owner)
    object[remove.fun](object, table.unpack(remove.arguments))
    return false
end)

lib.callback.register("evidences:collect", function(source, evidenceType, owner, remove, metadata)
    local options <const> = evidenceTypes[evidenceType]
    local collectedItem <const> = options.target.collect.collectedItem
    local requiredItem <const> = options.target.collect.removeRequiredItem and options.target.collect.requiredItem or nil

    if not exports.ox_inventory:CanCarryItem(source, collectedItem, 1, nil) then
        return "inventory_full"
    end

    if requiredItem then
        local success <const>, response <const> = exports.ox_inventory:RemoveItem(source, requiredItem, 1)
        if not success then
            return response
        end
    end

    local success <const>, response <const> = exports.ox_inventory:AddItem(source, collectedItem, 1)
    if requiredItem and not success then
        exports.ox_inventory:AddItem(source, requiredItem, 1)
        return response
    end

    local object <const> = api.get(api.evidenceTypes[evidenceType], owner)
    object[remove.fun](object, table.unpack(remove.arguments))
    
    metadata = metadata or {}
    metadata.information = metadata.information or {}
    metadata.information.collectionTime = os.date("%d.%m.%Y, %H:%M")
    metadata.description = require "server.evidences.evidence_information"(metadata.information)
    
    object:atItem(source, response[1].slot, metadata)

    return false
end)