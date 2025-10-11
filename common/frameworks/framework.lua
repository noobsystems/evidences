local config <const> = require "config"
local supportedFrameworks <const> = {
    ["es_extended"] = "esx",
    ["ND_Core"] = "nd",
    ["ox_core"] = "ox",
    ["qbx_core"] = "qbx"
}

for resource, framework in pairs(supportedFrameworks) do
    if GetResourceState(resource):find("start") then
        local frameworkImplentation = require(("common.frameworks.%s.%s"):format(framework, lib.context))
        
        -- Checks whether a player has permission to perform a specific action.
        ---@param action string The action to check permission for
        ---@return boolean True if the player has permission, false otherwise
        frameworkImplentation.hasPermission = function(action)
            for job, minGrade in pairs(config.permissions[action] or {}) do
                local grade <const> = frameworkImplentation.getGrade(job)

                if grade and grade >= minGrade then
                    return true
                end
            end
            
            return false
        end

        return frameworkImplentation
    end
end

lib.print.error("No supported framework.")
return nil