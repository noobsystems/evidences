local config <const> = require "config"
local eventHandler <const> = require "common.events.handler"
local evidenceTypes <const> = require "common.evidence_types"
local utils <const> = require "client.evidences.utils"

AddStateBagChangeHandler(nil, nil, function(bagName, key, value)
    if string.sub(key, 1, #"evidences:") == "evidences:" then
        lib.print.debug("statebag changed: " .. bagName .. " " .. key .. " " .. json.encode(value, {indent=true}))
    end
end)

local function getTargetedEvidences(evidences, isTargeted)
    local targets = {}
    
    for owner, data in pairs(evidences or {}) do
        if isTargeted(data) then
            targets[#targets + 1] = {
                owner = owner,
                data = data
            }
        end
    end

    return targets
end

-- atPlayer
local function createPlayerTarget(evidenceType, options, action)
    return {
        name = string.format("%s:player:%s", evidenceType, action),
        label = options.target[action].label,
        icon = options.target[action].icon or "fa-solid fa-magnifying-glass",
        groups = config.allowedJobs,
        items = options.target[action].requiredItem or nil,
        canInteract = function(entity, distance, coords, name, bone)
            -- get all evidences of evidenceType on the player
            local player <const> = GetPlayerServerId(NetworkGetPlayerIndexFromPed(entity))
            local evidences <const> = Player(player).state[string.format("evidences:%s", evidenceType)] or {}
            return evidences and next(evidences)
        end,
        onSelect = function(data)
            local player <const> = GetPlayerServerId(NetworkGetPlayerIndexFromPed(data.entity))
            local evidences <const> = Player(player).state[string.format("evidences:%s", evidenceType)] or {}
            local targetedEvidences = getTargetedEvidences(evidences, function(_) return true end)

            for _, evidence in pairs(targetedEvidences) do
                local metadata <const> = options.target[action].createMetadata and options.target[action].createMetadata(evidenceType, evidence.data, data.coords) or nil

                local error <const> = lib.callback.await(string.format("evidences:%s", action), false, evidenceType, evidence.owner, {
                    fun = "removeFromPlayer",
                    arguments = { player }
                }, metadata)

                if error then
                    config.notify({
                        key = string.format("evidences.notifications.common.errors.%s", error)
                    }, "error")
                    return
                end

                lib.playAnim(cache.ped, "mp_common", "givetake1_a")
            end

            config.notify({
                key = string.format("evidences.notifications.%s", action),
                arguments = {locale("evidences.notifications.common.placeholders.at_player")}
            }, "success")
        end
    }
end

-- atVehicleDoor
-- may only be targeted when the player targets the vehicle door from outside
local function createVehicleDoorTarget(evidenceType, options, action)
    return {
        name = string.format("%s:vehicle_door:%s", evidenceType, action),
        label = options.target[action].label,
        icon = options.target[action].icon or "fa-solid fa-magnifying-glass",
        groups = config.allowedJobs,
        items = options.target[action].requiredItem or nil,
        distance = 2,
        bones = { "door_dside_f", "door_pside_f", "door_dside_r", "door_pside_r" },
        canInteract = function(entity, distance, coords, name, bone)
            if cache.vehicle then
                return false
            end

            local targetedDoorId <const> = utils.getTargetedVehicleDoorId(entity, coords)
            if not targetedDoorId then
                return false
            end
            
            -- get all evidences of evidenceType at the targeted vehicle door
            local evidences <const> = Entity(entity).state[string.format("evidences:%s", evidenceType)] or {}
            return #getTargetedEvidences(evidences, function(data)
                return data.doorIds and data.doorIds[targetedDoorId]
            end) > 0
        end,
        onSelect = function(data)
            local targetedDoorId <const> = utils.getTargetedVehicleDoorId(data.entity, data.coords)
            if not targetedDoorId then
                return
            end
            
            -- get all evidences of evidenceType at the targeted vehicle door
            local evidences <const> = Entity(data.entity).state[string.format("evidences:%s", evidenceType)] or {}
            local targetedEvidences <const> = getTargetedEvidences(evidences, function(evidenceData)
                return evidenceData.doorIds and evidenceData.doorIds[targetedDoorId]
            end)

            for _, evidence in pairs(targetedEvidences) do
                local metadata <const> = options.target[action].createMetadata and options.target[action].createMetadata(evidenceType, evidence.data, data.coords, { door = targetedDoorId }) or nil

                local error <const> = lib.callback.await(string.format("evidences:%s", action), false, evidenceType, evidence.owner, {
                    fun = "removeFromVehicleDoors",
                    arguments = { VehToNet(data.entity), targetedDoorId }
                }, metadata)

                if error then
                    config.notify({
                        key = string.format("evidences.notifications.common.errors.%s", error)
                    }, "error")
                    return
                end

                lib.playAnim(cache.ped, "mp_common", "givetake1_a")
            end

            config.notify({
                key = string.format("evidences.notifications.%s", action),
                arguments = {locale("evidences.notifications.common.placeholders.at_vehicle_door")}
            }, "success")
        end
    }
end

