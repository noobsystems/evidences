local config <const> = require "config"
local eventHandler <const> = require "common.events.handler"
local framework <const> = require "common.frameworks.framework"
local dui <const> = require "client.dui.dui"
local texture <const> = require "client.dui.laptops.texture.texture"

local started = false
local lastX, lastY = 0, 0
local cam = nil

local focus = {}

local function handleMouse()
    local x <const>, y <const> = GetNuiCursorPosition()
    if x ~= lastX or y ~= lastY then -- update cursor position if mouse was moved
        -- calculate mouse position based on the user's screen size and send it to the dui
        local screenWidth, screenHeight <const> = GetActualScreenResolution()
        local scaleX <const> = 1920 / screenWidth
        local scaleY <const> = 1080 / screenHeight

        SendDuiMouseMove(dui.duiObject, math.floor((x * scaleX) + 0.5), math.floor((y * scaleY) + 0.5))
        lastX, lastY = x, y
    end

    if IsControlJustPressed(0, 237) then
        SendDuiMouseDown(dui.duiObject, "left")
    elseif IsControlJustReleased(0, 237) then
        SendDuiMouseUp(dui.duiObject, "left")
    end

    if IsControlJustPressed(0, 241) then
        SendDuiMouseWheel(dui.duiObject, 100, 0)
    elseif IsControlJustPressed(0, 242) then
        SendDuiMouseWheel(dui.duiObject, -100, 0)
    end
end

local function handleKeydown(key)
    if key == "Escape" then
        focus.stop()
        return
    end

    dui:sendMessage({
        action = "keydown",
        key = key
    })
end

eventHandler.onNui("keydown", function(event)
    if started then
        handleKeydown(event.data.key)
    end
end)

eventHandler.onNui("paste", function(event)
    if started then
        dui:sendMessage({
            action = "paste",
            clipboard = event.data.clipboard
        })
    end
end)

function focus.start(laptop)
    if not started then
        started = true
        -- render the dui on the laptop's screen again just in case it didn't work on startup ("black screen bug")
        texture.replace("script_rt_tvscreen", dui.dictName, dui.txtName)

        DisplayRadar(false)
        SetNuiFocus(true, false)
    
        local disabledApps = {}

        if not (GetResourceState("pma-voice"):find("start") and config.wiretap.enabled) then
            table.insert(disabledApps, "wiretap")
        end

        if not config.firearmsRegistry.enabled then
            table.insert(disabledApps, "firearms_registry")
        end

        dui:sendMessage({
            action = "focus",
            language = GetConvar("ox:locale", "en"),
            playerName = framework.getPlayerName(),
            canAccess = framework.hasPermission(config.permissions.access),
            options = {
                areCitizensSynced = config.citizens.synced,
                displayPhoneNumbers = config.wiretap.calls.displayPhoneNumbers or false,
                mayInterceptCalls = framework.hasPermission(config.wiretap.calls.permissions),
                mayInterceptRadio = framework.hasPermission(config.wiretap.radio.permissions),
                mayListenToSpyMicrophones = framework.hasPermission(config.wiretap.spyMicrophones.permissions),
                disabledApps = disabledApps
            }
        })

        -- Create a cam that faces the laptop's screen and render it for the player.
        -- Now that he focused the dui, we are going to keep the laptop opened, block movements, combat etc. and send mouse events and redirect keyboard events to the dui.
        -- We do this until the dui kicks out the player or he presses ESC. Then we have to destroy the cam and stop the loop.
        cam = CreateCam("DEFAULT_SCRIPTED_CAMERA", true)
        AttachCamToEntity(cam, laptop, 0.0, -0.25, 0.25, true)
        SetCamRot(cam, -22.5, 0.0, GetEntityHeading(laptop))
        SetCamFov(cam, 45.0)
        RenderScriptCams(true, true, 1000, true, true)

        PlayEntityAnim(laptop, "001927_01_fras_v2_4_on_laptop_exit_laptop", "switch@franklin@on_laptop", 1.0, false, true, false, 0.0)

        CreateThread(function()
            while started do
                SetEntityAnimCurrentTime(laptop, "switch@franklin@on_laptop", "001927_01_fras_v2_4_on_laptop_exit_laptop", 0.0)
                DisablePlayerFiring(cache.playerId, true)

                if not DoesEntityExist(laptop) or config.isPedDead(cache.ped) then
                    break
                end

                handleMouse()
                Wait(0)
            end

            focus.stop()
        end)
    end
end

function focus.stop()
    if started then
        started = false

        dui:sendMessage({ action = "unfocus" })

        RenderScriptCams(false, true, 500, true, false)
        DestroyCam(cam, false)

        SetNuiFocus(false, false)
        DisplayRadar(true)
    end
end

eventHandler.onLocal("onResourceStop", function(event)
    if event.arguments[1] == cache.resource then
        focus.stop()
    end
end)

return focus