local utils <const> = require "client.evidences.utils"

local function createMetadata(evidenceType, data, coords, holder)
    local door <const> = (holder and holder.door) and locale(string.format("evidences.information.doors.%s", tostring(holder.door))) or nil
    local seat <const> = (holder and holder.seat) and locale(string.format("evidences.information.seats.%s", tostring(holder.seat))) or nil

    local additionalData = locale("evidences.information.at_coords")
    if (data.plate and (door or seat)) then
        additionalData = locale("evidences.information.in_vehicle", door or seat, data.plate)
    elseif (data.plate and (not (door or seat))) then
        additionalData = locale("evidences.information.at_vehicle", data.plate)
    elseif (holder and holder.player) then
        additionalData = locale("evidences.information.at_player")
    end

    local metadata = {
        createdAt = data.createdAt,
        information = {
            collectionTime = utils.getFormatedDateTime(),
            crimeScene = utils.getStreetName(coords),
            additionalData = additionalData
        }
    }

    -- Details for ballistics evidences
    metadata["ballistics"] = {
        weaponType = data.weaponType,
        weaponImage = data.weaponImage,
        serial = data.serial,
        imperfections = data.imperfections,
        type = data.type
    }

    return metadata
end

return {
    -- biometric evidences
    fingerprint = {
        target = {
            collect = {
                label = locale("evidences.fingerprint.collecting_label"),
                icon = "fa-solid fa-fingerprint",
                requiredItem = "forensic_kit",
                collectedItem = "collected_fingerprint",
                createMetadata = createMetadata
            },
            destroy = {
                label = locale("evidences.fingerprint.destroying_label"),
                icon = "fa-solid fa-fingerprint",
                requiredItem = "hydrogen_peroxide"
            }
        },
        visualize = {}
    },
    blood = {
        target = {
            collect = {
                label = locale("evidences.blood.collecting_label"),
                icon = "fa-solid fa-droplet",
                requiredItem = "forensic_kit",
                collectedItem = "collected_blood",
                createMetadata = createMetadata
            },
            destroy = {
                label = locale("evidences.blood.destroying_label"),
                icon = "fa-solid fa-droplet",
                requiredItem = "hydrogen_peroxide"
            }
        },
        visualize = {
            show = function(point)
                if not point.decal then
                    point.decal = AddDecal(
                        1010,
                        point.coords.x, point.coords.y, point.coords.z,
                        0.0, 0.0, -1.0,
                        0.0, 1.0, 0.0,
                        0.65 /*width*/, 0.65 /*height*/,
                        0.2, 0.0, 0.0, 1.0,
                        -1 /*timeout*/,
                        true /*isLongRange*/,
                        false /*isDynamic*/,
                        true /*useComplexColn*/)
                end
            end,
            hide = function(point)
                if point.decal then
                    if IsDecalAlive(point.decal) then
                        RemoveDecal(point.decal)
                    end
                    point.decal = nil
                end
            end
        }
    },
    saliva = {
        target = {
            collect = {
                label = locale("evidences.saliva.collecting_label"),
                icon = "fa-solid fa-gun",
                requiredItem = "forensic_kit",
                collectedItem = "collected_saliva",
                createMetadata = createMetadata
            },
            destroy = {
                label = locale("evidences.saliva.destroying_label"),
                icon = "fa-solid fa-gun",
                requiredItem = nil
            }
        },
        visualize = {}
    },
    -- ballistics evidences
    magazine = {
        target = {
            collect = {
                label = locale("evidences.magazine.collecting_label"),
                icon = "fa-solid fa-gun",
                requiredItem = "forensic_kit",
                collectedItem = "collected_magazine",
                createMetadata = createMetadata
            },
            destroy = {
                label = locale("evidences.magazine.destroying_label"),
                icon = "fa-solid fa-gun",
                requiredItem = nil
            }
        },
        visualize = {
            show = function(point, data)
                local model <const> = data.magazineModel
                local rotation <const> = data.magazineRotation

                if model and rotation then
                    for _, nearbyObject in pairs(lib.getNearbyObjects(point.coords, 5)) do
                        nearbyObject = nearbyObject.object
                        if GetEntityModel(nearbyObject) == model then
                            if not DoesEntityBelongToThisScript(nearbyObject) then
                                if not IsEntityAttached(nearbyObject) then
                                    SetEntityAsMissionEntity(nearbyObject)
                                    DeleteObject(nearbyObject)
                                end
                            end
                        end
                    end

                    lib.requestModel(model)

                    point.entity = CreateObject(model, point.coords.x, point.coords.y, point.coords.z, false, false, false)
                    SetEntityRotation(point.entity, rotation.x, rotation.y, rotation.z)
                    SetEntityCoords(point.entity, point.coords.x, point.coords.y, point.coords.z)
                    SetEntityCollision(point.entity, false, false)
                    SetModelAsNoLongerNeeded(model)
                end
            end,
            hide = function(point)
                if point.entity then
                    DeleteObject(point.entity)
                end
            end
        }
    },
    casing = {
        target = {
            collect = {
                label = locale("evidences.casing.collecting_label"),
                icon = "fa-solid fa-gun",
                requiredItem = "forensic_kit",
                collectedItem = "collected_casing",
                createMetadata = createMetadata
            },
            destroy = {
                label = locale("evidences.casing.destroying_label"),
                icon = "fa-solid fa-gun",
                requiredItem = nil
            }
        },
        visualize = {
            show = function(point, data)
                local model <const> = `prop_sgun_casing`
                lib.requestModel(model)

                point.entity = CreateObject(model, point.coords.x, point.coords.y, point.coords.z, false, false, false)
                SetEntityCoords(point.entity, point.coords.x, point.coords.y, point.coords.z)
                SetEntityRotation(point.entity, 0.0, 0.0, math.random() * 360.0)
                SetEntityCollision(point.entity, false, false)
                SetModelAsNoLongerNeeded(model)
            end,
            hide = function(point)
                if point.entity then
                    DeleteObject(point.entity)
                end
            end
        }
    },
    bullet = {
        target = {
            collect = {
                label = locale("evidences.bullet.collecting_label"),
                icon = "fa-solid fa-gun",
                requiredItem = "forensic_kit",
                collectedItem = "collected_bullet",
                createMetadata = createMetadata
            },
            destroy = {
                label = locale("evidences.bullet.destroying_label"),
                icon = "fa-solid fa-gun",
                requiredItem = nil
            }
        },
        visualize = {
            show = function(point, data, no_thread)
                local shooterCoords <const> = data.shooterCoords
                local bulletCoords <const> = point.coords

                if not shooterCoords or not bulletCoords then
                    return
                end

                local dx, dy, dz = shooterCoords.x - bulletCoords.x, shooterCoords.y - bulletCoords.y, shooterCoords.z - bulletCoords.z
                local l = #(vector3(dx, dy, dz))

                if no_thread then
                    if exports.ox_inventory:Search("count", "forensic_kit") > 0 then
                        DrawLine(bulletCoords.x, bulletCoords.y, bulletCoords.z, bulletCoords.x + dx / l, bulletCoords.y + dy / l, bulletCoords.z + dz / l, 255, 0, 0, 255)
                    end
                else
                    point.isThreadRunning = true

                    CreateThread(function()
                        while point.isThreadRunning do
                            if exports.ox_inventory:Search("count", "forensic_kit") > 0 then
                                if exports.ox_target:isActive() then
                                    DrawLine(bulletCoords.x, bulletCoords.y, bulletCoords.z, bulletCoords.x + dx / l, bulletCoords.y + dy / l, bulletCoords.z + dz / l, 255, 0, 0, 255)
                                end
                            end

                            Wait(1)
                        end
                    end)
                end
            end,
            hide = function(point)
                if not no_thread then
                    point.isThreadRunning = false 
                end
            end
        }
    },
    gunshot_residue = {
        target = {
            collect = {
                label = locale("evidences.gunshot_residue.collecting_label"),
                icon = "fa-solid fa-gun",
                requiredItem = "forensic_kit",
                collectedItem = "collected_gunshot_residue",
                createMetadata = createMetadata
            },
            destroy = {
                label = locale("evidences.gunshot_residue.destroying_label"),
                icon = "fa-solid fa-gun",
                requiredItem = nil
            }
        },
        visualize = {}
    }
}