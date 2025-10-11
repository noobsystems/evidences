local config <const> = require "config"
local eventHandler <const> = require "common.events.handler"
local framework <const> = require "common.frameworks.framework"

local tempObject = nil

exports("evidence_laptop", function(data, slot)
    if not framework.hasPermission("place") then
        config.notify({
            key = "laptop.notifications.error_laptop_creation"
        }, "error")
        return
    end

    if tempObject then
        return
    end

    local coords <const> = GetEntityCoords(cache.ped)
    tempObject = CreateObject(lib.requestModel("p_laptop_02_s"), coords.x, coords.y, coords.z + 1.5, false, true, false)

    SetEntityHeading(tempObject, 0)
    SetEntityAlpha(tempObject, 150)
    SetEntityCollision(tempObject, false, false)
    FreezeEntityPosition(tempObject, true)

    config.inputHelp.show(locale("laptop.notifications.input_help"), {
        tildeDelimitedCodes = { "~INPUT_FRONTEND_ACCEPT~", "~n~", "~INPUT_FRONTEND_CANCEL~" },
        mappedValues = { "[ENTER]", "\n", "[ESC]" }
    })

    CreateThread(function()
        local confirmed = false

        while true do
            if IsControlPressed(0, 202) then
                break
            end

            if IsControlPressed(0, 201) then
                confirmed = true
                break
            end

            local hit <const>, _, endCoords <const>, _, _ = lib.raycast.fromCamera(339, 4, 10)
            if hit and endCoords ~= vector3(0, 0, 0) then
                SetEntityCoords(tempObject, endCoords.x, endCoords.y, endCoords.z)

                local camCoords <const> = GetGameplayCamCoord()
                local heading <const> = math.deg(math.atan2(camCoords.y - endCoords.y, camCoords.x - endCoords.x))
                SetEntityHeading(tempObject, heading + 90.0)
            end

            Wait(0)
        end

        local x <const>, y <const>, z <const> = table.unpack(GetEntityCoords(tempObject))
        local finalCoords <const> = vector4(x, y, z, GetEntityHeading(tempObject))

        DeleteObject(tempObject)
        tempObject = nil

        config.inputHelp.hide()

        if confirmed then
            lib.callback("evidences:laptops:place", false, function(success)
                if success then
                    exports.ox_inventory:useItem(data, function(data)
                        lib.playAnim(cache.ped, "mp_common", "givetake1_a")
                    end)
                    return
                end

                config.notify({
                    key = "laptop.notifications.error_laptop_creation"
                }, "error")
            end, finalCoords)
        end
    end)
end)

eventHandler.onLocal("onResourceStop", function(event)
    if event.arguments[1] == cache.resource then
        config.inputHelp.hide()
        DeleteObject(tempObject)
    end
end)