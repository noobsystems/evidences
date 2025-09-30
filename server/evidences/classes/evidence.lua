local eventHandler <const> = require "common.events.handler"

---@class EVIDENCE : OxClass
---@field owner string The identifier for the evidence (e.g. the fingerprint, dna or serial number of a weapon)
local EVIDENCE = lib.class("EVIDENCE")

function EVIDENCE:constructor(owner)
    self.owner = owner
    self.eventHandlers = {}
end


---@private
---@param object Evidence A current instance of this class
---@param entity number The netId of the target entity
---@param currentEvidencesOfThisType table The list of evidence of this type stored in the statebag of the entity to which the entity is added
---@param metadata? table
-- Entity(entity).state = {
--     evidences = {
--         object.__name = {
--             object.owner = {
--                 createdAt: metadata.createdAt or os.time()
--                 ... all other key-value pairs of metadata
--             },
--             ... all other evidences of this type
--         },
--         ... all other evidences of different types
--     },
--     ... all other data stored into the statebag
-- }
local function atEntityInternal(object, entity, currentEvidencesOfThisType, metadata)
    metadata = metadata or {}
    metadata.createdAt = metadata.createdAt or os.time()

    currentEvidencesOfThisType[object.owner] = metadata
    Entity(entity).state[string.format("evidences:%s", object.__name)] = currentEvidencesOfThisType
end


-- Binds the evidence to an entity. It can be destroyed or collected by targetting the entity.
-- While destroying the evidence triggers the removeFromEntity() function, collecting the evidence also transfers it to an item created for that purpose.
---@param entity number The netId of the entity the evidence should be bound to
---@param metadata? table
function EVIDENCE:atEntity(entity, metadata)
    if not DoesEntityExist(entity) then
        entity = NetworkGetEntityFromNetworkId(entity)
    end

    atEntityInternal(self, entity, Entity(entity).state[string.format("evidences:%s", self.__name)] or {}, metadata)
end

-- Removes the evidence from an entity is bound to.
---@param entity number The netId of the entity
function EVIDENCE:removeFromEntity(entity)
    if not DoesEntityExist(entity) then
        entity = NetworkGetEntityFromNetworkId(entity)
    end

    local currentEvidencesOfThisType = Entity(entity).state[string.format("evidences:%s", self.__name)] or {}
    currentEvidencesOfThisType[self.owner] = nil
    Entity(entity).state[string.format("evidences:%s", self.__name)] = currentEvidencesOfThisType
end


