local lastHealth = nil

Citizen.CreateThread(function() -- detects healing
    Wait(500)
    lastHealth = GetEntityHealth(cache.ped)
    
    while true do
        local health <const> = GetEntityHealth(cache.ped)
        if lastHealth < health then
            lastHealth = health
        end

        for _, evidence in ipairs(EvidencesAtCoords) do
            if evidence.evidenceType == "BLOOD" then
                if evidence:isExposedToRain() then
                    evidence:destroy()
                end
            end
        end
        
        Wait(500)
    end
end)

AddEventHandler("gameEventTriggered", function(name, args)
    if name == "CEventNetworkEntityDamage" then
        if args[1] == cache.ped then
            local ped <const> = cache.ped
            local damageAmount <const> = lastHealth - GetEntityHealth(cache.ped)
            
            if damageAmount > 5 then
                -- item blood
                if (args[12] or 0) == 1 then
                    local victim <const> = cache.serverId
                    local attacker <const> = GetPlayerServerId(NetworkGetPlayerIndexFromPed(args[2]))
                    TriggerServerEvent("evidences:new", "BLOOD",
                        victim, "atWeaponOf", attacker)
                end
                
                -- vehicle blood
                if cache.vehicle then
                    if not IsPedOnAnyBike(ped) then
                        TriggerServerEvent("evidences:new", "BLOOD", cache.serverId,
                            "atVehicleSeat", NetworkGetNetworkIdFromEntity(cache.vehicle), cache.seat, {
                                plate = GetVehicleNumberPlateText(cache.vehicle)
                            })
                        return
                    end
                end

                -- ground blood
                local coords <const> = GetEntityCoords(cache.ped)
                local success <const>, groundZ <const> = GetGroundZFor_3dCoord(coords.x, coords.y, coords.z, false)
                if success then
                    TriggerServerEvent("evidences:new", "BLOOD", cache.serverId,
                        "atCoords", vector3(coords.x, coords.y, groundZ))
                end
            end

            lastHealth = GetEntityHealth(cache.ped)
        end
    end
end)
