local config <const> = require "config"
local framework <const> = require "common.frameworks.framework"
local eventHandler <const> = require "common.events.handler"

local sync = {
    points = {}
}

local model <const> = `p_laptop_02_s`

---@param coords vector4[] | vector4
local function spawnLaptops(coords)
    coords = type(coords) == "table" and coords or { coords }

    for _, entry in ipairs(coords) do
        entry = vector4(entry.x, entry.y, entry.z, entry.w)

        sync.points[entry] = lib.points.new({
            coords = entry,
            distance = 15,
            onEnter = function(point)
                if not point.entity then
                    lib.requestModel(model)

                    point.entity = CreateObject(model, entry.x, entry.y, entry.z, false, true)
                    FreezeEntityPosition(point.entity, true)
                    SetEntityCoords(point.entity, entry.x, entry.y, entry.z)
                    SetEntityHeading(point.entity, entry.w)
                    SetModelAsNoLongerNeeded(model)

                    -- Play this animation to the laptop to keep it closed
                    lib.requestAnimDict("switch@franklin@on_laptop")
                    PlayEntityAnim(point.entity, "001927_01_fras_v2_4_on_laptop_exit_laptop", "switch@franklin@on_laptop", 1.0, false, true, false, 1.0)
                end
            end,
            onExit = function(point)
                if point.entity then
                    if DoesEntityExist(point.entity) then
                        DeleteObject(point.entity)
                    end
                    point.entity = nil
                end
            end
        })
    end
end

RegisterNetEvent("evidences:client:spawnLaptops", function(coords)
    spawnLaptops(coords)
end)

spawnLaptops(lib.callback.await("evidences:laptops:select", false) or {})

local function destroyLaptop(point)
    point:onExit()
    point:remove()
end

RegisterNetEvent("evidences:client:destroyLaptop", function(coords)
    local point <const> = sync.points[coords]
    if point then
        destroyLaptop(point)
    end
end)

eventHandler.onLocal("onResourceStop", function(event)
    if event.arguments[1] == cache.resource then
        for _, point in pairs(sync.points) do
            destroyLaptop(point)
        end
    end
end)

return sync