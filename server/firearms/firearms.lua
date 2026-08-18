local framework <const> = require "common.frameworks.framework"
local database <const> = require "server.database"
local config <const> = require "config"
local logger <const> = require "server.logger"

if not config.firearmsRegistry.enabled then
    return
end

MySQL.update.await(
    [[
        CREATE TABLE IF NOT EXISTS firearms_registry (
            serial VARCHAR(15) NOT NULL PRIMARY KEY,
            label TEXT NOT NULL,
            imagePath TEXT NOT NULL,
            identifier VARCHAR(500) NOT NULL,
            reason TEXT NOT NULL,
            registeredBy TEXT NOT NULL,
            registeredAt BIGINT NOT NULL,
            status ENUM('unknown', 'registered', 'lost', 'stolen', 'confiscated', 'destroyed', 'suspended') NOT NULL,
            UNIQUE(serial, identifier)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    ]]
)

local function registerFirearm(data)
    data.reason = data.reason or ""
    data.registeredAt = data.registeredAt or (os.time() * 1000)
    data.status = data.status or "unknown"

    if not (data.serial and data.label and data.imagePath and data.identifier and data.registeredBy) then
        lib.print.error("Registering a firearm requires at least a serial, weapon label and imagePath, citizen identifier and registeredBy value")
        return
    end

    local statuses <const> = {"unknown", "registered", "lost", "stolen", "confiscated", "destroyed", "suspended"}
    if not lib.table.contains(statuses, data.status) then
        lib.print.error("Valid firearm registration statuses are unknown, registered, lost, stolen, confiscated, destroyed and suspended")
        return
    end

    return database.update(
        [[
            INSERT INTO firearms_registry (serial, label, imagePath, identifier, reason, registeredBy, registeredAt, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                label = ?,
                imagePath = ?,
                identifier = ?,
                reason = ?,
                registeredBy = ?,
                registeredAt = ?,
                status = ?
        ]],
        data.serial, data.label, data.imagePath, data.identifier, data.reason, data.registeredBy, data.registeredAt, data.status,
        data.label, data.imagePath, data.identifier, data.reason, data.registeredBy, data.registeredAt, data.status,
        function()
            return data
        end
    )
end

exports("registerFirearm", function(data)
    local item = data.item and exports.ox_inventory:Items(data.item)
    if item then
        data.label = data.label or item.label
        data.imagePath = data.imagePath or GetConvar("inventory:imagepath", "nui://ox_inventory/web/images") .. string.format("/%s.png", item.name)
    end

    if not data.identifier then
        if not config.citizens.synced then
            lib.print.error("A citizen associated with a playerId cannot be determinded as long as citizen sync is disabled in config.lua. If you want to use the export, you must provide a citizen identifier in this case.")
            return
        end

        local playerId <const> = data.playerId or data.source
        if playerId then
            data.identifier = framework.getIdentifier(playerId)
        end
    end

    return registerFirearm(data)
end)

lib.callback.register("evidences:registerFirearm", function(source, arguments)
    if not framework.hasPermission(config.permissions.access, source) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
    end

    local result <const> = registerFirearm(arguments)

    if result.success then
        logger.log(source, "Firearm registered", result.response)
    end

    return result
end)

lib.callback.register("evidences:unregisterFirearm", function(source, arguments)
    if not framework.hasPermission(config.permissions.access, source) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
    end

    logger.log(source, "Firearm unregistering requested", arguments)
    return database.update("DELETE FROM firearms_registry WHERE serial = ?", arguments.serial)
end)

lib.callback.register("evidences:getRegisteredFirearms", function(source, arguments)
    if not framework.hasPermission(config.permissions.access, source) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
    end

    arguments.searchText = arguments.searchText or ""
    arguments.offset = arguments.offset or 0
    
    local pattern <const> = "%" .. arguments.searchText:sub(1, 25):gsub("\\", "\\\\"):gsub("%%", "\\%%"):gsub("_", "\\_") .. "%"

    return arguments.identifier and database.query(
        [[
            SELECT * FROM firearms_registry
            WHERE identifier = ?
            HAVING serial LIKE ?
            LIMIT 10 OFFSET ?
        ]],
        arguments.identifier, pattern, arguments.offset
    ) or database.query(
        [[
            SELECT * FROM firearms_registry
            HAVING serial LIKE ?
            LIMIT 10 OFFSET ?
        ]],
        pattern, arguments.offset
    )
end)

lib.callback.register("evidences:getRegisteredFirearmFromSerial", function(source, arguments)
    if not framework.hasPermission(config.permissions.access, source) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
    end

    arguments.serial = arguments.serial or ""

    return database.selectFirstRow(
        "SELECT * FROM firearms_registry WHERE serial = ?", 
        arguments.serial
    )
end)