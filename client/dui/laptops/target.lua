local config <const> = require "config"

local dui <const> = require "client.dui.dui"
local sync <const> = require "client.dui.laptops.sync"
local focus <const> = require "client.dui.focus"

local lastTargetCoords = nil

exports.ox_target:addModel(`p_laptop_02_s`, {
    -- Everyone can interact with any laptop entity
    {
        label = locale("laptop.target.interact"),
        icon = "fa-solid fa-laptop",
        distance = 2,
        canInteract = function(entity)
            local coords <const> = GetEntityCoords(entity)
            if coords == lastTargetCoords then
                -- Keep the laptop opened while targetting it
                PlayEntityAnim(entity, "001927_01_fras_v2_4_on_laptop_exit_laptop", "switch@franklin@on_laptop", 1.0, false, true, false, 0.0)
                SetEntityAnimCurrentTime(entity, "switch@franklin@on_laptop", "001927_01_fras_v2_4_on_laptop_exit_laptop", 0.0)
                return true
            end

            -- Logout the player if he targets a new laptop
            dui:sendMessage({
                action = "switchScreen",
                screen = "screensaver"
            })
            
            lastTargetCoords = coords
            return false
        end,
        onSelect = function(data)
            focus.start(data.entity)
        end
    },

    -- Players with the required job can pick up laptops that were placed by this script
    {
        label = locale("laptop.target.pickup"),
        icon = "fa-solid fa-arrow-up-from-bracket",
        distance = 2,
        canInteract = function(entity)
            for _, point in pairs(sync.points) do
                if point.entity == entity then
                    return true
                end
            end

            return false
        end,
        onSelect = function(data)
            for coords, point in pairs(sync.points) do
                if point.entity == data.entity then
                    lib.callback("evidences:laptops:pickup", false, function(success)
                        if success then
                            lib.playAnim(cache.ped, "mp_common", "givetake1_a")
                            return
                        end

                        config.notify({
                            key = "laptop.notifications.error_laptop_pickup"
                        }, "error")
                    end, coords)

                    break
                end
            end
        end
    }
})