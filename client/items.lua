exports("evidence_box", function(slot)
    local evidenceBoxItem

    for _, item in pairs(exports.ox_inventory:GetPlayerItems()) do
        if item and item.slot == slot then
            evidenceBoxItem = item
            break
        end
    end

    if evidenceBoxItem then
        local metadata <const> = evidenceBoxItem.metadata or {}

        -- we have to close the inventory to prevent the player from moving while focussing the input dialog after closing the inventory by himself
        exports.ox_inventory:closeInventory()
        local input <const> = lib.inputDialog(locale("evidences.evidece_box_label_dialog.title"), {
            {
                type = "input",
                label = locale("evidences.evidece_box_label_dialog.name_textfield_title"),
                description = locale("evidences.evidece_box_label_dialog.name_textfield_details"),
                default = metadata.label or evidenceBoxItem.label,
                required = true, 
                min = 1,
                max = 30
            },
            {
                type = "textarea",
                label = locale("evidences.evidece_box_label_dialog.description_textfield_title"),
                description = locale("evidences.evidece_box_label_dialog.description_textfield_details"),
                default = metadata.description or nil,
                required = false, 
                autosize = true
            }
        })

        if input then
            TriggerServerEvent("evidences:server:renameEvidenceBox", slot, input)
        end
    end
end)