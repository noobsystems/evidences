local utils <const> = require "client.evidences.utils"

local function createMetadata(evidenceType, data, coords, holder)
    local door <const> = (holder and holder.door) and locale(string.format("evidences.information.doors.%s", tostring(holder.door))) or nil
    local seat <const> = (holder and holder.seat) and locale(string.format("evidences.information.seats.%s", tostring(holder.seat))) or nil

    local additionalData = locale("evidences.information.at_coords")
    if (data.plate and (door or seat)) then
        additionalData = locale("evidences.information.in_vehicle", door or seat, data.plate)
    elseif (data.plate and (not (door or seat))) then
        additionalData = locale("evidences.information.at_vehicle", data.plate)
    end

    return {
        information = {
            crimeScene = utils.getStreetName(coords),
            additionalData = additionalData,
            weaponLabel = data.weaponLabel,
            serialNumber = data.serialNumber
        }
    }
end

return {
    FINGERPRINT = {
        target = {
            collect = {
                label = locale("evidences.fingerprint.collecting_label"),
                icon = "fa-solid fa-fingerprint",
                requiredItem = "fingerprint_brush",
                removeRequiredItem = false,
                collectedItem = "fingerprint_taken",
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
    BLOOD = {
        target = {
            collect = {
                label = locale("evidences.blood.collecting_label"),
                icon = "fa-solid fa-droplet",
                requiredItem = "baggy_empty",
                removeRequiredItem = true,
                collectedItem = "baggy_blood",
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
    MAGAZINE = {
        target = {
            collect = {
                label = locale("evidences.magazine.collecting_label"),
                icon = "fa-solid fa-gun",
                requiredItem = "baggy_empty",
                removeRequiredItem = true,
                collectedItem = "baggy_magazine",
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
    }
}