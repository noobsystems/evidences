for _, item in pairs({"evidence_laptop", "evidence_box", "baggy_empty", "baggy_blood", "baggy_magazine", "hydrogen_peroxide", "fingerprint_brush", "fingerprint_taken"}) do
    if not exports.ox_inventory:Items(item) then
        lib.print.error("Setup step missing: The script requires you to create the " .. item .. " item")
        return false
    end
end


-- https://github.com/CommunityOx/ox_inventory/commit/c7dee27c97a3ef2dc9e5ea402346cf6ea4cc1b16
-- https://github.com/CommunityOx/ox_inventory/commit/895cca3c9f0cd140e75bdb050dc88843119b4418
if lib.checkDependency("ox_inventory", "2.44.4") then
    exports.ox_inventory:setContainerProperties("evidence_box", {
        slots = 20,
        maxWeight = 5000
    })
else
    -- https://github.com/noobsystems/evidences/discussions/1
    -- Create a temporary stash to check if the item evidence_box is a container.
    -- That's needed because old versions of ox_inventory don't return the item metadata via exports.ox_inventory:Items(itemName).metadata.
    local temporaryInv <const> = exports.ox_inventory:CreateTemporaryStash({
        label = "Evidences",
        slots = 1,
        maxWeight = 0,
        groups = {},
        items = {{"evidence_box", 1}}
    })

    local evidenceBox <const> = exports.ox_inventory:GetSlot(temporaryInv, 1)
    exports.ox_inventory:RemoveInventory(temporaryInv)

    if evidenceBox and evidenceBox.metadata and (not evidenceBox.metadata.container) then
        lib.print.error("Setup step missing: Make the evidence_box a container item (https://coxdocs.dev/ox_inventory/Guides/creatingItems#creating-container-items) or use ox_inventory version 2.44.4 or higher")
        return false
    end
end


-- This event renames the item on the specified slot in the player's inventory
RegisterNetEvent("evidences:server:renameEvidenceBox", function(slot, input)
    local playerId <const> = source
    local item <const> = exports.ox_inventory:GetSlot(playerId, slot)

    if item and item.name == "evidence_box" then
        local metadata <const> = item.metadata or {}
        metadata.label = input[1] or nil
        metadata.description = input[2] or nil
        exports.ox_inventory:SetMetadata(playerId, slot, metadata)
    end
end)


return true