-- atVehicleSeat
-- may only be targeted when the player targets the vehicle from the inside
local function createVehicleSeatTarget(evidenceType, options, action)
    return {
        name = string.format("%s:vehicle_seat:%s", evidenceType, action),
        label = options.target[action].label,
        icon = options.target[action].icon or "fa-solid fa-magnifying-glass",
        groups = config.allowedJobs,
        items = options.target[action].requiredItem or nil,
        canInteract = function(entity, distance, coords, name, bone)
            if distance > 2 then
                return false
            end

            if not cache.vehicle or not cache.seat then
                return false
            end
            
            -- get all evidences of evidenceType at the player's vehicle seat
            local evidences <const> = Entity(cache.vehicle).state[string.format("evidences:%s", evidenceType)] or {}
            return #getTargetedEvidences(evidences, function(data)
                return data.seatIds and data.seatIds[cache.seat]
            end) > 0
        end,
        onSelect = function(data)
            -- get all evidences of evidenceType at the player's vehicle seat
            local evidences <const> = Entity(cache.vehicle).state[string.format("evidences:%s", evidenceType)] or {}
            local targetedEvidences <const> = getTargetedEvidences(evidences, function(evidenceData)
                return evidenceData.seatIds and evidenceData.seatIds[cache.seat]
            end)

            for _, evidence in pairs(targetedEvidences) do
                local metadata <const> = options.target[action].createMetadata and options.target[action].createMetadata(evidenceType, evidence.data, data.coords, { seat = cache.seat }) or nil

                local error <const> = lib.callback.await(string.format("evidences:%s", action), false, evidenceType, evidence.owner, {
                    fun = "removeFromVehicleSeats",
                    arguments = { VehToNet(cache.vehicle), cache.seat }
                }, metadata)

                if error then
                    config.notify({
                        key = string.format("evidences.notifications.common.errors.%s", error)
                    }, "error")
                    return
                end

                lib.playAnim(cache.ped, (cache.seat == -1 and "veh@helicopter@ds@base" or "veh@helicopter@ps@base"), "lean_forward_idle")
            end

            config.notify({
                key = string.format("evidences.notifications.%s", action),
                arguments = {locale("evidences.notifications.common.placeholders.at_vehicle_seat")}
            }, "success")
        end
    }
end

-- atEntity
local function createEntityTarget(evidenceType, options, action)
    return {
        name = string.format("%s:entity:%s", evidenceType, action),
        label = options.target[action].label,
        icon = options.target[action].icon or "fa-solid fa-magnifying-glass",
        groups = config.allowedJobs,
        items = options.target[action].requiredItem or nil,
        canInteract = function(entity, distance, coords, name, bone)
            if distance > 2 then
                return false
            end

            if not entity or not DoesEntityExist(entity) then
                return false
            end
            
            -- get all evidences of evidenceType on the entity
            local evidences <const> = Entity(entity).state[string.format("evidences:%s", evidenceType)] or {}
            return #getTargetedEvidences(evidences, function(data)
                return not data.seatIds and not data.doorIds
            end) > 0
        end,
        onSelect = function(data)
            -- get all evidences of evidenceType on the entity
            local evidences <const> = Entity(data.entity).state[string.format("evidences:%s", evidenceType)] or {}
            local targetedEvidences <const> = getTargetedEvidences(evidences, function(evidenceData)
                return not evidenceData.seatIds and not evidenceData.doorIds
            end)

            for _, evidence in pairs(targetedEvidences) do
                local metadata <const> = options.target[action].createMetadata and options.target[action].createMetadata(evidenceType, evidence.data, data.coords) or nil

                local error <const> = lib.callback.await(string.format("evidences:%s", action), false, evidenceType, evidence.owner, {
                    fun = "removeFromEntity",
                    arguments = { NetworkGetNetworkIdFromEntity(data.entity) }
                }, metadata)

                if error then
                    config.notify({
                        key = string.format("evidences.notifications.common.errors.%s", error)
                    }, "error")
                    return
                end

                lib.playAnim(cache.ped, "mp_common", "givetake1_a")
            end

            config.notify({
                key = string.format("evidences.notifications.%s", action),
                arguments = {locale("evidences.notifications.common.placeholders.at_entity")}
            }, "success")
        end
    }
end

for evidenceType, options in pairs(evidenceTypes) do
    exports.ox_target:addGlobalPlayer({
        createPlayerTarget(evidenceType, options, "collect"),
        createPlayerTarget(evidenceType, options, "destroy")
    })

    exports.ox_target:addGlobalVehicle({
        createVehicleDoorTarget(evidenceType, options, "collect"),
        createVehicleDoorTarget(evidenceType, options, "destroy")
    })

    exports.ox_target:addGlobalOption({
        createVehicleSeatTarget(evidenceType, options, "collect"),
        createVehicleSeatTarget(evidenceType, options, "destroy")
    })

    exports.ox_target:addGlobalOption({
        createEntityTarget(evidenceType, options, "collect"),
        createEntityTarget(evidenceType, options, "destroy")
    })
end

RegisterNetEvent("evidences:sync:atCoords", function(evidenceType, owner, coords, data)
    EvidenceAtCoords:new(evidenceType, owner, coords, data)
end)

eventHandler.onLocal("onResourceStop", function(event)
    if event.arguments[1] == cache.resource then
        local actions <const> = {"collect", "destroy"}

        for evidenceType, _ in pairs(evidenceTypes) do
            for _, action in pairs(actions) do
                exports.ox_target:removeGlobalPlayer(string.format("%s:player:%s", evidenceType, action))
                exports.ox_target:removeGlobalVehicle(string.format("%s:vehicle_door:%s", evidenceType, action))
                exports.ox_target:removeGlobalOption(string.format("%s:vehicle_seat:%s", evidenceType, action))
                exports.ox_target:removeGlobalOption(string.format("%s:entity:%s", evidenceType, action))
            end
        end
    end
end)