local config <const> = require "config"
local framework <const> = require "common.frameworks.framework"
local database <const> = require "server.database"
local logger <const> = require "server.logger"

MySQL.update.await(
    [[
        CREATE TABLE IF NOT EXISTS citizen_notes (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            identifier VARCHAR(500) NOT NULL,
            modifiedAt BIGINT NOT NULL,
            modifiedBy TEXT NOT NULL,
            title TEXT NULL,
            text TEXT NULL
        )
    ]]
)

lib.callback.register("evidences:storeNote", function(source, arguments)
    if not framework.hasPermission(config.permissions.access, source) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
    end

    return database.insert(
        [[
            INSERT INTO citizen_notes (id, identifier, modifiedAt, modifiedBy, title, text)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                modifiedAt = ?,
                modifiedBy = ?,
                title = ?,
                text = ?
        ]],
        arguments.id, arguments.identifier, arguments.modifiedAt, arguments.modifiedBy, arguments.title, arguments.text, 
        arguments.modifiedAt, arguments.modifiedBy, arguments.title, arguments.text,
        function(id)
            if not arguments.id then
                arguments.id = id
                logger.log(source, "Note created", arguments)
            end

            logger.log(source, "Note edited", arguments)
            return arguments
        end)
end)

lib.callback.register("evidences:deleteNote", function(source, arguments)
    if not framework.hasPermission(config.permissions.access, source) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
    end

    logger.log(source, "Note deletion requested", arguments)
    return database.update("DELETE FROM citizen_notes WHERE id = ?", arguments.id)
end)

lib.callback.register("evidences:getNotes", function(source, arguments)
    if not framework.hasPermission(config.permissions.access, source) then
        return {
            success = false,
            response = "laptop.notifications.no_permission.description"
        }
    end

    return database.query(
        [[
            SELECT * FROM citizen_notes WHERE identifier = ?
            ORDER BY modifiedAt DESC LIMIT 10 OFFSET ?
        ]],
        arguments.identifier, arguments.offset or 0
    )
end)