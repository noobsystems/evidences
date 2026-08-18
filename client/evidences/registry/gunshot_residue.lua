AddEventHandler("evidences:playerShot", function(weapon)
    -- If the serial number has been scratched off the weapon, it is stored in imperfections
    local serial <const> = weapon.metadata.serial or weapon.metadata.imperfections

    if serial then
        TriggerServerEvent("evidences:syncEvidence", "gunshot_residue", { serial, tostring(cache.serverId) },
            "atPlayer", cache.serverId, {
                weaponType = weapon.label,
                weaponImage = GetConvar("inventory:imagepath", "nui://ox_inventory/web/images") .. string.format("/%s.png", weapon.name),
                type = "gunshot_residue"
            })
    end
end)