local config <const> = require "config"

local lastEnteredVehicle = nil

lib.onCache("vehicle", function(value, oldValue)
    lastEnteredVehicle = value or lastEnteredVehicle
end)

-- vehicle(door) fingerprint
lib.onCache("seat", function(value, oldValue)
    if (not oldValue and value) or (oldValue and not value) then
        -- player is entering or exiting a vehicle
        if config.isPedWearingGloves() then
            return
        end

        local seatId <const> = value or oldValue
        local vehicle <const> = cache.vehicle or lastEnteredVehicle
        local entityModel <const> = GetEntityModel(cache.vehicle)

        -- our own vehicle door targeting logic only works with vehicles that have at least two doors
        -- checking whether the number of seats is less than or equal to 4 is necessary as our logic doesn't work for busses
        if GetNumberOfVehicleDoors(vehicle) >= 2 and GetVehicleModelNumberOfSeats(entityModel) <= 4 then
            -- vehicle door fingerprint
            TriggerServerEvent("evidences:new", "FINGERPRINT", cache.serverId,
                "atVehicleDoor", NetworkGetNetworkIdFromEntity(vehicle), seatId + 1 --[[doorId]], { plate = GetVehicleNumberPlateText(vehicle) })
        else
            -- vehicle fingerprint
            TriggerServerEvent("evidences:new", "FINGERPRINT", cache.serverId,
                "atEntity", NetworkGetNetworkIdFromEntity(vehicle), { plate = GetVehicleNumberPlateText(vehicle) })
        end
    end
end)