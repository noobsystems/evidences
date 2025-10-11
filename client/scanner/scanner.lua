local config <const> = require "config"
local eventHandler <const> = require "common.events.handler"

-- Create dui on phone
lib.requestModel("p_cs_cam_phone")
RemoveReplaceTexture("p_cs_cam_phone", "phone_screen")

local dui = lib.dui:new({
    url = string.format("nui://%s/html/dui/scanner/index.html", cache.resource),
    width = 128,
    height = 256,
    debug = false
})

AddReplaceTexture("p_cs_cam_phone", "phone_screen", dui.dictName, dui.txtName)

local function cancelFingerScan()
    if ScannerProp then
        DeleteEntity(ScannerProp)
        ClearPedTasks(cache.ped)
        SetNuiFocus(false, false)
        ScannerProp = nil
    end
end

eventHandler.onNui("keydown", function(event)
    local key <const> = event.data.key
    if key and (key == "Escape" or key == "Backspace") then
        cancelFingerScan()
    end
end)

-- Export to control the item registered in items.lua!
exports("fingerprint_scanner", function(data, slot)
    exports.ox_inventory:useItem(data, function(data)
        local coords <const> = GetEntityCoords(playerPed)

        TriggerEvent("ox_inventory:disarm", cache.ped, true)

        SetNuiFocus(true, false)

        ScannerProp = lib.requestModel(`p_cs_cam_phone`)
        ScannerProp = CreateObject(`p_cs_cam_phone`, coords.x, coords.y, coords.z, true, true, true)
        AttachEntityToEntity(
            ScannerProp,
            cache.ped,
            GetPedBoneIndex(PlayerPedId(), 28422),
            0.02, 0.025, -0.025,
            -85.0, 180.0, 20.0,
            true, true, true, true, 1, true
        )
        lib.playAnim(cache.ped, "random@hitch_lift", "idle_f", 8.0, 8.0, -1, 49, 0.0, false, 0, false)
    end)
end)

-- removes all objects that are attached to the player
RegisterCommand("fixprops", function()
    for _, object in ipairs(lib.getNearbyObjects(GetEntityCoords(cache.ped))) do
        local entity <const> = object.object
        local entityAttachedTo <const> = GetEntityAttachedTo(entity) or 0

        if entityAttachedTo == cache.ped then
            SetEntityAsMissionEntity(entity)
            DeleteObject(entity)
            ScannerProp = nil
        end
    end
end)

RegisterNetEvent("evidences:scanner:scanned", function()
    config.notify({
        key = "fingerprint_scanner.scanned_successful"
    }, "success")
    Wait(1250)
    cancelFingerScan()
end)

-- ox_target
exports.ox_target:addModel(`p_cs_cam_phone`, {
    label = locale("fingerprint_scanner.target"),
    icon = "fa-solid fa-fingerprint",
    distance = 1.5,
    canInteract = function(entity, distance, coords, name, bone)
        -- check if the targeted prop is attached to a ped playing the waiting for scan animation
        local ped <const> = GetEntityAttachedTo(entity) -- the person holding the scanner
        if ped and DoesEntityExist(ped) then
            return IsEntityPlayingAnim(ped, "random@hitch_lift", "idle_f", 3)
        end

        return false
    end,
    onSelect = function(data)
        local ped <const> = GetEntityAttachedTo(data.entity) -- the person holding the scanner
        if ped and DoesEntityExist(ped) then
            if config.isPedWearingGloves() then
                config.notify({
                    key = "fingerprint_scanner.scan_failed"
                }, "error")
                return
            end

            lib.callback("evidences:scanner:scan", false, function(success)
                if success then
                    config.notify({
                        key = "fingerprint_scanner.scanned_successful"
                    }, "success")

                    local pedCoords <const> = GetEntityCoords(cache.ped)
                    local coords <const> = GetEntityCoords(data.entity)
                    SetEntityHeading(cache.ped, GetHeadingFromVector_2d(coords.x - pedCoords.x, coords.y - pedCoords.y))
                    lib.playAnim(cache.ped, "gestures@f@standing@casual", "gesture_point", 8.0, 8.0, 2000)
                else
                    config.notify({
                        key = "fingerprint_scanner.scan_failed"
                    }, "error")
                end
            end, GetPlayerServerId(NetworkGetPlayerIndexFromPed(ped)))
        end
    end
})