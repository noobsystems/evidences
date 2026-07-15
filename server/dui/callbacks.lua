local config <const> = require "config"
local framework <const> = require "common.frameworks.framework"
local imagePath <const> = GetConvar("inventory:imagepath", "nui://ox_inventory/web/images") .. "/%s.png"

-- https://github.com/overextended/ox_inventory/blob/6be13009eebc618b282f584782d98ff16ea2f9ed/web/src/helpers/index.ts#L140
local function getItemImage(item)
    local metadata <const> = item.metadata

    if metadata then
        if metadata.imageurl then
            return metadata.imageurl
        elseif metadata.image then
            return string.format(imagePath, metadata.image)
        end
    end

    if item.image then
        return string.format(imagePath, item.image)
    end

    return string.format(imagePath, item.name)
end

---@param source number The players server id.
---@param filter func A function returning true if the item matches the filter. Additionaly, it can return a table with details or additionalData if they showed be added to the filtered items table returned by this function
local function getItemsMatchingFilter(source, filter)
    local result = {}

    local items <const> = exports.ox_inventory:GetInventoryItems(source)
    local filteredItems = {}

    for _, item in pairs(items or {}) do
        local slot <const> = item.slot
        local metadata <const> = item.metadata or {}

        local matchesFilter <const>, details <const> = filter(item)

        if matchesFilter then
            filteredItems[#filteredItems + 1] = {
                imagePath = getItemImage(item),
                label = metadata.label or item.label,
                slot = slot,
                details = details or {}
            }
        end

        -- for each item in the inventory holding a container
        if metadata.container then
            local containerData <const> = exports.ox_inventory:GetContainerFromSlot(source, slot)
            local filteredContainerItems = {}

            for _, containerItem in pairs(containerData.items or {}) do
                local matchesFilter, data = filter(containerItem)

                if matchesFilter then
                    local containerItemMetadata <const> = containerItem.metadata or {}

                    filteredContainerItems[#filteredContainerItems + 1] = {
                        imagePath = getItemImage(containerItem),
                        label = containerItemMetadata.label or containerItem.label,
                        slot = containerItem.slot,
                        details = details or {}
                    }
                end
            end

            if #filteredContainerItems > 0 then
                result[#result + 1] = {
                    inventory = metadata.container,
                    label = metadata.label or item.label,
                    items = filteredContainerItems
                }
            end
        end
    end

    local playerInventory <const> = exports.ox_inventory:GetInventory(source)
    if #filteredItems > 0 then
        result[#result + 1] = {
            inventory = source,
            label = playerInventory and playerInventory.label or "Deine Tasche",
            items = filteredItems
        }
    end

    return result
end

lib.callback.register("evidences:getPlayersFirearms", function(source, arguments)
    if not framework.hasPermission(config.permissions.access, source) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
    end

    return getItemsMatchingFilter(source, function(item)
        local metadata <const> = item.metadata or {}
        local serial <const> = metadata.serial
        local imperfections <const> = metadata.imperfections

        if serial or imperfections then
            return true, {
                serial = serial,
                imperfections = imperfections
            }
        end

        return false
    end)
end)

lib.callback.register("evidences:getPlayersItemsWithEvidence", function(source, arguments)
    if not framework.hasPermission(config.permissions.access, source) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
    end

    local type <const> = arguments.type
    if not type then return {} end

    return getItemsMatchingFilter(source, function(item)
        local metadata <const> = item.metadata or {}

        if metadata[type] and metadata[type].owner then
            local information <const> = metadata.information or {}

            return true, {
                createdAt = metadata.createdAt,
                crimeScene = information.crimeScene or "",
                collectionTime = information.collectionTime or "",
                additionalData = information.additionalData or "",
                weaponType = metadata[type].weaponType,
                weaponImage = metadata[type].weaponImage,
                serial = metadata[type].serial,
                imperfections = metadata[type].imperfections,
                type = metadata[type].type,
                identifier = metadata[type].owner,
                analysed = metadata[type].analysed or false
            }
        end

        return false
    end)
end)


local function getItem(source, inventory, slot)
    if type(inventory) == "number" then
        if source ~= inventory then
            -- player may not request changing metadata of an item in another player's inventory
            return false
        end
    end

    return exports.ox_inventory:GetSlot(inventory, slot)
end

lib.callback.register("evidences:updateAdditionalData", function(source, arguments)
    if not framework.hasPermission(config.permissions.access, source) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
    end

    local item <const> = getItem(source, arguments.inventory, arguments.slot)

    if item then
        local evidenceInformation <const> = item.metadata and item.metadata.information or {}
        evidenceInformation.additionalData = arguments.additionalData
        local description <const> = require "server.evidences.evidence_information"(evidenceInformation)

        item.metadata = item.metadata or {}
        item.metadata.information = evidenceInformation
        item.metadata.description = description

        exports.ox_inventory:SetMetadata(arguments.inventory, arguments.slot, item.metadata)
    end
end)

lib.callback.register("evidences:setAnalysed", function(source, arguments)
    if not framework.hasPermission(config.permissions.access, source) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
    end

    local item <const> = getItem(source, arguments.inventory, arguments.slot)

    if item then
        if item.metadata[arguments.type] then
            item.metadata[arguments.type].analysed = true

            -- Update the description of the evidence item
            item.metadata.information = item.metadata.information or {}
            item.metadata.information[arguments.type] = item.metadata[arguments.type].owner -- for biometric evidences (dna, fingerprint)

            local information <const> = arguments.information
            for key, value in pairs(information) do
                item.metadata.information[key] = value
            end

            item.metadata.description = require "server.evidences.evidence_information"(item.metadata.information)

            exports.ox_inventory:SetMetadata(arguments.inventory, arguments.slot, item.metadata)

            TriggerEvent("evidences:evidenceItemAnalysed", source, item)
        end
    end
end)