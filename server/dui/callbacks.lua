local database <const> = require "server.dui.database"
local imagePath <const> = GetConvar("inventory:imagepath", "nui://ox_inventory/web/images") .. "/%s.png"

-- https://github.com/CommunityOx/ox_inventory/blob/6be13009eebc618b282f584782d98ff16ea2f9ed/web/src/helpers/index.ts#L140
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

lib.callback.register("evidences:getPlayersItemsWithBiometricData", function(source, arguments)
    local type <const> = arguments.type
    if not type then return {} end

    local result = {}

    local items <const> = exports.ox_inventory:GetInventoryItems(source)
    local filteredItems = {}

    for _, item in pairs(items or {}) do
        local slot <const> = item.slot
        local metadata <const> = item.metadata or {}

        if metadata[type] then
            filteredItems[#filteredItems + 1] = {
                imagePath = getItemImage(item),
                label = metadata.label or item.label,
                slot = slot,
                identifier = metadata[type].owner,
                details = metadata.information and {
                    crimeScene = metadata.information.crimeScene or "",
                    collectionTime = metadata.information.collectionTime or "",
                    additionalData = metadata.information.additionalData or ""
                } or {}
            }
        end

        -- for each item in the inventory holding a container
        if metadata.container then
            local containerData <const> = exports.ox_inventory:GetContainerFromSlot(source, slot)
            local filteredContainerItems = {}

            for _, containerItem in pairs(containerData.items or {}) do
                local containerItemMetadata <const> = containerItem.metadata or {}

                if containerItemMetadata[type] then
                    filteredContainerItems[#filteredContainerItems + 1] = {
                        imagePath = getItemImage(containerItem),
                        label = containerItemMetadata.label or containerItem.label,
                        slot = containerItem.slot,
                        identifier = containerItemMetadata[type].owner,
                        details = containerItemMetadata.information and {
                            crimeScene = containerItemMetadata.information.crimeScene or "",
                            collectionTime = containerItemMetadata.information.collectionTime or "",
                            additionalData = containerItemMetadata.information.additionalData or ""
                        } or {}
                    }
                end
            end

            if #filteredContainerItems > 0 then
                result[#result + 1] = {
                    container = metadata.container,
                    label = metadata.label or item.label,
                    items = filteredContainerItems
                }
            end
        end
    end

    local playerInventory <const> = exports.ox_inventory:GetInventory(source)
    if #filteredItems > 0 then
        result[#result + 1] = {
            container = source,
            label = playerInventory and playerInventory.label or "Deine Tasche",
            items = filteredItems
        }
    end

    return result
end)

lib.callback.register("evidences:getStoredPersonalDataFromIdentifier", function(source, arguments)
    local type <const> = arguments.type
    local identifier <const> = arguments.identifier

    local personalData <const> = database.getPersonalDataByBiometricData(type, identifier) or {}

    return {
        identifier = identifier,
        firstname = personalData.firstname,
        lastname = personalData.lastname,
        birthdate = personalData.birthdate
    }
end)

lib.callback.register("evidences:storePersonalData", function(source, arguments)
    local type <const> = arguments.type
    local biometricData <const> = arguments.biometricData
    local firstname <const> = arguments.firstname
    local lastname <const> = arguments.lastname
    local birthdate <const> = arguments.birthdate

    database.storePersonalDataForBiometricData(type, biometricData, firstname, lastname, birthdate)
end)

---@param types table[string]
---@param search string
---@param page number
lib.callback.register("evidences:getStoredBiometricDataEntries", function(source, data)
    return database.getStoredBiometricDataEntries(data.types, data.search, data.page)
end)

lib.callback.register("evidences:labelEvidenceItem", function(source, arguments)
    local container <const> = arguments.container
    local slot <const> = arguments.slot
    local information <const> = arguments.information

    local src <const> = source

    if type(container) == "number" then
        if src ~= container then
            -- player may not request changing metadata of an item in another player's inventory
            return false
        end
    end

    local item <const> = exports.ox_inventory:GetSlot(container, slot)
    if item then
        local evidenceInformation <const> = item.metadata and item.metadata.information or {}
        local mergedInformation <const> = lib.table.merge(lib.table.deepclone(evidenceInformation), information)
        local description <const> = require "server.evidences.evidence_information"(mergedInformation)

        item.metadata = item.metadata or {}
        item.metadata.information = mergedInformation
        item.metadata.description = description

        exports.ox_inventory:SetMetadata(container, slot, item.metadata)
        return true
    end

    return false
end)