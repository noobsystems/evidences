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

lib.callback.register("evidences:registerFirearm", function(source, arguments)
    if not framework.hasPermission(config.permissions.access, source) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
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
        arguments.serial, arguments.label, arguments.imagePath, arguments.identifier, arguments.reason, arguments.registeredBy, arguments.registeredAt, arguments.status,
        arguments.label, arguments.imagePath, arguments.identifier, arguments.reason, arguments.registeredBy, arguments.registeredAt, arguments.status,
        function()
            logger.log(source, "Firearm registered", arguments)
            return arguments
        end
    )
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