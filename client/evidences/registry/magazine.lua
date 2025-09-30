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

    if not (weapon.metadata and weapon.metadata.ammo and weapon.metadata.serial) then
        return
    end

    local ammo <const> = weapon.metadata.ammo
    if lastAmmo and ammo > lastAmmo then -- reload

        local magazineModel <const> = getMagazineModel(weapon)
        if magazineModel then
                
            local naturallySpawnedMagazine <const> = getNaturallySpawnedMagazine(magazineModel)
            if naturallySpawnedMagazine then

                if cache.vehicle and cache.seat then -- vehicle magazine

                    if not IsPedOnAnyBike(ped) then
                        SetEntityAsMissionEntity(naturallySpawnedMagazine)
                        DeleteObject(naturallySpawnedMagazine)

                        TriggerServerEvent("evidences:new", "MAGAZINE", weapon.metadata.serial, 
                            "atVehicleSeat", NetworkGetNetworkIdFromEntity(cache.vehicle), cache.seat, {
                                plate = GetVehicleNumberPlateText(cache.vehicle),
                                weaponLabel = weapon.label or "unknown",
                                serialNumber = weapon.metadata.serial
                            })
                    end

                else -- ground magazine

                    local lastHeightAboveGround
                    local result <const> = lib.waitFor(function()
                        if DoesEntityExist(naturallySpawnedMagazine) then
                            local heightAboveGround = GetEntityHeightAboveGround(naturallySpawnedMagazine)

                            if lastHeightAboveGround == heightAboveGround then
                                Wait(2000)
                                return {
                                    coords = GetEntityCoords(naturallySpawnedMagazine),
                                    rotation = GetEntityRotation(naturallySpawnedMagazine)
                                }
                            end

                            lastHeightAboveGround = heightAboveGround
                        end
                    end, false, 3000)

                    if result then
                        SetEntityAsMissionEntity(naturallySpawnedMagazine)
                        DeleteObject(naturallySpawnedMagazine)

                        TriggerServerEvent("evidences:new", "MAGAZINE", weapon.metadata.serial,
                            "atCoords", result.coords, {
                                weaponLabel = weapon.label or "unknown",
                                serialNumber = weapon.metadata.serial,
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