local config <const> = require "config"
local eventHandler <const> = require "common.events.handler"
local evidenceTypes = require "common.evidence_types"

EvidencesAtCoords = {}

EvidenceAtCoords = lib.class("EvidenceAtCoords")

function EvidenceAtCoords:constructor(evidenceType, owner, coords, data)
    if not evidenceTypes[evidenceType] then
        lib.print.error("Server tried to sync a ground-evidence of an invalid type: ", evidenceType)
        return
    end

    self.evidenceType = evidenceType
    self.options = evidenceTypes[evidenceType]
    self.owner = owner
    self.coords = coords
    self.data = data or {}

    self.zone = exports.ox_target:addSphereZone({
        coords = self.coords,
        radius = 0.2,
        drawSprite = true,
        options = {
            {
                label = self.options.target.collect.label,
                icon = self.options.target.collect.icon or "fa-solid fa-magnifying-glass",
                distance = 2,
                groups = config.permissions.collect or false,
                items = self.options.target.collect.requiredItem or nil,
                onSelect = function(data)
                    local metadata <const> = self.options.target.collect.createMetadata(self.evidenceType, self.data, data.coords)
                    lib.callback("evidences:collect", false, function(error)
                        if error then
                            config.notify({
                                key = string.format("evidences.notifications.common.errors.%s", error)
                            }, "error")
                            return
                        end

                        local ped <const> = cache.ped
                        local pedCoords <const> = GetEntityCoords(ped)
                        SetEntityHeading(ped, GetHeadingFromVector_2d(self.coords.x - pedCoords.x, self.coords.y - pedCoords.y)) -- make player look at the evidence

                        lib.playAnim(ped, "random@domestic", "pickup_low")
                        config.notify({
                            key = "evidences.notifications.collect",
                            arguments = {locale("evidences.notifications.common.placeholders.at_coords")}
                        }, "success")
                    end, self.evidenceType, self.owner, {
                        fun = "removeFromCoords",
                        arguments = { self.coords }
                    }, metadata)
                end
            },
            {
                label = self.options.target.destroy.label,
                icon = self.options.target.destroy.icon or "fa-solid fa-hand-back-fist",
                distance = 2,
                items = self.options.target.destroy.requiredItem or nil,
                onSelect = function(data)
                    lib.callback("evidences:destroy", false, function(error)
                        if error then
                            config.notify({
                                key = string.format("evidences.notifications.common.errors.%s", error)
                            }, "error")
                            return
                        end

                        lib.playAnim(cache.ped, "random@domestic", "pickup_low")
                        config.notify({
                            key = "evidences.notifications.destroy",
                            arguments = {locale("evidences.notifications.common.placeholders.at_coords")}
                        }, "success")
                    end, self.evidenceType, self.owner, {
                        fun = "removeFromCoords",
                        arguments = { coords }
                    })
                end
            }
        }
    })

    self:visualize(self.options.visualize)

    eventHandler.onNet("evidences:remove:atCoords", function(event)
        if event.arguments[1] == self.evidenceType and event.arguments[2] == self.coords then
            self:destroy()
        end
    end)

    eventHandler.onLocal("onResourceStop", function(event)
        if event.arguments[1] == cache.resource then
            self:destroy()
        end
    end)

    table.insert(EvidencesAtCoords, self)
end

function EvidenceAtCoords:visualize(options)
    local this <const> = self
    self.point = lib.points.new({
        coords = this.coords,
        distance = 20,
        onEnter = function(point)
            if options.show then
                options.show(point, this.data)
            end
        end,
        onExit = function(point)
            if options.hide then
                options.hide(point, this.data)
            end
        end
    })
end

function EvidenceAtCoords:destroy()
    exports.ox_target:removeZone(self.zone)

    if self.point then
        self.point:onExit()
        self.point:remove()
        self.point = nil
    end

    for index, evidence in ipairs(EvidencesAtCoords) do
        if evidence == self then
            table.remove(EvidencesAtCoords, index)
            break
        end
    end
end

function EvidenceAtCoords:isExposedToRain()
    if GetRainLevel() > 0 then
        local success <const>, groundZ <const> = GetGroundZFor_3dCoord(self.coords.x, self.coords.y, 99999.0, true)
        return success and groundZ <= self.coords.z + 1.5
    end

    return false
end