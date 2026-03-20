AddEventHandler("evidences:playerShot", function(weapon)
    local rightHandBoneIndex <const> = GetPedBoneIndex(cache.ped, 0xDEAD)
    local coords <const> = GetWorldPositionOfEntityBone(cache.ped, rightHandBoneIndex)
    local success <const>, groundZ <const> = GetGroundZFor_3dCoord(coords.x, coords.y, coords.z, false)

    if success then
        -- If the serial number has been scratched off the weapon, it is stored in imperfections
        local serial <const> = weapon.metadata.serial or weapon.metadata.imperfections

        -- vehicle casing
        if cache.vehicle and cache.seat and not IsPedOnAnyBike(ped) then
            TriggerServerEvent("evidences:syncEvidence", "casing", serial,
                "atVehicleSeat", NetworkGetNetworkIdFromEntity(cache.vehicle), cache.seat, {
                    plate = GetVehicleNumberPlateText(cache.vehicle),
                    weaponType = weapon.label,
                    serial = weapon.metadata.serial,
                    imperfections = weapon.metadata.imperfections,
                    type = "casing"
                })
            return
        end

        -- ground casings
        TriggerServerEvent("evidences:syncEvidence", "casing", serial, 
            "atCoords", vector3(coords.x, coords.y, groundZ), {
                weaponType = weapon.label,
                serial = weapon.metadata.serial,
                imperfections = weapon.metadata.imperfections,
                type = "casing"
        })
    end
end)