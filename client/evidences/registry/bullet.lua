local config <const> = require "config"

AddEventHandler("evidences:playerShot", function(weapon, hit, entityHit, impactCoords)
    if not hit then return end

    -- If the serial number has been scratched off the weapon, it is stored in imperfections
    local serial <const> = weapon.metadata.serial or weapon.metadata.imperfections

    local weaponEntity <const> = GetCurrentPedWeaponEntityIndex(cache.ped)
    local shooterCoords <const> = GetEntityCoords(weaponEntity > 0 and weaponEntity or cache.ped)

    if DoesEntityExist(entityHit) then
        local entityType <const> = GetEntityType(entityHit)
        if entityType == 1 then return end

        if entityType ~= 0 then
            if not NetworkGetEntityIsNetworked(entityHit) then return end

            local localCoords <const> = GetOffsetFromEntityGivenWorldCoords(entityHit, impactCoords.x, impactCoords.y, impactCoords.z)

            TriggerServerEvent("evidences:syncEvidence", "bullet", serial, 
                "atRelativeEntityCoords", NetworkGetNetworkIdFromEntity(entityHit), localCoords, {
                    weaponType = weapon.label,
                    imperfections = serial,
                    plate = GetVehicleNumberPlateText(entity),
                    type = "bullet"
                }, { shooterCoords = shooterCoords })

            return
        end
    end

    TriggerServerEvent("evidences:syncEvidence", "bullet", serial, 
        "atCoords", impactCoords, {
            shooterCoords = shooterCoords,
            weaponType = weapon.label,
            imperfections = serial,
            type = "bullet"
        })
end)