local utils = {}

local vehicleCache = {}

local bones <const> = {
    [0] = "door_dside_f",
    [1] = "door_pside_f",
    [2] = "door_dside_r",
    [3] = "door_pside_r"
}

local function getRelative2d(entity, worldCoords)
    local relative3d <const> = GetOffsetFromEntityGivenWorldCoords(entity, worldCoords.x, worldCoords.y, worldCoords.z)
    return vector2(relative3d.x, relative3d.y)
end

local function getRelative3d(entity, worldCoords)
    return GetOffsetFromEntityGivenWorldCoords(entity, worldCoords.x, worldCoords.y, worldCoords.z)
end

local function getRelativeDoorCoords(entity, doorId)
    local boneIndex <const> = GetEntityBoneIndexByName(entity, bones[doorId])
    local worldPositionOfBone <const> = GetWorldPositionOfEntityBone(entity, boneIndex)
    return GetOffsetFromEntityGivenWorldCoords(entity, worldPositionOfBone.x, worldPositionOfBone.y, worldPositionOfBone.z)
end

local function hasDoor(entity, doorId)
    return GetIsDoorValid(entity, doorId) and not IsVehicleDoorDamaged(entity, doorId)
end

function utils.getTargetedVehicleDoorId(entity, coords)
    if not DoesEntityExist(entity) or not DoesEntityHaveDrawable(entity) then
        return nil
    end

    local entityModel <const> = GetEntityModel(entity)

    if not vehicleCache[entityModel] then
        vehicleCache[entityModel] = {
            doors = GetNumberOfVehicleDoors(entity),
            seats = GetVehicleModelNumberOfSeats(entityModel)
        }
    end

    if vehicleCache[entityModel].doors < 2 or vehicleCache[entityModel].seats > 4 then
        return nil
    end

    local relativeCoords <const> = GetOffsetFromEntityGivenWorldCoords(entity, coords.x, coords.y, coords.z)
    local relativeCoordsY <const> = (math.floor(relativeCoords.y * 100)) / 100

    local isPassengerSide <const> = relativeCoords.x > 0
    local frontDoorId <const> = isPassengerSide and 1 or 0
    local rearDoorId <const> = isPassengerSide and 3 or 2

    local frontDoorBonePosition <const> = hasDoor(entity, frontDoorId)
        and getRelativeDoorCoords(entity, frontDoorId)
        or nil

    local rearDoorBonePosition <const> = hasDoor(entity, rearDoorId)
        and getRelativeDoorCoords(entity, rearDoorId)
        or nil

    if rearDoorBonePosition then
        if relativeCoordsY <= rearDoorBonePosition.y
            and (#(relativeCoords - rearDoorBonePosition) < 2.5) then
            return rearDoorId
        end
    end

    if frontDoorBonePosition then
        if relativeCoordsY <= frontDoorBonePosition.y
            and (rearDoorBonePosition and (relativeCoordsY > rearDoorBonePosition.y) or true)
            and #(relativeCoords - frontDoorBonePosition) < 2.5 then

            return frontDoorId
        end
    end

    return nil
end

function utils.getStreetName(location)
   local streetNameHash <const>, crossingRoadHash <const> = GetStreetNameAtCoord(location.x, location.y, location.z)
   local streetName = GetStreetNameFromHashKey(streetNameHash)
   local crossingRoad <const> = GetStreetNameFromHashKey(crossingRoadHash)

   if crossingRoad and crossingRoad ~= "" then
      streetName = streetName .. " – " .. crossingRoad
   end

   return streetName
end

return utils