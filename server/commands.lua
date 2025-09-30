local api <const> = require "server.evidences.api"

local function clearEvidences(state, evidenceTypes)
    local count = 0
    for _, class in pairs(evidenceTypes) do
        if state["evidences:" .. class.__name] then
            state["evidences:" .. class.__name] = nil
            count += 1
        end
    end

    return count
end

lib.addCommand("clearEvidences", {
    help = "Command to remove evidences in a certain area around you.",
    params = {
        {
            name = "radius",
            type = "number",
            help = "Radius in which evidences shall be cleared."
        }
    },
    restricted = "group.admin"
}, function(source, args, raw)
    local radius <const> = args.radius
    
    if radius < 1 or radius > 500 then
        TriggerClientEvent("evidences:notify", source, {key = "commands.invalid_radius"}, "error")
        return
    end

    local playerCoords <const> = GetEntityCoords(GetPlayerPed(source))
    local evidenceCounter = 0

    -- clear entity evidences
    for _, object in ipairs(lib.getNearbyObjects(playerCoords, radius)) do
        evidenceCounter += clearEvidences(Entity(object.object).state, api.evidenceTypes)
    end

    for _, player in ipairs(lib.getNearbyPlayers(playerCoords, radius)) do
        evidenceCounter += clearEvidences(Entity(player.ped).state, api.evidenceTypes)
        evidenceCounter += clearEvidences(Player(player.id).state, api.evidenceTypes)
    end

    for _, vehicle in ipairs(lib.getNearbyVehicles(playerCoords, radius)) do
        evidenceCounter += clearEvidences(Entity(vehicle.vehicle).state, api.evidenceTypes)
    end

    -- clear ground evidences
    for coords, evidence in pairs(EvidencesAtCoords) do
        if #(playerCoords - coords) <= radius then
            evidence:removeFromCoords(coords)
            evidenceCounter += 1
        end
    end

    if evidenceCounter == 0 then
        TriggerClientEvent("evidences:notify", source, {key = "commands.no_evidences"}, "error")
        return
    end

    TriggerClientEvent("evidences:notify", source, {key = "commands.evidences_deleted", arguments = {radius, evidenceCounter}}, "success")
end)