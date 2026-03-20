local lastAmmo = nil

local function getMagazineModel(weapon)
    local componentKey <const> = string.format("%s_CLIP_0", weapon.name:gsub("WEAPON_", "COMPONENT_"))

    for i = 1, 3 do
        local componentHash <const> = GetHashKey(componentKey .. i)
        if HasPedGotWeaponComponent(cache.ped, weapon.hash, componentHash) then
            local magazineModel <const> = GetWeaponComponentTypeModel(componentHash)
            return (magazineModel and magazineModel ~= 0) and magazineModel or nil
        end
    end

    return nil
end

local function getNaturallySpawnedMagazine(magazineModel)
    for _, nearbyObject in pairs(lib.getNearbyObjects(GetEntityCoords(cache.ped), 5)) do
        nearbyObject = nearbyObject.object
        if GetEntityModel(nearbyObject) == magazineModel then
            if not DoesEntityBelongToThisScript(nearbyObject) then
                if IsEntityAttached(nearbyObject) then
                    if GetEntityAttachedTo(nearbyObject) == GetCurrentPedWeaponEntityIndex(cache.ped) then
                        return nearbyObject
                    end
                else
                    return nearbyObject
                end
            end
        end
    end

    return nil
end

AddEventHandler("ox_inventory:currentWeapon", function(weapon)
    if not weapon then -- disarm
        lastAmmo = nil
        return
    end

    -- If the serial number has been scratched off the weapon, it is stored in imperfections
    local serial <const> = weapon.metadata.serial or weapon.metadata.imperfections
    if not (weapon.metadata and weapon.metadata.ammo and serial) then
        return
    end

    local ammo <const> = weapon.metadata.ammo
    if lastAmmo and ammo > lastAmmo then -- reload

        local magazineModel <const> = getMagazineModel(weapon)
        if magazineModel then
 
            local naturallySpawnedMagazine <const> = getNaturallySpawnedMagazine(magazineModel)
            if naturallySpawnedMagazine then

                if cache.vehicle and cache.seat and not IsPedOnAnyBike(ped) then -- vehicle magazine
                    SetEntityAsMissionEntity(naturallySpawnedMagazine)
                    DeleteObject(naturallySpawnedMagazine)

                    TriggerServerEvent("evidences:syncEvidence", "magazine", serial, 
                        "atVehicleSeat", NetworkGetNetworkIdFromEntity(cache.vehicle), cache.seat, {
                            plate = GetVehicleNumberPlateText(cache.vehicle),
                            weaponType = weapon.label,
                            weaponImage = GetConvar("inventory:imagepath", "nui://ox_inventory/web/images") .. string.format("/%s.png", weapon.name),
                            type = "magazine"
                        })

                else -- ground magazine

                    local lastHeightAboveGround
                    local result <const> = lib.waitFor(function()
                        if DoesEntityExist(naturallySpawnedMagazine) then
                            local heightAboveGround = GetEntityHeightAboveGround(naturallySpawnedMagazine)

                            if lastHeightAboveGround and math.abs(lastHeightAboveGround - heightAboveGround) < 0.0005 then
                                if heightAboveGround < 0.25 then
                                    return {
                                        coords = GetEntityCoords(naturallySpawnedMagazine),
                                        rotation = GetEntityRotation(naturallySpawnedMagazine)
                                    }
                                end
                            end

                            lastHeightAboveGround = heightAboveGround
                            Wait(150)
                        end
                    end, "No magazine evidence was created because no native GTA-created magazine was lying on the ground within four seconds of reloading", 4000)

                    if result then
                        TriggerServerEvent("evidences:syncEvidence", "magazine", serial,
                            "atCoords", result.coords, {
                                weaponType = weapon.label,
                                weaponImage = GetConvar("inventory:imagepath", "nui://ox_inventory/web/images") .. string.format("/%s.png", weapon.name),
                                type = "magazine",
                                magazineModel = magazineModel,
                                magazineRotation = result.rotation
                            })
                    end
                end
            end
        end
    end

    lastAmmo = ammo
end)