-- Binds the evidence to a seat of a vehicle. Targetting the evidence requires the player to sit on this seat inside the vehicle.
-- A maximum of one evidence is bound to the vehicle, whereby a separate key is stored in the data of the evidence at the entity for each individual seat:
-- Entity(vehicle).state[evidences:self.__name][self.owner] = {
--     seatIds = {
--         evidence at the front driver seat:
--         [-1] = {
--             metadata.createdAt or os.time()
--             ... all other key-value pairs of metadata
--         },
--
--         evidence at the front passenger seat:
--         [0] = {
--             metadata.createdAt or os.time()
--             ... all other key-value pairs of metadata
--         },
--
--         ...
--     },
--     ...
-- }
---@param vehicle number The netId of the vehicle the evidence should be bound to
---@param seatId number The id of the seat (look at https://docs.fivem.net/natives/?_0x22AC59A870E6A669 for a list of seat indices)
---@param metadata? table
function EVIDENCE:atVehicleSeat(vehicle, seatId, metadata)
    if not DoesEntityExist(vehicle) then
        vehicle = NetworkGetEntityFromNetworkId(vehicle)
    end

    local currentEvidencesOfThisType = Entity(vehicle).state[string.format("evidences:%s", self.__name)] or {}
    metadata = metadata or {}
    metadata.seatIds = (currentEvidencesOfThisType[self.owner] and currentEvidencesOfThisType[self.owner].seatIds) or {}
    metadata.seatIds[seatId] = true

    atEntityInternal(self, vehicle, currentEvidencesOfThisType, metadata)
end

-- Removes the evidence from the vehicle seat it is bound to.
---@param vehicle number The nedId of the vehicle
---@param seatIds number[]|number The seatId or a list of seatIds
function EVIDENCE:removeFromVehicleSeats(vehicle, seatIds)
    if not DoesEntityExist(vehicle) then
        vehicle = NetworkGetEntityFromNetworkId(vehicle)
    end

    local currentEvidencesOfThisType = Entity(vehicle).state[string.format("evidences:%s", self.__name)] or {}
    local evidenceSeatIds = (currentEvidencesOfThisType[self.owner] and currentEvidencesOfThisType[self.owner].seatIds) or {}
    for _, seatId in pairs(type(seatIds) == "table" and seatIds or { seatIds }) do
        evidenceSeatIds[seatId] = nil
    end
    currentEvidencesOfThisType[self.owner].seatIds = evidenceSeatIds

    Entity(vehicle).state[string.format("evidences:%s", self.__name)] = currentEvidencesOfThisType
end


-- Binds the evidence to a door of a vehicle. If 0 < vehicle door count ≤ 4 targetting the evidence requires the player to look at exactly that door otherwise targetting the vehicle is sufficient.
-- The storing of multiple pieces of evidence of one owner on different doors of the same vehicle is similar to the procedure for vehicle seats (see above).
---@param vehicle number The netId of the vehicle the evidence should be bound to
---@param doorId number The id of the door (look at https://docs.fivem.net/natives/?_0x93D9BD300D7789E5 for a list of door indices)
---@param metadata? table
function EVIDENCE:atVehicleDoor(vehicle, doorId, metadata)
    if not DoesEntityExist(vehicle) then
        vehicle = NetworkGetEntityFromNetworkId(vehicle)
    end

    local currentEvidencesOfThisType = Entity(vehicle).state[string.format("evidences:%s", self.__name)] or {}
    metadata = metadata or {}
    metadata.doorIds = (currentEvidencesOfThisType[self.owner] and currentEvidencesOfThisType[self.owner].doorIds) or {}
    metadata.doorIds[doorId] = true

    atEntityInternal(self, vehicle, currentEvidencesOfThisType, metadata)
end

-- Removes the evidence from the vehicle door it is bound to.
---@param vehicle number The nedId of the vehicle
---@param doorIds number[]|number The doorId or a list of doorIds
function EVIDENCE:removeFromVehicleDoors(vehicle, doorIds)
    if not DoesEntityExist(vehicle) then
        vehicle = NetworkGetEntityFromNetworkId(vehicle)
    end

    local currentEvidencesOfThisType = Entity(vehicle).state[string.format("evidences:%s", self.__name)] or {}
    local evidenceDoorIds = (currentEvidencesOfThisType[self.owner] and currentEvidencesOfThisType[self.owner].doorIds) or {}
    for _, doorId in pairs(type(doorIds) == "table" and doorIds or { doorIds }) do
        evidenceDoorIds[doorId] = nil
    end
    currentEvidencesOfThisType[self.owner].doorIds = evidenceDoorIds

    Entity(vehicle).state[string.format("evidences:%s", self.__name)] = currentEvidencesOfThisType
end


-- Binds the evidence to a player. It can be destroyed or collected by targetting the player.
-- While destroying the evidence triggers the removeFromPlayer() function, collecting the evidence also transfers it to an item created for that purpose.
---@param playerId number The serverId of the player the evidence should be bound to
---@param metadata? table
function EVIDENCE:atPlayer(playerId, metadata)
    local currentEvidencesOfThisType = Player(playerId).state[string.format("evidences:%s", self.__name)] or {}
    currentEvidencesOfThisType[self.owner] = metadata

    Player(playerId).state[string.format("evidences:%s", self.__name)] = currentEvidencesOfThisType
end

-- Removes the evidence from the player it is bound to.
---@param playerId number The serverId of the player
function EVIDENCE:removeFromPlayer(playerId)
    local currentEvidencesOfThisType = Player(playerId).state[string.format("evidences:%s", self.__name)] or {}
    currentEvidencesOfThisType[self.owner] = nil

    Player(playerId).state[string.format("evidences:%s", self.__name)] = currentEvidencesOfThisType
end


EvidencesAtCoords = {}

-- Creates an collectable evidence at the given coords.
-- While destroying the evidence triggers the removeFromCoords() function, collecting the evidence also transfers it to an item created for that purpose.
---@param coords vector3 The coords of for that evidence
---@param metadata? table
function EVIDENCE:atCoords(coords, metadata)
    -- Prevent spawning multiple evidences at exactly the same coords
    if EvidencesAtCoords[coords] then
        return
    end

    metadata = metadata or {}
    metadata.createdAt = metadata.createdAt or os.time()

    TriggerClientEvent("evidences:sync:atCoords", -1, self.__name, self.owner, coords, metadata)

    -- Sync the evidence at the given coords with players joining after the creation.
    -- This is not done for the other holding types beacuse the metadata in statebags is synced by default.
    self.eventHandlers[coords] = eventHandler.onLocal("evidences:server:playerSpawned", function(event)
        TriggerClientEvent("evidences:sync:atCoords", event.arguments[1], self.__name, self.owner, coords, metadata)
    end)

    EvidencesAtCoords[coords] = self
end

-- Removes the evidence from the given coords.
---@param coords vector3
function EVIDENCE:removeFromCoords(coords)
    if not EvidencesAtCoords[coords] then return end

    TriggerClientEvent("evidences:remove:atCoords", -1, self.__name, coords)

    if self.eventHandlers[coords] then
        eventHandler.removeCallback("evidences:server:playerSpawned", self.eventHandlers[coords])
    end

    EvidencesAtCoords[coords] = nil
end


-- Binds the evidence to an item. Items can hold only one evidence of each type at a time. The currently stored evidence of this type on the item is overwritten.
-- Those items holding evidences inventories or inside containers in the inventories are listet in the dna and fingerprint app on the evidence laptop.
-- Items holding magazine type evidences are labeled with some of the given data.
-- The metadata of an item holding an evidence looks like that:
-- {
--     [DNA/FINGERPRINT/MAGAZINE] = {
--         owner = self.owner,
--         createdAt = os.time,
--         ... all other key-value pairs of data
--     }
-- }
---@param inventory table|string|number The inventory of the item holding the evidence (cf. https://coxdocs.dev/ox_inventory/Functions/Server#additem)
---@param slot number The slot of the item in the inventory
---@param data? table
function EVIDENCE:atItem(inventory, slot, data)
    local item <const> = exports.ox_inventory:GetSlot(inventory, slot)

    if item or next(item) == nil then
        local metadata <const> = item.metadata or {}
        metadata[self.superClassName] = {
            owner = self.owner,
            createdAt = os.time()
        }

        for key, value in pairs(data or {}) do
            metadata[key] = value
        end

        exports.ox_inventory:SetMetadata(inventory, slot, metadata)
    end
end


local lastUsedItems = {}
eventHandler.onLocal("ox_inventory:usedItem", function(event)
    local playerId <const>, name <const>, slotId <const>, metadata <const> = table.unpack(event.arguments)
    lastUsedItems[playerId] = slotId
end)

-- Binds the evidence to the last item a player used.
---@param playerId number The serverId of the player
---@param data? table
function EVIDENCE:atLastUsedItemOf(playerId, data)
    local lastUsedItem <const> = lastUsedItems[playerId]
    if lastUsedItem then
        self:atItem(playerId, lastUsedItem, data)
    end
end

-- Binds the evidence to the current weapon of a player.
---@param playerId number The serverId of the player
---@param data? table
function EVIDENCE:atWeaponOf(attacker, data)
    local weapon <const> = exports.ox_inventory:GetCurrentWeapon(attacker)
    if weapon and weapon.slot then
        self:atItem(attacker, weapon.slot, data)
    end
end


return EVIDENCE